import React from 'react';
import { ArrowRight } from 'lucide-react';
import { InstagramIcon } from '../common/InstagramIcon';

export const InstagramBanner: React.FC = () => {
  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-purple-900 via-pink-700 to-rose-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0 shadow-md">
            <InstagramIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Siga a Itaclean no Instagram
              </span>
              <span className="text-xs font-semibold text-pink-200">@itacleanlimpeza</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Dicas Técnicas de Diluição e Ofertas Semanais
            </h3>
            <p className="text-xs text-pink-100 max-w-lg mt-0.5">
              Acompanhe vídeos demonstrativos de químicos, aplicação de ceras e lançamentos em primeira mão.
            </p>
          </div>
        </div>

        <a
          href="https://www.instagram.com/itacleanlimpeza/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          <InstagramIcon className="w-4 h-4 text-pink-600" />
          <span>Ver Perfil @itacleanlimpeza</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};
