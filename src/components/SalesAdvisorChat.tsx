import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  RotateCcw,
  Send,
  ShoppingBag,
  X,
} from 'lucide-react';
import { MEDIA_ASSETS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/ecommerce';
import {
  ADVISOR_FAQS,
  buildWhatsAppUrl,
  evaluateSalesQuery,
  getAvailableSizes,
} from '../utils/salesAdvisor';
import { ResilientImage } from './ResilientImage';

interface ChatMessage {
  id: string;
  sender: 'advisor' | 'user';
  text: string;
  products?: Product[];
  links?: { label: string; to: string }[];
  whatsappDraft?: string;
}

function AdvisorProductCard({
  product,
  whatsappPhone,
  onNavigate,
}: {
  product: Product;
  whatsappPhone: string;
  onNavigate: () => void;
}) {
  const { addToCart } = useStore();
  const availableSizes = getAvailableSizes(product);
  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes[0] || product.sizes[0]
  );
  const [added, setAdded] = useState(false);

  const primaryColor = product.colors[0];
  const productWaUrl = buildWhatsAppUrl(
    whatsappPhone,
    `Hola BEACH POLO, Valeria me mostró ${product.name} (S/ ${product.price}, talla ${selectedSize}). ¿Me confirman disponibilidad para compra?`
  );

  const handleAdd = () => {
    if (!selectedSize || (product.stock[selectedSize] ?? 0) <= 0) return;
    addToCart(product, primaryColor, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="bg-white border border-black/10 rounded-xl p-2.5 flex gap-2.5 items-start shadow-xs">
      <Link
        to={`/producto/${product.slug}`}
        onClick={onNavigate}
        className="w-16 h-20 rounded-lg overflow-hidden bg-[#FAF7F2] shrink-0 block"
      >
        <ResilientImage src={product.images[0]} alt={product.name} />
      </Link>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/producto/${product.slug}`}
              onClick={onNavigate}
              className="font-display font-bold text-xs text-[#0B0D0F] hover:text-[#0E5A78] truncate block"
            >
              {product.name}
            </Link>
            <p className="text-[11px] text-[#0B0D0F]/55 capitalize truncate">
              {product.category} · {primaryColor.name}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono font-bold text-xs text-[#0B0D0F]">
              S/ {product.price}
            </p>
            {product.compareAtPrice && (
              <p className="font-mono text-[10px] text-[#0B0D0F]/40 line-through">
                S/ {product.compareAtPrice}
              </p>
            )}
          </div>
        </div>

        {availableSizes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {availableSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                  selectedSize === sz
                    ? 'bg-[#082B3A] text-white border-[#082B3A]'
                    : 'bg-[#FAF7F2] text-[#0B0D0F]/75 border-black/10 hover:border-black/30'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-red-600 font-medium">Sin stock temporal</p>
        )}

        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            disabled={availableSizes.length === 0}
            onClick={handleAdd}
            className="flex-1 h-7 px-2.5 rounded-md bg-[#0E5A78] hover:bg-[#082B3A] disabled:opacity-40 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors"
          >
            {added ? (
              <>
                <Check className="w-3 h-3" />
                <span>Agregado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>Agregar</span>
              </>
            )}
          </button>

          <Link
            to={`/producto/${product.slug}`}
            onClick={onNavigate}
            className="h-7 px-2 rounded-md border border-black/15 hover:border-[#0B0D0F] text-[11px] font-medium text-[#0B0D0F] inline-flex items-center"
          >
            Ver
          </Link>

          <a
            href={productWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar ${product.name} por WhatsApp`}
            title="Consultar este producto por WhatsApp"
            className="h-7 w-7 rounded-md border border-[#0F7B4D]/30 bg-[#0F7B4D]/8 text-[#0F7B4D] hover:bg-[#0F7B4D] hover:text-white inline-flex items-center justify-center transition-colors shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function SalesAdvisorChat({ onClose }: { onClose: () => void }) {
  const { products, coupons, shippingRates, settings, cart } = useStore();
  const [showFaqs, setShowFaqs] = useState(true);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const initialGreeting = useMemo<ChatMessage>(
    () => ({
      id: 'msg-welcome',
      sender: 'advisor',
      text: `¡Hola! Soy Valeria, tu asesora virtual de BEACH POLO. Puedo ayudarte con tallas, envíos gratis desde S/ ${
        settings.freeShippingThreshold || 199
      }, código VERANO27 (-15%), cambios o recomendarte prendas por nombre y precio en soles (S/).`,
      whatsappDraft:
        '¡Hola BEACH POLO! Estoy en su tienda online y me gustaría recibir asesoría de Valeria sobre sus prendas y envíos en Perú.',
    }),
    [settings.freeShippingThreshold]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuestion = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    const reply = evaluateSalesQuery(trimmed, {
      products,
      coupons,
      shippingRates,
      settings,
    });

    const advisorMsg: ChatMessage = {
      id: `adv-${Date.now() + 1}`,
      sender: 'advisor',
      text: reply.text,
      products: reply.products,
      links: reply.links,
      whatsappDraft: reply.whatsappDraft,
    };

    setMessages((prev) => [...prev, userMsg, advisorMsg]);
    setInput('');
    setShowFaqs(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const handleReset = () => {
    setMessages([initialGreeting]);
    setShowFaqs(true);
    setInput('');
  };

  const conversationWaHref = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
    const lastAdvisor = [...messages].reverse().find((m) => m.sender === 'advisor');

    const lines = ['Hola BEACH POLO, vengo del chat con Valeria en la tienda online.'];
    if (lastUser) {
      lines.push(`Mi consulta: "${lastUser.text}"`);
    }
    if (lastAdvisor?.products && lastAdvisor.products.length > 0) {
      lines.push(
        `Prendas consultadas: ${lastAdvisor.products
          .map((p) => `${p.name} (S/ ${p.price})`)
          .join(', ')}`
      );
    }
    if (cart.length > 0) {
      lines.push(
        `En mi bolsa tengo: ${cart
          .map((i) => `${i.quantity}x ${i.name} (${i.size})`)
          .join(', ')}`
      );
    }
    return buildWhatsAppUrl(settings.whatsappPhone, lines.join('\n'));
  }, [messages, cart, settings.whatsappPhone]);

  return (
    <section
      aria-label="Asesora virtual de ventas BEACH POLO"
      className="w-[calc(100vw-2rem)] sm:w-[392px] h-[min(74vh,580px)] bg-white text-[#0B0D0F] rounded-2xl shadow-2xl border border-black/12 flex flex-col overflow-hidden"
    >
      {/* Advisor Header with Female Avatar */}
      <div className="bg-[#082B3A] text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={MEDIA_ASSETS.advisorAvatar}
              alt="Valeria, asesora de ventas BEACH POLO"
              className="w-10 h-10 rounded-full object-cover object-top border border-[#E8D8BD]/60 bg-[#E8D8BD]"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#082B3A]"
            />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm truncate">
              Valeria · Asesora BEACH POLO
            </p>
            <p className="text-[11px] text-[#E8D8BD]/90 truncate">
              Tallas, envíos Perú (gratis S/ {settings.freeShippingThreshold || 199}) y compras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar conversación"
            title="Reiniciar conversación"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar asesora virtual"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages History */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3 bg-[#FAF7F2]/60"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } gap-2`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0E5A78] text-white rounded-br-xs'
                  : 'bg-white border border-black/8 text-[#0B0D0F] rounded-bl-xs shadow-2xs'
              }`}
            >
              {msg.text}
            </div>

            {msg.products && msg.products.length > 0 && (
              <div className="w-full space-y-2">
                {msg.products.map((prod) => (
                  <AdvisorProductCard
                    key={`${msg.id}-${prod.id}`}
                    product={prod}
                    whatsappPhone={settings.whatsappPhone}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            )}

            {msg.links && msg.links.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {msg.links.map((lnk) => (
                  <Link
                    key={lnk.to + lnk.label}
                    to={lnk.to}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-black/12 text-[11px] font-semibold text-[#0E5A78] hover:border-[#0E5A78] transition-colors"
                  >
                    <span>{lnk.label}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick FAQ Buttons */}
      <div className="border-t border-black/8 bg-white px-3.5 py-2 shrink-0">
        <button
          type="button"
          onClick={() => setShowFaqs((v) => !v)}
          className="w-full flex items-center justify-between text-[11px] font-semibold text-[#082B3A] py-0.5"
        >
          <span>Preguntas frecuentes rápidas</span>
          {showFaqs ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#0E5A78]" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-[#0E5A78]" />
          )}
        </button>

        {showFaqs && (
          <div className="mt-2 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pb-1">
            {ADVISOR_FAQS.map((faq) => (
              <button
                key={faq.id}
                type="button"
                onClick={() => sendQuestion(faq.question)}
                className="text-left px-2.5 py-1.5 rounded-lg border border-black/12 bg-[#FAF7F2] hover:bg-[#0E5A78] hover:text-white hover:border-[#0E5A78] text-[11px] font-medium text-[#0B0D0F] transition-colors leading-snug"
              >
                {faq.label} · {faq.question}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Handoff + Composer */}
      <div className="border-t border-black/8 bg-white px-3.5 py-2.5 space-y-2 shrink-0">
        <a
          href={conversationWaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-8 px-3 rounded-lg bg-[#0F7B4D]/10 hover:bg-[#0F7B4D] text-[#0F7B4D] hover:text-white border border-[#0F7B4D]/25 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Enviar consulta por WhatsApp (+51 955871452)</span>
        </a>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Busca por nombre (Ocean, Short) o precio (S/ 90)..."
            aria-label="Escribe tu consulta para Valeria"
            className="flex-1 h-9 px-3 text-xs rounded-lg border border-black/15 bg-[#FAF7F2]/60 focus:bg-white focus:border-[#0E5A78] outline-none"
          />
          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={!input.trim()}
            className="h-9 w-9 rounded-lg bg-[#082B3A] hover:bg-[#0E5A78] disabled:opacity-40 text-white inline-flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </section>
  );
}
