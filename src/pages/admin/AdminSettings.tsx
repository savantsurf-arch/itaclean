import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Shield,
  CreditCard,
  Truck,
  Database,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Clock,
  MapPin,
  Building2,
} from 'lucide-react';
import { getStoreSettings, saveStoreSettings } from '../../lib/data-service';
import { testSupabaseConnection, SupabaseConnectionStatus } from '../../lib/supabase';
import { StoreSettings } from '../../types';
import { formatPhone, formatDocument, formatCEP } from '../../lib/utils';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings);
    testSupabaseConnection().then(setDbStatus);
  }, []);

  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    const status = await testSupabaseConnection();
    setDbStatus(status);
    setIsTestingDb(false);
  };

  if (!settings) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setIsSaved(false);

    try {
      const saved = await saveStoreSettings(settings);
      setSettings(saved);
      setIsSaved(true);
      const reloaded = await getStoreSettings();
      setSettings(reloaded);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao persistir configurações no Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#003893]" />
          <span>Configurações Gerais da Loja</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Defina dados cadastrais, logotipo, contatos, horário, regras de frete e status do banco
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configurações salvas e confirmadas com sucesso no Supabase!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* IDENTIFICAÇÃO E LOGO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#003893]" />
            <span>Identificação da Empresa & Logotipo</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome da Empresa / Loja *</label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CNPJ da Distribuidora *</label>
              <input
                type="text"
                required
                value={settings.cnpj}
                onChange={(e) => setSettings({ ...settings, cnpj: formatDocument(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">URL do Logotipo da Loja</label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Ex: /itaclean-logo.jpg ou https://..."
                  value={settings.logo_url || '/itaclean-logo.jpg'}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
                />
                <div className="w-16 h-12 rounded-lg border border-slate-200 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={settings.logo_url || '/itaclean-logo.jpg'}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => ((e.target as any).src = '/itaclean-logo.jpg')}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Exibido no cabeçalho, rodapé e comprovantes da loja virtual.
              </span>
            </div>
          </div>
        </div>

        {/* CONTATOS & ATENDIMENTO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#003893]" />
            <span>Canais de Atendimento & Horário de Funcionamento</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Telefone Fixo Comercial *</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: formatPhone(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp Comercial Oficial *</label>
              <input
                type="text"
                required
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
              <span className="text-[10px] text-slate-400">
                Formato com código do país: 557341419517
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">E-mail Comercial de Vendas *</label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Perfil Oficial do Instagram</label>
              <input
                type="text"
                placeholder="https://www.instagram.com/itacleanlimpeza/"
                value={settings.instagram || ''}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Horário de Funcionamento & Expedição *</label>
              <input
                type="text"
                required
                value={settings.business_hours}
                onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>
          </div>
        </div>

        {/* ENDEREÇO DA DISTRIBUIDORA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#003893]" />
            <span>Endereço do Centro Logístico & Distribuidora</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Logradouro / Avenida *</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Bairro *</label>
              <input
                type="text"
                required
                value={settings.neighborhood}
                onChange={(e) => setSettings({ ...settings, neighborhood: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estado (UF) *</label>
              <input
                type="text"
                required
                value={settings.state}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CEP *</label>
              <input
                type="text"
                required
                value={settings.postal_code}
                onChange={(e) => setSettings({ ...settings, postal_code: formatCEP(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#003893]"
              />
            </div>
          </div>
        </div>

        {/* REGRAS COMERCIAIS & FRETE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#003893]" />
            <span>Informações de Entrega, Frete & Descontos</span>
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

        {/* STATUS DAS CONEXÕES DO SUPABASE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-[#003893]" />
              <span>Conexão com Banco de Dados Supabase (PostgreSQL)</span>
            </h2>

            <button
              type="button"
              onClick={handleTestDatabase}
              disabled={isTestingDb}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
              <span>{isTestingDb ? 'Testando...' : 'Re-testar Conexão'}</span>
            </button>
          </div>

          {dbStatus && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                dbStatus.connected
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dbStatus.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span className="font-bold">
                    {dbStatus.connected
                      ? 'Conectada: Conexão bem-sucedida! PostgreSQL e tabelas ativas.'
                      : 'Falha na conexão com Supabase.'}
                  </span>
                </div>
                {dbStatus.latencyMs !== undefined && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Latência: {dbStatus.latencyMs}ms
                  </span>
                )}
              </div>

              <div className="text-[11px] space-y-1 pt-1 border-t border-slate-200/50">
                <p>
                  <strong>Endpoint:</strong>{' '}
                  <span className="font-mono text-slate-600">{dbStatus.url}</span>
                </p>
                {dbStatus.tables && (
                  <div className="pt-1">
                    <strong className="block mb-1">Tabelas Verificadas:</strong>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {Object.entries(dbStatus.tables).map(([tbl, ok]) => (
                        <span
                          key={tbl}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center justify-between ${
                            ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span>{tbl}</span>
                          <span>{ok ? '✔' : '✖'}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#003893] hover:bg-[#002766] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gravando no Supabase...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Configurações da Loja</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
