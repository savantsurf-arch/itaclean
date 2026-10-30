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
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../lib/data-service';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatCurrency } from '../../lib/utils';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status update modal state
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending_payment');
  const [newTracking, setNewTracking] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadOrders = async () => {
    const data = await getOrders();
    setOrders(data);
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
          newStatus === 'payment_approved' || newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered'
            ? 'paid'
            : selectedOrder.payment_status,
      });
      setSelectedOrder(null);
      setActionFeedback({
        type: 'success',
        message: `Status do pedido ${selectedOrder.order_number} atualizado com sucesso no banco de dados!`,
      });
      await loadOrders();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setModalError(err.message || 'Falha ao atualizar status do pedido no Supabase.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestão de Pedidos & Faturamento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe pedidos, despache mercadorias e atualize códigos de rastreio
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border animate-fadeIn ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por número do pedido, cliente ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003893]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003893]"
        >
          <option value="">Todos os Status</option>
          <option value="pending_payment">Aguardando Pagamento</option>
          <option value="payment_approved">Pagamento Aprovado</option>
          <option value="processing">Em Separação</option>
          <option value="ready_for_shipping">Pronto para Envio</option>
          <option value="shipped">Enviado / Em Trânsito</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Nº Pedido</th>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">Cliente / Razão Social</th>
              <th className="py-3 px-4">Pagamento</th>
              <th className="py-3 px-4">Status Operacional</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-[#003893]">
                  {ord.order_number}
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {new Date(ord.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">{ord.customer_name}</p>
                  <p className="text-[10px] text-slate-400">{ord.customer_email}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold uppercase text-slate-700 text-[11px] block">
                    {ord.payment_method}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      ord.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-800 block">{ord.order_status}</span>
                  {ord.tracking_code && (
                    <span className="text-[10px] text-sky-600 font-mono">
                      Rastreio: {ord.tracking_code}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-black text-slate-900">
                  {formatCurrency(ord.total_amount)}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => openOrderModal(ord)}
                    className="px-3 py-1.5 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Gerenciar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAILS & STATUS UPDATE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Gerenciar Pedido: {selectedOrder.order_number}
                </h3>
                <span className="text-xs text-slate-500">
                  Realizado em {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            {/* Client & Address Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Dados do Cliente:</span>
                <p>Nome: {selectedOrder.customer_name}</p>
                <p>E-mail: {selectedOrder.customer_email}</p>
                <p>
                  Tel: {selectedOrder.customer_phone}{' '}
                  <a
                    href={`https://wa.me/55${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-bold ml-1 hover:underline inline-flex items-center gap-0.5"
                    title="Conversar no WhatsApp"
                  >
                    (Abrir WhatsApp)
                  </a>
                </p>
                {selectedOrder.customer_document && <p>Doc: {selectedOrder.customer_document}</p>}
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">Endereço de Envio:</span>
                <p>
                  {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}
                </p>
                <p>
                  {selectedOrder.shipping_address.neighborhood} - {selectedOrder.shipping_address.city}/
                  {selectedOrder.shipping_address.state}
                </p>
                <p>CEP: {selectedOrder.shipping_address.postal_code}</p>
                <p className="font-bold text-sky-700 mt-1">Frete: {selectedOrder.shipping_method}</p>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100 text-xs">
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="py-2 flex justify-between">
                  <span>
                    {it.quantity}x {it.product_name_snapshot} ({it.sku_snapshot})
                  </span>
                  <span className="font-bold">{formatCurrency(it.line_total)}</span>
                </div>
              ))}
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateStatus} className="pt-3 border-t border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase">Atualizar Andamento</h4>

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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                >
                  <option value="pending_payment">Aguardando Pagamento</option>
                  <option value="payment_approved">Pagamento Aprovado</option>
                  <option value="processing">Em Separação no Almoxarifado</option>
                  <option value="ready_for_shipping">Pronto para Despacho / Retirada</option>
                  <option value="shipped">Enviado / Em Rota de Entrega</option>
                  <option value="delivered">Entregue ao Destinatário</option>
                  <option value="cancelled">Pedido Cancelado</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Código de Rastreamento (Correios / Frota / Transportadora)
                </label>
                <input
                  type="text"
                  placeholder="Ex: FROTA-ITA-9921 ou BR123456789BR"
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
                      <span>Salvando no Banco...</span>
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
