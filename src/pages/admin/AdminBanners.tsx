import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getBanners, saveBanner, deleteBanner } from '../../lib/data-service';
import { Banner } from '../../types';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formButtonText, setFormButtonText] = useState('Ver Produtos');
  const [formLink, setFormLink] = useState('/produtos');
  const [formDesktopImage, setFormDesktopImage] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formOrder, setFormOrder] = useState('1');

  const loadData = async () => {
    const list = await getBanners(false);
    setBanners(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormButtonText('Conferir Ofertas');
    setFormLink('/produtos');
    setFormDesktopImage('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1600&q=80');
    setFormBadge('Destaque');
    setFormOrder((banners.length + 1).toString());
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setFormTitle(b.title);
    setFormSubtitle(b.subtitle || '');
    setFormButtonText(b.button_text || 'Ver Produtos');
    setFormLink(b.link_url);
    setFormDesktopImage(b.desktop_image_url);
    setFormBadge(b.badge_text || '');
    setFormOrder(b.sort_order.toString());
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesktopImage.trim()) return;

    const payload: Banner = {
      id: editingBanner ? editingBanner.id : `ban-${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      button_text: formButtonText.trim(),
      link_url: formLink.trim(),
      desktop_image_url: formDesktopImage.trim(),
      badge_text: formBadge.trim(),
      sort_order: parseInt(formOrder, 10) || 1,
      is_active: true,
    };

    setIsSaving(true);
    setModalError(null);

    try {
      await saveBanner(payload);
      setIsModalOpen(false);
      setActionFeedback({
        type: 'success',
        message: `Banner "${payload.title}" salvo com sucesso no banco de dados!`,
      });
      await loadData();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setModalError(err.message || 'Erro ao persistir banner no Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este banner?')) {
      try {
        await deleteBanner(id);
        setActionFeedback({
          type: 'success',
          message: 'Banner excluído com sucesso do banco de dados!',
        });
        await loadData();
        setTimeout(() => setActionFeedback(null), 4000);
      } catch (err: any) {
        setActionFeedback({
          type: 'error',
          message: err.message || 'Falha ao excluir banner no Supabase.',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Banners & Vitrines Promocionais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie os slides principais exibidos na página inicial da loja
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Banner</span>
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((ban) => (
          <div
            key={ban.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/9] relative bg-slate-900 overflow-hidden">
                <img
                  src={ban.desktop_image_url}
                  alt={ban.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#003893] text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  Ordem #{ban.sort_order}
                </div>
                {ban.badge_text && (
                  <div className="absolute top-2 right-2 bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded">
                    {ban.badge_text}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                  {ban.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{ban.subtitle}</p>
                <p className="text-[11px] text-[#003893] font-medium pt-1">
                  Destino: <code>{ban.link_url}</code>
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(ban)}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                title="Editar banner"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(ban.id)}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                title="Excluir banner"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingBanner ? 'Editar Banner' : 'Novo Banner da Vitrine'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título do Banner *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Linha Completa de Limpeza Profissional"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtítulo / Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Químicos de alto rendimento com faturamento até 30 dias..."
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Etiqueta / Badge</label>
                  <input
                    type="text"
                    placeholder="Ex: B2B Especial"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de Destino *</label>
                <input
                  type="text"
                  required
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL da Imagem Desktop *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formDesktopImage}
                  onChange={(e) => setFormDesktopImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ordem de Exibição</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#003893] hover:bg-[#002766] disabled:opacity-50 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Banco...</span>
                    </>
                  ) : (
                    <span>Salvar Banner</span>
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
