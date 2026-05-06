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

export const MATRIZ_INFRACOES = [
  { 
    id: 'leve', 
    nome: 'Infração Leve', 
    ufp: 100, 
    fundamentacao: 'Art. 24-A, § 2º, I; e § 3º, incisos I e II', 
    desc: 'Não fornecer, no prazo fixado, documento e/ou dado solicitado pela AGRESE. Outras hipóteses previstas em atos regulamentares.',
    hipoteses: [
      'Não fornecer, no prazo fixado, documento e/ou dado solicitado pela AGRESE (aplicado por documento/dado).',
      'Pequenas irregularidades administrativas sem prejuízo direto à prestação do serviço.',
      'Atraso de até 5 dias úteis no envio de relatórios de rotina.',
      'Outras hipóteses que venham a ser previstas em atos regulamentares da AGRESE.'
    ],
    baseLegal: 'Lei Nº 6.661/2009'
  },
  { 
    id: 'media', 
    nome: 'Infração Média', 
    ufp: 1000, 
    fundamentacao: 'Art. 24-A, § 2º, II; e § 4º, incisos I a V', 
    desc: 'Reincidência em infrações leves anteriores. Sonegação de informações. Descumprimento de prazos. Falha na prestação do serviço.',
    hipoteses: [
      'Reincidência em infrações leves anteriores nos últimos 12 meses.',
      'Sonegação de informações solicitadas formalmente pela agência reguladora.',
      'Descumprimento de prazos fixados em determinações ou ordens de serviço da AGRESE.',
      'Falha parcial na prestação do serviço que não comprometa a continuidade sistêmica.',
      'Atraso superior a 10 dias úteis no envio de informações obrigatórias mensais.',
      'Outras hipóteses previstas em ato regulamentar.'
    ],
    baseLegal: 'Lei Nº 6.661/2009'
  },
  { 
    id: 'grave', 
    nome: 'Infração Grave', 
    ufp: 5000, 
    fundamentacao: 'Art. 24-A, § 2º, III; e § 5º, incisos I a VI', 
    desc: 'Reincidência nas infrações médias. Informações adulteradas. Obstrução da fiscalização. Descumprimento da legislação. Grave violação de qualidade.',
    hipoteses: [
      'Reincidência nas infrações médias.',
      'Fornecimento de informações e documentos adulterados ou com má-fé comprovada.',
      'Obstrução direta da atividade de fiscalização técnica da AGRESE.',
      'Descumprimento grave de cláusulas contratuais de investimento ou operação.',
      'Grave violação dos padrões de qualidade da água ou continuidade do fornecimento.',
      'Não atendimento a determinações de urgência para cessar danos ao serviço.',
      'Outras hipóteses previstas em ato regulamentar.'
    ],
    baseLegal: 'Lei Nº 6.661/2009'
  },
  { 
    id: 'gravissima', 
    nome: 'Infração Gravíssima', 
    ufp: 10000, 
    fundamentacao: 'Art. 24-A, § 2º, IV; e § 6º, incisos I e II', 
    desc: 'Reincidência nas condutas classificadas como graves. Danos irreparáveis ou perigo à saúde pública.',
    hipoteses: [
      'Reincidência nas condutas classificadas como graves.',
      'Colocar em risco iminente a saúde pública por negligência operacional gravíssima.',
      'Fraude sistêmica em medidores de vazão ou parâmetros de qualidade da água.',
      'Abandono do serviço ou paralisação total sem justificativa técnica ou legal.',
      'Outras hipóteses previstas em ato regulamentar.'
    ],
    baseLegal: 'Lei Nº 6.661/2009'
  }
];

export const ENVIO_INFORMACOES = [
  { id: 'omissao', nome: 'Omissão no Envio de Informações', min_ufp: 100, max_ufp: 500, fundamentacao: 'Art. 6º, caput', baseLegal: 'Res. 01/2018' },
  { id: 'atraso_extenso', nome: 'Atraso Crítico (> 30 dias)', min_ufp: 500, max_ufp: 2000, fundamentacao: 'Art. 6º, § 1º', baseLegal: 'Res. 01/2018' },
  { id: 'falsas', nome: 'Informações Falsas ou Obstrução', min_ufp: 1000, max_ufp: 10000, fundamentacao: 'Art. 6º, § 2º', baseLegal: 'Res. 01/2018' }
];

export const CRITERIOS_DOSIMETRIA = [
  { id: 'baixa', nome: 'Baixa', peso: 0 },
  { id: 'media', nome: 'Média', peso: 0.5 },
  { id: 'alta', nome: 'Alta', peso: 1 }
];

export function calcularUfpEnvioInformacoes(tipo: string, gravidade: string, relevancia: string): number {
  const conduta = ENVIO_INFORMACOES.find(e => e.id === tipo) || ENVIO_INFORMACOES[0];
  const pesoGravidade = CRITERIOS_DOSIMETRIA.find(c => c.id === gravidade)?.peso ?? 0.5;
  const pesoRelevancia = CRITERIOS_DOSIMETRIA.find(c => c.id === relevancia)?.peso ?? 0.5;
  
  // Peso final varia de 0 a 1 (média dos dois pesos)
  const pesoFinal = (pesoGravidade + pesoRelevancia) / 2;
  const amplitude = conduta.max_ufp - conduta.min_ufp;
  
  return conduta.min_ufp + (amplitude * pesoFinal);
}

export const PRAZOS_ENVIO_AGRESE = [
  { id: 'periodicas', nome: 'Informações Periódicas', prazo: 'Até o 10º dia do mês subsequente', base: 'Art. 4º, § 2º' },
  { id: 'esclarecimentos', nome: 'Esclarecimentos sobre Dados', prazo: 'Até 5 dias corridos', base: 'Art. 5º, inciso I' },
  { id: 'eventuais', nome: 'Informações Eventuais', prazo: 'Até 10 dias corridos', base: 'Art. 5º, inciso II' },
  { id: 'manutencao', nome: 'Manutenção Programada', prazo: 'Com antecedência de 24 horas', base: 'Ofício nº 212/2026 - NTR 15/2026' },
  { id: 'interrupcao', nome: 'Interrupção Involuntária', prazo: 'Comunicada imediatamente', base: 'Art. 8º, inciso II' },
];

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
  multiplicador_base?: number; // Para tratar reincidência 4x do envio
}): ResultadoMultaAGRESE {
  const ufp = params.valor_ufp ?? PARAMETROS_DEFAULT.UFP_SE_VALOR;
  const ipca = (params.ipca_anual ?? PARAMETROS_DEFAULT.IPCA_ANUAL) / 100;
  const juros = (params.juros_mensal ?? PARAMETROS_DEFAULT.JUROS_MORA_MENSAL) / 100;

  // Validar limites UFP
  const ufp_qtd = Math.min(
    Math.max(params.ufp_quantidade, PARAMETROS_DEFAULT.UFP_SE_PISO),
    PARAMETROS_DEFAULT.UFP_SE_TETO
  );

  const multiplicador = params.multiplicador_base ?? 1;
  const valor_base = ufp_qtd * ufp * multiplicador;

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
    { descricao: `Valor Base: ${ufp_qtd} UFP/SE × R$ ${ufp.toFixed(2)}${multiplicador > 1 ? ` × ${multiplicador}x` : ''}`, valor: valor_base, tipo: 'base' },
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
// ENGINE - TAXA DE FISCALIZAÇÃO (Lei 6.661/2009)
// =============================================

export interface ResultadoTaxaFiscalizacao {
  valor_original: number;
  meses_atraso: number;
  selic_mensal_perc: number;
  selic_acumulada: number;
  juros_valor: number;
  multa_percentual: number;
  multa_valor: number;
  valor_total: number;
  breakdown: BreakdownItem[];
}

/**
 * Calcula acréscimos da Taxa de Fiscalização não recolhida no prazo.
 * § 4º Lei 6.661/2009 — regras:
 *   I  — Juros SELIC acumulados mês a mês (contados do mês SEGUINTE ao vencimento)
 *   II — Multa de mora:
 *          2%  se pago até o ÚLTIMO DIA ÚTIL do MÊS SUBSEQUENTE (atraso ≤ 1 mês)
 *         10%  se pago POSTERIORMENTE (atraso > 1 mês)
 * § 5º — Juros NÃO incidem sobre a multa de mora.
 *
 * O ÚNICO parâmetro de tempo é `meses_atraso`, que determina
 * SIMULTANEAMENTE a alíquota SELIC acumulada e a alíquota da multa.
 */
export function calcularTaxaFiscalizacao(params: {
  valor_original: number;
  meses_atraso: number;       // nº de meses de atraso (determina tudo)
  selic_mensal_perc?: number; // taxa SELIC mensal média (padrão 1.07% ≈ 13% a.a.)
}): ResultadoTaxaFiscalizacao {
  const { valor_original, meses_atraso } = params;
  const selic_mensal = params.selic_mensal_perc ?? 1.07; // % ao mês

  // I — Juros SELIC: Simples (acumulados mês a mês)
  // § 4º — Contados do mês seguinte ao vencimento.
  // Usamos juros simples por ser o padrão regulatório para SELIC acumulada.
  const selic_acumulada = parseFloat((meses_atraso * selic_mensal).toFixed(4));
  const juros_valor = valor_original * (selic_acumulada / 100);

  // II — Multa de mora: 2% se ≤ 1 mês (mês subsequente), 10% se > 1 mês
  // O tempo de atraso dita ambas as taxas para evitar contradição lógica.
  const multa_percentual = meses_atraso <= 1 ? 2 : 10;
  const multa_valor = valor_original * (multa_percentual / 100);

  const valor_total = valor_original + juros_valor + multa_valor;

  const breakdown: BreakdownItem[] = [
    { descricao: 'Valor Original da Taxa', valor: valor_original, tipo: 'base' },
    {
      descricao: `I — Juros SELIC Acumulados (${meses_atraso} ${meses_atraso === 1 ? 'mês' : 'meses'} × ${selic_mensal.toFixed(2)}%/mês = ${selic_acumulada.toFixed(2)}%)`,
      valor: juros_valor,
      tipo: 'mora',
      percentual: selic_acumulada,
    },
    {
      descricao: `II — Multa de Mora (${multa_percentual}%)${multa_percentual === 2 ? ' — pago no mês subsequente' : ' — pago após mês subsequente'} [§ 5º: não incide sobre juros]`,
      valor: multa_valor,
      tipo: 'agravante',
      percentual: multa_percentual,
    },
    { descricao: 'Valor Total Devido', valor: valor_total, tipo: 'final' },
  ];

  return {
    valor_original,
    meses_atraso,
    selic_mensal_perc: selic_mensal,
    selic_acumulada,
    juros_valor,
    multa_percentual,
    multa_valor,
    valor_total,
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
  multa_agrese_matriz: number;
  multa_agrese_prazos: number;
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
  ufp_multa_agrese_matriz?: number;
  agravantes_ids_matriz?: string[];
  atenuantes_ids_matriz?: string[];
  meses_mora_agrese_matriz?: number;
  
  ufp_multa_agrese_prazos?: number;
  multiplicador_prazos?: number;
  meses_mora_agrese_prazos?: number;

  valor_ufp?: number;
  multa_ci_percentual?: number;
  fatura_mensal?: number;
}): ResultadoCombinacao {
  const { desconto_d = 0 } = params;
  
  let multa_agrese_matriz = 0;
  if (params.ufp_multa_agrese_matriz && params.ufp_multa_agrese_matriz > 0) {
    const res = calcularMultaAGRESE({
      ufp_quantidade: params.ufp_multa_agrese_matriz,
      valor_ufp: params.valor_ufp,
      agravantes_ids: params.agravantes_ids_matriz ?? [],
      atenuantes_ids: params.atenuantes_ids_matriz ?? [],
      meses_mora: params.meses_mora_agrese_matriz ?? 0,
    });
    multa_agrese_matriz = res.valor_com_mora;
  }

  let multa_agrese_prazos = 0;
  if (params.ufp_multa_agrese_prazos && params.ufp_multa_agrese_prazos > 0) {
    const res = calcularMultaAGRESE({
      ufp_quantidade: params.ufp_multa_agrese_prazos,
      valor_ufp: params.valor_ufp,
      agravantes_ids: [],
      atenuantes_ids: [],
      meses_mora: params.meses_mora_agrese_prazos ?? 0,
      multiplicador_base: params.multiplicador_prazos ?? 1,
    });
    multa_agrese_prazos = res.valor_com_mora;
  }

  let multa_ci = 0;
  if (params.multa_ci_percentual && params.fatura_mensal) {
    multa_ci = params.fatura_mensal * (params.multa_ci_percentual / 100);
  }

  const total_impacto = desconto_d + multa_agrese_matriz + multa_agrese_prazos + multa_ci;

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
  if (multa_agrese_matriz > 0) {
    acumulado += multa_agrese_matriz;
    const meses = params.meses_mora_agrese_matriz ?? 0;
    timeline.push({ mes: meses > 0 ? meses + 1 : 2, evento: `Multa AGRESE Matriz (Auto de Infração${meses > 0 ? ' + Mora ' + meses + ' meses' : ''})`, valor: multa_agrese_matriz, tipo: 'multa', acumulado });
  }
  if (multa_agrese_prazos > 0) {
    acumulado += multa_agrese_prazos;
    const meses = params.meses_mora_agrese_prazos ?? 0;
    timeline.push({ mes: meses > 0 ? meses + 1 : 2, evento: `Multa AGRESE Prazos/Omissão (Auto de Infração${meses > 0 ? ' + Mora ' + meses + ' meses' : ''})`, valor: multa_agrese_prazos, tipo: 'multa', acumulado });
  }

  return {
    equacao_d: desconto_d,
    multa_agrese_matriz,
    multa_agrese_prazos,
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

/**
 * Retorna o nível de risco com base na quantidade de UFPs da infração.
 * Alinhado com a Matriz de Infrações AGRESE (Lei 6.661/2009):
 *   Leve       =   100 UFPs → BAIXO
 *   Média      = 1.000 UFPs → MÉDIO
 *   Grave      = 5.000 UFPs → ALTO
 *   Gravíssima = 10.000 UFPs → CRÍTICO
 */
export function getRiskLevelByUFP(ufpQuantidade: number): { label: string; color: string; bg: string } {
  if (ufpQuantidade >= 10000) return { label: 'CRÍTICO',  color: '#dc2626', bg: '#fef2f2' };
  if (ufpQuantidade >= 5000)  return { label: 'ALTO',     color: '#ea580c', bg: '#fff7ed' };
  if (ufpQuantidade >= 1000)  return { label: 'MÉDIO',    color: '#d97706', bg: '#fffbeb' };
  return                             { label: 'BAIXO',    color: '#16a34a', bg: '#f0fdf4' };
}
