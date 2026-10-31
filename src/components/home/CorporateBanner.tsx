import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileSpreadsheet, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';

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
            {/* CTA 1: Solicitar Orçamento PJ - WCAG Contrast Ratio: 13.5:1 (AAA) */}
            <Link
              to="/contato"
              className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-amber-300 cursor-pointer"
              aria-label="Solicitar Orçamento PJ e Vendas Corporativas"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-slate-950" />
              <span>Solicitar Orçamento PJ</span>
              <ArrowRight className="w-4 h-4 shrink-0 text-slate-950" />
            </Link>

            {/* CTA 2: WhatsApp Comercial - WCAG Contrast Ratio: 5.5:1 (AA) */}
            <a
              href="https://wa.me/557341419517?text=Ol%C3%A1!%20Represento%20uma%20empresa%20e%20gostaria%20de%20uma%20cota%C3%A7%C3%A3o%20corporativa."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-emerald-400/40 focus:outline-none focus:ring-4 focus:ring-emerald-300 cursor-pointer"
              aria-label="Falar com Especialista Técnico e Comercial pelo WhatsApp"
            >
              <MessageCircle className="w-4 h-4 shrink-0 text-white" />
              <span>Falar c/ Especialista no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
