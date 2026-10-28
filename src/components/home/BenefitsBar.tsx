import React from 'react';
import { Truck, Building2, QrCode, ShieldCheck } from 'lucide-react';

export const BenefitsBar: React.FC = () => {
  return (
    <div className="bg-white border-b border-slate-200 py-4 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Benefício 1 */}
          <div className="flex items-center gap-3 py-2 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#003893] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#009fe3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">Frete Grátis</p>
              <p className="text-[11px] text-slate-500">Em compras acima de R$ 299</p>
            </div>
          </div>

          {/* Benefício 2 */}
          <div className="flex items-center gap-3 py-2 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#003893] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#003893]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">Faturamento PJ</p>
              <p className="text-[11px] text-slate-500">Boleto faturado para empresas</p>
            </div>
          </div>

          {/* Benefício 3 */}
          <div className="flex items-center gap-3 py-2 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">5% OFF no Pix</p>
              <p className="text-[11px] text-slate-500">Desconto imediato à vista</p>
            </div>
          </div>

          {/* Benefício 4 */}
          <div className="flex items-center gap-3 py-2 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">Qualidade Garantida</p>
              <p className="text-[11px] text-slate-500">Químicos com registro ANVISA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
