import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Eye,
  CheckCircle2,
  Truck,
  Users,
} from 'lucide-react';
import { getOrders, getProducts } from '../../lib/data-service';
import { Order, Product } from '../../types';
import { formatCurrency } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [ordRes, prodRes] = await Promise.all([
        getOrders(),
        getProducts({ pageSize: 100 }),
      ]);
      setOrders(ordRes);
      setProducts(prodRes.products);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Compute metrics
  const totalOrdersCount = orders.length;
  const confirmedOrders = orders.filter(
    (o) => o.payment_status === 'paid' && o.order_status !== 'cancelled'
  );
  const totalSalesRevenue = confirmedOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.payment_status === 'pending' || o.order_status === 'pending_payment'
  ).length;
  const averageTicket =
    confirmedOrders.length > 0 ? totalSalesRevenue / confirmedOrders.length : 0;
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard de Vendas & Operação
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas em tempo real da loja virtual Itaclean
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/produtos"
            className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Cadastrar Produto
          </Link>
          <Link
            to="/admin/pedidos"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Gerenciar Pedidos
          </Link>
          <Link
            to="/admin/clientes"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#003893]" />
            <span>Ver Clientes</span>
          </Link>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas Confirmadas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Vendas Confirmadas</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">
            {formatCurrency(totalSalesRevenue)}
          </span>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{confirmedOrders.length} pedidos pagos</span>
          </p>
        </div>

        {/* Total de Pedidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Total de Pedidos</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{totalOrdersCount}</span>
          <p className="text-[11px] text-slate-500 mt-1">Registrados no sistema</p>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Ticket Médio</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">
            {formatCurrency(averageTicket)}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Por pedido aprovado</p>
        </div>

        {/* Pedidos Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Pedidos Pendentes</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{pendingOrdersCount}</span>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Aguardando confirmação</p>
        </div>
      </div>

      {/* SECONDARY ROW: LOW STOCK ALERTS & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RECENT ORDERS TABLE */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Últimos Pedidos Recebidos
            </h2>
            <Link
              to="/admin/pedidos"
              className="text-xs font-bold text-[#003893] hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nº Pedido</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-[#003893]">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800 truncate max-w-[160px]">
                        {ord.customer_name}
                      </p>
                      <span className="text-[10px] text-slate-400">{ord.customer_email}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900">
                      {formatCurrency(ord.total_amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/admin/pedidos"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-block"
                        title="Ver pedido"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Alerta de Estoque Baixo</span>
            </h2>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {lowStockProducts.length} itens
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Todos os produtos estão com níveis saudáveis de estoque.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-rose-600 block">
                      {p.stock_quantity} un
                    </span>
                    <span className="text-[10px] text-slate-400">Mín: {p.low_stock_threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/admin/produtos"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg text-center block transition-colors"
          >
            Gerenciar Estoque de Produtos →
          </Link>
        </div>
      </div>
    </div>
  );
};
