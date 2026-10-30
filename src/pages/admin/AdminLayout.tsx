import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Image as ImageIcon,
  Settings,
  Store,
  LogOut,
  Shield,
  Menu,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/produtos', label: 'Produtos & Estoque', icon: Package },
  { path: '/admin/categorias', label: 'Categorias', icon: Layers },
  { path: '/admin/pedidos', label: 'Pedidos & Vendas', icon: ShoppingBag },
  { path: '/admin/cupons', label: 'Cupons de Desconto', icon: Tag },
  { path: '/admin/banners', label: 'Banners da Vitrine', icon: ImageIcon },
  { path: '/admin/configuracoes', label: 'Configurações da Loja', icon: Settings },
];

const ADMIN_STORAGE_KEY = 'itaclean_admin_authenticated_session';
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || '2913';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, login, logout } = useAuth();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Verifica se o administrador já está autenticado nesta sessão
  const [isSessionAuthenticated, setIsSessionAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Garante que o perfil admin esteja ativo quando autenticado pelo PIN
  useEffect(() => {
    if (isSessionAuthenticated && !isAdmin) {
      login('admin@itaclean.com.br', 'admin123').catch(() => {});
    }
  }, [isSessionAuthenticated, isAdmin, login]);

  // Função para validar a senha do Administrador (2913)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (pinInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticating(true);
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
        setIsSessionAuthenticated(true);
        await login('admin@itaclean.com.br', 'admin123');
        setPinInput('');
      } catch (err) {
        console.error('Falha ao autenticar sessão admin:', err);
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      setAuthError('Senha incorreta. Acesso não autorizado.');
      setPinInput('');
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      setIsSessionAuthenticated(false);
      await logout();
      navigate('/');
    } catch (e) {
      navigate('/');
    }
  };

  // Se a senha 2913 ainda não foi informada nesta sessão, exibe a tela de bloqueio
  if (!isSessionAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00173d] via-[#00225d] to-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-blue-900/50 shadow-2xl space-y-6">
          {/* Logo e Ícone */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#009fe3] to-[#003893] p-0.5 mx-auto shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#00225d] rounded-2xl flex items-center justify-center text-white">
                <Lock className="w-8 h-8 text-[#009fe3]" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#009fe3]">
                Área Restrita
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Painel Administrativo
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Digite a senha de administrador para gerenciar a loja ItaClean.
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Formulário de Senha (2913) */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Senha de Acesso:</span>
                <span className="text-[10px] text-slate-500 font-normal">4 dígitos</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  maxLength={10}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-center tracking-[0.5em] font-mono text-xl focus:outline-none focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating || !pinInput.trim()}
              className="w-full py-3.5 bg-[#009fe3] hover:bg-sky-400 text-white font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isAuthenticating ? 'Validando...' : 'Acessar Painel de Controle'}</span>
            </button>
          </form>

          {/* Voltar para a Loja */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-[#009fe3] font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Voltar para a Loja Pública</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-[#00225d] text-white flex-col justify-between shrink-0 shadow-xl border-r border-blue-950">
        <div>
          {/* Logo / Header */}
          <div className="p-5 border-b border-blue-900/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-400/40 shrink-0">
              <img src="/itaclean-logo.jpg" alt="Itaclean" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wide text-white block">
                PAINEL ITACLEAN
              </span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                Gestão Comercial
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#009fe3] text-white shadow-md'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-900/60 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Ver Loja Pública</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão (Bloquear)</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileNavOpen(false)} />
          <div className="relative w-64 bg-[#00225d] text-white h-full p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-blue-900/60 mb-4">
                <span className="font-bold text-sm">Menu Admin</span>
                <button onClick={() => setIsMobileNavOpen(false)}>
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold ${
                        isActive(item.path, item.exact)
                          ? 'bg-[#009fe3] text-white'
                          : 'text-blue-100 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="space-y-2 border-t border-blue-900/60 pt-3">
              <Link to="/" className="text-xs text-sky-300 block py-1">
                ← Voltar para a Loja
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-red-300 block py-1 cursor-pointer"
              >
                Encerrar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Painel de Controle</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Sessão Autenticada
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="text-xs font-semibold text-[#003893] hover:underline flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visualizar Loja</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Bloquear Painel"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              ADM
            </div>
          </div>
        </header>

        {/* OUTLET FOR SUBPAGES */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
