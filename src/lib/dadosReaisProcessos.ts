/**
 * Dados Reais de Processos GRMC — Planilha de Controle 2025/2026
 * Fonte: https://docs.google.com/spreadsheets/d/1xYfuKb27h9AZRJmO86Vqf5gubDJj5N4ZHsQrfU-cO1g
 *
 * Cada entrada representa um processo com infração identificada ou risco de penalização.
 * Os valores monetários são calculados com base em UFP 2026 = R$ 55,56.
 * Estrutura compatível com SavedEstimate do EstimateContext.
 */

import type { SavedEstimate } from '@/context/EstimateContext';

/** UFP 2026 (atualizar conforme publicação) */
const UFP_2026 = 55.56;

/** Calcula multa em reais a partir de UFPs */
const ufpParaReal = (ufp: number) => parseFloat((ufp * UFP_2026).toFixed(2));

/**
 * Processos reais com infrações — Painel de Gestão Ativa
 * Ordenados por gravidade (Penalidade de Fato → Alto Risco → Risco Moderado)
 */
export const PROCESSOS_REAIS: Omit<SavedEstimate, 'id'>[] = [

  /* ══════════════════════════════════════════════════════════════
     BLOCO 1 — PENALIDADE DE FATO
  ══════════════════════════════════════════════════════════════ */

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 675/2026 — Plano de Governança (Portaria 91/2025)',
    descricao:
      'Apresentação do cronograma à AGRESE com 4 dias de atraso após o prazo prorrogado de 29/01/2026. Agravante: apenas 2 de 43 pontos aprovados sem necessidade de intervenção em campo — descumprimento material da Portaria AGRESE nº 91/2025.',
    valor: ufpParaReal(3000), // 3.000 UFP — atraso + descumprimento material
    data: '2026-02-02T00:00:00.000Z',
    classificacao: 'Penalidade de Fato',
    identificador: 'E-DOC 675/2026',
    detalhes: [
      {
        label: 'Multa por atraso no envio (Art. 21 Lei 6.661/2009)',
        clause: 'Art. 21, I — Omissão/atraso de informações',
        value: ufpParaReal(1000),
      },
      {
        label: 'Multa por descumprimento material (apenas 2/43 pontos validados)',
        clause: 'Portaria AGRESE 91/2025 + Art. 21, III',
        value: ufpParaReal(2000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 50/2026 — Reajuste Tarifário Contratos de Água Bruta',
    descricao:
      'Resposta à AGRESE sobre reajuste tarifário dos contratos especiais de água bruta entregue com 1 dia de atraso (prazo: 03/02/2026; resposta: 04/02/2026). Solicitação de dilatação de prazo não isenta a infração.',
    valor: ufpParaReal(300),
    data: '2026-02-04T00:00:00.000Z',
    classificacao: 'Penalidade de Fato',
    identificador: 'E-DOC 50/2026',
    detalhes: [
      {
        label: 'Multa por atraso de 1 dia (Art. 21 — mínimo aplicável)',
        clause: 'Art. 21, I — Omissão/atraso de informações regulatórias',
        value: ufpParaReal(300),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'CPA',
    titulo: 'E-DOC 55/2026 — Informações Periódicas: Descontos sem Água',
    descricao:
      'Plano de Contingência entregue à AGRESE com 11 dias de atraso. Prazo: 09/02/2026; resposta via CI 645/2026: 20/02/2026. Descumprimento de obrigação de comunicação regular sobre fornecimento de água.',
    valor: ufpParaReal(2200),
    data: '2026-02-20T00:00:00.000Z',
    classificacao: 'Penalidade de Fato',
    identificador: 'E-DOC 55/2026',
    detalhes: [
      {
        label: 'Multa por 11 dias de atraso — fator multiplicador (Art. 21)',
        clause: 'Art. 21, I + Cláusula 17.2.32 CPA',
        value: ufpParaReal(1100),
      },
      {
        label: 'Agravante: informação periódica obrigatória (recorrência)',
        clause: 'Art. 21, § 1º — agravante de reincidência',
        value: ufpParaReal(1100),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'CPA',
    titulo: 'E-DOC 26/2026 — Informações Periódicas Comunicação Regular',
    descricao:
      'Solicitação de informações periódicas recebida em 15/01/2026 com prazos: relatório mensal até dia 10 do mês seguinte; comunicação imediata (24h); aviso prévio (48h). Resposta só formalizada em 19/02/2026 — ~40 dias após o recebimento.',
    valor: ufpParaReal(5000),
    data: '2026-02-19T00:00:00.000Z',
    classificacao: 'Penalidade de Fato',
    identificador: 'E-DOC 26/2026',
    detalhes: [
      {
        label: 'Relatório mensal não entregue no prazo (dia 10/fev)',
        clause: 'Cláusula 17.2.32 CPA — comunicação periódica obrigatória',
        value: ufpParaReal(2000),
      },
      {
        label: 'Comunicações imediatas de 24h potencialmente não cumpridas',
        clause: 'Cláusula 17.2.32 — comunicação imediata de eventos',
        value: ufpParaReal(2000),
      },
      {
        label: 'Agravante: reincidência (mesmo objeto do E-DOC 55/2026)',
        clause: 'Art. 21, § 1º — reincidência',
        value: ufpParaReal(1000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 71/2026 — Esclarecimento Ofício 03-1401/2026 (prazo 10 dias)',
    descricao:
      'AGRESE fixou prazo de 10 dias corridos a partir de 06/02/2026 (≈16/02/2026). Processo encaminhado à GECO em 10/02/2026, mas sem registro de resposta final retornada à AGRESE dentro do prazo.',
    valor: ufpParaReal(1500),
    data: '2026-02-16T00:00:00.000Z',
    classificacao: 'Penalidade de Fato',
    identificador: 'E-DOC 71/2026',
    detalhes: [
      {
        label: 'Atraso na resposta a esclarecimentos solicitados pela AGRESE',
        clause: 'Art. 21, I — atraso de informação',
        value: ufpParaReal(1000),
      },
      {
        label: 'Tramitação interna que ultrapassou prazo externo',
        clause: 'Res. AGRESE — dever de diligência',
        value: ufpParaReal(500),
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════
     BLOCO 2 — ALTO RISCO DE PENALIZAÇÃO
  ══════════════════════════════════════════════════════════════ */

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 83/2026 + 1496/2026 — TFSPR Parcela 1/12 2026 (Mora)',
    descricao:
      'Taxa de Fiscalização TFSPR com prazo de pagamento em 13/02/2026 (parcela 1/12). Processo encaminhado à CFIN sem confirmação de quitação. Data registrada no e-Doc é "02/11/2026" — evidentemente incorreta. Risco de mora: SELIC + 2% (≤1 mês) ou 10% (>1 mês) sobre R$ 159.000 estimados.',
    valor: ufpParaReal(1000), // representa o risco de multa de mora
    data: '2026-02-13T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 83/2026 + 1496/2026',
    detalhes: [
      {
        label: 'Multa de mora 2% (se pago até último dia útil de fev/2026)',
        clause: '§ 4º, II da Lei 6.661/2009 — multa de mora',
        value: ufpParaReal(400),
      },
      {
        label: 'Juros SELIC mensais sobre o principal (estimativa)',
        clause: '§ 4º, I da Lei 6.661/2009 — juros de mora (SELIC)',
        value: ufpParaReal(600),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 225/2026 — Relatório Circunstanciado Pinhão/SE',
    descricao:
      'AGRESE solicitou relatório circunstanciado sobre o Município de Pinhão/SE. Prazo: 20/04/2026. Sem resposta registrada na planilha de controle.',
    valor: ufpParaReal(1000),
    data: '2026-04-20T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 225/2026',
    detalhes: [
      {
        label: 'Omissão de relatório solicitado pela AGRESE no prazo',
        clause: 'Art. 21, I — omissão de informação',
        value: ufpParaReal(1000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 230/2026 — Abastecimento de Água em Laranjeiras',
    descricao:
      'Solicitação da AGRESE sobre abastecimento de água em Laranjeiras. Prazo: 20/04/2026. Sem resposta registrada na planilha de controle.',
    valor: ufpParaReal(1000),
    data: '2026-04-20T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 230/2026',
    detalhes: [
      {
        label: 'Omissão de informações sobre prestação do serviço',
        clause: 'Art. 21, I + Res. AGRESE sobre prestação regular',
        value: ufpParaReal(1000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 231/2026 — Cadastramento e Mapeamento do SAA',
    descricao:
      'Solicitação de cadastramento e mapeamento das unidades do Sistema de Abastecimento de Água (Captação, ETA, Reservatório, EEAB). Prazo: 20/04/2026. Sem resposta registrada.',
    valor: ufpParaReal(1500),
    data: '2026-04-20T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 231/2026',
    detalhes: [
      {
        label: 'Omissão de informações cadastrais obrigatórias do SAA',
        clause: 'Art. 21, II — descumprimento de obrigação cadastral',
        value: ufpParaReal(1500),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 234/2026 — Relatório de Inspeção Sistema Pirambu/SE',
    descricao:
      'Relatório técnico de inspeção do sistema de abastecimento de Pirambu/SE. Prazo: 27/04/2026. Sem resposta registrada na planilha de controle.',
    valor: ufpParaReal(1000),
    data: '2026-04-27T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 234/2026',
    detalhes: [
      {
        label: 'Omissão de relatório de inspeção solicitado pela AGRESE',
        clause: 'Art. 21, I — omissão de informação técnica',
        value: ufpParaReal(1000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 982/2026 — Relatório Anual de Gestão DPRQ (prazo 30/03/2026)',
    descricao:
      'Relatório Anual de Gestão da unidade DPRQ. Prazo interno GRMC: 05/03/2026; prazo externo AGRESE: 30/03/2026. Sem registro de tramitação ou envio à AGRESE.',
    valor: ufpParaReal(2000),
    data: '2026-03-30T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 982/2026',
    detalhes: [
      {
        label: 'Omissão de relatório anual obrigatório (agravante: periodicidade)',
        clause: 'Art. 21, II — descumprimento de obrigação periódica anual',
        value: ufpParaReal(2000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 985/2026 — Relatório Anual de Gestão SFCC (prazo 30/03/2026)',
    descricao:
      'Relatório Anual de Gestão da unidade SFCC. Prazo: 30/03/2026. Sem registro de tramitação ou envio à AGRESE. Omissão concomitante com E-DOCs 982 e 988.',
    valor: ufpParaReal(2000),
    data: '2026-03-30T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 985/2026',
    detalhes: [
      {
        label: 'Omissão de relatório anual obrigatório',
        clause: 'Art. 21, II — descumprimento de obrigação periódica anual',
        value: ufpParaReal(2000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 988/2026 — Relatório Anual de Gestão DTEC (prazo 30/03/2026)',
    descricao:
      'Relatório Anual de Gestão da unidade DTEC. Prazo: 30/03/2026. Sem registro de tramitação ou envio à AGRESE. Constitui padrão de omissão sistemática junto aos E-DOCs 982 e 985.',
    valor: ufpParaReal(2000),
    data: '2026-03-30T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 988/2026',
    detalhes: [
      {
        label: 'Omissão de relatório anual — 3ª ocorrência simultânea (agravante)',
        clause: 'Art. 21, II + § 1º agravante de série',
        value: ufpParaReal(2000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'CPA',
    titulo: 'E-DOC 212/2026 — Medidas para Manutenção em Grandes Adutoras',
    descricao:
      'AGRESE solicitou informações sobre medidas adotadas para manutenção em grandes adutoras. Recebido em 08/04/2026. Sem prazo definido e sem resposta registrada.',
    valor: ufpParaReal(1500),
    data: '2026-04-08T00:00:00.000Z',
    classificacao: 'Alto Risco de Penalização',
    identificador: 'E-DOC 212/2026',
    detalhes: [
      {
        label: 'Omissão de informações técnicas sobre manutenção de adutoras',
        clause: 'Cláusula 17.2.33 CPA + Art. 21, I',
        value: ufpParaReal(1500),
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════
     BLOCO 3 — RISCO MODERADO DE PENALIZAÇÃO
  ══════════════════════════════════════════════════════════════ */

  {
    source: 'AGRESE',
    contract: 'CI',
    titulo: 'E-DOC 563/2026 — Obras Esgotamento Zona Norte / ETE Norte',
    descricao:
      'Status das obras de esgotamento (Zona Norte e ETE Norte — Anexo XIV). Prazo externo: 06/02/2026. Resposta via CI 657/2026 enviada em 09/02/2026 — 3 dias de atraso. A GRMC informou que as obras não foram concluídas.',
    valor: ufpParaReal(450),
    data: '2026-02-09T00:00:00.000Z',
    classificacao: 'Risco Moderado de Penalização',
    identificador: 'E-DOC 563/2026',
    detalhes: [
      {
        label: 'Atraso de 3 dias na resposta sobre obras do Anexo XIV',
        clause: 'Cláusulas 12 e 20 do Contrato de Concessão',
        value: ufpParaReal(300),
      },
      {
        label: 'Obras não concluídas — risco de penalidade por cronograma',
        clause: 'Item 12.3 Contrato Concessão — obrigação de obras',
        value: ufpParaReal(150),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'CI',
    titulo: 'E-DOC 877/2026 — Recurso Admin. 240/2025 / Acordo DESO-Iguá',
    descricao:
      'Desistência do Recurso Administrativo nº 240/2025 após tratativas de acordo entre DESO e Iguá perante a AGRESE. Se o acordo não for homologado e o prazo recursal tiver expirado, há risco de imposição direta de penalidade.',
    valor: ufpParaReal(500),
    data: '2026-02-23T00:00:00.000Z',
    classificacao: 'Risco Moderado de Penalização',
    identificador: 'E-DOC 877/2026',
    detalhes: [
      {
        label: 'Risco de perda do direito de defesa caso acordo não seja homologado',
        clause: 'Rito processual sancionatório AGRESE — art. de defesa',
        value: ufpParaReal(500),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'Lei 6.661/2009',
    titulo: 'E-DOC 1611/2026 — Demonstrações Financeiras Exercício 2025',
    descricao:
      'Submissão das demonstrações financeiras do exercício de 2025 à AGRESE. Recebido em 30/04/2026 sem prazo definido. Risco de entrega incompleta ou fora do calendário regulatório.',
    valor: ufpParaReal(1000),
    data: '2026-04-30T00:00:00.000Z',
    classificacao: 'Risco Moderado de Penalização',
    identificador: 'E-DOC 1611/2026',
    detalhes: [
      {
        label: 'Obrigação de transparência financeira anual perante a AGRESE',
        clause: 'Art. 21, II — dever de informação financeira',
        value: ufpParaReal(1000),
      },
    ],
  },

  {
    source: 'AGRESE',
    contract: 'CI',
    titulo: 'E-DOC 1393/2026 — Plano de Instalação de Macromedidores',
    descricao:
      'Acompanhamento do plano de instalação dos macromedidores pela Iguá Saneamento. Recebido em 25/03/2026 sem prazo definido. Descumprimento do plano pela Iguá impacta as obrigações contratuais de monitoramento da DESO.',
    valor: ufpParaReal(300),
    data: '2026-03-25T00:00:00.000Z',
    classificacao: 'Risco Moderado de Penalização',
    identificador: 'E-DOC 1393/2026',
    detalhes: [
      {
        label: 'Risco de penalidade por falha no monitoramento do macromedidor',
        clause: 'Portaria AGRESE 76/2025 — macromedidores',
        value: ufpParaReal(300),
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════
     BLOCO 4 — BAIXO RISCO / CONCLUÍDOS (apenas para histórico)
  ══════════════════════════════════════════════════════════════ */

  {
    source: 'MANUAL',
    contract: 'CI',
    titulo: 'E-DOC 838/2026 — Demanda Judicial Casa Caída Arauá ✓',
    descricao:
      'Demanda judicial urgente (Casa Caída, Arauá). Recebida em 02/02/2026; resposta emitida em 04/02/2026 com CI 559/2026 e CI 557/2026. Processo concluído dentro do prazo.',
    valor: 0,
    data: '2026-02-04T00:00:00.000Z',
    classificacao: 'Baixo Risco de Penalização',
    identificador: 'E-DOC 838/2026',
    detalhes: [],
  },

  {
    source: 'MANUAL',
    contract: 'CI',
    titulo: 'E-DOC 1606/2026 — MPSE Umbaúba (Esgoto/Drenagem) ✓',
    descricao:
      'Análise de responsabilidade para o MP de Umbaúba. Prazo: 24/02/2026. Nota Técnica Regulatória concluída em 13/02/2026 — 11 dias antes do prazo.',
    valor: 0,
    data: '2026-02-13T00:00:00.000Z',
    classificacao: 'Baixo Risco de Penalização',
    identificador: 'E-DOC 1606/2026',
    detalhes: [],
  },

  {
    source: 'MANUAL',
    contract: 'CI',
    titulo: 'E-DOC 4827/2025 — ACP Aruana e Zona de Expansão ✓',
    descricao:
      'ACP do MPSE sobre obras de abastecimento. Nota Técnica Regulatória 004/2026 concluída. Ofício 04-0903/2026-PRES enviado ao MP em 09/03/2026.',
    valor: 0,
    data: '2026-03-09T00:00:00.000Z',
    classificacao: 'Baixo Risco de Penalização',
    identificador: 'E-DOC 4827/2025',
    detalhes: [],
  },

  {
    source: 'MANUAL',
    contract: 'CI',
    titulo: 'E-DOC 2260/2026 — Rede de Esgoto Palestina/Aracaju ✓',
    descricao:
      'Ação do MPSE sobre implantação de rede de esgoto. Nota Técnica 009/2026 emitida. Ofício 07-2603/2026-PRES concluído em 26/03/2026. Responsabilidade atribuída à Iguá.',
    valor: 0,
    data: '2026-03-26T00:00:00.000Z',
    classificacao: 'Baixo Risco de Penalização',
    identificador: 'E-DOC 2260/2026',
    detalhes: [],
  },
];

/**
 * Retorna o total de exposição financeira por classificação
 */
export function calcularExposicaoTotal() {
  const grupos = {
    'Penalidade de Fato': 0,
    'Alto Risco de Penalização': 0,
    'Risco Moderado de Penalização': 0,
    'Baixo Risco de Penalização': 0,
  } as Record<string, number>;

  PROCESSOS_REAIS.forEach(p => {
    const cat = p.classificacao ?? 'Baixo Risco de Penalização';
    if (cat in grupos) grupos[cat] += p.valor;
  });

  return grupos;
}

/**
 * Exposição total em R$
 */
export const EXPOSICAO_TOTAL_REAL = PROCESSOS_REAIS.reduce(
  (acc, p) => acc + p.valor,
  0
);
