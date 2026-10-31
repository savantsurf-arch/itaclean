import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/minha-conta`,
        });
        if (resetErr) {
          throw resetErr;
        }
      }
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Erro na recuperação de senha:', err);
      // Even if email is not found, protect user enumeration while giving friendly feedback
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 mx-auto shadow-xs">
              <img src="/itaclean-logo.jpg" alt="Itaclean" className="w-full h-full object-cover" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Recuperação de Senha
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Informe seu e-mail cadastrado para redefinir sua senha de acesso
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Instruções Enviadas!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Se o e-mail <strong>{email}</strong> estiver cadastrado em nosso sistema, você receberá um link com as instruções para redefinir sua senha em instantes.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg shadow-sm transition-colors text-center"
                >
                  Voltar para o Login
                </Link>
                <a
                  href="https://wa.me/557341419517?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20redefinir%20minha%20senha%20na%20Itaclean."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 text-xs font-semibold text-green-700 hover:text-green-800 flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                  <span>Ajuda via WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="recovery-email" className="font-bold text-slate-700 block mb-1">
                  E-mail Cadastrado *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    placeholder="seuemail@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Enviando link...' : 'Enviar Link de Recuperação'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#003893] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Lembrou da senha? Voltar ao Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
