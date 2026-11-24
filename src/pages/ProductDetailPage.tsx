import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Check,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPEN, trackEcommerceEvent } from '../utils/analytics';
import { ResilientImage } from '../components/ResilientImage';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';

export function ProductDetailPage() {
  const { slug } = useParams();
  const {
    products,
    addToCart,
    wishlist,
    toggleWishlist,
    recordRecentlyViewed,
  } = useStore();

  const product = products.find((p) => p.slug === slug) || products[0];
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.includes('M') ? 'M' : product.sizes[0]
  );
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setActiveImage(0);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes.includes('M') ? 'M' : product.sizes[0]);
    setQty(1);
    recordRecentlyViewed(product.slug);
    trackEcommerceEvent('view_item', {
      item_id: product.sku,
      item_name: product.name,
      price: product.price,
      category: product.category,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.slug]);

  const currentStock = product.stock[selectedSize] ?? 0;
  const isWished = wishlist.includes(product.id);

  const recommended = useMemo(
    () => products.filter((p) => p.id !== product.id).slice(0, 4),
    [products, product.id]
  );

  const productJsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        description: product.description,
        brand: { '@type': 'Brand', name: 'BEACH POLO' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PEN',
          price: product.price,
          availability:
            currentStock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: '/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: product.category,
            item: `/shop/${product.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `/producto/${product.slug}`,
          },
        ],
      },
    ],
    [product, currentStock]
  );

  return (
    <div className="pt-28 pb-24 lg:pb-20 bg-white">
      <SeoHead
        title={`${product.name} | BEACH POLO Perú`}
        description={`${product.subtitle}. ${product.description}`}
        canonicalPath={`/producto/${product.slug}`}
        ogImage={product.images[0]}
        jsonLd={productJsonLd}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#0B0D0F]/55 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-[#0B0D0F]">Inicio</Link>
          <span>/</span>
          <Link to={`/shop/${product.category}`} className="capitalize hover:text-[#0B0D0F]">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#0B0D0F] font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sticky Left Gallery */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
            <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#FAF7F2]">
              <ResilientImage
                src={product.images[activeImage] || product.images[0]}
                alt={`${product.name} vista ${activeImage + 1}`}
                loading="eager"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-[4/5] rounded-lg overflow-hidden bg-[#FAF7F2] border-2 transition-colors ${
                      activeImage === idx ? 'border-[#0B0D0F]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ResilientImage src={img} alt={`${product.name} miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contiguous Purchase Module */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2 border-b border-black/8 pb-5">
              <div className="flex items-center justify-between text-xs text-[#0B0D0F]/60">
                <span className="uppercase tracking-[0.16em] text-[#0E5A78] font-semibold">
                  {product.collection} · SKU {product.sku}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#B89B5E] text-[#B89B5E]" />
                  {product.rating.toFixed(1)} ({product.reviewCount} reseñas)
                </span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0B0D0F]">
                {product.name}
              </h1>
              <p className="text-sm text-[#0B0D0F]/65">{product.subtitle}</p>

              <div className="pt-2 flex items-baseline gap-3 tabular-nums">
                <span className="font-display font-bold text-2xl text-[#0B0D0F]">
                  {formatPEN(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base text-[#0B0D0F]/45 line-through">
                    {formatPEN(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Color selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0B0D0F]">Color</span>
                <span className="text-[#0B0D0F]/65">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    aria-label={`Seleccionar color ${c.name}`}
                    className={`w-8 h-8 rounded-full border transition-all ${
                      selectedColor.name === c.name
                        ? 'ring-2 ring-offset-2 ring-[#0B0D0F]'
                        : 'border-black/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0B0D0F]">
                  Talla ({selectedSize})
                </span>
                <Link
                  to="/size-guide"
                  className="inline-flex items-center gap-1 text-[#0E5A78] hover:underline font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Guía de tallas</span>
                </Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const sStock = product.stock[size] ?? 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={sStock === 0}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 rounded-md text-xs font-semibold border transition-colors ${
                        selectedSize === size
                          ? 'bg-[#0B0D0F] text-white border-[#0B0D0F]'
                          : sStock === 0
                            ? 'bg-black/5 text-black/30 border-black/10 line-through cursor-not-allowed'
                            : 'bg-white text-[#0B0D0F] border-black/15 hover:border-[#0B0D0F]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#0B0D0F]/60 tabular-nums">
                {currentStock > 0
                  ? currentStock <= 5
                    ? `Últimas ${currentStock} unidades disponibles en talla ${selectedSize}`
                    : `Stock disponible: ${currentStock} unidades`
                  : 'Agotado temporalmente en esta talla'}
              </p>
            </div>

            {/* Qty + Primary Buy Action */}
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center border border-black/15 rounded-md h-12">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Menos"
                  className="w-10 h-full inline-flex items-center justify-center hover:bg-black/5"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(Math.max(1, currentStock), q + 1))}
                  aria-label="Más"
                  className="w-10 h-full inline-flex items-center justify-center hover:bg-black/5"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={currentStock === 0}
                onClick={() => addToCart(product, selectedColor, selectedSize, qty)}
                className="flex-1 h-12 px-6 bg-[#0B0D0F] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.12em] rounded-md hover:bg-[#0E5A78] disabled:bg-black/30 transition-colors inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar al carrito</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Guardar en favoritos"
                className="w-12 h-12 rounded-md border border-black/15 inline-flex items-center justify-center hover:border-[#0B0D0F] transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${isWished ? 'fill-[#0E5A78] text-[#0E5A78]' : ''}`}
                />
              </button>
            </div>

            {/* Delivery & Trust Peru */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] space-y-2.5 text-xs text-[#082B3A]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#0E5A78] shrink-0" />
                <span>Envío gratis a Lima y todo el Perú desde S/ 199.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0E5A78] shrink-0" />
                <span>Recojo gratis en Showroom Miraflores (24h).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0E5A78] shrink-0" />
                <span>Pago directo con Yape o Plin y validación administrativa verificada.</span>
              </div>
            </div>

            {/* Specs & Description */}
            <div className="space-y-4 pt-2 border-t border-black/8 text-sm">
              <div>
                <h2 className="font-display font-bold text-sm uppercase tracking-wider mb-1.5">
                  Descripción
                </h2>
                <p className="text-[#0B0D0F]/75 leading-relaxed">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-[#0B0D0F]/50 block">Composición</span>
                  <span className="font-medium text-[#0B0D0F]">{product.fabric}</span>
                </div>
                <div>
                  <span className="text-[#0B0D0F]/50 block">Calce / Fit</span>
                  <span className="font-medium text-[#0B0D0F]">{product.fit}</span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {product.reviews.length > 0 && (
              <div className="pt-4 border-t border-black/8 space-y-3">
                <h2 className="font-display font-bold text-sm uppercase tracking-wider">
                  Opiniones verificadas
                </h2>
                <div className="space-y-3">
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-lg bg-[#FAF7F2] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">{rev.author}</span>
                        <span className="text-[#0B0D0F]/50">{rev.location} · {rev.date}</span>
                      </div>
                      <p className="text-xs text-[#0B0D0F]/75 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cross-selling recommendations */}
        <section className="mt-20 pt-12 border-t border-black/8">
          <h2 className="font-display font-bold text-2xl mb-8">
            Combínalo con estas piezas
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommended.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Buy Bar (<= 64px to respect 15% cap) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-md border-t border-black/10 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold truncate">{product.name}</p>
          <p className="text-xs font-semibold text-[#0E5A78] tabular-nums">
            {formatPEN(product.price)} · Talla {selectedSize}
          </p>
        </div>
        <button
          type="button"
          disabled={currentStock === 0}
          onClick={() => addToCart(product, selectedColor, selectedSize, qty)}
          className="px-5 py-2.5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
