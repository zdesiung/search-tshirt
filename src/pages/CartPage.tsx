import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPEN } from '../utils/analytics';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

export function CartPage() {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useStore();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const total = Math.max(0, cartSubtotal - cartDiscount);

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Tu Bolsa de Compras | BEACH POLO Perú"
        description="Revisa tus prendas BEACH POLO antes de finalizar tu compra en Perú."
        canonicalPath="/cart"
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <h1 className="font-display font-extrabold text-3xl tracking-tight mb-8">
          Tu Bolsa de Compras
        </h1>

        {cart.length === 0 ? (
          <div className="py-20 text-center bg-[#FAF7F2] rounded-xl space-y-4">
            <p className="font-display font-semibold text-xl">Tu carrito está vacío</p>
            <p className="text-sm text-[#0B0D0F]/65">
              Descubre nuestros polos de algodón Pima y prendas de verano.
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78] transition-colors"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 divide-y divide-black/10 border-t border-b border-black/10">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.color.name}-${item.size}`}
                  className="py-5 flex gap-4 sm:gap-6 items-center"
                >
                  <Link
                    to={`/producto/${item.slug}`}
                    className="w-24 h-28 rounded-lg overflow-hidden bg-[#FAF7F2] shrink-0"
                  >
                    <ResilientImage src={item.image} alt={item.name} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${item.slug}`}
                      className="font-display font-bold text-base hover:text-[#0E5A78]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#0B0D0F]/60 mt-1">
                      Color: {item.color.name} · Talla: {item.size}
                    </p>
                    <p className="text-sm font-semibold mt-2 tabular-nums">
                      {formatPEN(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center border border-black/15 rounded-md">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, item.color.name, item.size, -1)}
                        className="w-9 h-9 inline-flex items-center justify-center hover:bg-black/5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, item.color.name, item.size, 1)}
                        className="w-9 h-9 inline-flex items-center justify-center hover:bg-black/5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="w-20 text-right font-bold text-sm tabular-nums hidden sm:block">
                      {formatPEN(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.color.name, item.size)}
                      aria-label="Eliminar producto"
                      className="p-2 text-[#0B0D0F]/45 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 bg-[#FAF7F2] rounded-xl p-6 space-y-5 h-fit">
              <h2 className="font-display font-bold text-lg">Resumen del pedido</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const r = applyCouponCode(couponInput);
                  setFeedback(r.message);
                  if (r.ok) setCouponInput('');
                }}
                className="space-y-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Cupón (VERANO27)"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-black/15 rounded-md outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B0D0F] text-white text-xs font-semibold rounded-md"
                  >
                    Aplicar
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-[#0E5A78]">
                    <span>{appliedCoupon.code} activo</span>
                    <button type="button" onClick={removeCoupon} className="underline">
                      Quitar
                    </button>
                  </div>
                )}
                {feedback && <p className="text-xs text-[#082B3A]">{feedback}</p>}
              </form>

              <div className="space-y-2 text-sm border-t border-black/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-[#0B0D0F]/70">Subtotal</span>
                  <span className="tabular-nums font-medium">{formatPEN(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-[#0E5A78]">
                    <span>Descuento</span>
                    <span className="tabular-nums">− {formatPEN(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#0B0D0F]/60">
                  <span>Envío</span>
                  <span>Envío calculado en checkout</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-black/10">
                  <span>Total</span>
                  <span className="tabular-nums">{formatPEN(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#0E5A78] transition-colors flex items-center justify-center gap-2"
              >
                <span>FINALIZAR COMPRA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/shop"
                className="block text-center text-xs font-medium text-[#0B0D0F]/70 hover:text-[#0B0D0F] underline"
              >
                SEGUIR COMPRANDO
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
