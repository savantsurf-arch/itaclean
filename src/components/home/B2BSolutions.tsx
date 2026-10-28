import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Factory, Stethoscope, UtensilsCrossed, Car, ArrowRight } from 'lucide-react';

const segments = [
  {
    id: 'condominios',
    title: 'Condomínios & Edifícios',
    description: 'Baldes espremedores, mops industriais, sabonetes galão 5L e sacos de lixo reforçados.',
    icon: Building,
    link: '/produtos?categoria=acessorios-de-limpeza',
    badge: 'Redução de Custos',
  },
  {
    id: 'industrias',
    title: 'Indústrias & Galpões',
    description: 'Desengraxantes pesados, químicos concentrados para máquinas e solventes de segurança.',
    icon: Factory,
    link: '/produtos?categoria=produtos-quimicos',
    badge: 'Alto Rendimento',
  },
  {
    id: 'clinicas',
    title: 'Clínicas & Saúde',
    description: 'Álcool 70% ANVISA, desinfetantes de nível intermediário e papéis toalha folha dupla virgem.',
    icon: Stethoscope,
    link: '/produtos?categoria=higiene-profissional',
    badge: 'Máxima Assepsia',
  },
  {
    id: 'restaurantes',
    title: 'Restaurantes & Bares',
    description: 'Detergentes para louças mecânicas, limpadores clorados e desincrustantes para fornos.',
    icon: UtensilsCrossed,
    link: '/produtos?categoria=produtos-quimicos',
    badge: 'Grau Alimentício',
  },
  {
    id: 'automotivo',
    title: 'Estética Automotiva',
    description: 'Shampoos neutros com cera de carnaúba, desengraxantes de chassi e microfibras.',
    icon: Car,
    link: '/produtos?categoria=limpeza-automotiva',
    badge: 'Brilho e Proteção',
  },
];

export const B2BSolutions: React.FC = () => {
  return (
    <section className="py-12 bg-slate-100/70 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#003893] bg-blue-100/60 px-3 py-1 rounded-full">
            Especialistas em Limpeza Profissional
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Soluções Sob Medida para o Seu Segmento
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Elimine desperdícios e aumente a produtividade da sua equipe com químicos diluíveis e equipamentos profissionais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <div
                key={seg.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#003893] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {seg.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{seg.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{seg.description}</p>
                </div>
                <Link
                  to={seg.link}
                  className="text-xs font-bold text-[#003893] hover:text-[#002766] flex items-center gap-1 group pt-2 border-t border-slate-100"
                >
                  <span>Ver produtos</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
