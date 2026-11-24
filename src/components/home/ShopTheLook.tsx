import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { MEDIA_ASSETS } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import { formatPEN } from '../../utils/analytics';
import { ResilientImage } from '../ResilientImage';

interface Hotspot {
  id: string;
  label: string;
  productSlug: string;
  xPct: number;
  yPct: number;
}

const HOTSPOTS: Hotspot[] = [
  { id: 'hs-polo', label: '+ POLO OCEAN', productSlug: 'beach-polo-ocean', xPct: 50, yPct: 33 },
  { id: 'hs-short', label: '+ SHORT BEACH', productSlug: 'short-beach-linen-arena', xPct: 49, yPct: 52 },
  { id: 'hs-cap', label: '+ GORRA BEACH POLO', productSlug: 'gorra-beach-polo-navy', xPct: 51, yPct: 12 },
];

export function ShopTheLook() {
  const { products, addToCart } = useStore();
  const [selectedHotspot, setSelectedHotspot] = useState<string>(HOTSPOTS[0].id);

  const activeSpot = HOTSPOTS.find((h) => h.id === selectedHotspot) || HOTSPOTS[0];
  const activeProduct =
    products.find((p) => p.slug === activeSpot.productSlug) || products[0];

  const [selectedSize, setSelectedSize] = useState<string>(
    activeProduct?.sizes[0] || 'M'
  );

  const handleSelectHotspot = (hs: Hotspot) => {
    setSelectedHotspot(hs.id);
    const prod = products.find((p) => p.slug === hs.productSlug);
    if (prod) {
      setSelectedSize(prod.sizes.includes('M') ? 'M' : prod.sizes[0]);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-[#FAF7F2]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E5A78]">
              Editorial Lookbook
            </p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#0B0D0F]">
              SHOP THE LOOK
            </h2>
          </div>
          <p className="text-sm text-[#0B0D0F]/65 max-w-md">
            Haz clic sobre cada punto de la fotografía para explorar y comprar las prendas del conjunto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Editorial Image with Hotspots */}
          <div className="lg:col-span-7 relative rounded-xl overflow-hidden bg-[#E8D8BD]/30 aspect-[4/3]">
            <ResilientImage
              src={MEDIA_ASSETS.shopTheLook}
              alt="Shop The Look BEACH POLO lookbook costero"
              className="w-full h-full object-cover"
            />
            <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

            {HOTSPOTS.map((hs) => {
              const isActive = hs.id === activeSpot.id;
              return (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => handleSelectHotspot(hs)}
                  style={{ left: `${hs.xPct}%`, top: `${hs.yPct}%` }}
                  aria-label={`Ver ${hs.label}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-wider transition-all shadow-lg ${
                    isActive
                      ? 'bg-[#0B0D0F] text-white scale-105 ring-2 ring-white'
                      : 'bg-white/95 text-[#0B0D0F] hover:bg-[#0E5A78] hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{hs.label.replace('+ ', '')}</span>
                </button>
              );
            })}
          </div>

          {/* Linked Active Product Card */}
          <div className="lg:col-span-5 bg-white rounded-xl p-6 sm:p-8 border border-black/8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-black/8 pb-4 mb-6">
                {HOTSPOTS.map((hs) => (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => handleSelectHotspot(hs)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      hs.id === activeSpot.id
                        ? 'bg-[#0B0D0F] text-white'
                        : 'bg-[#FAF7F2] text-[#0B0D0F]/70 hover:text-[#0B0D0F]'
                    }`}
                  >
                    {hs.label.replace('+ ', '')}
                  </button>
                ))}
              </div>

              {activeProduct && (
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6">
                  <Link
                    to={`/producto/${activeProduct.slug}`}
                    className="w-full sm:w-44 lg:w-full xl:w-44 aspect-[4/5] rounded-lg overflow-hidden bg-[#FAF7F2] shrink-0"
                  >
                    <ResilientImage
                      src={activeProduct.images[0]}
                      alt={activeProduct.name}
                    />
                  </Link>

                  <div className="flex-1 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-[#0E5A78] font-semibold">
                      {activeProduct.collection}
                    </p>
                    <h3 className="font-display font-bold text-xl text-[#0B0D0F]">
                      {activeProduct.name}
                    </h3>
                    <p className="text-xs text-[#0B0D0F]/65">{activeProduct.subtitle}</p>
                    <p className="text-lg font-bold tabular-nums text-[#0B0D0F]">
                      {formatPEN(activeProduct.price)}
                    </p>

                    <div className="pt-2">
                      <p className="text-xs font-medium text-[#0B0D0F]/70 mb-2">
                        Selecciona tu talla
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[40px] h-9 px-2.5 text-xs font-semibold rounded-md border transition-colors ${
                              selectedSize === size
                                ? 'bg-[#0B0D0F] text-white border-[#0B0D0F]'
                                : 'border-black/15 hover:border-[#0B0D0F]'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {activeProduct && (
              <div className="pt-6 mt-6 border-t border-black/8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    addToCart(
                      activeProduct,
                      activeProduct.colors[0],
                      activeProduct.sizes.includes(selectedSize)
                        ? selectedSize
                        : activeProduct.sizes[0],
                      1
                    )
                  }
                  className="flex-1 py-3 px-5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.12em] rounded-md hover:bg-[#0E5A78] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar al carrito</span>
                </button>
                <Link
                  to={`/producto/${activeProduct.slug}`}
                  className="py-3 px-5 border border-black/15 text-xs font-semibold rounded-md hover:border-[#0B0D0F] transition-colors whitespace-nowrap"
                >
                  Ver detalles
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
