import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Termos e Condições de Uso
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Condições gerais de navegação e compras na loja virtual Itaclean
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Aplicação e Aceite</h2>
            <p>
              Ao utilizar este portal e realizar compras de produtos de limpeza profissional e descartáveis,
              o comprador declara ter lido e concordado com as condições comerciais aqui estipuladas.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Produtos Químicos e Uso Profissional</h2>
            <p>
              A maioria dos produtos comercializados nesta loja possui formulação concentrada destinada ao
              uso institucional e profissional. O comprador é responsável por seguir as instruções de diluição,
              manuseio e uso de Equipamentos de Proteção Individual (EPIs) indicados na rotulagem e na FISPQ.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Preços e Faturamento PJ</h2>
            <p>
              Os preços informados incluem os tributos legais vigentes. As condições de faturamento a prazo via
              boleto bancário para Pessoas Jurídicas estão sujeitas à análise prévia e aprovação cadastral.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
