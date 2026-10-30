import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  connected: boolean;
  message: string;
  url?: string;
  latencyMs?: number;
  tables?: {
    categories: boolean;
    products: boolean;
    orders: boolean;
    banners: boolean;
    store_settings: boolean;
  };
}

/**
 * Realiza teste em tempo real de todas as conexões com as tabelas do Supabase
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      connected: false,
      message: 'Supabase em modo Local/Fallback. Para conectar ao banco na nuvem, defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env ou nas variáveis da Vercel.',
      url: supabaseUrl || 'Não definida',
    };
  }

  try {
    const start = Date.now();
    const [catRes, prodRes, ordRes, banRes, setRes] = await Promise.all([
      supabase.from('categories').select('id').limit(1),
      supabase.from('products').select('id').limit(1),
      supabase.from('orders').select('id').limit(1),
      supabase.from('banners').select('id').limit(1),
      supabase.from('store_settings').select('key').limit(1),
    ]);

    const latencyMs = Date.now() - start;

    const tables = {
      categories: !catRes.error,
      products: !prodRes.error,
      orders: !ordRes.error,
      banners: !banRes.error,
      store_settings: !setRes.error,
    };

    const allOk = Object.values(tables).every(Boolean);

    if (!allOk) {
      return {
        isConfigured: true,
        connected: false,
        message: 'Conectou ao Supabase, mas algumas tabelas ainda não foram criadas. Execute o script supabase/complete_setup.sql no SQL Editor do Supabase.',
        url: supabaseUrl,
        latencyMs,
        tables,
      };
    }

    return {
      isConfigured: true,
      connected: true,
      message: `Conexão bem-sucedida! PostgreSQL e tabelas ativas com tempo de resposta de ${latencyMs}ms.`,
      url: supabaseUrl,
      latencyMs,
      tables,
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      connected: false,
      message: `Erro ao comunicar com o Supabase: ${err.message || 'Falha de rede'}`,
      url: supabaseUrl,
    };
  }
}
