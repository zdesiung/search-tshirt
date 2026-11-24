import type {
  Coupon,
  Product,
  ShippingRate,
  StoreSettings,
} from '../types/ecommerce';

export const DEFAULT_WHATSAPP_PHONE = '955871452';

export interface AdvisorFaqChip {
  id: string;
  label: string;
  question: string;
}

export interface AdvisorReply {
  text: string;
  products: Product[];
  links?: { label: string; to: string }[];
  whatsappDraft: string;
}

export const ADVISOR_FAQS: AdvisorFaqChip[] = [
  {
    id: 'tallas',
    label: 'Tallas y calce',
    question: '¿Cómo elegir mi talla y calce?',
  },
  {
    id: 'envios',
    label: 'Envíos gratis',
    question: '¿Cuánto cuesta o demora el envío gratis a Lima y provincias?',
  },
  {
    id: 'pagos',
    label: 'Códigos y pagos',
    question: '¿Cómo aplicar el código VERANO27 (-15%) y qué medios de pago aceptan?',
  },
  {
    id: 'cambios',
    label: 'Cambios',
    question: '¿Cómo funcionan los cambios o devoluciones?',
  },
  {
    id: 'recomendar',
    label: 'Por precio o nombre',
    question: 'Recomiéndame prendas según ocasión o presupuesto en soles (S/)',
  },
];

export function formatPeruWhatsAppNumber(rawPhone?: string): string {
  const digits = (rawPhone || DEFAULT_WHATSAPP_PHONE).replace(/\D/g, '');
  const clean = digits.length >= 9 ? digits : DEFAULT_WHATSAPP_PHONE;
  return clean.startsWith('51') ? clean : `51${clean}`;
}

export function buildWhatsAppUrl(rawPhone: string | undefined, text: string): string {
  const number = formatPeruWhatsAppNumber(rawPhone);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function getAvailableSizes(product: Product): string[] {
  return product.sizes.filter((size) => (product.stock[size] ?? 0) > 0);
}

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

interface PriceFilter {
  min?: number;
  max?: number;
  exact?: number;
}

function extractPriceFilterSoles(q: string): PriceFilter | null {
  const rangeMatch = q.match(/entre\s*(?:s\/\s*)?(\d{2,4})\s*y\s*(?:s\/\s*)?(\d{2,4})/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      return { min: Math.min(a, b), max: Math.max(a, b) };
    }
  }

  const maxMatch = q.match(
    /(?:hasta|menos de|debajo de|maximo|máximo|presupuesto(?: de)?|no pase de)\s*(?:s\/\s*)?(\d{2,4})/
  );
  if (maxMatch) {
    const val = Number(maxMatch[1]);
    if (Number.isFinite(val) && val >= 30 && val <= 2000) return { max: val };
  }

  const minMatch = q.match(/(?:desde|mas de|más de|minimo|mínimo)\s*(?:s\/\s*)?(\d{2,4})/);
  if (minMatch) {
    const val = Number(minMatch[1]);
    if (Number.isFinite(val) && val >= 30 && val <= 2000) return { min: val };
  }

  const exactMatch =
    q.match(/(?:de|por|a|cuesta|vale)?\s*s\/\s*(\d{2,4})/) ||
    q.match(/(\d{2,4})\s*soles/);
  if (exactMatch) {
    const val = Number(exactMatch[1]);
    if (Number.isFinite(val) && val >= 30 && val <= 2000) return { exact: val, max: val };
  }

  return null;
}

const GENERIC_NAME_WORDS = new Set([
  'beach',
  'polo',
  'polos',
  'de',
  'para',
  'con',
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
]);

function scoreProductByName(product: Product, normalizedQuery: string): number {
  const fullName = normalize(product.name);
  if (normalizedQuery.includes(fullName)) return 10;

  const slugText = normalize(product.slug.replace(/-/g, ' '));
  if (normalizedQuery.includes(slugText)) return 9;

  const tokens = fullName
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !GENERIC_NAME_WORDS.has(w));

  let score = 0;
  for (const tok of tokens) {
    if (new RegExp(`\\b${tok}\\b`).test(normalizedQuery)) {
      score += 4;
    } else if (normalizedQuery.includes(tok) && tok.length >= 4) {
      score += 2;
    }
  }

  for (const color of product.colors) {
    const colorNorm = normalize(color.name);
    if (colorNorm.length >= 4 && normalizedQuery.includes(colorNorm)) {
      score += 2;
    }
  }

  return score;
}

export function evaluateSalesQuery(
  rawQuestion: string,
  context: {
    products: Product[];
    coupons: Coupon[];
    shippingRates: ShippingRate[];
    settings: StoreSettings;
  }
): AdvisorReply {
  const { products, coupons, settings } = context;
  const q = normalize(rawQuestion);
  const inStockProducts = products.filter((p) => getAvailableSizes(p).length > 0);
  const freeThreshold = settings.freeShippingThreshold || 199;
  const veranoCoupon = coupons.find((c) => c.code === 'VERANO27' && c.active);
  const priceFilter = extractPriceFilterSoles(q);

  // 1. Dynamic Product Name + Price Matching
  const scoredByName = inStockProducts
    .map((prod) => ({
      prod,
      nameScore: scoreProductByName(prod, q),
    }))
    .filter((entry) => entry.nameScore >= 4)
    .sort((a, b) => b.nameScore - a.nameScore);

  const isShippingOrReturnQuestion =
    q.includes('envio') || q.includes('cambio') || q.includes('devolucion');

  if (scoredByName.length > 0 && !isShippingOrReturnQuestion) {
    let matched = scoredByName.map((e) => e.prod);
    if (priceFilter?.max !== undefined) {
      const underCap = matched.filter((p) => p.price <= priceFilter.max!);
      if (underCap.length > 0) matched = underCap;
    }

    const lead = matched[0];
    const sizes = getAvailableSizes(lead).join(', ');
    const colors = lead.colors.map((c) => c.name).join(', ');
    const hasDiscountHint =
      lead.price >= 150 && veranoCoupon
        ? ` Con el cupón VERANO27 obtienes ${veranoCoupon.value}% de descuento.`
        : ` Combínalo con otro artículo para superar S/ ${freeThreshold} y llevar envío gratis a todo el Perú.`;

    return {
      text: `¡Excelente elección! ${lead.name} (${lead.subtitle}) cuesta S/ ${lead.price.toFixed(
        0
      )} y está hecho en ${lead.fabric}. Calce: ${lead.fit}. Colores: ${colors}. Tallas disponibles: ${sizes}.${hasDiscountHint}`,
      products: matched.slice(0, 3),
      links: [{ label: `Ver ${lead.name}`, to: `/producto/${lead.slug}` }],
      whatsappDraft: `Hola BEACH POLO, Valeria me recomendó ${lead.name} (S/ ${lead.price}). ¿Me confirman disponibilidad en talla ${getAvailableSizes(lead)[0] || 'M'}?`,
    };
  }

  // 2. FAQ: Tallas y calce
  if (
    q.includes('talla') ||
    q.includes('calce') ||
    q.includes('medida') ||
    q.includes('fit') ||
    q.includes('pecho') ||
    q.includes('encoge')
  ) {
    const featured = inStockProducts.filter((p) =>
      ['prod-bp-ocean', 'prod-bp-wave'].includes(p.id)
    );
    return {
      text:
        'Nuestras prendas usan algodón Pima peruano pre-lavado (no encoge tras el lavado). En polos de Hombre manejamos S, M, L y XL (Regular Modern Fit y Relaxed Coastal Fit); en Mujer manejamos XS, S, M y L (caída fluida); en Shorts tallas 28 a 34 y en Niños tallas 4 a 12. Si estás entre dos tallas, elige la mayor para un calce relajado o la menor si lo prefieres entallado.',
      products: featured,
      links: [{ label: 'Abrir Guía de Tallas', to: '/size-guide' }],
      whatsappDraft:
        'Hola BEACH POLO, necesito ayuda para confirmar mi talla según mis medidas.',
    };
  }

  // 3. FAQ: Envíos gratis y plazos en Lima y provincias
  if (
    q.includes('envio') ||
    q.includes('delivery') ||
    q.includes('demora') ||
    q.includes('provincia') ||
    q.includes('lima') ||
    q.includes('shalom') ||
    q.includes('olva') ||
    q.includes('miraflores') ||
    q.includes('recojo')
  ) {
    return {
      text: `¡Hacemos envíos a todo el Perú! El envío es GRATIS desde S/ ${freeThreshold}. Para compras menores: Lima Metropolitana (24 a 48h hábiles) S/ ${settings.limaShippingCost}, Callao S/ 18 y Provincias vía Shalom u Olva Courier (2 a 4 días hábiles) desde S/ 20. También puedes recoger gratis en 24h en nuestro Showroom de Miraflores (Calle Berlín 420).`,
      products: inStockProducts.slice(0, 2),
      links: [
        { label: 'Ver cobertura y tarifas', to: '/shipping' },
        { label: 'Seguir un pedido', to: '/orders' },
      ],
      whatsappDraft:
        'Hola BEACH POLO, quiero consultar el costo y tiempo de envío para mi distrito/ciudad.',
    };
  }

  // 4. FAQ: Códigos de descuento y medios de pago (Yape/Plin)
  if (
    q.includes('verano27') ||
    q.includes('playa10') ||
    q.includes('cupon') ||
    q.includes('codigo') ||
    q.includes('pago') ||
    q.includes('yape') ||
    q.includes('plin') ||
    q.includes('tarjeta') ||
    q.includes('descuento')
  ) {
    return {
      text:
        'En tu bolsa o checkout ingresa el código VERANO27 para obtener 15% de descuento desde S/ 150 (también tienes PLAYA10 con 10% de bienvenida sin mínimo). Aceptamos pagos directos sin comisiones vía Yape y Plin: luego de crear tu pedido subes tu número de operación y captura para validación manual.',
      products: inStockProducts
        .filter((p) => p.compareAtPrice || p.isBestSeller)
        .slice(0, 2),
      links: [
        { label: 'Ir al carrito', to: '/cart' },
        { label: 'Preguntas frecuentes', to: '/faq' },
      ],
      whatsappDraft:
        'Hola BEACH POLO, quiero aplicar el cupón VERANO27 y consultar los datos de pago por Yape o Plin.',
    };
  }

  // 5. FAQ: Cambios y devoluciones
  if (
    q.includes('cambio') ||
    q.includes('devolucion') ||
    q.includes('garantia') ||
    q.includes('reembolso')
  ) {
    return {
      text:
        'Tienes hasta 15 días calendario desde la entrega para cambiar de talla o prenda sin complicaciones, siempre que esté sin uso y con etiqueta original. En Lima puedes hacerlo en nuestro Showroom de Miraflores o coordinando recojo por WhatsApp; en provincias coordinamos el envío de cambio por agencia.',
      products: [],
      links: [{ label: 'Política de Cambios', to: '/returns' }],
      whatsappDraft:
        'Hola BEACH POLO, quisiera gestionar un cambio de talla o devolución de mi pedido.',
    };
  }

  // 6. Recomendación basada en Precio en Soles (S/), Categoría y Ocasión
  const wantsOffers =
    q.includes('oferta') ||
    q.includes('promo') ||
    q.includes('barat') ||
    q.includes('econom');
  const wantsMen =
    q.includes('hombre') || q.includes('chico') || q.includes('caballero') || q.includes('papa');
  const wantsWomen =
    q.includes('mujer') || q.includes('dama') || q.includes('chica') || q.includes('mama');
  const wantsKids = q.includes('nino') || q.includes('ninos') || q.includes('kids') || q.includes('hijo');
  const wantsBeach =
    q.includes('playa') ||
    q.includes('surf') ||
    q.includes('verano') ||
    q.includes('sol') ||
    q.includes('mancora') ||
    q.includes('paracas') ||
    q.includes('punta hermosa');
  const wantsNight =
    q.includes('cena') ||
    q.includes('noche') ||
    q.includes('formal') ||
    q.includes('elegante') ||
    q.includes('ciudad') ||
    q.includes('oficina');
  const wantsGift = q.includes('regalo') || q.includes('obsequio');
  const wantsRecommendPrompt =
    q.includes('recomienda') ||
    q.includes('ocasion') ||
    q.includes('presupuesto') ||
    q.includes('precio') ||
    q.includes('soles');

  let candidates = [...inStockProducts];
  if (wantsMen) candidates = candidates.filter((p) => p.category === 'hombre' || p.category === 'playa');
  if (wantsWomen) candidates = candidates.filter((p) => p.category === 'mujer' || p.category === 'accesorios');
  if (wantsKids) candidates = candidates.filter((p) => p.category === 'ninos');
  if (wantsBeach && !wantsMen && !wantsWomen) {
    candidates = candidates.filter((p) =>
      ['playa', 'accesorios', 'mujer', 'hombre'].includes(p.category)
    );
  }
  if (wantsNight) {
    candidates = candidates.filter((p) =>
      ['prod-bp-premium', 'prod-bp-black', 'prod-bp-palm', 'prod-bp-blue'].includes(p.id)
    );
  }
  if (wantsOffers) {
    const discounted = candidates.filter((p) => Boolean(p.compareAtPrice));
    if (discounted.length > 0) candidates = discounted;
  }

  if (priceFilter) {
    let priceMatched = candidates.filter((p) => {
      if (priceFilter.min !== undefined && p.price < priceFilter.min) return false;
      if (priceFilter.max !== undefined && p.price > priceFilter.max) return false;
      return true;
    });

    // If exact price requested (e.g. "de 89 soles"), prioritize exact matches first
    if (priceFilter.exact !== undefined) {
      const exactMatches = candidates.filter((p) => p.price === priceFilter.exact);
      if (exactMatches.length > 0) {
        priceMatched = exactMatches;
      }
    }

    if (priceMatched.length > 0) {
      const sorted = [...priceMatched].sort((a, b) => b.price - a.price).slice(0, 3);
      const label =
        priceFilter.min !== undefined && priceFilter.max !== undefined
          ? `entre S/ ${priceFilter.min} y S/ ${priceFilter.max}`
          : priceFilter.exact !== undefined && sorted[0].price === priceFilter.exact
            ? `de S/ ${priceFilter.exact}`
            : priceFilter.max !== undefined
              ? `hasta S/ ${priceFilter.max}`
              : `desde S/ ${priceFilter.min}`;

      return {
        text: `Según tu búsqueda ${label}, estas opciones reales están disponibles en stock ahora mismo (recuerda que con VERANO27 tienes 15% adicional desde S/ 150):`,
        products: sorted,
        links: [{ label: 'Ver catálogo completo', to: '/shop' }],
        whatsappDraft: `Hola BEACH POLO, Valeria me mostró opciones ${label}: ${sorted
          .map((p) => `${p.name} (S/ ${p.price})`)
          .join(', ')}.`,
      };
    }

    const cheapest = [...inStockProducts].sort((a, b) => a.price - b.price).slice(0, 3);
    const targetAmt = priceFilter.max ?? priceFilter.exact ?? priceFilter.min ?? 89;
    return {
      text: `No encontré prendas exactas dentro de S/ ${targetAmt}, pero nuestras opciones más accesibles parten desde S/ ${cheapest[0].price} (${cheapest[0].name}). ¡Échales un vistazo!`,
      products: cheapest,
      links: [{ label: 'Ver toda la tienda', to: '/shop' }],
      whatsappDraft: `Hola BEACH POLO, busco prendas cerca de S/ ${targetAmt}. ¿Qué opciones me sugieren?`,
    };
  }

  if (
    wantsOffers ||
    wantsMen ||
    wantsWomen ||
    wantsKids ||
    wantsBeach ||
    wantsNight ||
    wantsGift ||
    wantsRecommendPrompt
  ) {
    const picks = (wantsOffers ? candidates : [...candidates].sort((a, b) => a.price - b.price)).slice(0, 3);
    const intro = wantsNight
      ? 'Para una tarde en el malecón o cena frente al mar, te recomiendo siluetas estructuradas en tonos sobrios:'
      : wantsWomen
        ? 'Para mujer te recomiendo nuestras siluetas más frescas en algodón Pima y fibras naturales:'
        : wantsKids
          ? 'Para los más pequeños tenemos prendas suaves en algodón orgánico certificado:'
          : wantsGift
            ? 'Para regalo, estos favoritos en soles (S/) siempre aciertan por calce y presentación:'
            : 'Escríbeme el nombre de cualquier prenda (ej. Ocean, Wave, Short) o tu presupuesto en S/ (ej. "menos de S/ 95"). Mientras tanto, mira estas 3 recomendaciones en stock:';

    return {
      text: intro,
      products: picks,
      links: [{ label: 'Explorar catálogo completo', to: '/shop' }],
      whatsappDraft: `Hola BEACH POLO, Valeria me sugirió ${picks
        .map((p) => `${p.name} (S/ ${p.price})`)
        .join(', ')}. Quisiera asesoría para elegir.`,
    };
  }

  // Fallback general response
  const topPicks = inStockProducts.filter((p) => p.isBestSeller).slice(0, 3);
  return {
    text:
      '¡Con gusto te ayudo! Puedo asesorarte con tallas, envíos gratis desde S/ 199, código VERANO27 (-15%), pagos Yape/Plin o recomendarte prendas por nombre o presupuesto en S/. ¿Qué buscas hoy?',
    products: topPicks,
    links: [{ label: 'Ver tienda BEACH POLO', to: '/shop' }],
    whatsappDraft: `Hola BEACH POLO, tengo una consulta sobre la tienda: "${rawQuestion}"`,
  };
}
