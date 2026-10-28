import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Shield, CreditCard, Truck } from 'lucide-react';
import { getStoreSettings, saveStoreSettings } from '../../lib/data-service';
import { StoreSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Configurações Gerais da Loja
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina dados cadastrais, regras de frete e integrações de pagamento
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configurações salvas e aplicadas em toda a loja virtual!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* DADOS DA EMPRESA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Identificação Cadastral da Loja
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome da Loja *</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CNPJ da Distribuidora *</label>
              <input
                type="text"
                value={settings.cnpj}
                onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Telefone Fixo Comercial *</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp Comercial (com DDD) *</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">E-mail Comercial de Vendas *</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Horário de Expedição *</label>
              <input
                type="text"
                value={settings.business_hours}
                onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Endereço do Centro Logístico *</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>
          </div>
        </div>

        {/* REGRAS COMERCIAIS & FRETE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#003893]" />
            <span>Regras de Frete e Pagamento</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Valor Mínimo para Frete Grátis (R$) *
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
              <span className="text-[10px] text-slate-400">Padrão da loja: R$ 299,00</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Desconto à Vista no Pix (%) *
              </label>
              <input
                type="number"
                value={settings.pix_discount_percentage}
                onChange={(e) =>
                  setSettings({ ...settings, pix_discount_percentage: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
              <span className="text-[10px] text-slate-400">Padrão da loja: 5%</span>
            </div>
          </div>
        </div>

        {/* INFORMAÇÕES DE INTEGRAÇÃO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#003893]" />
            <span>Status das Integrações de Pagamento & Frete</span>
          </h2>

          <div className="space-y-2 text-slate-600 leading-relaxed">
            <p>
              • <strong>Mercado Pago / Gateway de Cartão:</strong> Para ativar transações ao vivo em produção, insira suas credenciais de produção no arquivo de ambiente <code>.env</code> ou nas variáveis de ambiente da Vercel (<code>PAYMENT_PROVIDER_SECRET_KEY</code> e <code>PAYMENT_WEBHOOK_SECRET</code>).
            </p>
            <p>
              • <strong>Supabase:</strong> A estrutura PostgreSQL, autenticação e tabelas de produtos, pedidos e clientes já estão com migrations prontas na pasta <code>supabase/migrations/</code>.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#003893] hover:bg-[#002766] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
