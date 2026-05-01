export interface NormaReferencia {
  id: string;
  titulo: string;
  link: string;
  categoria: 'ABNT' | 'ANA' | 'AGRESE' | 'CONTRATOS' | 'INTERNO';
  versao: string;
  ultimaAtualizacao: string;
}

export const NORMAS_INICIAIS: NormaReferencia[] = [
  // ABNT
  { id: 'iso-31000', titulo: 'ABNT NBR ISO 31000: Gestão de riscos — Diretrizes (2018)', link: 'https://drive.google.com/file/d/1gKG8q35Dd83CbTxY0gNsENK62OsHITKc', categoria: 'ABNT', versao: '2018', ultimaAtualizacao: '2024-01-15' },
  { id: 'iso-37301', titulo: 'ABNT NBR ISO 37301: Sistemas de gestão de compliance (2021/2024)', link: 'https://drive.google.com/file/d/14suUSLbFtzJkFXvoPqkz5Eayj7gJEue6', categoria: 'ABNT', versao: '2021 (Ed. 2024)', ultimaAtualizacao: '2024-03-20' },
  { id: 'iso-55000', titulo: 'ABNT NBR ISO 55000: Gestão de ativos — Terminologia (2024)', link: 'https://drive.google.com/file/d/1SiIEaMCp3VZrmah-L7_VbH2zrtnmUuXW', categoria: 'ABNT', versao: '2024', ultimaAtualizacao: '2024-08-10' },
  { id: 'iso-55001', titulo: 'ABNT NBR ISO 55001: Gestão de ativos — Sistemas de gestão (2024)', link: 'https://drive.google.com/file/d/1dcR7t95QGWz52ve_DrBFPyWx1KEKJTY_', categoria: 'ABNT', versao: '2024', ultimaAtualizacao: '2024-08-10' },
  // ANA
  { id: 'ana-in-01-2024', titulo: 'ANA Instrução Normativa nº 1/2024 - Metodologias de indenização', link: 'https://drive.google.com/file/d/1DnBvLTDblQAv6leFaRvtqzjUpkRY-B_Q', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-02-12' },
  { id: 'ana-nr-03-2023', titulo: 'ANA Norma de Referência nº 3/2023 - Indenização de investimentos', link: 'https://drive.google.com/file/d/107r7k3Kwd5mYfSJ6xLF8kcGszHHH6zY2', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2023-11-05' },
  { id: 'ana-nr-05-2024', titulo: 'ANA Norma de Referência nº 5/2024 - Repartição de riscos', link: 'https://drive.google.com/file/d/1AsZOw8IcmMqhDDuiimZV2_dKHDXKlgNJ', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-05-22' },
  { id: 'ana-nr-06-2024', titulo: 'ANA Norma de Referência nº 6/2024 - Regulação tarifária', link: 'https://drive.google.com/file/d/1ZtBf1ZJ3O4R2rP5O2vS_A8qY1v1JdIqV', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-06-18' },
  { id: 'ana-nr-08-2024', titulo: 'ANA Norma de Referência nº 8/2024 - Metas de universalização', link: 'https://drive.google.com/file/d/1dkAlyMkuLamllLzLrxaBifvcMeFXkY9-', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-07-30' },
  { id: 'ana-nr-09-2024', titulo: 'ANA Norma de Referência nº 9/2024 - Indicadores operacionais', link: 'https://drive.google.com/file/d/1zuyrLsjnbWWs64vd_ekHFvxsZal1GFOF', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-08-15' },
  { id: 'ana-nr-10-2024', titulo: 'ANA Norma de Referência nº 10/2024 - Reajustes tarifários', link: 'https://drive.google.com/file/d/1srGFluJeZ4zUwXSrjpvSrXZFtGo0JMcH', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-09-02' },
  { id: 'ana-nr-11-2024', titulo: 'ANA Norma de Referência nº 11/2024 - Condições gerais de prestação', link: 'https://drive.google.com/file/d/1GNOPNVaeBSrIlYzDSXI68DL9ISOfxwpA', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-09-10' },
  { id: 'ana-nr-13-2025', titulo: 'ANA Norma de Referência nº 13/2025 - Estrutura tarifária e tarifa social', link: 'https://drive.google.com/file/d/1CMa8NxbRnA_s6DhzAeWAAw-rc6Hj2lH0', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2025-01-20' },
  { id: 'ana-nr-15-2025', titulo: 'ANA Norma de Referência nº 15/2025 - Gestão de redução de perdas', link: 'https://drive.google.com/file/d/1_MRi4UUlBqhiyJrBAP0WzEPuicuY9pmq', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2025-02-15' },
  { id: 'ana-res-209-2024', titulo: 'ANA Resolução nº 209/2024 - Mediação de Conflitos', link: 'https://drive.google.com/file/d/1_DgwtQcNfdnSAsIVOkxuMeHMkp5D5zNL', categoria: 'ANA', versao: 'V1.0', ultimaAtualizacao: '2024-12-05' },
  // AGRESE
  { id: 'agrese-por-76-2025', titulo: 'AGRESE Portaria nº 76/2025 - Macromedidores', link: 'https://drive.google.com/file/d/1lpAdb2Uzl5AU9h9L3maVBNoiJp_rrwsq', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2025-03-01' },
  { id: 'agrese-por-81-2025', titulo: 'AGRESE Portaria nº 81/2025 - Verificador Independente', link: 'https://drive.google.com/file/d/14hyFcvPJFNw5XQbAiB4qBTHQpw-RA0i0', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2025-03-15' },
  { id: 'agrese-res-96-2025', titulo: 'AGRESE Resolução nº 96/2025 - Regulamento Geral Água e Esgoto', link: 'https://drive.google.com/file/d/1nSRpmtZVuVrIDkJIHhEQzg-j03eAJY-l', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2025-04-10' },
  { id: 'agrese-por-06-2026', titulo: 'AGRESE Portaria nº 06/2026 - Produto 3 Verificador Independente', link: 'https://drive.google.com/file/d/1iSp4Ls2iekjGqfAmiekqwxUaC9lbw0dX', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2026-02-05' },
  { id: 'agrese-por-10-2026', titulo: 'AGRESE Portaria nº 10/2026 - Fontes Alternativas e Penalidades', link: 'https://drive.google.com/file/d/1wisvmZKspHu8PJcVz7VRbIVu8HPobqnL', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2026-03-10' },
  { id: 'agrese-por-15-2026', titulo: 'AGRESE Portaria nº 15/2026 - Adequação Tarifa Social', link: 'https://drive.google.com/file/d/17Wv85gRkQ-z6_K1EGgVN2eDS5XsGaVO_', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2026-03-20' },
  { id: 'agrese-por-19-2026', titulo: 'AGRESE Portaria nº 19/2026 - Inclusão Beneficiários Tarifa Social', link: 'https://drive.google.com/file/d/1Lrwvpd1At16ZHyxQbIu-Ht2wFlTuC49j', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2026-03-25' },
  { id: 'agrese-por-21-2026', titulo: 'AGRESE Portaria nº 21/2026 - Plano de Governança DESO/Iguá', link: 'https://drive.google.com/file/d/1-hK8w0D9W3X4K8qT6Tz4L_b3U1wTzYhP', categoria: 'AGRESE', versao: 'V1.0', ultimaAtualizacao: '2026-04-01' },
  // CONTRATOS
  { id: 'contrato-concessao', titulo: 'Contrato de Concessão - Sergipe', link: 'https://drive.google.com/file/d/1nSa6HdqWXgVqCcOgUN0oahD6xuDTxHmI', categoria: 'CONTRATOS', versao: 'Original', ultimaAtualizacao: '2024-09-01' },
  { id: 'contrato-interdependencia', titulo: 'Contrato de Interdependência - Sergipe', link: 'https://drive.google.com/file/d/1HbJn-jXQxTKoT5-AMLxfkQImV4KhF-CE', categoria: 'CONTRATOS', versao: 'Original', ultimaAtualizacao: '2024-09-01' },
  { id: 'contrato-producao-agua', titulo: 'Contrato de Produção de Água - Sergipe', link: 'https://drive.google.com/file/d/18GvH11epZKkk8r9Mf0zgnNLFMkSGj6HF', categoria: 'CONTRATOS', versao: 'Original', ultimaAtualizacao: '2024-09-01' },
  // INTERNO
  { id: 'regimento-deso', titulo: 'Regimento Interno da DESO (2025)', link: 'https://drive.google.com/file/d/1qDLG4kpCHWdGsumsLm_pC7z9gUG6-uot', categoria: 'INTERNO', versao: 'Ed. 2025', ultimaAtualizacao: '2025-01-10' },
];

