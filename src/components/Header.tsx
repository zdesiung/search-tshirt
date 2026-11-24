import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useStore } from '../context/StoreContext';
import { formatPEN, trackEcommerceEvent } from '../utils/analytics';
import { ResilientImage } from './ResilientImage';

const NAV_LINKS = [
  { label: 'Hombre', to: '/shop/hombre' },
  { label: 'Mujer', to: '/shop/mujer' },
  { label: 'Niños', to: '/shop/ninos' },
  { label: 'Playa', to: '/shop/playa' },
  { label: 'Colecciones', to: '/collections' },
  { label: 'Ofertas', to: '/shop/ofertas' },
];

export function Header() {
  const {
    cartCount,
    wishlist,
    setCartOpen,
    searchOpen,
    setSearchOpen,
    products,
    settings,
    dismissAnnouncement,
  } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled && !mobileMenuOpen;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, setSearchOpen]);

  const searchResults = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q)
        );
      })
    : products.slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    trackEcommerceEvent('search', { search_term: query.trim() });
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-40">
        {settings.announcementVisible && (
          <div className="h-8 bg-[#0B0D0F] text-white text-xs flex items-center justify-center px-8 relative">
            <p className="truncate tracking-wide font-normal text-[#E8D8BD]">
              {settings.announcementText}
            </p>
            <button
              type="button"
              onClick={dismissAnnouncement}
              aria-label="Cerrar aviso"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <header
          className={`transition-colors duration-200 ${
            isTransparent
              ? 'bg-gradient-to-b from-black/55 to-transparent text-white'
              : 'bg-white/95 backdrop-blur-md text-[#0B0D0F] border-b border-black/8 shadow-[0_1px_12px_rgba(11,13,15,0.04)]'
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4 lg:gap-8">
            {/* Mobile Hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú de navegación"
                className="w-11 h-11 -ml-2 inline-flex items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E5A78]"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Zone 1: Brand Wordmark */}
            <Link
              to="/"
              aria-label="BEACH POLO Inicio"
              className="whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E5A78] rounded"
            >
              <BrandLogo tone={isTransparent ? 'light' : 'dark'} />
            </Link>

            {/* Zone 2: Single-line Primary Navigation (Desktop) */}
            <nav
              aria-label="Navegación principal"
              className="hidden lg:flex items-center gap-7 text-sm font-medium"
            >
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                      active
                        ? isTransparent
                          ? 'border-white text-white'
                          : 'border-[#0E5A78] text-[#0E5A78]'
                        : isTransparent
                          ? 'border-transparent text-white/90 hover:text-white hover:border-white/70'
                          : 'border-transparent text-[#0B0D0F]/80 hover:text-[#0B0D0F] hover:border-[#0B0D0F]/40'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar productos"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-black/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E5A78]"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              <Link
                to="/account"
                aria-label="Mi cuenta y pedidos"
                className="hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E5A78]"
              >
                <User className="w-[18px] h-[18px]" />
              </Link>

              <Link
                to="/wishlist"
                aria-label={`Favoritos (${wishlist.length})`}
                className="hidden sm:inline-flex relative w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E5A78]"
              >
                <Heart className="w-[18px] h-[18px]" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B89B5E] text-[#0B0D0F] text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Abrir carrito (${cartCount} artículos)`}
                className="relative w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-black/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E5A78]"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#0E5A78] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] bg-white text-[#0B0D0F] h-full flex flex-col justify-between p-6 overflow-y-auto shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-black/8">
                <BrandLogo tone="dark" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="w-10 h-10 inline-flex items-center justify-center rounded-md hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="py-3 px-2 text-base font-display font-semibold border-b border-black/5 flex items-center justify-between hover:text-[#0E5A78]"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-[#0B0D0F]/40">→</span>
                  </Link>
                ))}
                <Link
                  to="/stories"
                  className="py-3 px-2 text-base font-display font-semibold border-b border-black/5 flex items-center justify-between hover:text-[#0E5A78]"
                >
                  <span>Beach Stories</span>
                  <span className="text-xs text-[#0B0D0F]/40">→</span>
                </Link>
              </nav>
            </div>

            <div className="pt-6 space-y-2 border-t border-black/8 text-sm">
              <Link
                to="/account"
                className="flex items-center gap-3 py-2.5 px-2 rounded-md hover:bg-[#FAF7F2]"
              >
                <User className="w-4 h-4 text-[#0E5A78]" />
                <span>Mi Cuenta & Pedidos</span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-3 py-2.5 px-2 rounded-md hover:bg-[#FAF7F2]"
              >
                <Heart className="w-4 h-4 text-[#0E5A78]" />
                <span>Favoritos ({wishlist.length})</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-3 py-2.5 px-2 rounded-md hover:bg-[#FAF7F2] text-[#0B0D0F]/70"
              >
                <span>Panel Administrativo</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div
            className="fixed inset-0 bg-[#0B0D0F]/60 backdrop-blur-xs"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white text-[#0B0D0F] rounded-xl shadow-2xl overflow-hidden border border-black/10">
            <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-black/8 px-4">
              <Search className="w-5 h-5 text-[#0B0D0F]/50 shrink-0" />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar polos Pima, shorts, gorras o colecciones..."
                className="w-full py-4 px-3 text-sm sm:text-base outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Cerrar buscador"
                className="w-9 h-9 inline-flex items-center justify-center rounded-md hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <div className="p-4 sm:p-5 max-h-[65vh] overflow-y-auto">
              <p className="text-xs font-medium text-[#0B0D0F]/55 mb-3">
                {query.trim() ? `Resultados (${searchResults.length})` : 'Recomendados para ti'}
              </p>
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#0B0D0F]/60">
                  No encontramos prendas para &ldquo;{query}&rdquo;. Intenta con &ldquo;Ocean&rdquo;, &ldquo;Sand&rdquo; o &ldquo;Short&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      to={`/producto/${item.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FAF7F2] transition-colors"
                    >
                      <div className="w-14 h-16 rounded-md overflow-hidden bg-[#FAF7F2] shrink-0">
                        <ResilientImage src={item.images[0]} alt={item.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-[#0B0D0F]/55 truncate">{item.category}</p>
                        <p className="text-xs font-semibold text-[#0E5A78] tabular-nums mt-0.5">
                          {formatPEN(item.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
