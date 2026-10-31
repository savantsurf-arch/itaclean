import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/minha-conta';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center pt-8 pb-32 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#003893] rounded-full p-0.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 mx-auto shadow-xs">
              <img src="/itaclean-logo.jpg" alt="Itaclean Limpeza Profissional" className="w-full h-full object-cover" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Acesse sua Conta
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consulte seus pedidos, notas fiscais e condições exclusivas
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {error && (
            <div
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate={false}>
            {/* Campo E-mail */}
            <div>
              <label htmlFor="email" className="font-bold text-slate-700 block mb-1">
                E-mail Corporativo ou Pessoal *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  aria-required="true"
                  placeholder="seuemail@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="font-bold text-slate-700">
                  Senha de Acesso *
                </label>
                <Link
                  to="/recuperar-senha"
                  className="text-[11px] font-semibold text-[#003893] hover:text-[#00225d] hover:underline focus:outline-none focus:ring-1 focus:ring-[#003893] rounded px-1 transition-colors"
                  title="Recuperar senha de acesso"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-[#003893]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#003893] focus:ring-offset-2"
            >
              <span>{isLoading ? 'Entrando...' : 'Entrar na Conta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé do Card com Link para Cadastro */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Ainda não tem cadastro?{' '}
              <Link
                to="/cadastro"
                className="font-bold text-[#003893] hover:text-[#00225d] underline hover:no-underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#003893] rounded px-1 py-0.5"
              >
                Criar uma conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
