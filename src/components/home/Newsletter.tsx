import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-gradient-to-b from-slate-100 to-slate-200/60 py-10 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#003893] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Informativo Técnico & Descontos B2B</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              Dicas Técnicas de Diluição e Ofertas Semanais
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Cadastre o e-mail da sua empresa e receba guias práticos de rendimento por litro, tabelas de faturamento direto e <strong className="text-emerald-700">cupom de 10% OFF</strong> para a 1ª compra corporativa.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[380px]">
            {isSubscribed ? (
              <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>E-mail cadastrado com sucesso! Enviamos seu cupom de 10% OFF.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    aria-label="E-mail corporativo para receber ofertas e dicas técnicas"
                    placeholder="Seu e-mail corporativo..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#003893] hover:bg-[#00225d] text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#003893] focus:ring-offset-2"
                >
                  Receber Ofertas
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
