import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  products: Product[];
  viewAllLink?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  badge,
  products,
  viewAllLink = '/produtos',
}) => {
  if (products.length === 0) return null;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-2 border-b border-slate-200 gap-2">
        <div>
          {badge && (
            <span className="inline-block bg-sky-100 text-[#003893] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
              {badge}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <Link
          to={viewAllLink}
          className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#00225d] flex items-center gap-1 group whitespace-nowrap self-start sm:self-auto"
        >
          <span>Ver mais ofertas</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
