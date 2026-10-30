import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Shield, CreditCard, Truck, Database, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { getStoreSettings, saveStoreSettings } from '../../lib/data-service';
import { testSupabaseConnection, SupabaseConnectionStatus } from '../../lib/supabase';
import { StoreSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings);
    // Realiza teste de conexão inicial com o Supabase
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
              <label className="font-bold text-slate-700 block mb-1">Perfil Oficial do Instagram</label>
              <input
                type="text"
                placeholder="https://www.instagram.com/itacleanlimpeza/"
                value={settings.instagram || ''}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
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
              <span>{isTestingDb ? 'Testando Conexão...' : 'Testar Conexão Novamente'}</span>
            </button>
          </div>

          {/* Status Geral */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            dbStatus?.connected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : dbStatus?.isConfigured
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            {dbStatus?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : dbStatus?.isConfigured ? (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Database className="w-5 h-5 text-[#003893] shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wide">
                  {dbStatus?.connected
                    ? '🟢 Supabase Online e Conectado'
                    : dbStatus?.isConfigured
                    ? '🟡 Chaves Configuradas (Tabelas Pendentes)'
                    : '🔵 Modo Local / Fallback Resiliente Ativo'}
                </span>
                {dbStatus?.latencyMs !== undefined && (
                  <span className="text-[10px] font-mono bg-white/70 px-1.5 py-0.5 rounded border border-current">
                    {dbStatus.latencyMs}ms
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{dbStatus?.message}</p>
              {dbStatus?.url && (
                <p className="text-[11px] font-mono opacity-80 pt-1">
                  URL do Projeto: {dbStatus.url}
                </p>
              )}
            </div>
          </div>

          {/* Status das Tabelas Individuais se configurado */}
          {dbStatus?.tables && (
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Status das Tabelas no PostgreSQL:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(dbStatus.tables).map(([table, isOk]) => (
                  <div
                    key={table}
                    className={`p-2.5 rounded-xl border text-center text-xs ${
                      isOk
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <span className="block font-bold text-[11px]">{table}</span>
                    <span className="text-[10px] font-semibold">
                      {isOk ? '✔ Conectada' : '✖ Não encontrada'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guia de Configuração se não conectado */}
          {!dbStatus?.connected && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-600 text-xs">
              <strong className="text-slate-800 block">Como ativar a conexão completa com o Supabase:</strong>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Acesse seu projeto no painel do <strong>Supabase</strong> e abra o <strong>SQL Editor</strong>.</li>
                <li>Copie e execute o script unificado em <code>supabase/complete_setup.sql</code>.</li>
                <li>Em <strong>Project Settings → API</strong>, copie a <strong>Project URL</strong> e a <strong>anon key</strong>.</li>
                <li>Insira no arquivo <code>.env</code> ou nas <strong>Environment Variables</strong> da Vercel:
                  <div className="mt-1 font-mono bg-slate-800 text-sky-300 p-2 rounded-lg text-[10px] space-y-0.5">
                    <div>VITE_SUPABASE_URL=https://sua-url.supabase.co</div>
                    <div>VITE_SUPABASE_ANON_KEY=sua-chave-anon</div>
                  </div>
                </li>
              </ol>
            </div>
          )}
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
