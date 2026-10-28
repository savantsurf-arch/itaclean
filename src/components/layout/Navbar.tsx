import React, { useState, useEffect } from 'react';
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
  Phone,
  MessageCircle,
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
  const location = useLocation();

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <nav className="bg-[#003893] text-white sticky top-[68px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center gap-2 py-3 text-white focus:outline-none"
            aria-label="Abrir Menu de Categorias"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            <span className="font-semibold text-sm">Todas as Categorias</span>
          </button>

          {/* DESKTOP CATEGORY BAR */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            <Link
              to="/produtos"
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#002766] rounded-md transition-colors whitespace-nowrap"
            >
              Todos os Produtos
            </Link>

            {categories.map((cat) => {
              const IconComponent = cat.icon_name ? iconMap[cat.icon_name] : null;
              const isSpecialOffer = cat.slug === 'ofertas';

              return (
                <Link
                  key={cat.id}
                  to={`/produtos?categoria=${cat.slug}`}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    isSpecialOffer
                      ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow-xs'
                      : 'text-blue-50 hover:bg-[#002766] hover:text-white'
                  }`}
                >
                  {IconComponent && (
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isSpecialOffer ? 'text-slate-900' : 'text-sky-300'
                      }`}
                    />
                  )}
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>

          {/* QUICK B2B CTA */}
          <div className="hidden xl:flex items-center">
            <Link
              to="/contato"
              className="text-xs font-semibold text-sky-200 hover:text-white hover:underline flex items-center gap-1"
            >
              Orçamento Rápido B2B →
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/50 backdrop-blur-xs fixed inset-0 top-[110px] z-50 flex">
          <div className="bg-white text-slate-800 w-4/5 max-w-sm h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="p-4 bg-[#003893] text-white flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">Menu de Navegação</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-3 divide-y divide-slate-100 flex-1">
              <Link
                to="/produtos"
                className="flex items-center justify-between py-2.5 px-3 text-sm font-bold text-[#003893] hover:bg-blue-50 rounded-md"
              >
                <span>Ver Catálogo Completo</span>
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
                        ? 'text-amber-700 bg-amber-50 font-bold'
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
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
