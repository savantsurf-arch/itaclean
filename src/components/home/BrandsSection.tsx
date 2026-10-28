import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBrands } from '../../lib/data-service';
import { Brand } from '../../types';

export const BrandsSection: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    getBrands().then(setBrands);
  }, []);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Marcas que Trabalhamos
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Os melhores fabricantes mundiais e nacionais com garantia oficial
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {brands.map((b) => (
          <Link
            key={b.id}
            to={`/produtos?marca=${b.slug}`}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#003893] hover:shadow-sm flex items-center justify-center transition-all group text-center"
          >
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#003893] transition-colors">
              {b.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
