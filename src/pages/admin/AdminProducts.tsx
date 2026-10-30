import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Check,
  X,
  AlertTriangle,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getProducts, getCategories, saveProduct, deleteProduct } from '../../lib/data-service';
import { Product, Category } from '../../types';
import { formatCurrency, slugify } from '../../lib/utils';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
  const [formIsActive, setFormIsActive] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [prodRes, catRes] = await Promise.all([
      getProducts({ pageSize: 100, activeOnly: false }),
      getCategories(false),
    ]);
    setProducts(prodRes.products);
    setCategories(catRes);
    setIsLoading(false);
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
      is_active: formIsActive,
      is_new: false,
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

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      try {
        await deleteProduct(id);
        setActionFeedback({
          type: 'success',
          message: 'Produto excluído com sucesso do banco de dados!',
        });
        await loadData();
        setTimeout(() => setActionFeedback(null), 4000);
      } catch (err: any) {
        setActionFeedback({
          type: 'error',
          message: err.message || 'Falha ao excluir produto no Supabase.',
        });
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'SKU', 'Preco', 'Preco_Promocional', 'Estoque', 'Destaque', 'Ativo'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.price,
      p.sale_price || '',
      p.stock_quantity,
      p.is_featured ? 'SIM' : 'NAO',
      p.is_active ? 'SIM' : 'NAO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalogo_itaclean_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestão de Produtos & Estoque
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre, edite preços, controle estoque e regras técnicas de químicos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
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

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003893]"
        >
          <option value="">Todas as Categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
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
                <th className="py-3 px-4">Destaque</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => {
                const isLow = prod.stock_quantity <= prod.low_stock_threshold;
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0] || '/itaclean-logo.jpg'}
                          alt={prod.name}
                          className="w-10 h-10 object-contain rounded border border-slate-100 shrink-0"
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
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {prod.sale_price ? formatCurrency(prod.sale_price) : '-'}
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
                    </td>
                    <td className="py-3 px-4">
                      {prod.is_featured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-current" /> Sim
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Não</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {prod.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Inativo
                        </span>
                      )}
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
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
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
                  <label className="font-bold text-slate-700 block mb-1">Preço Promocional (Opcional)</label>
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
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                  />
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

              <div className="flex items-center gap-6 pt-2">
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
    </div>
  );
};
