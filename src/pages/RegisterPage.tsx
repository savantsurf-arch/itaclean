import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPhone } from '../lib/utils';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validações em tempo real
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      email,
      full_name: fullName,
      phone,
    });
    setIsLoading(false);

    if (res.success) {
      navigate('/minha-conta');
    } else {
      setError(res.error || 'Erro ao realizar cadastro.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#003893] rounded-full p-0.5"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 mx-auto shadow-xs">
              <img src="/itaclean-logo.jpg" alt="Itaclean Limpeza Profissional" className="w-full h-full object-cover" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Criar Cadastro</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre-se para comprar com agilidade e salvar seus endereços
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
            {/* Nome Completo */}
            <div>
              <label htmlFor="fullName" className="font-bold text-slate-700 block mb-1">
                Nome Completo / Contato *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  aria-required="true"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="font-bold text-slate-700 block mb-1">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  placeholder="seuemail@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Telefone / WhatsApp */}
            <div>
              <label htmlFor="phone" className="font-bold text-slate-700 block mb-1">
                Telefone / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  aria-required="true"
                  placeholder="(73) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] text-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Senha com Validação em Tempo Real */}
            <div>
              <label htmlFor="password" className="font-bold text-slate-700 block mb-1">
                Senha de Acesso (Mínimo 6 caracteres) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 text-slate-900 transition-colors ${
                    password.length > 0
                      ? isPasswordValid
                        ? 'border-emerald-400 focus:ring-emerald-500'
                        : 'border-amber-400 focus:ring-amber-500'
                      : 'border-slate-300 focus:ring-[#003893]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Feedback em tempo real para senha */}
              {password.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {isPasswordValid ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Senha válida (mínimo de 6 caracteres atingido)
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> A senha deve ter no mínimo 6 caracteres (digitados: {password.length}/6)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Confirmar Senha com Validação de Equivalência */}
            <div>
              <label htmlFor="confirmPassword" className="font-bold text-slate-700 block mb-1">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 text-slate-900 transition-colors ${
                    confirmPassword.length > 0
                      ? doPasswordsMatch
                        ? 'border-emerald-400 focus:ring-emerald-500'
                        : 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-[#003893]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Feedback em tempo real para confirmação */}
              {confirmPassword.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {doPasswordsMatch ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Senhas idênticas
                    </span>
                  ) : isPasswordMismatch ? (
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> As senhas não coincidem
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              className="w-full py-3 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#003893] focus:ring-offset-2"
            >
              <span>{isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Rodapé com Link para Login */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-bold text-[#003893] hover:text-[#00225d] underline hover:no-underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#003893] rounded px-1 py-0.5"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
