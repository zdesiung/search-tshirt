import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { CATEGORIES, INSTAGRAM_POSTS, MEDIA_ASSETS } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ProductCard';
import { ResilientImage } from '../ResilientImage';

export function BenefitsBar() {
  const items = [
    { icon: Truck, title: 'Envíos a todo el Perú', detail: 'Lima 24-48h · Provincias 2-4 días' },
    { icon: ShieldCheck, title: 'Pagos Yape y Plin', detail: 'Validación directa y sin comisiones' },
    { icon: RefreshCw, title: 'Cambios fáciles', detail: 'Hasta 15 días sin complicaciones' },
    { icon: MessageCircle, title: 'Atención por WhatsApp', detail: 'Asesoría directa de tallas' },
  ];

  return (
    <section aria-label="Beneficios BEACH POLO" className="border-b border-black/8 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-[#0E5A78] shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#0B0D0F]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#0B0D0F]/55 mt-0.5">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function NewCollectionSection() {
  const cards = [
    {
      title: 'HOMBRE',
      subtitle: 'Piqué Pima & cortes limpios',
      image: MEDIA_ASSETS.heroMobile,
      to: '/shop/hombre',
      pos: 'object-top',
    },
    {
      title: 'MUJER',
      subtitle: 'Siluetas fluidas de verano',
      image: MEDIA_ASSETS.catMujer,
      to: '/shop/mujer',
      pos: 'object-top',
    },
    {
      title: 'PLAYA',
      subtitle: 'Lino & esenciales oceánicos',
      image: MEDIA_ASSETS.poloWhite,
      to: '/shop/playa',
      pos: 'object-center',
    },
    {
      title: 'BEACH LIFE',
      subtitle: 'Colección resort editorial',
      image: MEDIA_ASSETS.editorialStory,
      to: '/collections/beach-life',
      pos: 'object-center',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B89B5E]">
              SUMMER 2027
            </p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight">
              NUEVA COLECCIÓN
            </h2>
          </div>
          <Link
            to="/collections/summer"
            className="text-sm font-semibold text-[#0E5A78] hover:underline inline-flex items-center gap-1.5"
          >
            <span>Ver campaña completa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF7F2]"
            >
              <ResilientImage
                src={card.image}
                alt={card.title}
                className={`w-full h-full object-cover ${card.pos} transition-transform duration-700 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/80 via-[#0B0D0F]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[11px] text-[#E8D8BD] tracking-wider uppercase">
                  {card.subtitle}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-lg sm:text-xl tracking-wide">
                    {card.title}
                  </h3>
                  <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center group-hover:bg-white group-hover:text-[#0B0D0F] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BestSellersCarousel() {
  const { products } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);

  const slide = (dir: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  return (
    <section className="py-16 lg:py-24 bg-white border-t border-black/6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
              LOS MÁS VENDIDOS
            </h2>
            <p className="mt-1.5 text-sm text-[#0B0D0F]/65">
              Los favoritos de nuestra comunidad.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => slide('prev')}
              aria-label="Productos anteriores"
              className="w-10 h-10 rounded-full border border-black/15 hover:border-[#0B0D0F] inline-flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => slide('next')}
              aria-label="Siguientes productos"
              className="w-10 h-10 rounded-full border border-black/15 hover:border-[#0B0D0F] inline-flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2"
        >
          {bestSellers.map((prod) => (
            <div
              key={prod.id}
              className="snap-start shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
            >
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EditorialVideoSection() {
  const pillars = [
    {
      title: 'OCÉANO',
      desc: 'Tejidos respirables concebidos frente al Pacífico para acompañarte todo el día.',
      image: MEDIA_ASSETS.poloOcean,
      to: '/collections/ocean',
    },
    {
      title: 'LIBERTAD',
      desc: 'Cortes relajados que fluyen con la brisa desde Punta Hermosa hasta Máncora.',
      image: MEDIA_ASSETS.editorialStory,
      to: '/collections/beach-life',
    },
    {
      title: 'VERANO',
      desc: 'Algodón Pima peruano de fibra extra larga en tonos arena, sol y mar.',
      image: MEDIA_ASSETS.poloSunset,
      to: '/collections/summer',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#082B3A] text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E8D8BD]">
              Campaña Editorial
            </p>
            <h2 className="font-editorial italic text-3xl sm:text-4xl lg:text-5xl leading-tight">
              MORE THAN A POLO
            </h2>
            <p className="text-base text-white/80 leading-relaxed max-w-md">
              BEACH POLO nace para quienes encuentran libertad frente al mar.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#E8D8BD] hover:text-white transition-colors"
              >
                <span>Conoce nuestra historia</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 relative aspect-[16/9] rounded-xl overflow-hidden bg-[#0B0D0F]">
            <ResilientImage
              src={MEDIA_ASSETS.editorialStory}
              alt="Campaña editorial BEACH POLO en playa peruana"
              className="w-full h-full object-cover animate-hero-motion"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-white/85">
              <span>Costa Peruana · Film Lookbook 2027</span>
              <span className="font-mono">00:15 · 4K</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              to={pillar.to}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0B0D0F]"
            >
              <ResilientImage
                src={pillar.image}
                alt={pillar.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/90 via-[#0B0D0F]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display font-bold text-lg tracking-wider text-white">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-xs text-white/75 leading-relaxed">{pillar.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E5A78]">
              Explora por línea
            </p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight">
              CATEGORÍAS
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-[#0B0D0F] hover:text-[#0E5A78] inline-flex items-center gap-1"
          >
            <span>Ver todo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="group flex flex-col"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF7F2]">
                <ResilientImage
                  src={cat.image}
                  alt={cat.name}
                  className={`w-full h-full object-cover ${cat.objectPosition || 'object-center'} transition-transform duration-500 group-hover:scale-105`}
                />
              </div>
              <h3 className="mt-3 font-display font-bold text-base text-[#0B0D0F] group-hover:text-[#0E5A78] transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-[#0B0D0F]/60 mt-0.5 line-clamp-2">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandStorySection() {
  return (
    <section className="py-16 lg:py-24 bg-[#FAF7F2] border-y border-black/6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 aspect-[4/3] rounded-xl overflow-hidden bg-[#E8D8BD]/30">
            <ResilientImage
              src={MEDIA_ASSETS.poloSand}
              alt="Tejido de algodón Pima peruano BEACH POLO"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-5 lg:pl-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E5A78]">
              Confección Peruana
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-4xl tracking-tight leading-tight [text-wrap:balance]">
              Algodón Pima cultivado en la costa norte, diseñado para el mar.
            </h2>
            <p className="text-sm sm:text-base text-[#0B0D0F]/75 leading-relaxed">
              Cada polo BEACH POLO combina hilado de fibra extra larga con acabados pre-lavados que resisten el salitre, el sol y el ritmo diario. Producimos en talleres locales en Lima bajo estándares de comercio responsable.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-black/10">
              <div>
                <p className="font-display font-bold text-2xl tabular-nums text-[#082B3A]">
                  100%
                </p>
                <p className="text-xs text-[#0B0D0F]/60 mt-0.5">Algodón Pima Peruano</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl tabular-nums text-[#082B3A]">
                  220g
                </p>
                <p className="text-xs text-[#0B0D0F]/60 mt-0.5">Piqué de alta frescura</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl tabular-nums text-[#082B3A]">
                  24h
                </p>
                <p className="text-xs text-[#0B0D0F]/60 mt-0.5">Despacho Lima Express</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BeachStoriesSection() {
  const { stories } = useStore();

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B89B5E]">
              Revista Digital
            </p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight">
              BEACH STORIES
            </h2>
          </div>
          <Link
            to="/stories"
            className="text-sm font-semibold text-[#0E5A78] hover:underline inline-flex items-center gap-1"
          >
            <span>Todas las historias</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {stories.slice(0, 3).map((story) => (
            <article key={story.id} className="group flex flex-col">
              <Link
                to={`/stories/${story.slug}`}
                className="aspect-[16/10] rounded-xl overflow-hidden bg-[#FAF7F2]"
              >
                <ResilientImage
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="pt-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#0B0D0F]/55">
                    <span>{story.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{story.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{story.readTime}</span>
                  </div>
                  <Link to={`/stories/${story.slug}`}>
                    <h3 className="mt-1.5 font-display font-bold text-lg text-[#0B0D0F] group-hover:text-[#0E5A78] transition-colors">
                      {story.title}
                    </h3>
                  </Link>
                  <p className="mt-1.5 text-sm text-[#0B0D0F]/65 line-clamp-2">
                    {story.excerpt}
                  </p>
                </div>
                <Link
                  to={`/stories/${story.slug}`}
                  className="pt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0E5A78] hover:underline"
                >
                  <span>Leer más</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstagramGrid() {
  return (
    <section className="py-16 lg:py-20 bg-[#FAF7F2] border-t border-black/6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E5A78]">
              Comunidad Costera
            </p>
            <h2 className="mt-1.5 font-display font-bold text-2xl sm:text-3xl tracking-tight">
              @BEACHPOLO.PE
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#0E5A78] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            SEGUIR EN INSTAGRAM
          </a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label={post.caption}
              className="group relative aspect-square rounded-lg overflow-hidden bg-[#E8D8BD]/30"
            >
              <ResilientImage
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-wider text-[#E8D8BD]">
                  {post.type}
                </span>
                <p className="text-[11px] leading-tight line-clamp-2">{post.caption}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="py-16 lg:py-20 bg-white border-t border-black/8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B89B5E]">
          Club BEACH POLO
        </p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
          ÚNETE A BEACH POLO
        </h2>
        <p className="text-sm sm:text-base text-[#0B0D0F]/65">
          Recibe lanzamientos, descuentos y novedades.
        </p>

        {submitted ? (
          <div className="mt-6 p-4 rounded-lg bg-[#FAF7F2] border border-[#0E5A78]/20 text-sm text-[#082B3A]">
            ¡Bienvenido a la costa! Revisa tu bandeja de entrada para tu cupón de bienvenida <strong className="font-mono">PLAYA10</strong>.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Tu email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="TU EMAIL"
              className="flex-1 px-4 py-3 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78] bg-[#FAF7F2]/50"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#0E5A78] transition-colors whitespace-nowrap shrink-0"
            >
              SUSCRIBIRME
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
