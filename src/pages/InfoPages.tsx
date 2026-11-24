import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AUDIOVISUAL_CAMPAIGN_SPECS, MEDIA_ASSETS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

export function AboutPage() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Nuestra Historia | BEACH POLO Perú"
        description="Conoce la historia, filosofía costera y producción sostenible en algodón Pima de BEACH POLO."
        canonicalPath="/about"
      />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E5A78]">
              Nuestra Historia
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
              Nacimos frente al Pacífico para vestir el verano sin prisa.
            </h1>
            <p className="text-base text-[#0B0D0F]/75 leading-relaxed">
              BEACH POLO une la tradición textil del algodón Pima peruano con una estética limpia e internacional. Creemos en prendas duraderas que respiran frente al mar y mantienen su silueta impecable en la ciudad.
            </p>
          </div>
          <div className="lg:col-span-6 aspect-[16/10] rounded-xl overflow-hidden bg-[#FAF7F2]">
            <ResilientImage src={MEDIA_ASSETS.editorialStory} alt="Equipo y costa BEACH POLO" />
          </div>
        </section>

        <section id="filosofia" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-black/8">
          <div className="p-6 rounded-xl bg-[#FAF7F2] space-y-2">
            <h2 className="font-display font-bold text-lg">Océano</h2>
            <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
              Diseños inspirados en los tonos cambiantes del litoral peruano: azul profundo, arena mineral y blanco solar.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#FAF7F2] space-y-2">
            <h2 className="font-display font-bold text-lg">Libertad</h2>
            <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
              Patrones ergonómicos pensados para el movimiento natural, la brisa marina y el viaje ligero.
            </p>
          </div>
          <div id="sostenibilidad" className="p-6 rounded-xl bg-[#FAF7F2] space-y-2">
            <h2 className="font-display font-bold text-lg">Sostenibilidad</h2>
            <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
              Confección local en Lima con algodón orgánico trazable de Piura y empaques compostables libres de plástico.
            </p>
          </div>
        </section>

        <section className="pt-8 border-t border-black/8 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B89B5E]">
              Producción Audiovisual Summer 2027
            </p>
            <h2 className="mt-1 font-display font-bold text-2xl">
              Especificaciones de Campaña & Formatos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AUDIOVISUAL_CAMPAIGN_SPECS.map((spec) => (
              <div key={spec.id} className="p-5 rounded-xl border border-black/10 space-y-2">
                <div className="flex justify-between text-xs font-mono text-[#0E5A78]">
                  <span>{spec.id}</span>
                  <span>{spec.duration}</span>
                </div>
                <h3 className="font-display font-bold text-base">{spec.title}</h3>
                <p className="text-xs text-[#0B0D0F]/65 leading-relaxed">{spec.prompt}</p>
                <p className="text-[11px] font-medium text-[#082B3A] pt-1">
                  {spec.formats.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { settings } = useStore();
  const [sent, setSent] = useState(false);

  return (
    <div className="pt-28 pb-20 bg-[#FAF7F2] min-h-screen">
      <SeoHead
        title="Contacto | BEACH POLO Perú"
        description="Escríbenos o visita nuestro showroom en Miraflores, Lima."
        canonicalPath="/contact"
      />
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-4">
          <h1 className="font-display font-extrabold text-3xl">Contacto</h1>
          <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
            ¿Dudas sobre tallas, envíos a provincias o ventas corporativas? Nuestro equipo en Lima responde en menos de 2 horas hábiles.
          </p>
          <div className="space-y-2 text-sm pt-2">
            <p><strong>Email:</strong> {settings.contactEmail}</p>
            <p><strong>Showroom:</strong> {settings.showroomAddress}</p>
            <p><strong>Horario:</strong> Lun – Sáb · 10:00 a.m. – 8:00 p.m.</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="md:col-span-7 bg-white rounded-xl p-6 sm:p-8 border border-black/8 space-y-4"
        >
          {sent ? (
            <div className="py-10 text-center space-y-2">
              <p className="font-display font-bold text-xl text-[#0E5A78]">
                Mensaje enviado
              </p>
              <p className="text-sm text-[#0B0D0F]/65">
                Gracias por escribirnos. Te responderemos a la brevedad.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-lg">Envíanos un mensaje</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Nombre completo"
                  className="px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  className="px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Asunto (ej. Consulta de talla o pedido)"
                className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
              />
              <textarea
                rows={4}
                required
                placeholder="Escribe tu consulta..."
                className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78] transition-colors"
              >
                Enviar consulta
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export function ShippingPage() {
  const { settings } = useStore();
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Envíos a Todo el Perú | BEACH POLO"
        description="Tarifas y tiempos de entrega en Lima Metropolitana y provincias del Perú."
        canonicalPath="/shipping"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Envíos a todo el Perú</h1>
        <p className="text-base text-[#0B0D0F]/70">
          Disfruta envío gratuito en compras desde <strong>S/ {settings.freeShippingThreshold}</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-[#FAF7F2] space-y-1">
            <h2 className="font-display font-bold text-base">Lima Metropolitana</h2>
            <p className="text-sm font-semibold text-[#0E5A78] tabular-nums">
              S/ {settings.limaShippingCost}
            </p>
            <p className="text-xs text-[#0B0D0F]/65">24 a 48 horas hábiles.</p>
          </div>
          <div className="p-5 rounded-xl bg-[#FAF7F2] space-y-1">
            <h2 className="font-display font-bold text-base">Provincias Perú</h2>
            <p className="text-sm font-semibold text-[#0E5A78] tabular-nums">
              S/ {settings.provinceShippingCost}
            </p>
            <p className="text-xs text-[#0B0D0F]/65">2 a 4 días vía Olva / Shalom.</p>
          </div>
          <div className="p-5 rounded-xl bg-[#FAF7F2] space-y-1">
            <h2 className="font-display font-bold text-base">Recojo Showroom</h2>
            <p className="text-sm font-semibold text-[#0E5A78]">Gratis</p>
            <p className="text-xs text-[#0B0D0F]/65">Listo en 24h en Miraflores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Cambios y Devoluciones | BEACH POLO Perú"
        description="Política de cambios fáciles de talla o prenda hasta 15 días en Perú."
        canonicalPath="/returns"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Cambios y Devoluciones</h1>
        <p className="text-base text-[#0B0D0F]/75 leading-relaxed">
          Tienes hasta <strong>15 días calendario</strong> desde que recibes tu pedido para solicitar un cambio de talla o color sin costo administrativo. La prenda debe encontrarse sin uso, sin lavado y con sus etiquetas originales.
        </p>
        <div className="p-6 rounded-xl bg-[#FAF7F2] space-y-2 text-sm">
          <p className="font-bold">¿Cómo solicitar un cambio?</p>
          <ol className="list-decimal list-inside space-y-1.5 text-[#0B0D0F]/75">
            <li>Ten a la mano tu número de pedido (ej. BP-2027-1048).</li>
            <li>Escríbenos por WhatsApp o desde la página de Contacto.</li>
            <li>Elige cambio presencial en Miraflores o recojo motorizado a domicilio.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export function SizeGuidePage() {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const rows = [
    { size: 'XS', chestCm: '90 – 94', lengthCm: '67', shoulderCm: '42' },
    { size: 'S', chestCm: '95 – 99', lengthCm: '69', shoulderCm: '44' },
    { size: 'M', chestCm: '100 – 105', lengthCm: '71', shoulderCm: '46' },
    { size: 'L', chestCm: '106 – 112', lengthCm: '73', shoulderCm: '48' },
    { size: 'XL', chestCm: '113 – 119', lengthCm: '75', shoulderCm: '50' },
  ];

  const convertRange = (range: string) => {
    if (unit === 'cm') return `${range} cm`;
    return (
      range
        .split('–')
        .map((n) => (Number(n.trim()) / 2.54).toFixed(1))
        .join(' – ') + ' in'
    );
  };

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Guía de Tallas | BEACH POLO Perú"
        description="Medidas exactas de polos BEACH POLO para elegir tu calce ideal."
        canonicalPath="/size-guide"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display font-extrabold text-3xl">Guía de Tallas</h1>
          <div className="inline-flex bg-[#FAF7F2] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                unit === 'cm' ? 'bg-[#0B0D0F] text-white' : 'text-[#0B0D0F]/65'
              }`}
            >
              CM
            </button>
            <button
              type="button"
              onClick={() => setUnit('in')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                unit === 'in' ? 'bg-[#0B0D0F] text-white' : 'text-[#0B0D0F]/65'
              }`}
            >
              IN
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF7F2] text-xs uppercase text-[#0B0D0F]/65">
              <tr>
                <th className="py-3 px-4">Talla</th>
                <th className="py-3 px-4">Pecho</th>
                <th className="py-3 px-4">Largo total</th>
                <th className="py-3 px-4">Hombros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8 tabular-nums">
              {rows.map((r) => (
                <tr key={r.size}>
                  <td className="py-3 px-4 font-bold">{r.size}</td>
                  <td className="py-3 px-4">{convertRange(r.chestCm)}</td>
                  <td className="py-3 px-4">{convertRange(r.lengthCm)}</td>
                  <td className="py-3 px-4">{convertRange(r.shoulderCm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export function FaqPage() {
  const faqs = [
    {
      q: '¿Qué tipo de algodón utilizan los polos BEACH POLO?',
      a: 'Trabajamos con 100% algodón Pima peruano de fibra extra larga (205g a 260g), pre-lavado para evitar encogimiento.',
    },
    {
      q: '¿Cómo pago con Yape o Plin en Perú?',
      a: 'En el checkout eliges Yape o Plin, transfieres el importe exacto al número o QR oficial y adjuntas tu número de operación y captura del comprobante. Nuestro equipo valida manualmente el abono antes de despachar.',
    },
    {
      q: '¿Cuánto demora el envío a provincias como Piura, Trujillo o Arequipa?',
      a: 'El tiempo estimado de entrega a provincias es de 2 a 4 días hábiles. En Lima Metropolitana entregamos en 24 a 48 horas.',
    },
    {
      q: '¿Puedo cambiar la talla si no me queda?',
      a: 'Sí, cuentas con hasta 15 días para realizar cambios fáciles en nuestro showroom de Miraflores o coordinando recojo.',
    },
  ];

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Preguntas Frecuentes y Legal | BEACH POLO"
        description="Respuestas sobre envíos en Perú, pagos con Yape/Plin, tallas, términos y privacidad."
        canonicalPath="/faq"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="space-y-6">
          <h1 className="font-display font-extrabold text-3xl">Preguntas Frecuentes</h1>
          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {faqs.map((item) => (
              <details key={item.q} className="py-4 group">
                <summary className="font-display font-bold text-base cursor-pointer list-none flex items-center justify-between">
                  <span>{item.q}</span>
                  <span className="text-[#0E5A78] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-sm text-[#0B0D0F]/70 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div id="terminos" className="space-y-2 pt-4 border-t border-black/8">
          <h2 className="font-display font-bold text-xl">Términos y Condiciones</h2>
          <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
            Todos los precios publicados en BEACH POLO están expresados en Soles Peruanos (PEN) e incluyen IGV. Las promociones y cupones aplican según vigencia indicada.
          </p>
        </div>

        <div id="privacidad" className="space-y-2">
          <h2 className="font-display font-bold text-xl">Política de Privacidad</h2>
          <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
            Cumplimos con la Ley N.° 29733 de Protección de Datos Personales del Perú. Tus datos y comprobantes Yape/Plin se utilizan exclusivamente para verificar pagos y coordinar despachos a nivel nacional.
          </p>
        </div>

        <div id="cookies" className="space-y-2">
          <h2 className="font-display font-bold text-xl">Política de Cookies</h2>
          <p className="text-sm text-[#0B0D0F]/70 leading-relaxed">
            Utilizamos almacenamiento local y cookies analíticas (GA4 / Meta Pixel) únicamente para conservar tu bolsa de compras y mejorar la experiencia de navegación.
          </p>
        </div>
      </div>
    </div>
  );
}
