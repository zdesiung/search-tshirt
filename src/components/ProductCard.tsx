import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { useStore } from '../context/StoreContext';
import { formatPEN } from '../utils/analytics';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.includes('M') ? 'M' : product.sizes[0]
  );

  const isWished = wishlist.includes(product.id);
  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <article className="group flex flex-col">
      {/* Media frame */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#FAF7F2]">
        <Link to={`/producto/${product.slug}`} className="block w-full h-full">
          <ResilientImage
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} vista lifestyle`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Quiet status text only when discounted or new — max 1 unboxed tag */}
        {discountPct > 0 ? (
          <span className="absolute top-3 left-3 text-[11px] font-semibold tracking-wider uppercase bg-white/90 text-[#0B0D0F] px-2 py-0.5 rounded">
            −{discountPct}%
          </span>
        ) : product.isNew ? (
          <span className="absolute top-3 left-3 text-[11px] font-semibold tracking-wider uppercase bg-white/90 text-[#082B3A] px-2 py-0.5 rounded">
            Nuevo
          </span>
        ) : null}

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWished ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#0B0D0F] hover:scale-105 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E5A78]"
        >
          <Heart
            className={`w-4 h-4 ${isWished ? 'fill-[#0E5A78] text-[#0E5A78]' : ''}`}
          />
        </button>

        {/* Quick-size & Add hover drawer */}
        <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-sm rounded-md p-2.5 shadow-sm opacity-100 lg:opacity-0 lg:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[28px] h-7 px-1.5 text-[11px] font-medium rounded transition-colors ${
                    selectedSize === size
                      ? 'bg-[#0B0D0F] text-white'
                      : 'bg-[#FAF7F2] text-[#0B0D0F] hover:bg-[#E8D8BD]/60'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <Link
              to={`/producto/${product.slug}`}
              className="text-[11px] font-medium text-[#0E5A78] hover:underline whitespace-nowrap shrink-0 pl-1"
            >
              Ver
            </Link>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product, selectedColor, selectedSize, 1)}
            className="w-full py-2 px-3 bg-[#0B0D0F] text-white text-xs font-semibold rounded hover:bg-[#0E5A78] transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Agregar al carrito</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="pt-3.5 flex flex-col flex-1 justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#0B0D0F]/55">
            <span className="uppercase tracking-wider">{product.category}</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star className="w-3 h-3 fill-[#B89B5E] text-[#B89B5E]" />
              {product.rating.toFixed(1)}
            </span>
          </div>

          <Link
            to={`/producto/${product.slug}`}
            className="mt-1 block font-display font-semibold text-[15px] text-[#0B0D0F] hover:text-[#0E5A78] transition-colors truncate"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-[15px] font-semibold text-[#0B0D0F]">
              {formatPEN(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-[#0B0D0F]/45 line-through">
                {formatPEN(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5" aria-label="Colores disponibles">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => setSelectedColor(c)}
                aria-label={`Color ${c.name}`}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  selectedColor.name === c.name
                    ? 'ring-1 ring-offset-1 ring-[#0B0D0F] scale-110'
                    : 'border-black/20'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
