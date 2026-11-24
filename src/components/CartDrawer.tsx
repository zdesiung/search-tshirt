import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPEN } from '../utils/analytics';
import { ResilientImage } from './ResilientImage';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    settings,
    products,
    addToCart,
  } = useStore();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  if (!cartOpen) return null;

  const remainingForFreeShipping = Math.max(0, settings.freeShippingThreshold - cartSubtotal);
  const progressPct = Math.min(100, (cartSubtotal / settings.freeShippingThreshold) * 100);
  const netSubtotal = Math.max(0, cartSubtotal - cartDiscount);

  const crossSell = products.find(
    (p) => !cart.some((c) => c.productId === p.id) && (p.slug === 'gorra-beach-polo-navy' || p.slug === 'short-beach-linen-arena')
  );

  const handleCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCouponCode(couponInput);
    setCouponFeedback(res.message);
    if (res.ok) setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#0B0D0F]/55 backdrop-blur-xs"
        onClick={() => setCartOpen(false)}
      />

      <aside
        aria-label="Carrito de compras"
        className="relative w-full max-w-md bg-white text-[#0B0D0F] h-full flex flex-col shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#0E5A78]" />
            <h2 className="font-display font-bold text-base tracking-tight">Tu Bolsa</h2>
            <span className="text-xs text-[#0B0D0F]/55 tabular-nums">
              ({cart.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Cerrar bolsa"
            className="w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="px-6 py-3 bg-[#FAF7F2] border-b border-black/5">
          <p className="text-xs text-[#082B3A] mb-1.5">
            {remainingForFreeShipping === 0
              ? '¡Tienes envío gratis a Lima y provincias!'
              : `Te faltan ${formatPEN(remainingForFreeShipping)} para envío gratis a todo el Perú`}
          </p>
          <div className="h-1.5 w-full bg-[#E8D8BD]/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0E5A78] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="font-display font-semibold text-base">Tu bolsa está vacía</p>
              <p className="text-sm text-[#0B0D0F]/60 max-w-xs mx-auto">
                Explora nuestra colección Summer 2027 en algodón Pima peruano.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/shop');
                }}
                className="px-6 py-2.5 bg-[#0B0D0F] text-white text-sm font-medium rounded-md hover:bg-[#0E5A78] transition-colors"
              >
                Explorar tienda
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-black/8">
                {cart.map((item) => (
                  <li
                    key={`${item.productId}-${item.color.name}-${item.size}`}
                    className="py-4 first:pt-0 flex gap-4"
                  >
                    <Link
                      to={`/producto/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="w-20 h-24 rounded-md overflow-hidden bg-[#FAF7F2] shrink-0"
                    >
                      <ResilientImage src={item.image} alt={item.name} />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/producto/${item.slug}`}
                            onClick={() => setCartOpen(false)}
                            className="text-sm font-semibold hover:text-[#0E5A78] truncate"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.productId, item.color.name, item.size)
                            }
                            aria-label={`Eliminar ${item.name}`}
                            className="text-[#0B0D0F]/40 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#0B0D0F]/60 mt-0.5">
                          {item.color.name} · Talla {item.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-black/12 rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(item.productId, item.color.name, item.size, -1)
                            }
                            aria-label="Disminuir cantidad"
                            className="w-8 h-8 inline-flex items-center justify-center hover:bg-black/5"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(item.productId, item.color.name, item.size, 1)
                            }
                            aria-label="Aumentar cantidad"
                            className="w-8 h-8 inline-flex items-center justify-center hover:bg-black/5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatPEN(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Cross-selling suggestion */}
              {crossSell && (
                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-black/6">
                  <p className="text-xs font-medium text-[#082B3A] mb-2.5">
                    Completa tu look de playa
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded overflow-hidden shrink-0">
                      <ResilientImage src={crossSell.images[0]} alt={crossSell.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{crossSell.name}</p>
                      <p className="text-xs text-[#0E5A78] font-medium tabular-nums">
                        {formatPEN(crossSell.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(crossSell, crossSell.colors[0], crossSell.sizes[0], 1)
                      }
                      className="px-3 py-1.5 text-xs font-medium bg-[#0B0D0F] text-white rounded hover:bg-[#0E5A78] transition-colors whitespace-nowrap shrink-0"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Coupon */}
              <form onSubmit={handleCoupon} className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Código de cupón (ej. VERANO27)"
                    className="flex-1 px-3 py-2 text-xs border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium bg-[#FAF7F2] border border-black/15 rounded-md hover:bg-[#E8D8BD]/40 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-[#0E5A78]">
                    <span>Cupón activo: {appliedCoupon.code}</span>
                    <button type="button" onClick={removeCoupon} className="underline">
                      Quitar
                    </button>
                  </div>
                )}
                {couponFeedback && (
                  <p className="text-xs text-[#082B3A]">{couponFeedback}</p>
                )}
              </form>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-black/8 bg-white space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#0B0D0F]/70">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPEN(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-[#0E5A78]">
                  <span>Descuento ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">− {formatPEN(cartDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total estimado</span>
                <span className="tabular-nums">{formatPEN(netSubtotal)}</span>
              </div>
              <p className="text-xs text-[#0B0D0F]/55">Envío calculado en checkout</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3.5 px-6 bg-[#0B0D0F] text-white text-sm font-semibold rounded-md hover:bg-[#0E5A78] transition-colors flex items-center justify-center gap-2"
              >
                <span>Finalizar compra</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-between gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="text-xs font-medium text-[#0B0D0F]/70 hover:text-[#0B0D0F] underline"
                >
                  Seguir comprando
                </button>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="text-xs font-medium text-[#0E5A78] hover:underline"
                >
                  Ver bolsa completa
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
