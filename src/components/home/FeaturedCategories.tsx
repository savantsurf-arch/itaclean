import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
  ArrowRight,
} from 'lucide-react';
import { getCategories } from '../../lib/data-service';
import { Category } from '../../types';

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

export const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Categorias em Destaque
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Soluções completas para higiene, conservação e limpeza pesada
          </p>
        </div>
        <Link
          to="/categorias"
          className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#00225d] flex items-center gap-1 group focus:outline-none focus:ring-2 focus:ring-[#003893] rounded px-1"
          aria-label="Ver todas as categorias de produtos"
          title="Ver todas as categorias"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const IconComponent = cat.icon_name ? iconMap[cat.icon_name] : null;
          const isOffer = cat.slug === 'ofertas';

          return (
            <Link
              key={cat.id}
              to={`/produtos?categoria=${cat.slug}`}
              className={`group p-4 rounded-xl border transition-all duration-200 flex flex-col items-center text-center justify-center hover:-translate-y-1 hover:shadow-md ${
                isOffer
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100/50 border-amber-300'
                  : 'bg-white border-slate-200 hover:border-sky-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isOffer
                    ? 'bg-amber-400 text-slate-950 group-hover:scale-110 transition-transform'
                    : 'bg-sky-50 text-[#003893] group-hover:bg-[#003893] group-hover:text-white'
                }`}
              >
                {IconComponent ? (
                  <IconComponent className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#003893] transition-colors leading-tight">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                {cat.product_count || 5}+ itens
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
