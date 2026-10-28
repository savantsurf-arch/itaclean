import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CorporateBanner: React.FC = () => {
  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-[#00225d] via-[#003893] to-[#004bb5] text-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Background decorative pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-200 text-xs font-bold px-3 py-1 rounded-full border border-sky-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendas Corporativas & Faturamento B2B</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Sua Empresa Precisa de Cotação de Limpeza em Grande Escala?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Atendemos condomínios, indústrias, redes hoteleiras, clínicas e comércios com preços
              diferenciados por quantidade, faturamento via boleto e entrega programada por frota própria.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Boleto faturado até 30 dias</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tabela progressiva de atacado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Consultor técnico dedicado</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <Link
              to="/contato"
              className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Solicitar Orçamento PJ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/5511987654321?text=Ol%C3%A1!%20Represento%20uma%20empresa%20e%20gostaria%20de%20uma%20cota%C3%A7%C3%A3o%20corporativa."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-6 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl text-center border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Falar c/ Especialista no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
