import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

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
    <section className="bg-slate-100 py-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003893]">
              Informativo & Novidades
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Receba Ofertas Exclusivas e Tabelas Promocionais
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cadastre o e-mail da sua empresa e receba lançamentos de produtos químicos, dispensers e descartáveis com cupom de desconto na 1ª compra.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[360px]">
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>E-mail cadastrado com sucesso! Em breve você receberá nossas ofertas.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="Seu e-mail corporativo..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#003893] hover:bg-[#002766] text-white font-bold text-xs rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cadastrar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
