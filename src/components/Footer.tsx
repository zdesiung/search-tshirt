import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useStore } from '../context/StoreContext';

export function Footer() {
  const { settings } = useStore();

  return (
    <footer className="bg-[#0B0D0F] text-white border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo tone="light" />
            <p className="text-sm font-medium tracking-[0.2em] text-[#B89B5E] uppercase">
              {settings.tagline}.
            </p>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Moda beachwear contemporánea diseñada en el Perú con algodón Pima orgánico y espíritu oceánico.
            </p>
            <p className="text-xs text-white/50">{settings.showroomAddress}</p>
          </div>

          {/* Comprar */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Comprar
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/shop/hombre" className="hover:text-[#E8D8BD] transition-colors">Hombre</Link></li>
              <li><Link to="/shop/mujer" className="hover:text-[#E8D8BD] transition-colors">Mujer</Link></li>
              <li><Link to="/shop/ninos" className="hover:text-[#E8D8BD] transition-colors">Niños</Link></li>
              <li><Link to="/shop/playa" className="hover:text-[#E8D8BD] transition-colors">Playa</Link></li>
              <li><Link to="/shop/accesorios" className="hover:text-[#E8D8BD] transition-colors">Accesorios</Link></li>
              <li><Link to="/shop/ofertas" className="hover:text-[#E8D8BD] transition-colors">Ofertas</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Ayuda
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/contact" className="hover:text-[#E8D8BD] transition-colors">Contacto</Link></li>
              <li><Link to="/shipping" className="hover:text-[#E8D8BD] transition-colors">Envíos</Link></li>
              <li><Link to="/returns" className="hover:text-[#E8D8BD] transition-colors">Cambios</Link></li>
              <li><Link to="/returns" className="hover:text-[#E8D8BD] transition-colors">Devoluciones</Link></li>
              <li><Link to="/size-guide" className="hover:text-[#E8D8BD] transition-colors">Guía de tallas</Link></li>
              <li><Link to="/faq" className="hover:text-[#E8D8BD] transition-colors">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          {/* Nosotros */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Nosotros
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/about" className="hover:text-[#E8D8BD] transition-colors">Nuestra historia</Link></li>
              <li><Link to="/about#filosofia" className="hover:text-[#E8D8BD] transition-colors">Nuestra filosofía</Link></li>
              <li><Link to="/about#sostenibilidad" className="hover:text-[#E8D8BD] transition-colors">Sostenibilidad</Link></li>
              <li><Link to="/stories" className="hover:text-[#E8D8BD] transition-colors">Beach Stories</Link></li>
              <li><Link to="/orders" className="hover:text-[#E8D8BD] transition-colors">Seguir pedido</Link></li>
              <li><Link to="/admin" className="hover:text-[#E8D8BD] transition-colors">Panel Admin</Link></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/faq#terminos" className="hover:text-[#E8D8BD] transition-colors">Términos</Link></li>
                <li><Link to="/faq#privacidad" className="hover:text-[#E8D8BD] transition-colors">Privacidad</Link></li>
                <li><Link to="/faq#cookies" className="hover:text-[#E8D8BD] transition-colors">Cookies</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                Social
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/75">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white">TikTok</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white">YouTube</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/55">
          <p>© {new Date().getFullYear()} BEACH POLO Perú. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-white/40 uppercase tracking-wider">Pagos en Perú:</span>
            <span className="text-white/85 font-medium">Yape · Plin · Validación directa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
