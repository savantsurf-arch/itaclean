import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Shield, LogOut, ChevronDown, X, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';
import { getProducts } from '../../lib/data-service';
import { Product } from '../../types';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { itemCount, subtotal, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Autocomplete search suggestions with debounce
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await getProducts({ search: searchTerm, pageSize: 5 });
      setSuggestions(res.products);
      setShowSuggestions(true);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/produtos?busca=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* LOGO ITACLEAN */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-slate-200 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/itaclean-logo.jpg"
              alt="Itaclean Limpeza e Descartável"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#003893] leading-none">
              ITACLEAN
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-sky-600 tracking-wider uppercase leading-tight mt-0.5">
              Limpeza & Descartável
            </span>
          </div>
        </Link>

        {/* SEARCH BAR (DESKTOP & TABLET) */}
        <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto, marca, SKU ou químico (ex: desengraxante, mop, papel)..."
              className="w-full pl-4 pr-24 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-12 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 px-3.5 py-1.5 bg-[#003893] hover:bg-[#002766] text-white rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                Sugestões de Produtos
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/produto/${p.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-2.5 hover:bg-sky-50/60 transition-colors"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500">
                        SKU: {p.sku} {p.brand && `• ${p.brand.name}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#003893]">
                        {formatCurrency(p.sale_price ?? p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs font-semibold text-[#003893] hover:underline"
                >
                  Ver todos os resultados para "{searchTerm}" →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* USER ACTIONS: ACCOUNT, WISHLIST, CART */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* USER ACCOUNT DROPDOWN */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-2 text-slate-700 hover:text-[#003893] hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                {user ? (
                  <span className="font-bold text-xs text-[#003893]">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] text-slate-500 leading-none">
                  {user ? `Olá, ${user.full_name.split(' ')[0]}` : 'Bem-vindo'}
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-0.5 mt-0.5">
                  {user ? 'Minha Conta' : 'Entrar / Cadastrar'}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                          Administrador da Loja
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span>Painel Administrativo</span>
                      </Link>
                    )}
                    <Link
                      to="/minha-conta"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Dados Cadastrais</span>
                    </Link>
                    <Link
                      to="/minha-conta?aba=pedidos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Meus Pedidos</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta</span>
                    </button>
                  </>
                ) : (
                  <div className="p-3 flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full py-2 bg-[#003893] hover:bg-[#002766] text-white text-xs font-semibold text-center rounded-md transition-colors"
                    >
                      Entrar na Conta
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center rounded-md transition-colors"
                    >
                      Criar Cadastro
                    </Link>
                    <div className="pt-2 border-t border-slate-100">
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 justify-center"
                      >
                        <Shield className="w-3.5 h-3.5" /> Acesso Painel Admin
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* WISHLIST BUTTON */}
          <Link
            to="/minha-conta?aba=favoritos"
            className="relative p-2 text-slate-700 hover:text-[#003893] hover:bg-slate-50 rounded-lg transition-colors"
            title="Meus Favoritos"
          >
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CART BUTTON WITH DRAWER TRIGGER */}
          <button
            onClick={openCart}
            className="flex items-center gap-2.5 bg-sky-50 hover:bg-sky-100/80 text-[#003893] border border-sky-200 px-3 py-2 rounded-lg transition-colors cursor-pointer group"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-[#003893] group-hover:scale-105 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Meu Carrinho
              </span>
              <span className="text-xs font-bold text-[#003893]">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH BAR */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por produto, químico, SKU..."
            className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
          />
          <button type="submit" className="absolute right-2 text-slate-500 p-1">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
};
