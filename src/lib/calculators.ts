// =============================================
// PARÂMETROS PADRÃO DO SISTEMA
// =============================================
export const PARAMETROS_DEFAULT = {
  UFP_SE_VALOR: 81.49,
  UFP_SE_PISO: 100,
  UFP_SE_TETO: 10000,
  IPCA_ANUAL: 5.0,
  JUROS_MORA_MENSAL: 1.0,
  PRAZO_PAGAMENTO_DIAS: 20,
  MULTA_ATRASO_CONCESSIONARIA: 1.5,
  MULTA_OCIOSIDADE_PERCENTUAL: 5.0,
  IPD_PADRAO: 65,
  TARIFA_MEDIA: 5.24,
  MARGEM_EBITDA: 39,
  ICA_COBERTURA_AGUA: 95,
  ICE_COBERTURA_ESGOTO: 60,
  IMPOSTOS_RECEITA: 9.25,
  ATENUANTE_PAGAMENTO_ANTECIPADO: 10,
  ATENUANTE_PAGAMENTO_POS_DEFESA: 5,
  ATENUANTE_PRIMARIEDADE: 5,
  ATENUANTE_REPARACAO_VOLUNTARIA: 10,
  ATENUANTE_NEXO_TERCEIRO: 15,
  AGRAVANTE_DOLO_FRAUDE: 30,
  AGRAVANTE_ENRIQUECIMENTO: 30,
  AGRAVANTE_DESOBEDIENCIA: 20,
  AGRAVANTE_REINCIDENCIA: 5,
};

// =============================================
// ENGINE DE CÁLCULO - MULTA AGRESE (CPA Cl. 22)
// =============================================

export interface AgravanteSelecionado {
  id: string;
  nome: string;
  percentual: number;
  clausula: string;
}

export interface AtenuanteSelecionado {
  id: string;
  nome: string;
  percentual: number;
  clausula: string;
}

export interface ResultadoMultaAGRESE {
  ufp_quantidade: number;
  valor_ufp: number;
  valor_base: number;
  agravantes: AgravanteSelecionado[];
  atenuantes: AtenuanteSelecionado[];
  percentual_agravantes: number;
  percentual_atenuantes: number;
  valor_majorado: number;
  valor_atenuado: number;
  valor_final: number;
  // Mora (caso não pague em 20 dias)
  meses_mora: number;
  ipca_periodo: number;
  juros_mora: number;
  valor_com_mora: number;
  economia_pagamento_antecipado: number;
  // Detalhamento
  breakdown: BreakdownItem[];
}

export interface BreakdownItem {
  descricao: string;
  valor: number;
  tipo: 'base' | 'agravante' | 'atenuante' | 'mora' | 'final';
  percentual?: number;
}

export const AGRAVANTES_DISPONIVEIS: AgravanteSelecionado[] = [
  {
    id: 'dolo_fraude',
    nome: 'Dolo, Omissão Dolosa ou Ocultação',
    percentual: 30,
    clausula: 'Cl. 22.12.1 CPA',
  },
  {
    id: 'enriquecimento',
    nome: 'Busca por Enriquecimento Ilícito',
    percentual: 30,
    clausula: 'Cl. 22.12.2 CPA',
  },
  {
    id: 'desobediencia',
    nome: 'Desobediência à Ordem Mitigadora',
    percentual: 20,
    clausula: 'Cl. 22.12.3 CPA',
  },
  {
    id: 'reincidencia',
    nome: 'Reincidência Operacional Específica',
    percentual: 5,
    clausula: 'Cl. 22.12.4 CPA / Res. 96/2025',
  },
];

export const ATENUANTES_DISPONIVEIS: AtenuanteSelecionado[] = [
  {
    id: 'pagamento_antecipado',
    nome: 'Reconhecimento Precoce e Liquidação Voluntária',
    percentual: 10,
    clausula: 'Cl. 22.4.2 CPA',
  },
  {
    id: 'pagamento_pos_defesa',
    nome: 'Aceitação Pós-Decisão Preliminar (sem recurso)',
    percentual: 5,
    clausula: 'Cl. 22.5.1 (ii) CPA',
  },
  {
    id: 'primariedade',
    nome: 'Inexistência de Antecedentes (Primariedade 5 anos)',
    percentual: 5,
    clausula: 'Cl. 22.11.4 CPA',
  },
  {
    id: 'reparacao_voluntaria',
    nome: 'Reparação Voluntária e Mitigação Espontânea',
    percentual: 10,
    clausula: 'Cl. 22.11.3 CPA',
  },
  {
    id: 'nexo_terceiro',
    nome: 'Nexo Causal Indireto por Agente Terceiro',
    percentual: 15,
    clausula: 'Cl. 22.11.2 CPA',
  },
];

export interface InfracaoAgrese {
  id: string;
  nome: string;
  tipo: 'comercial' | 'operacional' | 'institucional';
  ufp_sugerida: number;
  clausula: string;
  desc: string;
}

export const INFRACOES_COMUNS_AGRESE: InfracaoAgrese[] = [
  {
    id: 'atraso_contas',
    nome: 'Atraso na Prestação de Contas Mensal',
    tipo: 'comercial',
    ufp_sugerida: 500,
    clausula: 'Cl. 15.2 CPA',
    desc: 'Descumprimento de prazos para entrega de relatórios de faturamento e balancetes.',
  },
  {
    id: 'atraso_informacoes',
    nome: 'Atraso na Prestação de Informações',
    tipo: 'institucional',
    ufp_sugerida: 500,
    clausula: 'Norma Regulatória',
    desc: 'Atraso no envio de informações, dados ou documentos solicitados pela AGRESE.',
  },
  {
    id: 'potabilidade_fora',
    nome: 'Parâmetros de Potabilidade Fora do Padrão',
    tipo: 'operacional',
    ufp_sugerida: 5000,
    clausula: 'Cl. 7.1 CPA / Res. 96',
    desc: 'Fornecimento de água em desacordo com a Portaria de Consolidação GM/MS nº 5.',
  },
  {
    id: 'desabastecimento_critico',
    nome: 'Desabastecimento Massivo (> 24h)',
    tipo: 'operacional',
    ufp_sugerida: 8500,
    clausula: 'Cl. 22.1.2 CPA',
    desc: 'Interrupção total do fornecimento sem aviso prévio ou por negligência operacional.',
  },
  {
    id: 'obstrucao_fiscal',
    nome: 'Obstrução de Atividade Fiscalizatória',
    tipo: 'institucional',
    ufp_sugerida: 2000,
    clausula: 'Cl. 25.4 CPA',
    desc: 'Dificultar acesso de técnicos da AGRESE às instalações ou ao sistema SCADA.',
  },
  {
    id: 'falta_investimento',
    nome: 'Não Execução de Investimento Obrigatório',
    tipo: 'institucional',
    ufp_sugerida: 10000,
    clausula: 'Anexo II CPA / CAPEX',
    desc: 'Atraso em obras de expansão ou reinvestimento previstas no cronograma contratual.',
  },
  {
    id: 'extravio_documentos',
    nome: 'Extravio de Documentos Obrigatórios',
    tipo: 'institucional',
    ufp_sugerida: 1000,
    clausula: 'Norma Regulatória',
    desc: 'Perda ou não conservação de documentos essenciais exigidos para fiscalização.',
  },
  {
    id: 'falta_manutencao',
    nome: 'Falta de Manutenção Preventiva',
    tipo: 'operacional',
    ufp_sugerida: 3000,
    clausula: 'Plano de Manutenção',
    desc: 'Omissão na execução do plano de manutenção preventiva de equipamentos críticos.',
  }
];

export function calcularMultaAGRESE(params: {
  ufp_quantidade: number;
  valor_ufp?: number;
  agravantes_ids: string[];
  atenuantes_ids: string[];
  meses_mora?: number;
  ipca_anual?: number;
  juros_mensal?: number;
}): ResultadoMultaAGRESE {
  const ufp = params.valor_ufp ?? PARAMETROS_DEFAULT.UFP_SE_VALOR;
  const ipca = (params.ipca_anual ?? PARAMETROS_DEFAULT.IPCA_ANUAL) / 100;
  const juros = (params.juros_mensal ?? PARAMETROS_DEFAULT.JUROS_MORA_MENSAL) / 100;

  // Validar limites UFP
  const ufp_qtd = Math.min(
    Math.max(params.ufp_quantidade, PARAMETROS_DEFAULT.UFP_SE_PISO),
    PARAMETROS_DEFAULT.UFP_SE_TETO
  );

  const valor_base = ufp_qtd * ufp;

  // Selecionar agravantes e atenuantes
  const agravantes = AGRAVANTES_DISPONIVEIS.filter((a) =>
    params.agravantes_ids.includes(a.id)
  );
  const atenuantes = ATENUANTES_DISPONIVEIS.filter((a) =>
    params.atenuantes_ids.includes(a.id)
  );

  // Calcular percentuais acumulados
  const pct_agravantes = agravantes.reduce((sum, a) => sum + a.percentual, 0);
  const pct_atenuantes = atenuantes.reduce((sum, a) => sum + a.percentual, 0);

  // Aplicar agravantes sobre base
  const incremento_agravantes = valor_base * (pct_agravantes / 100);
  const valor_majorado = valor_base + incremento_agravantes;

  // Aplicar atenuantes sobre valor majorado
  const reducao_atenuantes = valor_majorado * (pct_atenuantes / 100);
  const valor_atenuado = valor_majorado - reducao_atenuantes;
  const valor_final = valor_atenuado;

  // Calcular mora se aplicável
  const meses = params.meses_mora ?? 0;
  let valor_com_mora = valor_final;
  let ipca_total = 0;
  let juros_total = 0;
  if (meses > 0) {
    // IPCA pro rata (anual / 12 * meses)
    ipca_total = ipca / 12 * meses;
    juros_total = juros * meses;
    valor_com_mora = valor_final * (1 + ipca_total + juros_total);
  }

  // Economia se pagar antecipado (sem mora)
  const economia_pagamento_antecipado = valor_com_mora - valor_final;

  // Breakdown detalhado
  const breakdown: BreakdownItem[] = [
    { descricao: `Valor Base: ${ufp_qtd} UFP/SE × R$ ${ufp.toFixed(2)}`, valor: valor_base, tipo: 'base' },
    ...agravantes.map((a) => ({
      descricao: `Agravante: ${a.nome}`,
      valor: valor_base * (a.percentual / 100),
      tipo: 'agravante' as const,
      percentual: a.percentual,
    })),
    ...atenuantes.map((a) => ({
      descricao: `Atenuante: ${a.nome}`,
      valor: -(valor_majorado * (a.percentual / 100)),
      tipo: 'atenuante' as const,
      percentual: -a.percentual,
    })),
    { descricao: 'Valor Final (sem mora)', valor: valor_final, tipo: 'final' },
  ];

  if (meses > 0) {
    breakdown.push({
      descricao: `Mora: IPCA ${(ipca_total * 100).toFixed(2)}% + Juros ${(juros_total * 100).toFixed(2)}% (${meses} meses)`,
      valor: valor_com_mora - valor_final,
      tipo: 'mora',
    });
    breakdown.push({ descricao: 'Valor Total com Mora', valor: valor_com_mora, tipo: 'final' });
  }

  return {
    ufp_quantidade: ufp_qtd,
    valor_ufp: ufp,
    valor_base,
    agravantes,
    atenuantes,
    percentual_agravantes: pct_agravantes,
    percentual_atenuantes: pct_atenuantes,
    valor_majorado,
    valor_atenuado,
    valor_final,
    meses_mora: meses,
    ipca_periodo: ipca_total * 100,
    juros_mora: juros_total * 100,
    valor_com_mora,
    economia_pagamento_antecipado,
    breakdown,
  };
}

// =============================================
// ENGINE DE CÁLCULO - EQUAÇÃO D (CI Cl. 11.2)
// =============================================

export interface ResultadoEquacaoD {
  volume_nao_fornecido: number;
  ipd_percentual: number;
  volume_efetivo: number;
  tarifa_media: number;
  faturamento_potencial_bruto: number;
  margem_ebitda: number;
  lucro_ebitda: number;
  ica: number;
  ice: number;
  multiplicador_esgoto: number;
  valor_composto: number;
  impostos: number;
  denominador: number;
  desconto_d: number;
  // Detalhes por etapa
  etapas: EtapaCalculo[];
}

export interface EtapaCalculo {
  numero: number;
  titulo: string;
  formula: string;
  resultado: number;
  unidade: string;
}

export function calcularEquacaoD(params: {
  volume_nao_fornecido: number; // m³
  ipd_percentual?: number; // %
  tarifa_media?: number; // R$/m³
  margem_ebitda?: number; // %
  ica_cobertura_agua?: number; // %
  ice_cobertura_esgoto?: number; // %
  impostos_percentual?: number; // %
}): ResultadoEquacaoD {
  const ipd = (params.ipd_percentual ?? PARAMETROS_DEFAULT.IPD_PADRAO) / 100;
  const tarifa = params.tarifa_media ?? PARAMETROS_DEFAULT.TARIFA_MEDIA;
  const ebitda = (params.margem_ebitda ?? PARAMETROS_DEFAULT.MARGEM_EBITDA) / 100;
  const ica = (params.ica_cobertura_agua ?? PARAMETROS_DEFAULT.ICA_COBERTURA_AGUA) / 100;
  const ice = (params.ice_cobertura_esgoto ?? PARAMETROS_DEFAULT.ICE_COBERTURA_ESGOTO) / 100;
  const impostos = (params.impostos_percentual ?? PARAMETROS_DEFAULT.IMPOSTOS_RECEITA) / 100;
  const VN = params.volume_nao_fornecido;

  // Etapa 1: Volume efetivo (descontando perdas da distribuidora)
  const volume_efetivo = VN * (1 - ipd);

  // Etapa 2: Faturamento potencial bruto
  const fat_bruto = volume_efetivo * tarifa;

  // Etapa 3: EBITDA (lucro real)
  const lucro_ebitda = fat_bruto * ebitda;

  // Etapa 4: Multiplicador esgoto (ICA/ICE)
  const multiplicador_esgoto = 1 + (ica / ice);

  // Etapa 5: Valor composto (água + esgoto)
  const valor_composto = lucro_ebitda * multiplicador_esgoto;

  // Etapa 6: Depuração tributária
  const denominador = 1 + impostos;

  // Resultado final: D = Valor composto / (1 + I)
  const desconto_d = valor_composto / denominador;

  const etapas: EtapaCalculo[] = [
    {
      numero: 1,
      titulo: 'Volume Efetivo (após perdas da rede)',
      formula: `VN × (1 - IPD) = ${VN.toLocaleString('pt-BR')} × (1 - ${(ipd * 100).toFixed(0)}%)`,
      resultado: volume_efetivo,
      unidade: 'm³',
    },
    {
      numero: 2,
      titulo: 'Faturamento Potencial Bruto',
      formula: `Vol. Efetivo × Tarifa = ${volume_efetivo.toLocaleString('pt-BR')} × R$ ${tarifa.toFixed(2)}`,
      resultado: fat_bruto,
      unidade: 'R$',
    },
    {
      numero: 3,
      titulo: 'Lucro EBITDA (frustrado)',
      formula: `Fat. Bruto × Margem EBITDA = R$ ${fat_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} × ${(ebitda * 100).toFixed(0)}%`,
      resultado: lucro_ebitda,
      unidade: 'R$',
    },
    {
      numero: 4,
      titulo: 'Multiplicador Esgoto (ICA/ICE)',
      formula: `1 + (ICA/ICE) = 1 + (${(ica * 100).toFixed(0)}%/${(ice * 100).toFixed(0)}%)`,
      resultado: multiplicador_esgoto,
      unidade: 'x',
    },
    {
      numero: 5,
      titulo: 'Valor Composto (Água + Esgoto)',
      formula: `EBITDA × Multiplicador = R$ ${lucro_ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} × ${multiplicador_esgoto.toFixed(3)}`,
      resultado: valor_composto,
      unidade: 'R$',
    },
    {
      numero: 6,
      titulo: 'Depuração Tributária (denominador)',
      formula: `1 + Impostos = 1 + ${(impostos * 100).toFixed(2)}%`,
      resultado: denominador,
      unidade: 'fator',
    },
    {
      numero: 7,
      titulo: 'DESCONTO D (Resultado Final)',
      formula: `Valor Composto ÷ Denominador = R$ ${valor_composto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ÷ ${denominador.toFixed(4)}`,
      resultado: desconto_d,
      unidade: 'R$',
    },
  ];

  return {
    volume_nao_fornecido: VN,
    ipd_percentual: ipd * 100,
    volume_efetivo,
    tarifa_media: tarifa,
    faturamento_potencial_bruto: fat_bruto,
    margem_ebitda: ebitda * 100,
    lucro_ebitda,
    ica: ica * 100,
    ice: ice * 100,
    multiplicador_esgoto,
    valor_composto,
    impostos: impostos * 100,
    denominador,
    desconto_d,
    etapas,
  };
}

// =============================================
// ENGINE - COMBINAÇÃO DE PENALIDADES
// =============================================

export interface ResultadoCombinacao {
  equacao_d: number;
  multa_agrese: number;
  multa_ci: number;
  total_impacto: number;
  descricao_cenario: string;
  timeline: TimelineItem[];
}

export interface TimelineItem {
  mes: number;
  evento: string;
  valor: number;
  tipo: 'desconto' | 'multa' | 'mora';
  acumulado: number;
}

export function calcularCombinacao(params: {
  desconto_d?: number;
  ufp_multa_agrese?: number;
  valor_ufp?: number;
  agravantes_ids?: string[];
  multa_ci_percentual?: number;
  fatura_mensal?: number;
  meses_mora_agrese?: number;
}): ResultadoCombinacao {
  const { desconto_d = 0 } = params;
  
  let multa_agrese = 0;
  if (params.ufp_multa_agrese && params.ufp_multa_agrese > 0) {
    const res = calcularMultaAGRESE({
      ufp_quantidade: params.ufp_multa_agrese,
      valor_ufp: params.valor_ufp,
      agravantes_ids: params.agravantes_ids ?? [],
      atenuantes_ids: [],
      meses_mora: params.meses_mora_agrese ?? 0,
    });
    multa_agrese = res.valor_com_mora;
  }

  let multa_ci = 0;
  if (params.multa_ci_percentual && params.fatura_mensal) {
    multa_ci = params.fatura_mensal * (params.multa_ci_percentual / 100);
  }

  const total_impacto = desconto_d + multa_agrese + multa_ci;

  let acumulado = 0;
  const timeline: TimelineItem[] = [];
  
  if (desconto_d > 0) {
    acumulado += desconto_d;
    timeline.push({ mes: 1, evento: 'Desconto D (Equação D — Lucros Cessantes)', valor: desconto_d, tipo: 'desconto', acumulado });
  }
  if (multa_ci > 0) {
    acumulado += multa_ci;
    timeline.push({ mes: 1, evento: 'Multa CI (Infração Contrato Interdependência)', valor: multa_ci, tipo: 'multa', acumulado });
  }
  if (multa_agrese > 0) {
    acumulado += multa_agrese;
    const meses = params.meses_mora_agrese ?? 0;
    timeline.push({ mes: meses > 0 ? meses + 1 : 2, evento: `Multa AGRESE (Auto de Infração${meses > 0 ? ' + Mora ' + meses + ' meses' : ''})`, valor: multa_agrese, tipo: 'multa', acumulado });
  }

  return {
    equacao_d: desconto_d,
    multa_agrese,
    multa_ci,
    total_impacto,
    descricao_cenario: `Impacto combinado de ${timeline.length} sanções simultâneas`,
    timeline,
  };
}

// =============================================
// HELPERS DE FORMATAÇÃO
// =============================================

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatM3(value: number): string {
  return `${new Intl.NumberFormat('pt-BR').format(value)} m³`;
}

export function getRiskColor(value: number): string {
  if (value >= 800000) return '#ef4444'; // crítico
  if (value >= 400000) return '#f97316'; // alto
  if (value >= 100000) return '#eab308'; // médio
  return '#22c55e'; // baixo
}

export function getRiskLevel(value: number): { label: string; color: string; bg: string } {
  if (value >= 800000) return { label: 'CRÍTICO', color: '#dc2626', bg: '#fef2f2' };
  if (value >= 400000) return { label: 'ALTO', color: '#ea580c', bg: '#fff7ed' };
  if (value >= 100000) return { label: 'MÉDIO', color: '#d97706', bg: '#fffbeb' };
  return { label: 'BAIXO', color: '#16a34a', bg: '#f0fdf4' };
}
