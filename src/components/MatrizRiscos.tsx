'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SectionHeader, ClausulaTag, StatCard } from '@/components/ui';
import { PROCESSOS_COMPLIANCE as STATIC_PROCESSOS } from '@/lib/processosCompliance';
import { ETAPAS_PRESIDENCIA, EtapaProcesso } from '@/lib/processosPresidencia';
import TabelasReferencia from '@/components/TabelasReferencia';

const FormularioRevisao = dynamic(
  () => import('@/components/FormularioRevisao'),
  { ssr: false, loading: () => <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Carregando...</div> }
);

const GerenciadorDocumentos = dynamic(
  () => import('@/components/GerenciadorDocumentos'),
  { ssr: false, loading: () => <div className="mt-4 p-4 text-center text-sm text-gray-500">Carregando gerenciador de documentos...</div> }
);

interface RiscoItem {
  id: string;
  tipo: string;
  clausula: string;
  nome: string;
  descExata: string;
  alocacao: string;
  cor: string;
  contract?: 'CPA' | 'CI';
}

interface ProcessoItem {
  id: string;
  eixo: string;
  processo: string;
  fundamentacao: string;
  fluxo: string;
  destino: string;
  prazo: string;
  impacto: string;
  entregaveis: string;
}

interface OcorrenciaItem {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  riscoId: string;
  status: 'Identificado' | 'Em Tratamento' | 'Resolvido';
}

const DEFAULT_RISCOS_CPA: RiscoItem[] = [
  // DESO (Operador Upstream)
  { id: 'cpa-1', tipo: 'Erro de Estimativa (CAPEX/OPEX)', clausula: '21.3.1; 21.3.38', nome: 'Erro de Estimativa (CAPEX/OPEX)', descExata: 'Variação, erro ou subestimativa nos investimentos de capital, reinvestimentos necessários e custos operacionais ou de conservação do sistema upstream.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-2', tipo: 'Comercial', clausula: '21.3.2', nome: 'Frustração de Receitas Acessórias', descExata: 'Insucesso ou não efetivação de receitas provenientes de projetos associados, exploração de atividades alternativas e publicidade.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-3', tipo: 'Custos', clausula: '21.3.3; 21.3.4', nome: 'Custo de Insumos e Mão de Obra', descExata: 'Elevação nos preços de materiais, insumos produtivos e variações oriundas de dissídios, acordos, convenções coletivas e encargos legais.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-4', tipo: 'Suprimentos', clausula: '21.3.5; 21.3.6', nome: 'Cadeia de Fornecedores e Contratados', descExata: 'Falhas, atrasos, inconsistências ou inexecução de contratos por parte de subcontratados da DESO, bem como fornecimento inadequado de materiais.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-5', tipo: 'Utilidades', clausula: '21.3.7', nome: 'Interrupção de Utilidades Públicas', descExata: 'Atrasos ou intermitências no fornecimento de utilidades públicas fundamentais à operação de captação e tratamento.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-6', tipo: 'Social', clausula: '21.3.8', nome: 'Greves e Conflitos Internos', descExata: 'Ocorrência de manifestações, greves ou paralisações motivadas por demandas trabalhistas direcionadas diretamente à DESO ou às suas terceirizadas.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-7', tipo: 'HSE', clausula: '21.3.9', nome: 'Saúde, Segurança e Acidentes (HSE)', descExata: 'Falhas de segurança no trabalho, acidentes e integridade de trabalhadores em canteiros de obras ou na operação contínua.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-8', tipo: 'Compliance', clausula: '21.3.10', nome: 'Conformidade Legal (Compliance)', descExata: 'Descumprimento da legislação trabalhista, previdenciária e tributária exigível no Brasil.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-9', tipo: 'Vícios', clausula: '21.3.11', nome: 'Vícios de Projeto e Engenharia', descExata: 'Falhas, erros ou omissões em projetos básicos ou executivos elaborados pela DESO para a prestação dos serviços ou obras.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-10', tipo: 'Operacional', clausula: '21.3.12', nome: 'Sanções e Embargos Operacionais', descExata: 'Atrasos operacionais, embargos de obras e necessidade de refazimento devido à violação de normas técnicas ou do próprio contrato.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-11', tipo: 'Gestão', clausula: '21.3.13', nome: 'Atrasos e Gestão de Cronograma', descExata: 'Sobrecustos e atrasos na execução das obras e serviços que não sejam imputáveis aos municípios, Estado ou à Concessionária privada.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-12', tipo: 'Fundiário', clausula: '21.3.14', nome: 'Desocupações de Áreas', descExata: 'Prazos dilatados e custos diretos ou indiretos necessários para desocupar imóveis invadidos irregularmente após a assinatura do contrato.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-13', tipo: 'Fundiário', clausula: '21.3.15', nome: 'Custos de Desapropriação', descExata: 'Pagamento de indenizações, valores de mercado e despesas procedimentais para efetivar desapropriações e instituir servidões administrativas.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-14', tipo: 'Judiciário', clausula: '21.3.16', nome: 'Lentidão do Judiciário', descExata: 'Demora no proferimento de decisões judiciais necessárias à imissão na posse de terrenos e áreas desapropriadas.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-15', tipo: 'Fundiário', clausula: '21.3.17', nome: 'Regularização Imobiliária', descExata: 'Investimentos e impactos atrelados à regularização de matrículas documentais de imóveis para obtenção de licenciamento.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-16', tipo: 'Engenharia', clausula: '21.3.18', nome: 'Interferências Subterrâneas', descExata: 'Despesas e atrasos para remoção de interferências subterrâneas (redes de gás, telecomunicações, drenagem) não cadastradas.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-17', tipo: 'Ambiental', clausula: '21.3.19', nome: 'Geologia e Climatologia Adversa', descExata: 'Imprevistos durante escavações, composições rochosas severas ou eventos climáticos sazonais que afetem o cronograma de obras.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-18', tipo: 'Ambiental', clausula: '21.3.20; 21.3.21', nome: 'Licenciamento (Culpa do Operador)', descExata: 'Não obtenção ou atraso em licenças ambientais por falha na entrega de estudos, qualidade técnica insuficiente, bem como o custo de atender condicionantes ecológicas.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-19', tipo: 'Ambiental', clausula: '21.3.22', nome: 'Passivos Ambientais Históricos', descExata: 'Recuperação e mitigação de contaminações, danos ou irregularidades ambientais no sistema, sem distinção da data de origem do passivo.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-20', tipo: 'Tecnológico', clausula: '21.3.23', nome: 'Obsolescência Tecnológica', descExata: 'Necessidade de atualização de equipamentos e metodologias para cumprimento dos limites regulatórios ao longo de 35 anos.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-21', tipo: 'Segurança', clausula: '21.3.24', nome: 'Segurança e Danos Patrimoniais', descExata: 'Perdas em decorrência de roubos, furtos, vandalismo ou qualquer dano causado à infraestrutura, como o roubo de cabos e bombas em elevatórias.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-22', tipo: 'Vícios', clausula: '21.3.25', nome: 'Vícios Ocultos (Latentes)', descExata: 'Custos de correção e refazimento resultantes de falhas estruturais, de material ou de fundação que se manifestem no futuro.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-23', tipo: 'Financeiro', clausula: '21.3.26; 21.3.27', nome: 'Risco de Financiamento e Juros', descExata: 'Dificuldade de acesso a crédito, exigência de garantias severas por mutuantes, elevação do custo de capital próprio ou de terceiros (juros de mercado).', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-24', tipo: 'Financeiro', clausula: '21.3.28', nome: 'Risco Cambial', descExata: 'Flutuações nas taxas de câmbio que elevem o custo de equipamentos importados (como membranas de filtração, softwares SCADA) ou o serviço da dívida.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-25', tipo: 'Gestão', clausula: '21.3.29; 21.3.30; 21.3.37', nome: 'Álea de Gestão Empresarial', descExata: 'Custos excedentes por administração ineficiente, erros no planejamento tributário e contábil, e os riscos inerentes à exploração do capital.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-26', tipo: 'Tributário', clausula: '21.3.31', nome: 'Tributação Direta (Imposto de Renda)', descExata: 'Criação, alteração ou extinção de normas tributárias que incidam diretamente sobre a renda (IRPJ) e os lucros (CSLL) da companhia.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-27', tipo: 'Controle', clausula: '21.3.32; 21.3.33', nome: 'Determinações Judiciais/Controle', descExata: 'Suspensões de operação impostas por decisões de Tribunais de Contas ou do Judiciário originadas por obrigações devidas pela DESO.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-28', tipo: 'Seguros', clausula: '21.3.34; 21.3.35', nome: 'Franquias e Tetos de Seguros', descExata: 'Custos das apólices obrigatórias e absorção dos prejuízos materiais causados por Força Maior até o limite das coberturas contratadas e franquias aplicáveis.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },
  { id: 'cpa-29', tipo: 'Responsabilidade', clausula: '21.3.36', nome: 'Responsabilidade Civil a Terceiros', descExata: 'Reparação de danos civis, materiais, morais e ambientais causados pela atividade produtiva a vizinhos, transeuntes ou propriedades privadas.', alocacao: 'DESO', cor: '#ef4444', contract: 'CPA' },

  // PODER CONCEDENTE (Reequilíbrio)
  { id: 'cpa-30', tipo: 'Variação de Perímetro da Concessão', clausula: '21.5.1', nome: 'Variação de Perímetro da Concessão', descExata: 'Modificação na área de atendimento devido à transformação de áreas rurais em urbanas, inclusão/exclusão de povoados e expansões.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-31', tipo: 'Inadimplência do Poder Público', clausula: '21.5.2', nome: 'Inadimplência do Poder Público', descExata: 'Omissão, inércia ou descumprimento de prazos e deveres legais por parte do Estado ou da Agência Reguladora (AGRESE).', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-32', tipo: 'Atrasos em Decretos de Utilidade Pública', clausula: '21.5.3; 21.5.4', nome: 'Atrasos em Decretos de Utilidade Pública', descExata: 'Atraso por parte do Estado ou do Município na emissão de Declaração de Utilidade Pública (DUP) indispensável para desapropriações essenciais ao cronograma.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-33', tipo: 'Interferência da Concessionária Privada', clausula: '21.5.5', nome: 'Interferência da Concessionária Privada', descExata: 'Atrasos operacionais, inexecução ou perda de receita da DESO causados comprovadamente por ações ou omissões diretas da Concessionária (Concessionária).', alocacao: 'Estado (Repasse/Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-34', tipo: 'Alterações em Especificações de Obra', clausula: '21.5.6', nome: 'Alterações em Especificações de Obra', descExata: 'Imposições da AGRESE ou do Estado para alterar especificações técnicas originais das obras (não decorrentes de falha técnica prévia da DESO).', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-35', tipo: 'Atrasos por Falha Estatal/Municipal', clausula: '21.5.7; 21.5.8', nome: 'Atrasos por Falha Estatal/Municipal', descExata: 'Problemas crônicos no fornecimento de serviços e liberação de frentes de obra imputáveis diretamente à inércia de prefeituras ou do Governo.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-36', tipo: 'Assimetria de Dados na Estruturação', clausula: '21.5.9', nome: 'Assimetria de Dados na Estruturação', descExata: 'Constatação superveniente de erros colossais nos dados técnicos e estimativas fornecidas no Edital pelo Poder Público, viciando a formulação do CAPEX.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-37', tipo: 'Alteração Unilateral do Contrato', clausula: '21.5.10', nome: 'Alteração Unilateral do Contrato', descExata: 'Modificação forçada de cláusulas e escopos exigida unilateralmente pelo Estado em nome do interesse público (Art. 58, Lei 8.666/93 / Nova Lei de Licitações).', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-38', tipo: 'Risco Regulatório de Novas Normas', clausula: '21.5.11', nome: 'Risco Regulatório de Novas Normas', descExata: 'Edição superveniente de normas regulamentares pela AGRESE ou normas de referência da ANA que imponham novos encargos pesados e imprevistos à DESO.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-39', tipo: 'Fato do Príncipe e Fato da Administração', clausula: '21.5.12', nome: 'Fato do Príncipe e Fato da Administração', descExata: 'Ação de poder de império estatal, de forma geral ou direta sobre o contrato, que agrave o custo da prestação do serviço.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-40', tipo: 'Risco Tributário Indireto (EC 132/2023)', clausula: '21.5.13; 21.5.14', nome: 'Risco Tributário Indireto (EC 132/2023)', descExata: 'Mudanças na legislação, especialmente a nova Reforma Tributária (Emenda Constitucional 132/2023), alterando impostos sobre consumo (IBS/CBS), serviços e encargos indiretos.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-41', tipo: 'Força Maior Extraordinária', clausula: '21.5.15', nome: 'Força Maior Extraordinária', descExata: 'Ocorrência de catástrofes da natureza, pandemias extremas ou atos bélicos que excedam as coberturas securitárias exigíveis na regulamentação de mercado.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-42', tipo: 'Licenciamento Ambiental (Demora Estatal)', clausula: '21.5.16', nome: 'Licenciamento Ambiental (Demora Estatal)', descExata: 'Extrapolação dos prazos formais de análise pelos órgãos ambientais competentes, desde que a DESO comprove absoluta diligência documental.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-43', tipo: 'Decisões Judiciais de Terceiros', clausula: '21.5.17', nome: 'Decisões Judiciais de Terceiros', descExata: 'Determinações legais que acarretem atrasos ou cortes de receita, desde que comprovadamente a DESO não tenha dado causa processual a tal evento.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-44', tipo: 'Crédito Afetado por Atos do Estado', clausula: '21.5.18', nome: 'Crédito Afetado por Atos do Estado', descExata: 'Encarecimento abrupto de financiamentos bancários da DESO ocasionados de forma direta por calotes ou atos prejudiciais do Poder Concedente ou Municípios.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-45', tipo: 'Achados Arqueológicos/Históricos', clausula: '21.5.19', nome: 'Achados Arqueológicos/Históricos', descExata: 'Custos incorridos e atrasos devidos à paralisação de escavações por descoberta fortuita de sítios arqueológicos (IPHAN) ou patrimônios artísticos.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-46', tipo: 'Colapso Elétrico Sustentado', clausula: '21.5.20', nome: 'Colapso Elétrico Sustentado', descExata: 'Indisponibilidade de fornecimento da rede pública de energia elétrica, não imputável à DESO, por período contínuo superior a duas horas.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-47', tipo: 'Escassez Hídrica Crítica Oficial', clausula: '21.5.21', nome: 'Escassez Hídrica Crítica Oficial', descExata: 'Secas prolongadas que resultem na declaração oficial de escassez pelos órgãos gestores de recursos hídricos, impactando os volumes de adução.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-48', tipo: 'Conflitos de Povos Tradicionais', clausula: '21.5.22', nome: 'Conflitos de Povos Tradicionais', descExata: 'Interferências, ocupações ou embargos promovidos por indígenas, quilombolas ou movimentações sociais reivindicatórias de grande magnitude territorial.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-49', tipo: 'Greves Sistêmicas Externas', clausula: '21.5.23', nome: 'Greves Sistêmicas Externas', descExata: 'Greves da polícia, dos caminhoneiros, agentes portuários ou de funcionários exclusivos da Concessionária privada que paralisem as operações interdependentes.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-50', tipo: 'Imposições Tecnológicas Estatais', clausula: '21.5.24', nome: 'Imposições Tecnológicas Estatais', descExata: 'Custos para implementar metodologias ou tecnologias não previstas na matriz técnica original, exigidas pelo Estado apenas por interesse político superveniente.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
  { id: 'cpa-51', tipo: 'Investimentos Extrateto (Cláusula 11)', clausula: '21.5.25', nome: 'Investimentos Extrateto (Cláusula 11)', descExata: 'Investimentos adicionais supervenientes realizados no sistema após a assinatura dos contratos, que não constavam no Anexo de Obras exigidas, mas tornaram-se vitais.', alocacao: 'Poder Concedente (Reequilíbrio)', cor: '#10b981', contract: 'CPA' },
];

const DEFAULT_RISCOS_CI: RiscoItem[] = [
  { id: 'ci-1', tipo: 'Operacional Isolado e Expansão', clausula: '3.2; 5.4', nome: 'Operacional Isolado e Expansão', descExata: 'Necessidade de captação, adução e tratamento de água bruta em perímetros rurais isolados ou novos povoados onde o sistema da DESO não opera.', alocacao: 'Concessionária', cor: '#8b5cf6', contract: 'CI' },
  { id: 'ci-2', tipo: 'Falha em Macromedidores', clausula: '7.1; 7.3; 7.4', nome: 'Falha em Macromedidores', descExata: 'Custos associados à aquisição, calibração falha, manutenções periódicas e substituição por término de vida útil dos macromedidores eletrônicos de vazão nos Pontos de Entrega.', alocacao: 'Concessionária', cor: '#8b5cf6', contract: 'CI' },
  { id: 'ci-3', tipo: 'Discrepância Metrológica', clausula: '7.7.3; 7.7.4', nome: 'Discrepância Metrológica', descExata: 'Leitura de volumes divergente entre o macromedidor instalado pela Concessionária e os medidores preexistentes operados pela DESO.', alocacao: 'Compartilhado (via Agência)', cor: '#3b82f6', contract: 'CI' },
  { id: 'ci-4', tipo: 'Inadimplência Estrutural', clausula: '8.1; 8.2', nome: 'Inadimplência Estrutural', descExata: 'Insolvência de caixa da DESO causando calotes em contratos críticos (ex: concessionária de eletricidade, produtos para potabilização) com interrupção iminente do fornecimento.', alocacao: 'Concessionária (Faculdade de Assunção)', cor: '#8b5cf6', contract: 'CI' },
  { id: 'ci-5', tipo: 'Saturação de Margem Financeira', clausula: '8.2.4', nome: 'Saturação de Margem Financeira', descExata: 'Os valores despendidos pela Concessionária para resgatar financeiramente a DESO que superarem o próprio montante que seria devido na fatura mensal do contrato de compra de água.', alocacao: 'Concessionária (com Reequilíbrio)', cor: '#8b5cf6', contract: 'CI' },
  { id: 'ci-6', tipo: 'Suspensão Programada sem Aviso', clausula: '9.1; 10.13', nome: 'Suspensão Programada sem Aviso', descExata: 'Manutenções da rede ou das ETAs que causem interrupções de adução por mais de 3 horas sem a notificação com antecedência mínima de dois dias úteis.', alocacao: 'DESO', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-7', tipo: 'Desabastecimento Emergencial', clausula: '10.12', nome: 'Desabastecimento Emergencial', descExata: 'Reduções abruptas superiores a 10% do fluxo contratado na rede adutora, perdurando por mais de doze horas.', alocacao: 'DESO', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-8', tipo: 'Potabilidade Fora dos Padrões (MS)', clausula: '9.3; 9.5; 15.1.5', nome: 'Potabilidade Fora dos Padrões (MS)', descExata: 'Água injetada nos pontos de entrega aferida com turbidez, pH, coliformes ou cloro fora dos limites estritos da Portaria 05/2017 do Ministério da Saúde.', alocacao: 'DESO', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-9', tipo: 'Intermitência Estrutural Extrema', clausula: '9.7.5', nome: 'Intermitência Estrutural Extrema', descExata: 'Colapsos recorrentes que o Certificador Independente atribua a falhas graves de infraestrutura nas ETAs estaduais após o período de maturação.', alocacao: 'DESO (Subsidiariamente Concessionária)', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-10', tipo: 'Demanda Frustrada de Curto Prazo', clausula: '10.1; 10.2; 15.1.6', nome: 'Demanda Frustrada de Curto Prazo', descExata: 'Consumo e faturamento hídrico comercializado nas cidades ser muito inferior à garantia firmada nas tabelas volumétricas de transição nos três primeiros anos.', alocacao: 'Concessionária', cor: '#8b5cf6', contract: 'CI' },
  { id: 'ci-11', tipo: 'Subcapacidade de Produção', clausula: '10.3; 10.4; 10.5', nome: 'Subcapacidade de Produção', descExata: 'Planejamento quinquenal exigido pelo crescimento imobiliário exceder a capacidade atual de filtração e recalque instalada nas ETAs da DESO.', alocacao: 'DESO', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-12', tipo: 'Ociosidade por Falso Planejamento', clausula: '10.5.3', nome: 'Ociosidade por Falso Planejamento', descExata: 'A Concessionária privada exigir judicial ou contratualmente a expansão de uma ETA pela DESO e, posteriormente, cancelar seu planejamento de distribuição, tornando a planta um "elefante branco".', alocacao: 'Concessionária', cor: '#8b5cf6', contract: 'CI' },
  { id: 'ci-13', tipo: 'Fornecimento via Terceiros', clausula: '10.6.1; 10.8.2', nome: 'Fornecimento via Terceiros', descExata: 'Ineficiência contínua e reiterada (>15 dias) da DESO em prover volumes ou potabilidade, forçando a compra de caminhões-pipa ou água bruta de fontes alternativas.', alocacao: 'DESO (com Reequilíbrio pró-Concessionária)', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-14', tipo: 'Colapso e Construção de Autoprodução', clausula: '10.6.3', nome: 'Colapso e Construção de Autoprodução', descExata: 'Impossibilidade técnica total e duradoura do fornecimento pela DESO obrigar a corporação privada a construir poços profundos ou micro-ETAs próprias às pressas.', alocacao: 'DESO (com Reequilíbrio pró-Concessionária)', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-15', tipo: 'Lucros Cessantes por Falha Hídrica', clausula: '10.8.1; 11.2', nome: 'Lucros Cessantes por Falha Hídrica', descExata: 'Frustração total ou parcial da capacidade de faturar aos cidadãos devido à secagem generalizada dos pontos de entrega por negligência no tratamento upstream.', alocacao: 'DESO (via Desconto Formulaico)', cor: '#ef4444', contract: 'CI' },
  { id: 'ci-16', tipo: 'Inflação Divergente de Insumos', clausula: '6.3; 6.4', nome: 'Inflação Divergente de Insumos', descExata: 'Preços de sulfato de alumínio, cloro, bombas (pelo IPA-OG-DI), eletricidade (Tarifa A4 Azul) ou salários operacionais aumentarem substancialmente acima da tarifa do consumidor geral.', alocacao: 'Compartilhado (Reajuste Paramétrico)', cor: '#3b82f6', contract: 'CI' },
  { id: 'ci-17', tipo: 'Risco de Acesso e Assimetria de Dados', clausula: '5.6; 15.1.1', nome: 'Risco de Acesso e Assimetria de Dados', descExata: 'Funcionários de uma entidade negarem acesso a laboratórios, registros de telemetria (SCADA) e diários de potabilidade solicitados formalmente pela contraparte.', alocacao: 'Parte Infratora', cor: '#64748b', contract: 'CI' },
  { id: 'ci-18', tipo: 'Inadimplemento Comercial Faturado', clausula: '6.5; 15.1.3; 15.1.7', nome: 'Inadimplemento Comercial Faturado', descExata: 'Inércia ou negação contumaz da concessionária privada em liquidar as notas fiscais relativas à compra da água tratada ou dos volumes mínimos até o 10º dia do mês.', alocacao: 'Concessionária', cor: '#8b5cf6', contract: 'CI' },
  { id: 'ci-19', tipo: 'Custos Transacionais Arbitrais', clausula: '17.13', nome: 'Custos Transacionais Arbitrais', descExata: 'Custos com emolumentos, câmara administrativa, peritos e honorários exorbitantes do Tribunal Arbitral ao submeter divergências contratuais não resolvidas amigavelmente.', alocacao: 'Concessionária (Adiantamento)', cor: '#8b5cf6', contract: 'CI' },
];


const getEixoColor = (eixo: string) => {
  if (eixo.includes('Eixo 1')) return '#f59e0b';
  if (eixo.includes('Eixo 2')) return '#ef4444';
  if (eixo.includes('Eixo 3')) return '#3b82f6';
  if (eixo.includes('Eixo 4')) return '#22c55e';
  return '#3b82f6';
};

export default function MatrizRiscos() {
  const [activeTab, setActiveTab] = useState<'cpa' | 'ci' | 'instrumentos' | 'revisao' | 'tabelas' | 'ocorrencias'>('cpa');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [eixoFiltro, setEixoFiltro] = useState<string>('');
  
  const [riscosCPA, setRiscosCPA] = useState<RiscoItem[]>([]);
  const [riscosCI, setRiscosCI] = useState<RiscoItem[]>([]);
  const [processos, setProcessos] = useState<ProcessoItem[]>([]);
  const [etapas, setEtapas] = useState<EtapaProcesso[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaItem[]>([]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'risco' | 'processo' | 'etapa' | 'ocorrencia' | null>(null);

  useEffect(() => {
    const savedCPA = localStorage.getItem('spd_riscos_cpa');
    setRiscosCPA(savedCPA ? JSON.parse(savedCPA) : DEFAULT_RISCOS_CPA);

    const savedCI = localStorage.getItem('spd_riscos_ci');
    setRiscosCI(savedCI ? JSON.parse(savedCI) : DEFAULT_RISCOS_CI);

    const savedProcessos = localStorage.getItem('spd_processos_compliance');
    setProcessos(savedProcessos ? JSON.parse(savedProcessos) : STATIC_PROCESSOS);

    const savedEtapas = localStorage.getItem('spd_etapas_custom');
    setEtapas(savedEtapas ? JSON.parse(savedEtapas) : ETAPAS_PRESIDENCIA);

    const savedOcorrencias = localStorage.getItem('spd_ocorrencias');
    setOcorrencias(savedOcorrencias ? JSON.parse(savedOcorrencias) : []);
  }, []);

  const saveAll = (type: string, data: any) => {
    localStorage.setItem(`spd_${type}`, JSON.stringify(data));
    if (type === 'riscos_cpa') setRiscosCPA(data);
    if (type === 'riscos_ci') setRiscosCI(data);
    if (type === 'processos_compliance') setProcessos(data);
    if (type === 'etapas_custom') setEtapas(data);
    if (type === 'ocorrencias') setOcorrencias(data);
  };

  const filteredRiscos = useMemo(() => {
    if (activeTab === 'instrumentos' || activeTab === 'tabelas') return [];
    const list = activeTab === 'cpa' ? riscosCPA : riscosCI;
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(r => 
      r.nome.toLowerCase().includes(s) || 
      r.descExata.toLowerCase().includes(s) || 
      r.clausula.toLowerCase().includes(s) ||
      r.alocacao.toLowerCase().includes(s)
    );
  }, [activeTab, search, riscosCPA, riscosCI]);

  const filteredProcessos = useMemo(() => {
    if (activeTab !== 'instrumentos') return [];
    const s = search.toLowerCase();
    const list = processos.filter(p => 
      (!eixoFiltro || p.eixo.includes(eixoFiltro)) &&
      (p.processo.toLowerCase().includes(s) ||
      p.fundamentacao.toLowerCase().includes(s) ||
      p.entregaveis.toLowerCase().includes(s) ||
      p.eixo.toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s))
    );

    return list.sort((a, b) => {
      const partsA = a.id.split('.').map(Number);
      const partsB = b.id.split('.').map(Number);
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const valA = partsA[i] || 0;
        const valB = partsB[i] || 0;
        if (valA !== valB) return valA - valB;
      }
      return 0;
    });
  }, [activeTab, search, eixoFiltro, processos]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 100 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'cpa', label: 'Matriz CPA (Produção)', icon: '🏛️' },
          { id: 'ci', label: 'Matriz CI (Interdependência)', icon: '⚡' },
          { id: 'instrumentos', label: 'Instrumentos de Gestão', icon: '📋' },
          { id: 'revisao', label: 'Revisão de Processos', icon: '📝' },
          { id: 'tabelas', label: 'Referências', icon: '📑' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id as any); setExpandedId(null); }}
            style={{
              padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
              background: activeTab === t.id ? 'var(--brand-blue)' : 'white',
              border: `1px solid ${activeTab === t.id ? 'var(--brand-blue)' : 'var(--border-primary)'}`,
              color: activeTab === t.id ? '#ffffff' : 'var(--text-primary)',
              transition: 'all 0.2s ease', fontWeight: 700, fontSize: '0.85rem'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.4)', padding: 20, borderRadius: 16, border: '1px solid var(--border-primary)', marginBottom: 24 }}>
        {/* Top Bar: Search & Action Buttons */}
        {(activeTab === 'cpa' || activeTab === 'ci' || activeTab === 'instrumentos') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
              <input 
                type="text" 
                placeholder={`Pesquisar em ${activeTab.toUpperCase()}...`} 
                className="spd-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 44, height: 48, borderRadius: 12, fontSize: '0.95rem' }}
              />
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem' }}>🔍</span>
            </div>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {activeTab === 'cpa' && (
                <button 
                  onClick={() => {
                    const novo: RiscoItem = { 
                      id: `cpa-${Date.now()}`, 
                      tipo: 'Técnico', 
                      clausula: '', 
                      nome: 'Novo Risco CPA', 
                      descExata: '', 
                      alocacao: 'DESO', 
                      cor: '#ef4444',
                      contract: 'CPA'
                    };
                    setEditingItem(novo);
                    setEditType('risco');
                  }}
                  className="spd-button" style={{ background: 'var(--brand-blue)', color: 'white', fontWeight: 800, padding: '0 24px', height: 48, borderRadius: 12 }}
                >
                  + Novo Risco CPA
                </button>
              )}
              {activeTab === 'ci' && (
                <button 
                  onClick={() => {
                    const novo: RiscoItem = { 
                      id: `ci-${Date.now()}`, 
                      tipo: 'Comercial', 
                      clausula: '', 
                      nome: 'Novo Risco CI', 
                      descExata: '', 
                      alocacao: 'Concessionária', 
                      cor: '#8b5cf6',
                      contract: 'CI'
                    };
                    setEditingItem(novo);
                    setEditType('risco');
                  }}
                  className="spd-button" style={{ background: 'var(--brand-blue)', color: 'white', fontWeight: 800, padding: '0 24px', height: 48, borderRadius: 12 }}
                >
                  + Novo Risco CI
                </button>
              )}
              {activeTab === 'instrumentos' && (
                <button 
                  onClick={() => {
                    const novo: ProcessoItem = { 
                      id: `PR-${Date.now()}`, 
                      eixo: 'Eixo 1 — Regulação e Financeiro', 
                      processo: 'Novo Processo de Gestão', 
                      fundamentacao: '', fluxo: '', destino: '', prazo: '', impacto: '', entregaveis: '' 
                    };
                    setEditingItem(novo);
                    setEditType('processo');
                  }}
                  className="spd-button" style={{ background: 'var(--brand-blue)', color: 'white', fontWeight: 800, padding: '0 24px', height: 48, borderRadius: 12 }}
                >
                  + Adicionar Instrumento
                </button>
              )}

              {(activeTab === 'cpa' || activeTab === 'ci') && (
                <button 
                  onClick={() => {
                    const tabName = activeTab === 'cpa' ? 'CPA' : 'CI';
                    if(confirm(`Deseja restaurar a matriz ${tabName} padrão? Todas as alterações manuais serão perdidas.`)) {
                      if (activeTab === 'cpa') {
                        setRiscosCPA(DEFAULT_RISCOS_CPA);
                        localStorage.setItem('spd_riscos_cpa', JSON.stringify(DEFAULT_RISCOS_CPA));
                      } else {
                        setRiscosCI(DEFAULT_RISCOS_CI);
                        localStorage.setItem('spd_riscos_ci', JSON.stringify(DEFAULT_RISCOS_CI));
                      }
                    }
                  }}
                  className="spd-button" style={{ background: 'transparent', border: '1px solid var(--border-primary)', color: 'var(--text-muted)', fontSize: '0.75rem' }}
                >
                  🔄 Restaurar Padrões
                </button>
              )}
            </div>
          </div>
        )}

        {/* Classification Summary Dashboard */}
        {(activeTab === 'cpa' || activeTab === 'ci') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #fff, #fef2f2)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Alocação DESO</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>
                {(activeTab === 'cpa' ? riscosCPA : riscosCI).filter(r => r.alocacao.includes('DESO')).length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', opacity: 0.7, fontWeight: 600 }}>Operacional Upstream</div>
            </div>

            {activeTab === 'cpa' ? (
              <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #fff, #f0fdf4)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Poder Concedente / Estado</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>
                  {riscosCPA.filter(r => r.alocacao.includes('Poder Concedente') || r.alocacao.includes('Estado')).length}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', opacity: 0.7, fontWeight: 600 }}>Riscos de Reequilíbrio</div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #fff, #f5f3ff)', border: '1px solid rgba(139,92,246,0.1)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Concessionária</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6' }}>
                  {riscosCI.filter(r => r.alocacao.includes('Concessionária')).length}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#8b5cf6', opacity: 0.7, fontWeight: 600 }}>Operacional e Comercial</div>
              </div>
            )}

            <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #fff, #eff6ff)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Compartilhado / Outros</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6' }}>
                {(activeTab === 'cpa' ? riscosCPA : riscosCI).filter(r => 
                  !r.alocacao.includes('DESO') && 
                  !r.alocacao.includes('Poder Concedente') && 
                  !r.alocacao.includes('Estado') && 
                  !r.alocacao.includes('Concessionária')
                ).length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#3b82f6', opacity: 0.7, fontWeight: 600 }}>Agência / Partes</div>
            </div>
          </div>
        )}

        {activeTab === 'instrumentos' && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { key: '', label: 'Ver Todos', count: processos.length, icon: '📋', color: '#64748b', bg: 'white' },
              { key: 'Eixo 1', label: 'Eixo 1 — Regulatória/Financ.', count: processos.filter(p => p.eixo.includes('Eixo 1')).length, icon: '🏛️', color: '#f59e0b', bg: '#fffbeb' },
              { key: 'Eixo 2', label: 'Eixo 2 — Produção', count: processos.filter(p => p.eixo.includes('Eixo 2')).length, icon: '💧', color: '#ef4444', bg: '#fef2f2' },
              { key: 'Eixo 3', label: 'Eixo 3 — Investimentos', count: processos.filter(p => p.eixo.includes('Eixo 3')).length, icon: '🏗️', color: '#3b82f6', bg: '#eff6ff' },
              { key: 'Eixo 4', label: 'Eixo 4 — Institucional', count: processos.filter(p => p.eixo.includes('Eixo 4')).length, icon: '🏢', color: '#22c55e', bg: '#f0fdf4' },
            ].map(e => {
              const isSel = eixoFiltro === e.key;
              return (
                <button
                  key={e.key}
                  onClick={() => { setEixoFiltro(e.key); setExpandedId(null); }}
                  style={{
                    flex: '1 1 180px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px',
                    borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${isSel ? e.color : 'var(--border-primary)'}`,
                    background: isSel ? e.bg : 'white', color: isSel ? e.color : 'var(--text-secondary)',
                    transition: 'all 0.2s', boxShadow: isSel ? `0 4px 12px ${e.color}20` : '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.4rem' }}>{e.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{e.label}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 700 }}>{e.key || 'Geral'}</div>
                    </div>
                  </div>
                  <span style={{ background: isSel ? e.color : 'var(--bg-secondary)', color: isSel ? 'white' : 'var(--text-muted)', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 900 }}>
                    {e.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'instrumentos' ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {activeTab !== 'instrumentos' && activeTab !== 'tabelas' && activeTab !== 'revisao' && filteredRiscos.map((r) => (
          <div key={r.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${expandedId === r.id ? r.cor : 'var(--border-primary)'}`, transition: 'all 0.2s' }}>
            <div style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ 
                  fontSize: '0.62rem', fontWeight: 900, color: 'white', 
                  background: r.cor, padding: '2px 8px', borderRadius: 4, 
                  textTransform: 'uppercase', boxShadow: `0 2px 4px ${r.cor}40`
                }}>
                  {r.tipo}
                </span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingItem(r); setEditType('risco'); }} 
                    style={{ background: 'rgba(59,130,246,0.1)', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Excluir risco?')) saveAll(activeTab==='cpa'?'riscos_cpa':'riscos_ci', (activeTab==='cpa'?riscosCPA:riscosCI).filter(x=>x.id!==r.id)); }} 
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{r.nome}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <ClausulaTag text={r.clausula} />
                <span style={{ 
                  fontSize: '0.68rem', fontWeight: 900, color: r.cor, 
                  background: `${r.cor}15`, padding: '4px 10px', borderRadius: 20, 
                  border: `2px solid ${r.cor}30`, textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {r.alocacao}
                </span>
              </div>
            </div>
            {expandedId === r.id && (
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ height: 1, background: 'var(--border-primary)', marginBottom: 16 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.descExata}</p>
              </div>
            )}
          </div>
        ))}

        {activeTab === 'instrumentos' && filteredProcessos.map((p) => {
          const corEixo = getEixoColor(p.eixo);
          return (
            <div key={p.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', borderLeft: `6px solid ${corEixo}` }}>
              <div style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: corEixo, textTransform: 'uppercase' }}>{p.eixo}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingItem(p); setEditType('processo'); }} 
                      style={{ background: 'rgba(59,130,246,0.1)', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-blue)' }}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Excluir processo?')) saveAll('processos_compliance', processos.filter(x=>x.id!==p.id)); }} 
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, color: '#ef4444' }}
                    >
                      🗑️ Excluir
                    </button>
                    <span style={{ opacity: 0.5, marginLeft: 8 }}>{expandedId === p.id ? '▲' : '▼'}</span>
                  </div>
              </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: 8 }}>
                  <span style={{ opacity: 0.5 }}>{p.id}</span> — {p.processo}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.fundamentacao}</p>
              </div>

              {expandedId === p.id && (
                <div style={{ padding: '0 20px 24px', borderTop: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 20 }}>
                    <div>
                      <h4 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Destino</h4>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.destino}</p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Prazo</h4>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.prazo}</p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Entregáveis</h4>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.entregaveis}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontWeight: 800, fontSize: '0.9rem' }}>📋 Etapas Detalhadas</h4>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button 
                          onClick={() => {
                            // Pre-fill revision form and switch tab
                            localStorage.setItem('spd_pending_revision', JSON.stringify({
                              processo: p.processo,
                              codigo: p.id
                            }));
                            setActiveTab('revisao');
                          }}
                          className="spd-button" style={{ fontSize: '0.7rem', padding: '6px 12px', background: 'rgba(59,130,246,0.1)', color: 'var(--brand-blue)', border: '1px solid var(--brand-blue)30' }}
                        >
                          📝 Solicitar Revisão
                        </button>
                        <button 
                          onClick={() => {
                            const nova: EtapaProcesso = { id: p.id, processo: p.processo, etapa: (etapas.filter(e => e.id === p.id).length + 1).toString(), origem: '', destino: '', prazoInterno: '', prazoExterno: '', entregavel: '' };
                            setEditingItem(nova);
                            setEditType('etapa');
                          }}
                          className="spd-button" style={{ fontSize: '0.7rem', padding: '6px 12px' }}
                        >
                          + Adicionar Etapa
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border-primary)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead style={{ background: 'var(--bg-secondary)' }}>
                          <tr>
                            <th style={{ padding: 12, textAlign: 'left' }}>Etapa</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Origem → Destino</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Prazos (I/E)</th>
                            <th style={{ padding: 12, textAlign: 'left' }}>Entregáveis</th>
                            <th style={{ padding: 12, textAlign: 'center' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {etapas.filter(e => e.id === p.id).map((e, idx) => (
                            <tr key={`${p.id}-${idx}`} style={{ borderTop: '1px solid var(--border-primary)' }}>
                              <td style={{ padding: 12, fontWeight: 700 }}>{e.etapa}</td>
                              <td style={{ padding: 12 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.origem}</div>
                                <div style={{ fontWeight: 600 }}>{e.destino}</div>
                              </td>
                              <td style={{ padding: 12 }}>
                                <div style={{ fontSize: '0.7rem' }}>I: {e.prazoInterno}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>E: {e.prazoExterno}</div>
                              </td>
                              <td style={{ padding: 12 }}>{e.entregavel}</td>
                              <td style={{ padding: 12, textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                  <button 
                                    onClick={() => { setEditingItem(e); setEditType('etapa'); }} 
                                    style={{ background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 8 }}
                                    title="Editar Etapa"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    onClick={() => { 
                                      if(confirm('Deseja excluir esta etapa?')) {
                                        const newList = etapas.filter(x => x !== e);
                                        saveAll('etapas_custom', newList);
                                      }
                                    }} 
                                    style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 8 }}
                                    title="Excluir Etapa"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {etapas.filter(e => e.id === p.id).length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                                Nenhuma etapa detalhada mapeada para este processo.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <GerenciadorDocumentos key={p.id} processoId={p.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {((activeTab === 'cpa' || activeTab === 'ci') && filteredRiscos.length === 0) || (activeTab === 'instrumentos' && filteredProcessos.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(6,13,31,0.4)', borderRadius: 20, border: '1px dashed rgba(59,130,246,0.2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔎</div>
          <h3 style={{ color: 'var(--text-secondary)' }}>Nenhum item encontrado para "{search}"</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>Tente ajustar os filtros ou o termo de busca.</p>
        </div>
      ) : null}

      {activeTab === 'tabelas' && (
        <TabelasReferencia />
      )}

      {activeTab === 'revisao' && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <FormularioRevisao />
        </div>
      )}

      {/* Ocorrências removed as requested */}

      {(activeTab === 'cpa' || activeTab === 'ci') && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 16, 
          marginTop: 32,
          padding: 16,
          background: 'rgba(59,130,246,0.03)',
          borderRadius: 20,
          border: '1px solid rgba(59,130,246,0.1)'
        }}>
          <StatCard label="Total de Riscos Mapeados" value={riscosCPA.length + riscosCI.length} icon="🧩" />
          <StatCard label="Alocação DESO (Upstream)" value={riscosCPA.filter(r => r.alocacao === 'DESO').length + riscosCI.filter(r => r.alocacao === 'DESO').length} variant="danger" icon="🏭" />
          <StatCard label="Alocação Poder Concedente" value={riscosCPA.filter(r => r.alocacao.includes('Poder')).length} variant="success" icon="🛡️" />
          <StatCard label="Alocação Concessionária" value={riscosCI.filter(r => r.alocacao.includes('Concessionária')).length} variant="primary" icon="⚡" />
        </div>
      )}

      {editingItem && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 600, padding: 32, background: 'white' }}>
            <h3 style={{ marginBottom: 24, fontSize: '1.2rem', fontWeight: 800 }}>
              {editType === 'risco' ? '📝 Editar Risco' : editType === 'processo' ? '📋 Editar Instrumento' : '📋 Editar Etapa'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {editType === 'risco' && (
                <>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Nome do Risco</label>
                    <input className="spd-input" value={editingItem.nome} onChange={e => setEditingItem({...editingItem, nome: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Tipo</label>
                    <input className="spd-input" value={editingItem.tipo} onChange={e => setEditingItem({...editingItem, tipo: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Cláusula</label>
                    <input className="spd-input" value={editingItem.clausula} onChange={e => setEditingItem({...editingItem, clausula: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Alocação</label>
                    <input className="spd-input" value={editingItem.alocacao} onChange={e => setEditingItem({...editingItem, alocacao: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Descrição Detalhada</label>
                    <textarea className="spd-input" rows={4} value={editingItem.descExata} onChange={e => setEditingItem({...editingItem, descExata: e.target.value})} />
                  </div>
                </>
              )}

              {editType === 'processo' && (
                <>
                  <div>
                    <label className="spd-label">ID / Código</label>
                    <input className="spd-input" value={editingItem.id} onChange={e => setEditingItem({...editingItem, id: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Eixo</label>
                    <select className="spd-input" value={editingItem.eixo} onChange={e => setEditingItem({...editingItem, eixo: e.target.value})}>
                      <option>Eixo 1 — Regulação e Financeiro</option>
                      <option>Eixo 2 — Operacional e Manutenção</option>
                      <option>Eixo 3 — Investimentos e Expansão</option>
                      <option>Eixo 4 — Institucional e Governança</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Nome do Processo</label>
                    <input className="spd-input" value={editingItem.processo} onChange={e => setEditingItem({...editingItem, processo: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Fundamentação Normativa</label>
                    <input className="spd-input" value={editingItem.fundamentacao} onChange={e => setEditingItem({...editingItem, fundamentacao: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Destino Principal</label>
                    <input className="spd-input" value={editingItem.destino} onChange={e => setEditingItem({...editingItem, destino: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Prazo</label>
                    <input className="spd-input" value={editingItem.prazo} onChange={e => setEditingItem({...editingItem, prazo: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Entregáveis</label>
                    <input className="spd-input" value={editingItem.entregaveis} onChange={e => setEditingItem({...editingItem, entregaveis: e.target.value})} />
                  </div>
                </>
              )}

              {editType === 'etapa' && (
                <>
                  <div>
                    <label className="spd-label">Número da Etapa</label>
                    <input className="spd-input" value={editingItem.etapa} onChange={e => setEditingItem({...editingItem, etapa: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Origem</label>
                    <input className="spd-input" value={editingItem.origem} onChange={e => setEditingItem({...editingItem, origem: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Destino</label>
                    <input className="spd-input" value={editingItem.destino} onChange={e => setEditingItem({...editingItem, destino: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Prazo Interno</label>
                    <input className="spd-input" value={editingItem.prazoInterno} onChange={e => setEditingItem({...editingItem, prazoInterno: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Prazo Externo</label>
                    <input className="spd-input" value={editingItem.prazoExterno} onChange={e => setEditingItem({...editingItem, prazoExterno: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Entregável</label>
                    <input className="spd-input" value={editingItem.entregavel} onChange={e => setEditingItem({...editingItem, entregavel: e.target.value})} />
                  </div>
                </>
              )}

              {editType === 'ocorrencia' && (
                <>
                  <div>
                    <label className="spd-label">ID / Identificador</label>
                    <input className="spd-input" value={editingItem.id} onChange={e => setEditingItem({...editingItem, id: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Data da Ocorrência</label>
                    <input type="date" className="spd-input" value={editingItem.data} onChange={e => setEditingItem({...editingItem, data: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Nome da Ocorrência</label>
                    <input className="spd-input" value={editingItem.nome} onChange={e => setEditingItem({...editingItem, nome: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="spd-label">Descrição Própria</label>
                    <textarea className="spd-input" rows={3} value={editingItem.descricao} onChange={e => setEditingItem({...editingItem, descricao: e.target.value})} />
                  </div>
                  <div>
                    <label className="spd-label">Vincular a Risco Mapeado</label>
                    <select className="spd-input" value={editingItem.riscoId} onChange={e => setEditingItem({...editingItem, riscoId: e.target.value})}>
                      <option value="">Nenhum risco vinculado</option>
                      <optgroup label="Riscos CPA">
                        {riscosCPA.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                      </optgroup>
                      <optgroup label="Riscos CI">
                        {riscosCI.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="spd-label">Status do Tratamento</label>
                    <select className="spd-input" value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value as any})}>
                      <option value="Identificado">Identificado</option>
                      <option value="Em Tratamento">Em Tratamento</option>
                      <option value="Resolvido">Resolvido</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="spd-button" onClick={() => { setEditingItem(null); setEditType(null); }}>Cancelar</button>
              <button 
                className="spd-button" 
                style={{ background: 'var(--brand-blue)', color: 'white' }}
                onClick={() => {
                  if (editType === 'risco') {
                    const list = activeTab === 'cpa' ? riscosCPA : riscosCI;
                    const exists = list.find(r => r.id === editingItem.id);
                    const newList = exists ? list.map(r => r.id === editingItem.id ? editingItem : r) : [editingItem, ...list];
                    saveAll(activeTab === 'cpa' ? 'riscos_cpa' : 'riscos_ci', newList);
                  } else if (editType === 'processo') {
                    const exists = processos.find(p => p.id === editingItem.id);
                    const newList = exists ? processos.map(p => p.id === editingItem.id ? editingItem : p) : [editingItem, ...processos];
                    saveAll('processos_compliance', newList);
                  } else if (editType === 'etapa') {
                    const idx = etapas.findIndex(e => e.id === editingItem.id && e.etapa === editingItem.etapa);
                    const newList = idx !== -1 
                      ? etapas.map((e, i) => i === idx ? editingItem : e) 
                      : [...etapas, editingItem];
                    saveAll('etapas_custom', newList);
                  } else if (editType === 'ocorrencia') {
                    const exists = ocorrencias.find(o => o.id === editingItem.id);
                    const newList = exists ? ocorrencias.map(o => o.id === editingItem.id ? editingItem : o) : [editingItem, ...ocorrencias];
                    saveAll('ocorrencias', newList);
                  }
                  setEditingItem(null);
                  setEditType(null);
                }}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
