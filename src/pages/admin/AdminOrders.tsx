import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Loader2,
  AlertCircle,
  Calendar,
  Phone,
  Tag,
  DollarSign,
  Package,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../lib/data-service';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatCurrency, formatDocument } from '../../lib/utils';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status update modal state
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending_payment');
  const [newTracking, setNewTracking] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Erro ao buscar pedidos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.order_status);
    setNewTracking(ord.tracking_code || '');
    setNewNotes(ord.notes || '');
    setModalError(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    setModalError(null);

    try {
      await updateOrderStatus(selectedOrder.id, {
        order_status: newStatus,
        tracking_code: newTracking.trim(),
        notes: newNotes.trim(),
        payment_status:
          newStatus === 'payment_approved' ||
          newStatus === 'processing' ||
          newStatus === 'shipped' ||
          newStatus === 'delivered'
            ? 'paid'
            : selectedOrder.payment_status,
      });

      setSelectedOrder(null);
      setActionFeedback({
        type: 'success',
        message: `Status do pedido ${selectedOrder.order_number} atualizado com sucesso no Supabase!`,
      });
      await loadOrders();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setModalError(err.message || 'Falha ao atualizar status do pedido no Supabase.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper for human-friendly status labels and colors
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return {
          label: 'Novo Pedido',
          desc: 'Aguardando pagamento / confirmação',
          badgeClass: 'bg-blue-100 text-[#003893] border-blue-200',
        };
      case 'payment_approved':
        return {
          label: 'Aguardando Confirmação',
          desc: 'Pagamento recebido',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'processing':
        return {
          label: 'Em Preparação',
          desc: 'Separação e embalagem no almoxarifado',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'ready_for_shipping':
        return {
          label: 'Pronto para Despacho',
          desc: 'Aguardando coleta / retirada',
          badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'shipped':
        return {
          label: 'Saiu para Entrega',
          desc: 'Em trânsito com frota ou transportadora',
          badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        };
      case 'delivered':
        return {
          label: 'Concluído',
          desc: 'Entregue com sucesso ao cliente',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          desc: 'Pedido cancelado',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: status,
          desc: '',
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  // Filter orders by search, status, and period
  const filtered = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.customer_email.toLowerCase().includes(q);

    const matchStatus = !statusFilter || o.order_status === statusFilter;

    let matchPeriod = true;
    if (periodFilter !== 'all') {
      const orderDate = new Date(o.created_at).getTime();
      const now = Date.now();
      if (periodFilter === 'today') {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        matchPeriod = orderDate >= todayStart;
      } else if (periodFilter === '7days') {
        matchPeriod = now - orderDate <= 7 * 24 * 60 * 60 * 1000;
      } else if (periodFilter === '30days') {
        matchPeriod = now - orderDate <= 30 * 24 * 60 * 60 * 1000;
      }
    }

    return matchSearch && matchStatus && matchPeriod;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Numero_Pedido',
      'Data_Hora',
      'Cliente',
      'Telefone',
      'Email',
      'Status',
      'Pagamento',
      'Subtotal',
      'Frete',
      'Total',
    ];
    const rows = filtered.map((o) => [
      `"${o.order_number}"`,
      `"${new Date(o.created_at).toLocaleString('pt-BR')}"`,
      `"${o.customer_name.replace(/"/g, '""')}"`,
      `"${o.customer_phone}"`,
      `"${o.customer_email}"`,
      `"${o.order_status}"`,
      `"${o.payment_method}"`,
      o.subtotal.toFixed(2),
      o.shipping_amount.toFixed(2),
      o.total_amount.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `itaclean_pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalOrders = orders.length;
  const newOrdersCount = orders.filter((o) => o.order_status === 'pending_payment' || o.order_status === 'payment_approved').length;
  const inTransitCount = orders.filter((o) => o.order_status === 'processing' || o.order_status === 'shipped').length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#003893]" />
            <span>Gerenciamento de Pedidos & Faturamento</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize pedidos recebidos, consulte clientes, despache entregas e atualize andamentos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Atualizar pedidos do Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#003893]' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer text-xs">
            ✕
          </button>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Pedidos
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalOrders}
            </span>
            <span className="text-[10px] text-slate-500">Registrados na base</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Novos / Aguardando
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {newOrdersCount}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">Aguardando confirmação</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Em Preparação / Trânsito
            </span>
            <span className="text-2xl font-black text-cyan-600 mt-1 block">
              {inTransitCount}
            </span>
            <span className="text-[10px] text-cyan-700 font-bold">Expedição ativa</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Faturamento Bruto
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-[10px] text-slate-500">Total acumulado</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número do pedido, cliente, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003893]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-[#003893] cursor-pointer"
        >
          <option value="">Todos os Status</option>
          <option value="pending_payment">Novo Pedido</option>
          <option value="payment_approved">Aguardando Confirmação</option>
          <option value="processing">Em Preparação</option>
          <option value="shipped">Saiu para Entrega</option>
          <option value="delivered">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value as any)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-[#003893] cursor-pointer"
        >
          <option value="all">Todos os Períodos</option>
          <option value="today">Hoje</option>
          <option value="7days">Últimos 7 dias</option>
          <option value="30days">Últimos 30 dias</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Nº Pedido</th>
                <th className="py-3 px-4">Data e Horário</th>
                <th className="py-3 px-4">Cliente / Razão Social</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4">Status do Pedido</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#003893] mb-2" />
                    <span>Carregando pedidos do Supabase...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum pedido encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => {
                  const statusInfo = getStatusInfo(ord.order_status);
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#003893]">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="block font-bold text-slate-800">
                          {new Date(ord.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(ord.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{ord.customer_name}</p>
                        <p className="text-[10px] text-slate-400">{ord.customer_phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold uppercase text-slate-700 text-[11px] block">
                          {ord.payment_method === 'whatsapp' ? 'WhatsApp / Pix' : ord.payment_method}
                        </span>
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            ord.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.payment_status === 'paid' ? 'Pago' : 'Aguardando'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                        {ord.tracking_code && (
                          <span className="text-[10px] text-sky-600 font-mono block mt-0.5">
                            Rastreio: {ord.tracking_code}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {formatCurrency(ord.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openOrderModal(ord)}
                          className="px-3 py-1.5 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS & STATUS UPDATE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-base">
                    Pedido: {selectedOrder.order_number}
                  </h3>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      getStatusInfo(selectedOrder.order_status).badgeClass
                    }`}
                  >
                    {getStatusInfo(selectedOrder.order_status).label}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Realizado em {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(selectedOrder.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Client & Address Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[10px] text-slate-400">
                  Dados do Cliente
                </span>
                <p className="font-bold text-slate-800">{selectedOrder.customer_name}</p>
                <p className="text-slate-600">{selectedOrder.customer_email}</p>
                <p className="mt-1">
                  <a
                    href={`https://wa.me/55${selectedOrder.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${selectedOrder.customer_name}! Sobre o seu pedido ${selectedOrder.order_number} na ItaClean:`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline inline-flex items-center gap-1"
                    title="Abrir WhatsApp com o cliente"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedOrder.customer_phone} (Chamar no WhatsApp)</span>
                  </a>
                </p>
                {selectedOrder.customer_document && (
                  <p className="text-slate-600 font-mono mt-0.5">
                    Doc: {formatDocument(selectedOrder.customer_document)}
                  </p>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[10px] text-slate-400">
                  Endereço de Entrega
                </span>
                <p className="text-slate-800 font-medium">
                  {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}
                  {selectedOrder.shipping_address.complement && ` (${selectedOrder.shipping_address.complement})`}
                </p>
                <p className="text-slate-600">
                  {selectedOrder.shipping_address.neighborhood} — {selectedOrder.shipping_address.city}/
                  {selectedOrder.shipping_address.state}
                </p>
                <p className="text-slate-600 font-mono">
                  CEP: {selectedOrder.shipping_address.postal_code}
                </p>
                <p className="font-bold text-sky-700 mt-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Método: {selectedOrder.shipping_method}</span>
                </p>
              </div>
            </div>

            {/* Products & Quantities List */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#003893]" />
                <span>Produtos do Pedido ({selectedOrder.items.length})</span>
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {it.image_url ? (
                        <img
                          src={it.image_url}
                          alt={it.product_name_snapshot}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {it.quantity}x {it.product_name_snapshot}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          SKU: {it.sku_snapshot} | Unit: {formatCurrency(it.unit_price)}
                        </span>
                      </div>
                    </div>

                    <span className="font-black text-slate-900 shrink-0">
                      {formatCurrency(it.line_total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary & Observations */}
            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Desconto {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}:</span>
                  <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Frete:</span>
                <span>
                  {selectedOrder.shipping_amount === 0
                    ? 'Grátis'
                    : formatCurrency(selectedOrder.shipping_amount)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-[#003893]">
                <span>Total do Pedido:</span>
                <span>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
              {selectedOrder.notes && (
                <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                  <span className="font-bold text-slate-800 block">Observações do Cliente:</span>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateStatus} className="pt-3 border-t border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase">Atualizar Andamento no Supabase</h4>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Operacional *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893] font-bold cursor-pointer"
                >
                  <option value="pending_payment">Novo Pedido (Aguardando Pagamento)</option>
                  <option value="payment_approved">Aguardando Confirmação (Pagamento Aprovado)</option>
                  <option value="processing">Em Preparação (Separação no Almoxarifado)</option>
                  <option value="shipped">Saiu para Entrega (Em Rota de Envio)</option>
                  <option value="delivered">Concluído (Entregue ao Destinatário)</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Código de Rastreamento (Correios / Frota / Transportadora)
                </label>
                <input
                  type="text"
                  placeholder="Ex: FROTA-ITA-8821 ou BR123456789BR"
                  value={newTracking}
                  onChange={(e) => setNewTracking(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observações Internas</label>
                <textarea
                  rows={2}
                  placeholder="Notas internas para a equipe de expedição..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#003893] hover:bg-[#002766] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Supabase...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações do Pedido</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
