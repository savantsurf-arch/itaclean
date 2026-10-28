import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, X } from 'lucide-react';
import { getCoupons, saveCoupon, deleteCoupon } from '../../lib/data-service';
import { Coupon } from '../../types';
import { formatCurrency } from '../../lib/utils';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage');
  const [formValue, setFormValue] = useState('10');
  const [formMinOrder, setFormMinOrder] = useState('100');
  const [formLimit, setFormLimit] = useState('500');

  const loadData = async () => {
    const list = await getCoupons();
    setCoupons(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) return;

    const newCoupon: Coupon = {
      id: `cup-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      discount_type: formType,
      discount_value: parseFloat(formValue) || 10,
      min_order_amount: parseFloat(formMinOrder) || 0,
      usage_limit: parseInt(formLimit, 10) || 500,
      times_used: 0,
      is_active: true,
    };

    await saveCoupon(newCoupon);
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este cupom?')) {
      await deleteCoupon(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestão de Cupons de Desconto
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie códigos promocionais percentuais ou com desconto em reais
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#003893] hover:bg-[#002766] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Cupom</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Desconto</th>
              <th className="py-3 px-4">Pedido Mínimo</th>
              <th className="py-3 px-4">Utilizações</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((cup) => (
              <tr key={cup.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{cup.code}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">
                  {cup.discount_type === 'percentage'
                    ? `${cup.discount_value}% OFF`
                    : formatCurrency(cup.discount_value)}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {cup.min_order_amount ? formatCurrency(cup.min_order_amount) : 'Sem mínimo'}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {cup.times_used} / {cup.usage_limit || 'Ilimitado'}
                </td>
                <td className="py-3 px-4">
                  {cup.is_active ? (
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
                  <button
                    onClick={() => handleDelete(cup.id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Novo Cupom Promocional</h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PRIMEIRACOMPRA"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Desconto</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valor do Desconto *</label>
                  <input
                    type="number"
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pedido Mínimo (R$)</label>
                <input
                  type="number"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003893] text-white rounded-lg font-bold"
                >
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
