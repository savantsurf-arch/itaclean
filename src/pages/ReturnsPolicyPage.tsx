import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003893] bg-blue-50 px-2.5 py-1 rounded">
              Código de Defesa do Consumidor
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Política de Trocas e Devoluções
            </h1>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Direito de Arrependimento</h2>
            <p>
              Em conformidade com o Artigo 49 do CDC, compras realizadas online podem ser canceladas em até
              7 (sete) dias corridos após o recebimento, desde que o produto esteja na embalagem original,
              com lacre inviolado e acompanhado de Nota Fiscal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Avarias no Transporte ou Vazamentos Químicos</h2>
            <p>
              Caso receba uma bombona ou galão com lacre rompido ou avaria externa decorrente do transporte,
              recuse o recebimento no ato da entrega ou comunique nosso suporte em até 48 horas úteis para
              a reposição imediata sem qualquer custo adicional.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
