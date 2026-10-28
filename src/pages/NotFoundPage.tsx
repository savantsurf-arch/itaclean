import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-6xl font-black text-[#003893]">404</span>
        <h1 className="text-xl font-black text-slate-800">Página Não Encontrada</h1>
        <p className="text-xs text-slate-500">
          A página ou produto que você buscou não existe ou foi movido para outro endereço.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2.5 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Página Inicial</span>
          </Link>
          <Link
            to="/produtos"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Ver Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
