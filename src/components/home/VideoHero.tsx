import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { MEDIA_ASSETS } from '../../data/catalog';

export interface HeroSlide {
  id: string;
  label: string;
  desktop: string;
  mobile: string;
  caption: string;
  alt: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'golden-hour',
    label: '01 · Golden Hour',
    desktop: MEDIA_ASSETS.heroDesktop,
    mobile: MEDIA_ASSETS.heroMobile,
    caption: 'Costa Sur Peruana · Envíos a todo el Perú',
    alt: 'Pareja caminando por la playa peruana al atardecer con polos BEACH POLO',
  },
  {
    id: 'turquesa-pacific',
    label: '02 · Orilla del Pacífico',
    desktop: MEDIA_ASSETS.heroSlideFour,
    mobile: MEDIA_ASSETS.heroSlideFour,
    caption: 'Olas del Pacífico · Algodón Pima 220g',
    alt: 'Modelo caminando descalzo hacia olas turquesas en playa peruana',
  },
  {
    id: 'marea-alta',
    label: '03 · Marea Alta',
    desktop: MEDIA_ASSETS.editorialStory,
    mobile: MEDIA_ASSETS.catMujer,
    caption: 'Colección Summer 2027 · Cortes Relajados',
    alt: 'Modelos en playa peruana al anochecer con prendas beachwear arena y lino',
  },
  {
    id: 'costa-norte',
    label: '04 · Costa Norte',
    desktop: MEDIA_ASSETS.shopTheLook,
    mobile: MEDIA_ASSETS.heroMobile,
    caption: 'Océano · Libertad · Verano',
    alt: 'Lookbook costero frente al mar con polo azul océano y shorts arena',
  },
];

const AUTOPLAY_INTERVAL_MS = 4500;

export function VideoHero({ slides = DEFAULT_HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const safeIndex = slideIndex % slides.length;
  const current = slides[safeIndex];

  useEffect(() => {
    if (!playing || isHovered || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [playing, isHovered, slides.length, safeIndex]);

  const handlePrev = () => {
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setSlideIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      aria-label="Campaña principal BEACH POLO"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[640px] sm:h-[720px] lg:h-[92vh] lg:min-h-[680px] lg:max-h-[960px] flex items-end lg:items-center overflow-hidden bg-[#082B3A] text-white"
    >
      {/* Desktop 4-Slide Crossfade Stack (fixed height + object-cover for zero CLS) */}
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <img
            key={`desk-${slide.id}`}
            src={slide.desktop}
            alt={slide.alt}
            referrerPolicy="no-referrer"
            aria-hidden={index !== safeIndex}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-out ${
              index === safeIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
            } ${playing && index === safeIndex ? 'animate-hero-motion' : ''}`}
          />
        ))}
      </div>

      {/* Mobile Vertical Composition Stack (fixed height + object-cover for zero CLS) */}
      <div className="md:hidden absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <img
            key={`mob-${slide.id}`}
            src={slide.mobile}
            alt={slide.alt}
            referrerPolicy="no-referrer"
            aria-hidden={index !== safeIndex}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-out ${
              index === safeIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
            } ${playing && index === safeIndex ? 'animate-hero-motion' : ''}`}
          />
        ))}
      </div>

      {/* Measured contrast scrims */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] bg-gradient-to-r from-[#0B0D0F]/80 via-[#0B0D0F]/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0B0D0F]/75 via-transparent to-[#0B0D0F]/25"
      />

      {/* Overlaid Hero Copy & CTAs */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-12 lg:py-24">
        <div className="max-w-xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E8D8BD]">
            BEACH POLO · SUMMER 2027 · ENVÍOS A TODO EL PERÚ
          </p>

          <h1 className="font-display font-extrabold tracking-tight leading-[1.02] text-[clamp(2.5rem,5.5vw,4.5rem)] text-white [text-wrap:balance]">
            VIVE LA PLAYA
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-md leading-relaxed font-normal">
            Moda inspirada en el océano, creada para vivir el momento.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              to="/shop"
              className="px-7 py-3.5 bg-white text-[#0B0D0F] text-xs sm:text-sm font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#E8D8BD] transition-colors whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              COMPRAR AHORA
            </Link>
            <Link
              to="/collections/summer"
              className="px-7 py-3.5 bg-transparent border border-white/70 text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] rounded-md hover:bg-white/12 transition-colors whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              EXPLORAR COLECCIÓN
            </Link>
          </div>
        </div>

        {/* Slider Indicators & Controls */}
        <div className="mt-10 lg:mt-16 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-5">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setSlideIndex(index)}
                aria-current={safeIndex === index ? 'true' : undefined}
                className={`text-xs font-medium tracking-wider uppercase py-1.5 border-b transition-colors whitespace-nowrap shrink-0 ${
                  safeIndex === index
                    ? 'border-[#B89B5E] text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {slide.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-white/75">
            <span className="hidden sm:inline mr-1">{current.caption}</span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide anterior"
              className="w-9 h-9 rounded-full border border-white/30 bg-black/25 hover:bg-white/15 inline-flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente slide"
              className="w-9 h-9 rounded-full border border-white/30 bg-black/25 hover:bg-white/15 inline-flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pausar rotación automática' : 'Reanudar rotación automática'}
              className="w-9 h-9 rounded-full border border-white/30 bg-black/25 hover:bg-white/15 inline-flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
