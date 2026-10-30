import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Percent,
  FlaskConical,
  Sparkles,
  ScrollText,
  Brush,
  Wrench,
  Zap,
  Car,
  Layers,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Phone,
  MessageCircle,
  LayoutGrid,
} from 'lucide-react';
import { getCategories } from '../../lib/data-service';
import { Category } from '../../types';

// Map category icons to Lucide icons
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Percent,
  FlaskConical,
  Sparkles,
  ScrollText,
  Brush,
  Wrench,
  Zap,
  Car,
  Layers,
  PackageCheck,
};

export const Navbar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      setTimeout(checkScroll, 100);
    });
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Check horizontal scroll limits
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  return (
    <nav className="bg-[#003893] text-white relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center gap-2 py-2 text-white focus:outline-none"
            aria-label="Abrir Menu de Categorias"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
            <span className="font-semibold text-xs tracking-wide uppercase">Todas as Categorias</span>
          </button>

          {/* DESKTOP CATEGORY BAR WITH ARROWS & SCROLL */}
          <div className="hidden lg:flex items-center flex-1 min-w-0 relative">
            {/* Scroll Left Button */}
            {canScrollLeft && (
              <button
                onClick={() => handleScroll('left')}
                className="absolute left-0 z-10 p-1 bg-[#002766]/90 hover:bg-[#002766] text-white rounded-full shadow-md transition-all -ml-2"
                aria-label="Rolar para esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable Category Pills Container */}
            <div
              ref={scrollRef}
              onWheel={handleWheel}
              className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none flex-1 min-w-0 scroll-smooth pr-1"
            >
              <Link
                to="/produtos"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-950/50 hover:bg-[#002766] border border-blue-400/25 rounded-md transition-colors whitespace-nowrap"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-sky-300" />
                <span>Todos os Produtos</span>
              </Link>

              {categories.map((cat) => {
                const IconComponent = cat.icon_name ? iconMap[cat.icon_name] : null;
                const isSpecialOffer = cat.slug === 'ofertas';

                return (
                  <Link
                    key={cat.id}
                    to={`/produtos?categoria=${cat.slug}`}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                      isSpecialOffer
                        ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-xs'
                        : 'text-blue-50 hover:bg-[#002766] hover:text-white'
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSpecialOffer ? 'text-slate-900' : 'text-sky-300'
                        }`}
                      />
                    )}
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            {canScrollRight && (
              <button
                onClick={() => handleScroll('right')}
                className="absolute right-0 z-10 p-1 bg-[#002766]/90 hover:bg-[#002766] text-white rounded-full shadow-md transition-all -mr-2"
                aria-label="Rolar para direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* QUICK B2B CTA (ALWAYS SEPARATED & FIXED TO THE RIGHT) */}
          <div className="hidden xl:flex items-center shrink-0 ml-4 pl-4 border-l border-blue-800/80">
            <Link
              to="/contato"
              className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 hover:text-white bg-blue-950/40 hover:bg-amber-500/20 border border-amber-400/35 transition-all whitespace-nowrap shadow-xs"
            >
              <span>Orçamento Rápido B2B</span>
              <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform font-bold">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white text-slate-800 w-4/5 max-w-sm h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="p-4 bg-[#003893] text-white flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">Menu de Categorias</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-blue-800 text-white"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 divide-y divide-slate-100 flex-1 overflow-y-auto">
              <Link
                to="/produtos"
                className="flex items-center justify-between py-2.5 px-3 text-sm font-bold text-[#003893] hover:bg-blue-50 rounded-md"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4 text-sky-600" />
                  <span>Ver Catálogo Completo</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {categories.map((cat) => {
                const IconComponent = cat.icon_name ? iconMap[cat.icon_name] : null;
                const isSpecialOffer = cat.slug === 'ofertas';

                return (
                  <Link
                    key={cat.id}
                    to={`/produtos?categoria=${cat.slug}`}
                    className={`flex items-center justify-between py-2.5 px-3 text-sm font-medium rounded-md transition-colors ${
                      isSpecialOffer
                        ? 'text-amber-800 bg-amber-50 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {IconComponent && (
                        <IconComponent
                          className={`w-4 h-4 ${
                            isSpecialOffer ? 'text-amber-600' : 'text-[#003893]'
                          }`}
                        />
                      )}
                      <span>{cat.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Contact Quick Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Fale com a Itaclean
              </p>
              <a
                href="tel:7341419517"
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#003893]"
              >
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>(73) 4141-9517</span>
              </a>
              <a
                href="https://wa.me/557341419517?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos%20Itaclean."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-green-700 hover:text-green-800"
              >
                <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                <span>WhatsApp: (73) 4141-9517</span>
              </a>
            </div>
          </div>

          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
};
