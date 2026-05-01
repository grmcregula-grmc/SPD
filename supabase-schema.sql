-- ============================================================
-- SPD — Simulador de Penalidades DESO
-- Schema Supabase — Execute no SQL Editor do projeto
-- URL: https://ftrhvwsbvyrifcrqfbfz.supabase.co
-- ============================================================

-- Tabela de simulações salvas
CREATE TABLE IF NOT EXISTS public.simulacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('agrese_multa', 'equacao_d', 'contrato_interdependencia', 'concurso_infracoes')),
  parametros JSONB NOT NULL DEFAULT '{}',
  resultado JSONB NOT NULL DEFAULT '{}',
  valor_base NUMERIC(15,2),
  valor_final NUMERIC(15,2),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de infrações
CREATE TABLE IF NOT EXISTS public.infracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulacao_id UUID REFERENCES public.simulacoes(id) ON DELETE CASCADE,
  tipo_infracao TEXT NOT NULL,
  clausula_referencia TEXT,
  contrato TEXT CHECK (contrato IN ('CPA', 'CI', 'AGRESE')),
  ufp_quantidade NUMERIC(10,2),
  valor_ufp NUMERIC(10,2) DEFAULT 79.90,
  valor_base NUMERIC(15,2),
  agravantes JSONB DEFAULT '[]',
  atenuantes JSONB DEFAULT '[]',
  valor_final NUMERIC(15,2),
  status TEXT DEFAULT 'simulado' CHECK (status IN ('simulado', 'autuado', 'pago', 'recurso', 'transitado')),
  data_fato DATE,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de parâmetros globais do sistema
CREATE TABLE IF NOT EXISTS public.parametros_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de alertas de compliance
CREATE TABLE IF NOT EXISTS public.alertas_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('critico', 'atencao', 'informativo')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  modulo TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  resolvido_em TIMESTAMPTZ
);

-- Inserir parâmetros padrão
INSERT INTO public.parametros_sistema (chave, valor, descricao, categoria) VALUES
('UFP_SE_VALOR', '79.90', 'Valor da UFP/SE conforme Portaria SEFAZ-SE 86/2026 (fev-abr 2026)', 'fiscal'),
('UFP_SE_PISO', '100', 'Quantidade mínima de UFP/SE por autuação (Cl. 22.1.2 CPA)', 'fiscal'),
('UFP_SE_TETO', '10000', 'Quantidade máxima de UFP/SE por autuação (Cl. 22.1.2 CPA)', 'fiscal'),
('IPCA_ANUAL', '5.0', 'IPCA anual projetado para correção monetária (%)', 'financeiro'),
('JUROS_MORA_MENSAL', '1.0', 'Juros de mora mensais pro rata die após 20 dias (%)', 'financeiro'),
('PRAZO_PAGAMENTO_DIAS', '20', 'Prazo para pagamento voluntário após trânsito em julgado (dias)', 'regulatorio'),
('IPD_PADRAO', '32', 'Índice de Perdas de Distribuição padrão homologado IDG (%)', 'operacional'),
('TARIFA_MEDIA', '6.50', 'Tarifa média R$/m³ (exercício anterior Iguá Sergipe)', 'operacional'),
('MARGEM_EBITDA', '38', 'Margem EBITDA da Iguá Sergipe (%)', 'financeiro'),
('ICA_COBERTURA_AGUA', '95', 'Índice de Cobertura de Água ICA (%)', 'operacional'),
('ICE_COBERTURA_ESGOTO', '60', 'Índice de Cobertura de Esgoto ICE (%)', 'operacional'),
('IMPOSTOS_RECEITA', '9.25', 'Alíquota consolidada de impostos sobre receita PIS+COFINS+ISS (%)', 'fiscal'),
('ATENUANTE_PAGAMENTO_ANTECIPADO', '10', 'Atenuante Cl. 22.4.2: reconhecimento e pagamento antecipado (%)', 'dosimetria'),
('ATENUANTE_PAGAMENTO_POS_DEFESA', '5', 'Atenuante Cl. 22.5.1(ii): pagamento após defesa prévia (%)', 'dosimetria'),
('ATENUANTE_PRIMARIEDADE', '5', 'Atenuante Cl. 22.11.4: primariedade (sem infrações nos últimos 5 anos) (%)', 'dosimetria'),
('ATENUANTE_REPARACAO_VOLUNTARIA', '10', 'Atenuante Cl. 22.11.3: reparação voluntária antes da decisão (%)', 'dosimetria'),
('ATENUANTE_NEXO_TERCEIRO', '15', 'Atenuante Cl. 22.11.2: nexo causal indireto por agente terceiro (%)', 'dosimetria'),
('AGRAVANTE_DOLO_FRAUDE', '30', 'Agravante Cl. 22.12.1: dolo, omissão dolosa ou ocultação (%)', 'dosimetria'),
('AGRAVANTE_ENRIQUECIMENTO', '30', 'Agravante Cl. 22.12.2: busca por enriquecimento ilícito (%)', 'dosimetria'),
('AGRAVANTE_DESOBEDIENCIA', '20', 'Agravante Cl. 22.12.3: desobediência à ordem mitigadora (%)', 'dosimetria'),
('AGRAVANTE_REINCIDENCIA', '5', 'Agravante Cl. 22.12.4 / Res. 96/2025: reincidência operacional (%)', 'dosimetria')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = NOW();

-- ============================================================
-- HABILITAR RLS (Row Level Security)
-- ============================================================
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametros_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_compliance ENABLE ROW LEVEL SECURITY;

-- Políticas (acesso público para leitura, admin para escrita)

-- Tabelas de simulação (Públicas - para uso com localStorage ou se quiser persistir publicamente)
CREATE POLICY "Public read simulacoes" ON public.simulacoes FOR SELECT USING (true);
CREATE POLICY "Public insert simulacoes" ON public.simulacoes FOR INSERT WITH CHECK (true);

-- Parâmetros do Sistema (O mais importante: Leitura pública, Escrita Admin)
CREATE POLICY "Public read parametros" ON public.parametros_sistema FOR SELECT USING (true);
CREATE POLICY "Admin CRUD parametros" ON public.parametros_sistema 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Alertas de Compliance
CREATE POLICY "Public read alertas" ON public.alertas_compliance FOR SELECT USING (true);
CREATE POLICY "Admin CRUD alertas" ON public.alertas_compliance 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_simulacoes_tipo ON public.simulacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_simulacoes_criado ON public.simulacoes(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_infracoes_sim ON public.infracoes(simulacao_id);
CREATE INDEX IF NOT EXISTS idx_params_chave ON public.parametros_sistema(chave);
