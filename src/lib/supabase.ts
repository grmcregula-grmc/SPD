import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar se as chaves são válidas (não são placeholders ou vazias)
const isValidConfig = !!(
  supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('sua-url-aqui') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('sua-chave')
);

// Configuração resiliente do cliente Supabase
const supabaseOptions = {
  auth: {
    persistSession: isValidConfig,
    autoRefreshToken: isValidConfig,
    detectSessionInUrl: isValidConfig,
    storage: isValidConfig ? (typeof window !== 'undefined' ? window.localStorage : undefined) : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  },
  global: {
    // Custom fetch para capturar erros de rede silenciosamente em modo Guest
    fetch: async (input: any, init?: any) => {
      try {
        const response = await fetch(input, init);
        return response;
      } catch (err: any) {
        if (!isValidConfig || err.message?.includes('fetch') || err.name === 'TypeError') {
          // Em modo Guest ou falha de DNS, silenciamos o erro para não poluir o console
          return new Response(JSON.stringify({ error: 'Supabase offline/unreachable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw err;
      }
    }
  }
};

export const supabase = createClient(
  isValidConfig ? supabaseUrl : 'https://placeholder.supabase.co', 
  isValidConfig ? supabaseAnonKey : 'placeholder',
  supabaseOptions
);

export const isSupabaseConfigured = isValidConfig;

// Função para verificar se o Supabase está REALMENTE acessível
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!isValidConfig) return false;
  try {
    const { error } = await supabase.from('parametros_sistema').select('count', { count: 'exact', head: true }).limit(1);
    return !error;
  } catch {
    return false;
  }
}

// =============================================
// PARÂMETROS DO SISTEMA (fallback local)
// =============================================
export const PARAMETROS_DEFAULT = {
  UFP_SE_VALOR: 79.90,
  UFP_SE_PISO: 100,
  UFP_SE_TETO: 10000,
  IPCA_ANUAL: 5.0,
  JUROS_MORA_MENSAL: 1.0,
  PRAZO_PAGAMENTO_DIAS: 20,
  MULTA_ATRASO_CONCESSIONARIA: 1.5,
  MULTA_OCIOSIDADE_PERCENTUAL: 5.0,
  IPD_PADRAO: 32,
  TARIFA_MEDIA: 6.50,
  MARGEM_EBITDA: 38,
  ICA_COBERTURA_AGUA: 95,
  ICE_COBERTURA_ESGOTO: 60,
  IMPOSTOS_RECEITA: 9.25,
  // Dosimetria - Atenuantes
  ATENUANTE_PAGAMENTO_ANTECIPADO: 10,
  ATENUANTE_PAGAMENTO_POS_DEFESA: 5,
  ATENUANTE_PRIMARIEDADE: 5,
  ATENUANTE_REPARACAO_VOLUNTARIA: 10,
  ATENUANTE_NEXO_TERCEIRO: 15,
  // Dosimetria - Agravantes
  AGRAVANTE_DOLO_FRAUDE: 30,
  AGRAVANTE_ENRIQUECIMENTO: 30,
  AGRAVANTE_DESOBEDIENCIA: 20,
  AGRAVANTE_REINCIDENCIA: 5,
};

// =============================================
// TIPOS
// =============================================
export interface Simulacao {
  id?: string;
  titulo: string;
  tipo: 'agrese_multa' | 'equacao_d' | 'contrato_interdependencia' | 'combinacao_penalidades';
  parametros: Record<string, unknown>;
  resultado: Record<string, unknown>;
  valor_base?: number;
  valor_final?: number;
  criado_em?: string;
}

export interface Infracao {
  id?: string;
  simulacao_id?: string;
  tipo_infracao: string;
  clausula_referencia?: string;
  contrato?: 'CPA' | 'CI' | 'AGRESE';
  ufp_quantidade?: number;
  valor_ufp?: number;
  valor_base?: number;
  agravantes?: string[];
  atenuantes?: string[];
  valor_final?: number;
  status?: string;
  data_fato?: string;
  observacoes?: string;
}
