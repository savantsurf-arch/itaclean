import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit2,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { getCustomers, updateCustomer } from '../../lib/data-service';
import { CustomerSummary } from '../../types';
import { formatCurrency, formatPhone, formatDocument, formatCEP } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'recurrent' | 'single' | 'b2b' | 'b2c'>('all');

  // Modals state
  const [viewCustomer, setViewCustomer] = useState<CustomerSummary | null>(null);
  const [editCustomer, setEditCustomer] = useState<CustomerSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDoc, setFormDoc] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCep, setFormCep] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error('Erro ao carregar clientes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (cust: CustomerSummary) => {
    setEditCustomer(cust);
    setFormName(cust.name);
    setFormPhone(cust.phone);
    setFormEmail(cust.email);
    setFormDoc(cust.document || '');
    setFormStreet(cust.address?.street || '');
    setFormNumber(cust.address?.number || '');
    setFormNeighborhood(cust.address?.neighborhood || '');
    setFormCity(cust.address?.city || 'Itabuna');
    setFormState(cust.address?.state || 'BA');
    setFormCep(cust.address?.postal_code || '');
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    setIsSaving(true);
    setActionFeedback(null);

    try {
      await updateCustomer(editCustomer.id, {
        name: formName,
        phone: formPhone,
        email: formEmail,
        document: formDoc,
        address: {
          street: formStreet,
          number: formNumber,
          neighborhood: formNeighborhood,
          city: formCity,
          state: formState,
          postal_code: formCep,
        },
      });

      setActionFeedback({
        type: 'success',
        message: `Cadastro de ${formName} atualizado e sincronizado com o Supabase com sucesso!`,
      });
      setEditCustomer(null);
      await loadData();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Falha ao atualizar dados do cliente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Documento', 'Cidade', 'UF', 'Pedidos', 'Total_Gasto', 'Recorrente', 'Ultimo_Pedido'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.document || ''}"`,
      `"${c.address?.city || 'Itabuna'}"`,
      `"${c.address?.state || 'BA'}"`,
      c.total_orders,
      c.total_spent.toFixed(2),
      c.is_recurrent ? 'SIM' : 'NAO',
      `"${new Date(c.last_order_at).toLocaleDateString('pt-BR')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `itaclean_clientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.document && c.document.includes(q)) ||
      (c.address?.city && c.address.city.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (typeFilter === 'recurrent') return c.is_recurrent;
    if (typeFilter === 'single') return c.total_orders === 1;
    if (typeFilter === 'b2b') return c.document && c.document.replace(/\D/g, '').length === 14;
    if (typeFilter === 'b2c') return !c.document || c.document.replace(/\D/g, '').length <= 11;

    return true;
  });

  // Metrics
  const totalCustomersCount = customers.length;
  const recurrentCount = customers.filter((c) => c.is_recurrent).length;
  const b2bCount = customers.filter((c) => c.document && c.document.replace(/\D/g, '').length === 14).length;
  const totalRevenue = customers.reduce((acc, c) => acc + c.total_spent, 0);
  const avgSpent = totalCustomersCount > 0 ? totalRevenue / totalCustomersCount : 0;

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#003893]" />
            <span>Gerenciamento de Clientes</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Base unificada de clientes identificados na loja e pedidos via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Atualizar dados do Supabase"
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

      {/* FEEDBACK BANNER */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Clientes
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalCustomersCount}
            </span>
            <span className="text-[10px] text-slate-500">Unificados sem duplicatas</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Clientes Recorrentes
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {recurrentCount}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              {totalCustomersCount > 0 ? `${Math.round((recurrentCount / totalCustomersCount) * 100)}% de taxa de recompra` : '0%'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Empresas / B2B
            </span>
            <span className="text-2xl font-black text-[#FF6700] mt-1 block">
              {b2bCount}
            </span>
            <span className="text-[10px] text-slate-500">Com CNPJ identificado</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6700] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ticket Médio
            </span>
            <span className="text-2xl font-black text-[#003893] mt-1 block">
              {formatCurrency(avgSpent)}
            </span>
            <span className="text-[10px] text-slate-500">Gasto acumulado por cliente</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, CPF/CNPJ, e-mail ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#003893] focus:outline-none transition-all shadow-2xs"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#003893] focus:outline-none shadow-2xs cursor-pointer"
        >
          <option value="all">Todos os Clientes ({customers.length})</option>
          <option value="recurrent">Apenas Recorrentes (2+ pedidos)</option>
          <option value="single">Primeiro Pedido (1 pedido)</option>
          <option value="b2b">Pessoas Jurídicas (B2B)</option>
          <option value="b2c">Pessoas Físicas (CPF)</option>
        </select>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Cliente / Razão Social</th>
                <th className="py-3 px-4">Contato (WhatsApp)</th>
                <th className="py-3 px-4">Localidade</th>
                <th className="py-3 px-4">Pedidos</th>
                <th className="py-3 px-4">Total Gasto</th>
                <th className="py-3 px-4">Última Compra</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#003893] mb-2" />
                    <span>Carregando clientes do Supabase...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum cliente encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isB2B = cust.document && cust.document.replace(/\D/g, '').length === 14;
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                              cust.is_recurrent
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{cust.name}</span>
                              {cust.is_recurrent && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                  Recorrente
                                </span>
                              )}
                              {isB2B && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800">
                                  B2B
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              {cust.document ? formatDocument(cust.document) : cust.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <a
                          href={`https://wa.me/55${cust.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                          title="Abrir WhatsApp com este cliente"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{cust.phone}</span>
                        </a>
                        <span className="text-[10px] text-slate-400 block">{cust.email}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium block">
                          {cust.address?.city || 'Itabuna'}/{cust.address?.state || 'BA'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {cust.address?.neighborhood || 'Centro'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 text-xs">
                          {cust.total_orders} {cust.total_orders === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {formatCurrency(cust.total_spent)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(cust.last_order_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(cust.last_order_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewCustomer(cust)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#003893] rounded-lg transition-colors cursor-pointer"
                            title="Ver histórico e pedidos deste cliente"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Editar dados cadastrais"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW CUSTOMER & ORDER HISTORY MODAL */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#003893]" />
                <h3 className="font-black text-slate-900 text-sm">
                  Ficha do Cliente: {viewCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setViewCustomer(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nome / Razão Social</span>
                  <span className="font-bold text-slate-800 text-sm">{viewCustomer.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp / Telefone</span>
                  <a
                    href={`https://wa.me/55${viewCustomer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${viewCustomer.name}, tudo bem? Sou da equipe ItaClean!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{viewCustomer.phone} (Conversar no WhatsApp)</span>
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">E-mail</span>
                  <span className="text-slate-700">{viewCustomer.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">CPF / CNPJ</span>
                  <span className="text-slate-700 font-mono">
                    {viewCustomer.document ? formatDocument(viewCustomer.document) : 'Não informado'}
                  </span>
                </div>
              </div>

              {viewCustomer.address && (
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Endereço Principal</span>
                  <p className="text-slate-700">
                    {viewCustomer.address.street}, {viewCustomer.address.number}{' '}
                    {viewCustomer.address.complement && `(${viewCustomer.address.complement})`} -{' '}
                    {viewCustomer.address.neighborhood}, {viewCustomer.address.city}/{viewCustomer.address.state} -{' '}
                    CEP: {viewCustomer.address.postal_code}
                  </p>
                </div>
              )}
            </div>

            {/* Orders History List */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#003893]" />
                  <span>Histórico de Pedidos ({viewCustomer.orders.length})</span>
                </h4>
                <span className="font-bold text-xs text-slate-700">
                  Total Acumulado: {formatCurrency(viewCustomer.total_spent)}
                </span>
              </div>

              {viewCustomer.orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                  Nenhum pedido registrado para este cliente até o momento.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {viewCustomer.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#003893]">
                            {ord.order_number}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {ord.order_status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(ord.created_at).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(ord.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-slate-900 block">
                          {formatCurrency(ord.total_amount)}
                        </span>
                        <Link
                          to="/admin/pedidos"
                          className="text-[10px] font-bold text-[#003893] hover:underline flex items-center gap-0.5 justify-end"
                        >
                          <span>Ver no Painel</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const target = viewCustomer;
                  setViewCustomer(null);
                  openEditModal(target);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Dados Cadastrais</span>
              </button>

              <button
                type="button"
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">
                Editar Dados do Cliente
              </h3>
              <button
                onClick={() => setEditCustomer(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo / Razão Social *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    maxLength={18}
                    value={formDoc}
                    onChange={(e) => setFormDoc(formatDocument(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block mb-2 uppercase text-[11px]">
                  Endereço Cadastrado
                </span>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="col-span-2">
                    <label className="font-bold text-slate-600 block mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Número</label>
                    <input
                      type="text"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formNeighborhood}
                      onChange={(e) => setFormNeighborhood(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Cidade / UF</label>
                    <input
                      type="text"
                      value={`${formCity}/${formState}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('/');
                        setFormCity(parts[0] || 'Itabuna');
                        if (parts[1]) setFormState(parts[1]);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">CEP</label>
                    <input
                      type="text"
                      maxLength={9}
                      value={formCep}
                      onChange={(e) => setFormCep(formatCEP(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditCustomer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Supabase...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
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
