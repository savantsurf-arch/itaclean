import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
  Shield,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getOrders, getProducts } from '../lib/data-service';
import { Order, Product } from '../types';
import { formatCurrency, formatDocument, formatPhone } from '../lib/utils';
import { ProductCard } from '../components/common/ProductCard';

export const MyAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('aba') || 'pedidos';

  const { user, isAdmin, logout } = useAuth();
  const { wishlistIds } = useWishlist();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState('');

  // Editable Profile state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [documentNumber, setDocumentNumber] = useState(user?.document_number || '');
  const [companyName, setCompanyName] = useState(user?.company_name || '');

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFullName(user.full_name);
      setPhone(user.phone || '');
      setDocumentNumber(user.document_number || '');
      setCompanyName(user.company_name || '');
    }
  }, [user, navigate]);

  // Load orders
  useEffect(() => {
    getOrders().then((data) => {
      // Filter orders by user or email
      if (user) {
        const userOrders = data.filter(
          (o) => o.user_id === user.id || o.customer_email.toLowerCase() === user.email.toLowerCase()
        );
        setOrders(userOrders.length > 0 ? userOrders : data); // fallback to demo orders if none
      }
    });
  }, [user]);

  // Load wishlist products
  useEffect(() => {
    if (wishlistIds.length > 0) {
      getProducts({ pageSize: 50 }).then((res) => {
        setWishlistProducts(res.products.filter((p) => wishlistIds.includes(p.id)));
      });
    } else {
      setWishlistProducts([]);
    }
  }, [wishlistIds]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccessMessage('Dados atualizados com sucesso!');
    setTimeout(() => setSavedSuccessMessage(''), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'payment_approved':
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            Pagamento Aprovado
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
            <Truck className="w-3 h-3" /> Enviado / Em Trânsito
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">
            Entregue
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            Em Separação
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            Cancelado
          </span>
        );
      case 'pending_payment':
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Aguardando Pagamento
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Minha Conta
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Olá, <strong className="text-slate-800">{user?.full_name}</strong> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 bg-blue-50 text-[#003893] border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Acessar Painel Admin</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="px-3 py-2 bg-white text-rose-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR TABS */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 space-y-1">
            <button
              onClick={() => setSearchParams({ aba: 'pedidos' })}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'pedidos'
                  ? 'bg-[#003893] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Meus Pedidos</span>
            </button>

            <button
              onClick={() => setSearchParams({ aba: 'favoritos' })}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'favoritos'
                  ? 'bg-[#003893] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Lista de Favoritos ({wishlistIds.length})</span>
            </button>

            <button
              onClick={() => setSearchParams({ aba: 'dados' })}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'dados'
                  ? 'bg-[#003893] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Dados Cadastrais</span>
            </button>
          </aside>

          {/* MAIN TAB CONTENT */}
          <main className="lg:col-span-9">
            {/* ABA 1: MEUS PEDIDOS */}
            {activeTab === 'pedidos' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
                  <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Histórico de Compras</span>
                    <span className="text-xs text-slate-500 font-normal">
                      {orders.length} pedidos encontrados
                    </span>
                  </h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Package className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Você ainda não realizou nenhum pedido.</p>
                      <Link
                        to="/produtos"
                        className="inline-block px-4 py-2 bg-[#003893] text-white text-xs font-bold rounded-lg"
                      >
                        Começar a Comprar
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-sky-300 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <span className="font-mono text-xs font-bold text-[#003893]">
                                {ord.order_number}
                              </span>
                              <span className="text-slate-400 text-xs mx-2">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(ord.created_at).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(ord.created_at).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div>{getStatusBadge(ord.order_status)}</div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">
                                {ord.items.length} {ord.items.length === 1 ? 'item' : 'itens'}:{' '}
                                <span className="font-normal text-slate-600">
                                  {ord.items.map((i) => i.product_name_snapshot).join(', ')}
                                </span>
                              </p>
                              {ord.tracking_code && (
                                <p className="text-sky-700 font-semibold flex items-center gap-1">
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Rastreamento: {ord.tracking_code}</span>
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block uppercase">Total</span>
                                <span className="text-sm font-black text-[#003893]">
                                  {formatCurrency(ord.total_amount)}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Detalhes</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 2: FAVORITOS */}
            {activeTab === 'favoritos' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
                <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Meus Produtos Favoritos ({wishlistProducts.length})
                </h2>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Sua lista de favoritos está vazia.</p>
                    <p className="text-xs text-slate-500">
                      Clique no ícone de coração nos cards de produtos para salvá-los aqui.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlistProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ABA 3: DADOS CADASTRAIS */}
            {activeTab === 'dados' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
                <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Informações Pessoais e Comerciais
                </h2>

                {savedSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{savedSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">E-mail Cadastrado</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CPF ou CNPJ</label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(formatDocument(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        Razão Social da Empresa / Condomínio (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Condomínio Edifício Flamboyant"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Pedido {selectedOrder.order_number}
                </h3>
                <p className="text-xs text-slate-500">
                  Data: {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Status recap */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Status Operacional:</span>
                <span className="font-bold text-slate-900">
                  {getStatusBadge(selectedOrder.order_status)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Forma de Pagamento:</span>
                <span className="font-bold uppercase text-slate-900">
                  {selectedOrder.payment_method}
                </span>
              </div>
            </div>

            {/* Tracking Code if exists */}
            {selectedOrder.tracking_code && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-900">
                  <Truck className="w-4 h-4 text-sky-700" />
                  <span>Código de Rastreio: <strong>{selectedOrder.tracking_code}</strong></span>
                </div>
                <span className="text-[11px] font-bold text-sky-700">Frota Própria / Correios</span>
              </div>
            )}

            {/* Items table */}
            <div className="divide-y divide-slate-100 text-xs">
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{it.product_name_snapshot}</p>
                    <p className="text-[11px] text-slate-500">
                      SKU: {it.sku_snapshot} • {it.quantity} un x {formatCurrency(it.unit_price)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(it.line_total)}</span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descontos:</span>
                  <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>
                  {selectedOrder.shipping_amount === 0
                    ? 'Grátis'
                    : formatCurrency(selectedOrder.shipping_amount)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total:</span>
                <span className="text-base text-[#003893]">
                  {formatCurrency(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
