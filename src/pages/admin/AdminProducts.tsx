import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Star,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Eye,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  DollarSign,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  getProducts,
  getCategories,
  saveProduct,
  deleteProduct,
  toggleProductActive,
} from '../../lib/data-service';
import { Product, Category } from '../../types';
import { formatCurrency, slugify } from '../../lib/utils';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'normal' | 'low' | 'out'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formLowStock, setFormLowStock] = useState('5');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDilution, setFormDilution] = useState('');
  const [formSafety, setFormSafety] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({ pageSize: 150, activeOnly: false }),
        getCategories(false),
      ]);
      setProducts(prodRes.products);
      setCategories(catRes);
    } catch (e) {
      console.error('Erro ao buscar dados de produtos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`ITA-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory(categories[0]?.id || '');
    setFormPrice('49.90');
    setFormSalePrice('');
    setFormStock('25');
    setFormLowStock('5');
    setFormShortDesc('');
    setFormDesc('');
    setFormDilution('Limpeza Pesada: 1:10 | Limpeza Leve: 1:50');
    setFormSafety('Utilizar luvas de proteção. Registro ANVISA.');
    setFormImage('https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80');
    setFormIsFeatured(false);
    setFormIsNew(true);
    setFormIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCategory(p.category_id || '');
    setFormPrice(p.price.toString());
    setFormSalePrice(p.sale_price ? p.sale_price.toString() : '');
    setFormStock(p.stock_quantity.toString());
    setFormLowStock(p.low_stock_threshold.toString());
    setFormShortDesc(p.short_description || '');
    setFormDesc(p.description);
    setFormDilution(p.dilution_info || '');
    setFormSafety(p.safety_info || '');
    setFormImage(p.images[0] || '');
    setFormIsFeatured(p.is_featured);
    setFormIsNew(p.is_new ?? false);
    setFormIsActive(p.is_active);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    const priceNum = parseFloat(formPrice.replace(',', '.'));
    const salePriceNum = formSalePrice ? parseFloat(formSalePrice.replace(',', '.')) : undefined;

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      slug: editingProduct ? editingProduct.slug : slugify(formName.trim()),
      sku: formSku.trim(),
      category_id: formCategory,
      price: isNaN(priceNum) ? 0 : priceNum,
      sale_price: salePriceNum && !isNaN(salePriceNum) ? salePriceNum : undefined,
      stock_quantity: parseInt(formStock, 10) || 0,
      low_stock_threshold: parseInt(formLowStock, 10) || 5,
      short_description: formShortDesc.trim(),
      description: formDesc.trim() || formShortDesc.trim(),
      dilution_info: formDilution.trim(),
      safety_info: formSafety.trim(),
      images: [formImage.trim() || '/itaclean-logo.jpg'],
      is_featured: formIsFeatured,
      is_new: formIsNew,
      is_active: formIsActive,
      created_at: editingProduct ? editingProduct.created_at : new Date().toISOString(),
    };

    setIsSaving(true);
    setModalError(null);

    try {
      await saveProduct(productPayload);
      setIsModalOpen(false);
      setActionFeedback({
        type: 'success',
        message: `Produto "${productPayload.name}" salvo e persistido com sucesso no banco de dados!`,
      });
      await loadData();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setModalError(err.message || 'Falha ao salvar produto no Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleProductActive(id, !currentActive);
      setActionFeedback({
        type: 'success',
        message: `Status do produto atualizado para ${!currentActive ? 'ATIVO' : 'INATIVO'} no Supabase!`,
      });
      await loadData();
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e: any) {
      setActionFeedback({
        type: 'error',
        message: e.message || 'Erro ao alterar status do produto.',
      });
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteConfirm.id);
      setActionFeedback({
        type: 'success',
        message: `Produto "${deleteConfirm.name}" excluído do Supabase com sucesso!`,
      });
      setDeleteConfirm(null);
      await loadData();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Erro ao excluir produto no Supabase.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'SKU', 'Preco', 'Preco_Promocional', 'Estoque', 'Destaque', 'Ativo'];
    const rows = filtered.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      p.price.toFixed(2),
      p.sale_price ? p.sale_price.toFixed(2) : '',
      p.stock_quantity,
      p.is_featured ? 'SIM' : 'NAO',
      p.is_active ? 'SIM' : 'NAO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `itaclean_produtos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'out') {
      matchesStock = p.stock_quantity === 0;
    } else if (stockFilter === 'low') {
      matchesStock = p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
    } else if (stockFilter === 'normal') {
      matchesStock = p.stock_quantity > p.low_stock_threshold;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate discount percentage if sale price is provided
  const parsedPrice = parseFloat(formPrice.replace(',', '.'));
  const parsedSalePrice = parseFloat(formSalePrice.replace(',', '.'));
  const discountPercent =
    !isNaN(parsedPrice) && !isNaN(parsedSalePrice) && parsedPrice > 0 && parsedSalePrice < parsedPrice
      ? Math.round(((parsedPrice - parsedSalePrice) / parsedPrice) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#003893]" />
            <span>Gerenciamento de Produtos & Estoque</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastre, edite preços, controle estoque e defina promoções na loja virtual
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
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
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

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003893]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-[#003893] cursor-pointer"
        >
          <option value="">Todas as Categorias ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-[#003893] cursor-pointer"
        >
          <option value="all">Todos os Estoques</option>
          <option value="normal">Estoque Normal</option>
          <option value="low">Alerta Estoque Baixo</option>
          <option value="out">Esgotado (0 un)</option>
        </select>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Preço Normal</th>
                <th className="py-3 px-4">Preço Promo</th>
                <th className="py-3 px-4">Estoque</th>
                <th className="py-3 px-4">Destaques</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#003893] mb-2" />
                    <span>Carregando produtos do Supabase...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isLow = prod.stock_quantity <= prod.low_stock_threshold;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0] || '/itaclean-logo.jpg'}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded-lg border border-slate-200 p-0.5 bg-white shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                            <span className="text-[10px] text-slate-400">
                              {prod.category?.name || 'Sem categoria'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">{prod.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {formatCurrency(prod.price)}
                      </td>
                      <td className="py-3 px-4">
                        {prod.sale_price ? (
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-emerald-600">
                              {formatCurrency(prod.sale_price)}
                            </span>
                            <span className="px-1 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded">
                              PROMO
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-black ${
                            prod.stock_quantity === 0
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {prod.stock_quantity} un
                        </span>
                        {isLow && prod.stock_quantity > 0 && (
                          <span className="text-[9px] text-amber-700 block font-bold">Mín: {prod.low_stock_threshold}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {prod.is_featured && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Star className="w-2.5 h-2.5 fill-current" /> Destaque
                            </span>
                          )}
                          {prod.is_new && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              <Sparkles className="w-2.5 h-2.5" /> Lançamento
                            </span>
                          )}
                          {!prod.is_featured && !prod.is_new && (
                            <span className="text-slate-400 text-[10px]">Padrão</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(prod.id, prod.is_active)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            prod.is_active
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                          title="Clique para ativar/desativar este produto"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prod.is_active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                          <span>{prod.is_active ? 'Ativo' : 'Inativo'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Editar produto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(prod)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Desengraxante Industrial Solv-Clean 5 Litros"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ITA-QUI-001"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893] font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preço Normal (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="69.90"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Preço Promocional (Opcional)</span>
                    {discountPercent > 0 && (
                      <span className="text-emerald-700 font-black text-[10px]">
                        -{discountPercent}% OFF
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="59.90"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estoque Atual *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alerta de Estoque Mínimo</label>
                  <input
                    type="number"
                    min={1}
                    value={formLowStock}
                    onChange={(e) => setFormLowStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">URL da Imagem Principal</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                    />
                    {formImage && (
                      <div className="w-12 h-12 rounded-lg border border-slate-200 p-0.5 bg-white shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={formImage}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => ((e.target as any).src = '/itaclean-logo.jpg')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Instruções de Diluição</label>
                  <input
                    type="text"
                    placeholder="Ex: 1:10 para limpeza pesada e 1:50 para manutenção"
                    value={formDilution}
                    onChange={(e) => setFormDilution(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Informações de Segurança / FISPQ</label>
                  <input
                    type="text"
                    placeholder="Ex: Utilizar luvas e óculos de proteção. Produto notificado ANVISA."
                    value={formSafety}
                    onChange={(e) => setFormSafety(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Descrição Comercial</label>
                  <textarea
                    rows={3}
                    placeholder="Detalhes completos sobre as vantagens e aplicações deste produto..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#003893] rounded"
                  />
                  <span>Exibir em Destaque na Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsNew}
                    onChange={(e) => setFormIsNew(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>Marcar como Lançamento</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#003893] rounded"
                  />
                  <span>Produto Ativo para Venda</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#003893] hover:bg-[#002766] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gravando no Banco...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Excluir Produto</h3>
                <p className="text-xs text-slate-500">Esta ação é irreversível no Supabase.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              Tem certeza que deseja excluir o produto{' '}
              <strong className="text-slate-900 font-bold">"{deleteConfirm.name}"</strong>?
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Sim, Excluir Produto</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
