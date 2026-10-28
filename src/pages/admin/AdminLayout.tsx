import React, { useState } from 'react';
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
  AlertTriangle,
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

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, login, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // If user is not admin, show login / elevated role switcher
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black">Acesso Administrativo Restrito</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Esta área é exclusiva para a equipe de gestão da Itaclean. Identifique-se com uma conta de administrador para prosseguir.
          </p>

          <div className="pt-2 space-y-2">
            <button
              onClick={async () => {
                await login('admin@itaclean.com.br', 'admin123');
              }}
              className="w-full py-3 bg-[#009fe3] hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
            >
              Entrar como Administrador de Demonstração
            </button>
            <Link
              to="/"
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-xs rounded-xl transition-colors block"
            >
              Voltar para a Loja Pública
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
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
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
            <div>
              <Link to="/" className="text-xs text-sky-300 block py-2">
                ← Voltar para a Loja
              </Link>
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
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Sistema Operacional Ativo
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
            <div className="w-8 h-8 rounded-full bg-[#003893] text-white flex items-center justify-center font-bold text-xs">
              A
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
