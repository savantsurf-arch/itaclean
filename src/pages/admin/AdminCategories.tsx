import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { getCategories, saveCategory } from '../../lib/data-service';
import { Category } from '../../types';
import { slugify } from '../../lib/utils';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState('1');
  const [formIsActive, setFormIsActive] = useState(true);

  const loadData = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDesc('');
    setFormOrder((categories.length + 1).toString());
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormDesc(c.description || '');
    setFormOrder(c.sort_order.toString());
    setFormIsActive(c.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: formName.trim(),
      slug: editingCategory ? editingCategory.slug : slugify(formName.trim()),
      description: formDesc.trim(),
      sort_order: parseInt(formOrder, 10) || 0,
      is_active: formIsActive,
    };

    await saveCategory(payload);
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Categorias do Catálogo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize os departamentos e menus visíveis na loja
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Ordem</th>
              <th className="py-3 px-4">Nome da Categoria</th>
              <th className="py-3 px-4">Slug / URL</th>
              <th className="py-3 px-4">Descrição</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-400">#{cat.sort_order}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{cat.slug}</td>
                <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                  {cat.description || '-'}
                </td>
                <td className="py-3 px-4">
                  {cat.is_active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Ativa
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Inativa
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Produtos Químicos Concentrados"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Breve descrição dos produtos pertencentes a esta categoria..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ordem de Exibição</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#003893] rounded"
                  />
                  <span>Categoria Ativa no Menu</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003893] text-white font-bold rounded-lg"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
