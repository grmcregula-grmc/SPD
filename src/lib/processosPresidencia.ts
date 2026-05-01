export interface EtapaProcesso {
  id: string;
  processo: string;
  etapa: string;
  origem: string;
  destino: string;
  prazoInterno: string;
  prazoExterno: string;
  entregavel: string;
  isFinal?: boolean;
}

export const ETAPAS_PRESIDENCIA: EtapaProcesso[] = [
  // 1.1
  { id: '1.1', processo: 'Relatório Mensal de Gestão (RMG) - Faturamento Mensal do Volume de Água', etapa: '2', origem: 'SFCC', destino: 'GRMC', prazoInterno: 'Até o 6º dia do mês', prazoExterno: 'Mensalmente, até o 10º dia do mês subsequente.', entregavel: 'Emissão de Fatura Comercial com Memória de cálculo indexando tarifas atuais e deduzindo Equação D.' },
  { id: '1.1', processo: 'Relatório Mensal de Gestão (RMG) - Faturamento Mensal do Volume de Água', etapa: '3', origem: 'GRMC', destino: 'GAPR', prazoInterno: 'Até o 8º dia do mês', prazoExterno: 'Mensalmente, até o 10º dia do mês subsequente.', entregavel: 'Validação de aderência aos parâmetros de reajuste e medição.' },
  { id: '1.1', processo: 'Relatório Mensal de Gestão (RMG) - Faturamento Mensal do Volume de Água', etapa: '4', origem: 'GAPR', destino: 'Concessionária', prazoInterno: 'Mensalmente, até o 10º dia do mês subsequente.', prazoExterno: 'Mensalmente, até o 10º dia do mês subsequente.', entregavel: 'Envio formal da Fatura Comercial e do Relatório Mensal de Gestão validado.', isFinal: true },
  // 1.2
  { id: '1.2', processo: 'Resolução de Divergência de Macromedidores (> 5 %)', etapa: '2', origem: 'GECO', destino: 'GRMC', prazoInterno: 'Em até 5 dias após instrução técnica', prazoExterno: 'Por demanda, sempre que exceder 5%', entregavel: 'Instrução jurídica da controvérsia.' },
  { id: '1.2', processo: 'Resolução de Divergência de Macromedidores (> 5 %)', etapa: '3', origem: 'GRMC', destino: 'GAPR', prazoInterno: 'Em até 5 dias', prazoExterno: 'Por demanda, sempre que exceder 5%', entregavel: 'Nota Técnica baseando o pleito de recuperação de receita e afastando falha da DESO.' },
  { id: '1.2', processo: 'Resolução de Divergência de Macromedidores (> 5 %)', etapa: '4', origem: 'GAPR', destino: 'AGRESE / Concessionária', prazoInterno: 'Em até 15 dias do evento', prazoExterno: 'Por demanda, sempre que exceder 5%', entregavel: 'Ofício de instauração de mediação.', isFinal: true },
  // 1.3
  { id: '1.3', processo: 'Cálculo e Pleito de Reajuste Tarifário (IRC)', etapa: '1', origem: 'GRMC', destino: 'GAPR', prazoInterno: '15 dias antes do reajuste', prazoExterno: 'Anualmente, até o último dia de maio', entregavel: 'Cálculo de Índice de Reajuste Contratual (IRC) e nova tarifa.' },
  { id: '1.3', processo: 'Cálculo e Pleito de Reajuste Tarifário (IRC)', etapa: '2', origem: 'GAPR', destino: 'AGRESE', prazoInterno: 'Na data marco exata', prazoExterno: 'Anualmente, até o último dia de maio', entregavel: 'Envio do Pleito de Reajuste submetido formalmente à Agência.', isFinal: true },
  // 1.4
  { id: '1.4', processo: 'Revisão Extraordinária da Tarifa', etapa: '1', origem: 'SPGE / SFCC / GCIG', destino: 'GRMC', prazoInterno: 'Contínuo à materialização', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Relatórios periciais de custos extracontratuais demonstrando destruição da equação inicial.' },
  { id: '1.4', processo: 'Revisão Extraordinária da Tarifa', etapa: '2', origem: 'GRMC', destino: 'GAPR', prazoInterno: '15 dias de análise pericial', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Nota Técnica atestando de forma inequívoca a conformidade e necessidade do pleito.' },
  { id: '1.4', processo: 'Revisão Extraordinária da Tarifa', etapa: '3', origem: 'GAPR', destino: 'AGRESE / Poder C.', prazoInterno: '5 dias após nota GRMC', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Pleito Extraordinário formal, com base documental e legal, protocolado.', isFinal: true },
  // 1.5
  { id: '1.5', processo: 'Recolhimento da Taxa de Fiscalização', etapa: '1', origem: 'GRMC', destino: 'SFCC (GFIN)', prazoInterno: 'Até o 6º dia útil do mês', prazoExterno: 'Até o 10º dia útil do mês', entregavel: 'Análise prévia da Guia de Recolhimento emitida pela AGRESE para atestar base de cálculo.' },
  { id: '1.5', processo: 'Recolhimento da Taxa de Fiscalização', etapa: '2', origem: 'SFCC (GFIN)', destino: 'GAPR', prazoInterno: 'Até o 8º dia útil do mês', prazoExterno: 'Até o 10º dia útil do mês', entregavel: 'Execução do pagamento e emissão do respectivo comprovante.' },
  { id: '1.5', processo: 'Recolhimento da Taxa de Fiscalização', etapa: '3', origem: 'GAPR', destino: 'AGRESE', prazoInterno: 'Até o 10º dia útil do mês', prazoExterno: 'Até o 10º dia útil do mês', entregavel: 'Guia de recolhimento paga com comprovante encaminhada.', isFinal: true },
  // 1.6
  { id: '1.6', processo: 'Relatório Anual da Taxa de Fiscalização', etapa: '1', origem: 'GRMC', destino: 'GAPR', prazoInterno: 'Até 02 de janeiro', prazoExterno: 'Anualmente, até 05 de janeiro', entregavel: 'Extrato financeiro anual demonstrando o somatório algébrico de receitas e taxas.' },
  { id: '1.6', processo: 'Relatório Anual da Taxa de Fiscalização', etapa: '2', origem: 'GAPR', destino: 'AGRESE', prazoInterno: 'Até 05 de janeiro', prazoExterno: 'Anualmente, até 05 de janeiro', entregavel: 'Relatório Anual consolidado protocolado.', isFinal: true },
  // 1.7
  { id: '1.7', processo: 'Relatório Operacional Anual (ROA)', etapa: '2', origem: 'GRMC', destino: 'GAPR', prazoInterno: 'Até 15 de março', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Auditoria sistemática de coerência das informações fornecidas por DTEC e DPRQ.' },
  { id: '1.7', processo: 'Relatório Operacional Anual (ROA)', etapa: '3', origem: 'GAPR', destino: 'AGRESE / Poder C.', prazoInterno: 'Até o último dia de março', prazoExterno: 'Anualmente, último dia de março', entregavel: 'Submissão formal do ROA oficial consolidado aos órgãos fiscalizadores.', isFinal: true },
  // 1.8
  { id: '1.8', processo: 'Submissão das Demonstrações Financeiras', etapa: '1', origem: 'SFCC', destino: 'GRMC', prazoInterno: 'Até 15 de abril', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Demonstrações contábeis e notas explicativas chanceladas por auditores externos sem ressalvas.' },
  { id: '1.8', processo: 'Submissão das Demonstrações Financeiras', etapa: '2', origem: 'GRMC', destino: 'GAPR', prazoInterno: 'Até 25 de abril', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Conferência de todas as condicionantes e prazos normativos de publicação.' },
  { id: '1.8', processo: 'Submissão das Demonstrações Financeiras', etapa: '3', origem: 'GAPR', destino: 'AGRESE', prazoInterno: 'Até 01 de maio', prazoExterno: 'Anualmente, até 01º de maio', entregavel: 'Publicação pública em canais oficiais e protocolo integral das demonstrações.', isFinal: true },
  // 1.9
  { id: '1.9', processo: 'Assunção de Encargos por Inadimplência', etapa: '1', origem: 'SFCC', destino: 'GRMC', prazoInterno: 'Imediato ao cenário de mora', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Dossiê crítico evidenciando contas em atraso e parecer de insolvência/crise transitória.' },
  { id: '1.9', processo: 'Assunção de Encargos por Inadimplência', etapa: '2', origem: 'GRMC', destino: 'GAPR', prazoInterno: '24 horas após receber dossiê', prazoExterno: 'N/A (Trâmite interno)', entregavel: 'Emissão de alerta urgente pormenorizando probabilidade de colapso de fornecimento.' },
  { id: '1.9', processo: 'Assunção de Encargos por Inadimplência', etapa: '3', origem: 'GAPR', destino: 'AGRESE / Conces.', prazoInterno: 'Imediato após anuência', prazoExterno: '2 dias úteis após anuência AGRESE', entregavel: 'Solicitação formal e autorização de intervenção financeira repassada à Iguá.', isFinal: true },
  // 1.10_1
  { id: '1.10_1', processo: 'BAR - Aprovação do Manual de Controle Patrimonial', etapa: '1', origem: 'SFCC / Consultoria', destino: 'GRMC', prazoInterno: 'Etapa de Planejamento Inicial', prazoExterno: 'Etapa Preliminar do Projeto BAR', entregavel: 'Manual exaustivo de políticas contábeis, métricas de vida útil e estrutura de árvore de ativos.' },
  { id: '1.10_1', processo: 'BAR - Aprovação do Manual de Controle Patrimonial', etapa: '2', origem: 'GRMC', destino: 'GAPR', prazoInterno: '15 dias de revisão normativa', prazoExterno: 'Etapa Preliminar do Projeto BAR', entregavel: 'Parecer validando conformidade absoluta com regras da ANA e AGRESE.', isFinal: true },
  // 1.10_3
  { id: '1.10_3', processo: 'BAR - Conciliação Físico-Contábil e Impairment', etapa: '1', origem: 'SFCC / CAIP', destino: 'GRMC', prazoInterno: 'Pós-inspeção de tagueamento', prazoExterno: 'Anterior aos cálculos VNR/CHC', entregavel: 'Relatório analítico consolidado listando sobras, itens inexistentes e teste de recuperabilidade.' },
  { id: '1.10_3', processo: 'BAR - Conciliação Físico-Contábil e Impairment', etapa: '2', origem: 'GRMC', destino: 'GAPR', prazoInterno: '20 dias de análise de compliance', prazoExterno: 'Anterior aos cálculos VNR/CHC', entregavel: 'Parecer técnico resguardando os ativos contra inflacionamento inverídico.', isFinal: true },
  // 1.10_4
  { id: '1.10_4', processo: 'BAR - Emissão, Revisão e Defesa dos Laudos', etapa: '1', origem: 'SFCC / Consultoria', destino: 'GRMC', prazoInterno: 'Etapa Final de Modelagem', prazoExterno: 'Marco final do ciclo da BAR', entregavel: 'Balancetes segregados e cadernos atestando Custo de Reposição via indexadores (SINAPI).' },
  { id: '1.10_4', processo: 'BAR - Emissão, Revisão e Defesa dos Laudos', etapa: '2', origem: 'GRMC', destino: 'GAPR', prazoInterno: '30 dias de escrutínio rigoroso', prazoExterno: 'Marco final do ciclo da BAR', entregavel: 'Análise regulatória de conformidade atestando método científico da consultoria.' },
  { id: '1.10_4', processo: 'BAR - Emissão, Revisão e Defesa dos Laudos', etapa: '3', origem: 'GAPR', destino: 'AGRESE', prazoInterno: '5 dias após finalização GRMC', prazoExterno: 'Marco final do ciclo da BAR', entregavel: 'Protocolo de Defesa e Submissão oficial para homologação estrita de ressarcimento.', isFinal: true },
  // 1.12
  { id: '1.12', processo: 'Baixa/Alienação de Bens Reversíveis', etapa: '2', origem: 'SFCC (CAIP)', destino: 'GRMC', prazoInterno: '5 dias após ateste da DTEC', prazoExterno: 'Antecedência razoável prévia', entregavel: 'Extrato de depreciação contábil do item para fundamentar desmobilização.' },
  { id: '1.12', processo: 'Baixa/Alienação de Bens Reversíveis', etapa: '3', origem: 'GRMC / GAPR', destino: 'AGRESE', prazoInterno: '10 dias de formulação técnica', prazoExterno: 'Antecedência razoável prévia', entregavel: 'Ofício requerendo autorização estatal de desfazimento ou leilão patrimonial.', isFinal: true },
  // 1.13
  { id: '1.13', processo: 'Contratos de Financiamento (Notificação)', etapa: '1', origem: 'SFCC (GFIN/CTRT)', destino: 'GRMC', prazoInterno: 'Em até 3 dias úteis do ato', prazoExterno: 'Até 10 dias úteis da assinatura', entregavel: 'Cópias literais dos contratos de crédito, garantias e emissões debenturistas.' },
  { id: '1.13', processo: 'Contratos de Financiamento (Notificação)', etapa: '2', origem: 'GRMC / GAPR', destino: 'Poder Concedente', prazoInterno: 'Em até 5 dias úteis', prazoExterno: 'Impreterivelmente 10 dias úteis', entregavel: 'Ofício certificando não oneração ilegal de bens reversíveis a credores (Cláusula 13.6).', isFinal: true },
  // 1.14
  { id: '1.14', processo: 'Inadimplência em Financiamentos', etapa: '1', origem: 'SFCC (GFIN/CTRT)', destino: 'GRMC', prazoInterno: 'Imediato ao recebimento da mora', prazoExterno: 'Prazo máximo de 1 dia útil', entregavel: 'Dossiê circunstanciado descrevendo o evento de default ou paralisação de pagamentos.' },
  { id: '1.14', processo: 'Inadimplência em Financiamentos', etapa: '2', origem: 'GRMC / GAPR', destino: 'Poder Concedente', prazoInterno: 'Horas após comunicação', prazoExterno: 'Máximo de 1 dia útil da mora', entregavel: 'Alerta de emergência por risco iminente de caducidade do contrato outorgado.', isFinal: true },
  // 3.6
  { id: '3.6', processo: 'Celebração do Termo de Transferência da Obra', etapa: '2', origem: 'SJUR / SFCC (CAIP)', destino: 'GRMC', prazoInterno: '15 dias após comissionamento', prazoExterno: 'Ato contínuo à liberação do CI', entregavel: 'Minuta revisada de cessão civil e conciliação prévia atuarial do ativo contábil.', isFinal: true },
  // 3.9
  { id: '3.9', processo: 'Procedimento de Desapropriação e Servidão (DUP)', etapa: '1', origem: 'SJUR', destino: 'GRMC', prazoInterno: 'Conforme Plano de Obras DTEC', prazoExterno: 'Conforme plano de trabalho', entregavel: 'Elaboração pericial da minuta do Decreto de Utilidade Pública estruturada.', isFinal: true },
  // 3.10
  { id: '3.10', processo: 'Propriedade Intelectual (Cessão a Terceiros)', etapa: '1', origem: 'SJUR', destino: 'GRMC', prazoInterno: 'Imediato à entrega técnica', prazoExterno: 'Durante a vigência contratual', entregavel: 'Parecer Jurídico de Renúncia inalienável de royalties atestando poderes signatários.' },
  { id: '3.10', processo: 'Propriedade Intelectual (Cessão a Terceiros)', etapa: '2', origem: 'GRMC', destino: 'SFCC (CAIP)', prazoInterno: '5 dias úteis de validação', prazoExterno: 'Durante a vigência contratual', entregavel: 'Requisição formal de tombamento físico do ativo intangível imaterial à base contábil.' },
  { id: '3.10', processo: 'Propriedade Intelectual (Cessão a Terceiros)', etapa: '3', origem: 'GAPR', destino: 'Poder Concedente', prazoInterno: '10 dias após contabilização', prazoExterno: 'Contínuo', entregavel: 'Declaração de Cessão Intelectual permanente submetida aos arquivos governamentais.', isFinal: true },
  // 4.1
  { id: '4.1', processo: 'Acionamento do Comitê Técnico (Conflitos)', etapa: '1', origem: 'SJUR', destino: 'GRMC', prazoInterno: '15 dias da falha mediadora', prazoExterno: 'Por demanda (Réu 15d, Com. 30d)', entregavel: 'Requerimento isento de jargões genéricos instruído com laudos independentes.', isFinal: true },
  // 4.2
  { id: '4.2', processo: 'Instauração e Condução de Arbitragem', etapa: '1', origem: 'SJUR (GECO)', destino: 'GRMC', prazoInterno: 'Concomitante ao fim do Comitê', prazoExterno: 'Por demanda, via esgotamento', entregavel: 'Petição Inicial rigorosa com delimitação de pedidos e provas fáticas anexas.' },
  { id: '4.2', processo: 'Instauração e Condução de Arbitragem', etapa: '2', origem: 'GRMC / GAPR', destino: 'CAM-CCBC', prazoInterno: '10 dias de compilação técnica', prazoExterno: 'Por demanda', entregavel: 'Dossiê de falência conciliatória e protocolo institucional na Câmara Eleita.', isFinal: true },
  // 4.4
  { id: '4.4', processo: 'Pleito de Reequilíbrio Econômico-Financeiro', etapa: '1', origem: 'SPGE / SFCC', destino: 'GRMC', prazoInterno: '20 dias após materialização', prazoExterno: 'Imediato à materialização', entregavel: 'Dossiê orçamentário demonstrando fluxo marginal projetado e danos a longo prazo.', isFinal: true },
  // 4.5
  { id: '4.5', processo: 'Defesa Prévia Contra Autos de Infração e Multas', etapa: '1', origem: 'SJUR / GCIG', destino: 'GRMC', prazoInterno: '15 dias do recebimento do auto', prazoExterno: '30 dias para defesa; 15 recurso', entregavel: 'Peça fundamentada em ações atenuantes espontâneas visando desconto dosimétrico.' },
  { id: '4.5', processo: 'Defesa Prévia Contra Autos de Infração e Multas', etapa: '2', origem: 'GRMC / GAPR', destino: 'AGRESE', prazoInterno: 'Até o 25º dia útil', prazoExterno: 'Até 30 dias após auto infração', entregavel: 'Submissão tempestiva da Peça de Defesa evitando preclusão de direitos.', isFinal: true },
  // 4.8
  { id: '4.8', processo: 'Cláusulas de Sub-rogação em Terceirizados', etapa: '1', origem: 'SJUR / GLIC', destino: 'GCIG', prazoInterno: 'Antes da emissão de Edital', prazoExterno: 'Estritamente ato antecedente', entregavel: 'Termos de Referência obrigando terceiros a garantir salvaguardas de Bens Reversíveis.' },
  { id: '4.8', processo: 'Cláusulas de Sub-rogação em Terceirizados', etapa: '2', origem: 'GCIG', destino: 'GLIC', prazoInterno: '3 dias de verificação normativa', prazoExterno: 'Estritamente ato antecedente', entregavel: 'Compliance Check deferindo procedimentalmente a publicação segura do certame.', isFinal: true },
];

// Agrupar etapas por processo (id único)
export interface GrupoProcesso {
  id: string;
  processo: string;
  etapas: EtapaProcesso[];
  eixo: string;
}

const getEixo = (id: string): string => {
  const num = parseInt(id.split('.')[0]);
  if (num === 1) return 'Eixo 1 — Regulatório / Financeiro';
  if (num === 2) return 'Eixo 2 — Produção e Qualidade';
  if (num === 3) return 'Eixo 3 — Investimentos / Patrimônio';
  if (num === 4) return 'Eixo 4 — Institucional / Contencioso';
  return 'Outro';
};

export const GRUPOS_PROCESSOS: GrupoProcesso[] = (() => {
  const map = new Map<string, GrupoProcesso>();
  ETAPAS_PRESIDENCIA.forEach(e => {
    if (!map.has(e.id)) {
      map.set(e.id, { id: e.id, processo: e.processo, etapas: [], eixo: getEixo(e.id) });
    }
    map.get(e.id)!.etapas.push(e);
  });
  return Array.from(map.values()).sort((a, b) => {
    const pa = a.id.replace('_', '.').split('.').map(Number);
    const pb = b.id.replace('_', '.').split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    }
    return 0;
  });
})();
