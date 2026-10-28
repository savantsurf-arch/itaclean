import React from 'react';
import { Building2, ShieldCheck, Truck, Users, Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* HERO */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 mx-auto shadow-sm">
            <img src="/itaclean-logo.jpg" alt="Itaclean" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#003893] bg-blue-50 px-3 py-1 rounded-full">
            Nossa História e Compromisso
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Sobre a Itaclean Limpeza e Descartável
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Especialistas em fornecer soluções completas, econômicas e de alto padrão técnico em
            produtos de higiene, químicos profissionais, papéis institucionais e equipamentos para o
            mercado corporativo brasileiro.
          </p>
        </div>

        {/* PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#003893] flex items-center justify-center">
              <Target className="w-5 h-5 text-[#009fe3]" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Nossa Missão</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Levar eficiência, redução de custos e segurança sanitária para empresas e condomínios
              através de produtos com alta capacidade de diluição e assessoria técnica especializada.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center">
              <Award className="w-5 h-5 text-[#003893]" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Garantia Técnica</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trabalhamos exclusivamente com marcas consagradas (Spartan, Renko, Bralimpia, Santher, Kimberly-Clark)
              com registro na ANVISA e laudos de eficácia bactericida e segurança.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Logística Expressa</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Frota própria e transportadoras parceiras homologadas para cargas químicas, garantindo
              que sua operação nunca fique desabastecida.
            </p>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
            A Distribuidora Parceira do Seu Negócio
          </h2>
          <p>
            Fundada com o propósito de modernizar as compras de insumos de limpeza e higiene, a{' '}
            <strong>Itaclean Limpeza e Descartável</strong> atende desde pequenas empresas até grandes indústrias,
            hospitais, redes de restaurantes e condomínios com milhares de moradores.
          </p>
          <p>
            Diferente de supermercados tradicionais, os produtos profissionais concentrados da Itaclean
            são desenvolvidos para serem dosados em água, gerando um custo por litro limpo infinitamente
            menor e com poder desengraxante e desinfetante comprovado cientificamente.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <p className="font-bold text-slate-900">Dados Cadastrais da Distribuidora:</p>
            <p>Razão Social: Itaclean Pro Distribuidora de Produtos de Limpeza Ltda</p>
            <p>CNPJ: 38.452.190/0001-44</p>
            <p>Endereço: Av. Cinquentenário, 187 - Centro - Itabuna/BA (CEP: 45600-077)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
