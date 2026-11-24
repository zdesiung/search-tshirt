import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, COLLECTIONS } from '../data/catalog';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';

interface ShopPageProps {
  mode?: 'shop' | 'collections';
}

export function ShopPage({ mode = 'shop' }: ShopPageProps) {
  const { category, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, recentlyViewed } = useStore();

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSize, setSelectedSize] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>(
    'featured'
  );

  const activeCategory = mode === 'shop' ? category || 'all' : 'all';
  const activeCollection = mode === 'collections' ? slug || 'all' : 'all';

  const currentCatInfo = CATEGORIES.find((c) => c.slug === activeCategory);
  const currentColInfo = COLLECTIONS.find((c) => c.slug === activeCollection);

  const pageTitle =
    activeCategory === 'ofertas'
      ? 'OFERTAS SUMMER 2027'
      : currentCatInfo
        ? currentCatInfo.name.toUpperCase()
        : currentColInfo
          ? `COLECCIÓN ${currentColInfo.name}`
          : mode === 'collections'
            ? 'COLECCIONES BEACH POLO'
            : 'TIENDA BEACH POLO';

  const pageSubtitle =
    activeCategory === 'ofertas'
      ? 'Precios especiales de temporada en piezas seleccionadas.'
      : currentCatInfo?.description ||
        currentColInfo?.description ||
        'Algodón Pima peruano y diseños concebidos para vivir el verano todo el año.';

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeCategory === 'ofertas') {
      list = list.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    } else if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (activeCollection !== 'all') {
      list = list.filter((p) => p.collection === activeCollection);
    }

    if (selectedSize !== 'ALL') {
      list = list.filter((p) => p.sizes.includes(selectedSize));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [products, activeCategory, activeCollection, selectedSize, searchQuery, sortBy]);

  const recentProducts = products.filter((p) => recentlyViewed.includes(p.slug)).slice(0, 4);

  const availableSizes = ['ALL', 'XS', 'S', 'M', 'L', 'XL', 'Única'];

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title={`${pageTitle} | BEACH POLO Perú`}
        description={pageSubtitle}
        canonicalPath={
          mode === 'collections'
            ? activeCollection !== 'all'
              ? `/collections/${activeCollection}`
              : '/collections'
            : activeCategory !== 'all'
              ? `/shop/${activeCategory}`
              : '/shop'
        }
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#0B0D0F]/55 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-[#0B0D0F]">Inicio</Link>
          <span>/</span>
          <span className="text-[#0B0D0F] font-medium">{pageTitle}</span>
        </nav>

        {/* Header Banner */}
        <div className="pb-8 border-b border-black/8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-[#0B0D0F]">
              {pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-[#0B0D0F]/65">{pageSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#FAF7F2] border border-black/10 rounded-md"
              >
                <span>Búsqueda: &ldquo;{searchQuery}&rdquo;</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-xs text-[#0B0D0F]/55 tabular-nums">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>

        {/* Collections Switcher if in collections mode */}
        {mode === 'collections' && (
          <div className="py-5 border-b border-black/8 flex flex-wrap gap-2">
            <Link
              to="/collections"
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeCollection === 'all'
                  ? 'bg-[#0B0D0F] text-white'
                  : 'bg-[#FAF7F2] text-[#0B0D0F]/75 hover:text-[#0B0D0F]'
              }`}
            >
              Todas las colecciones
            </Link>
            {COLLECTIONS.map((col) => (
              <Link
                key={col.slug}
                to={`/collections/${col.slug}`}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                  activeCollection === col.slug
                    ? 'bg-[#0B0D0F] text-white'
                    : 'bg-[#FAF7F2] text-[#0B0D0F]/75 hover:text-[#0B0D0F]'
                }`}
              >
                {col.name}
              </Link>
            ))}
          </div>
        )}

        {/* Filter & Sort Toolbar */}
        <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/8 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <Link
              to="/shop"
              className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                mode === 'shop' && activeCategory === 'all'
                  ? 'bg-[#0B0D0F] text-white'
                  : 'bg-[#FAF7F2] text-[#0B0D0F]/75 hover:text-[#0B0D0F]'
              }`}
            >
              Todos
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop/${cat.slug}`}
                className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-[#0B0D0F] text-white'
                    : 'bg-[#FAF7F2] text-[#0B0D0F]/75 hover:text-[#0B0D0F]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/shop/ofertas"
              className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeCategory === 'ofertas'
                  ? 'bg-[#0E5A78] text-white'
                  : 'bg-[#FAF7F2] text-[#0E5A78] hover:bg-[#E8D8BD]/40'
              }`}
            >
              Ofertas
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B0D0F]/55" />
              <span className="text-xs text-[#0B0D0F]/60">Talla:</span>
              <select
                aria-label="Filtrar por talla"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="text-xs font-medium bg-[#FAF7F2] border border-black/10 rounded-md px-2.5 py-1.5 outline-none"
              >
                {availableSizes.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'Todas' : s}
                  </option>
                ))}
              </select>
            </div>

            <select
              aria-label="Ordenar productos"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating')
              }
              className="text-xs font-medium bg-[#FAF7F2] border border-black/10 rounded-md px-3 py-1.5 outline-none"
            >
              <option value="featured">Ordenar: Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor valorados</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#FAF7F2] rounded-xl space-y-3">
            <p className="font-display font-bold text-lg">
              No hay productos con esos filtros
            </p>
            <p className="text-sm text-[#0B0D0F]/60">
              Prueba limpiando la talla seleccionada o explorando toda la tienda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSize('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#0B0D0F] text-white text-xs font-semibold rounded-md"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Recently Viewed CRO Section */}
        {recentProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-black/8">
            <h2 className="font-display font-bold text-xl mb-6">
              Vistos recientemente
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
