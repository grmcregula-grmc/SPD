import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

const ADMIN_EMAIL = 'lucassilva@deso-se.com.br';
const ADMIN_PASSWORD = 'grmc@deS012';
const LS_COM = 'spd_comunicacao';
const LS_VOL = 'spd_volumes';
const LS_ADMIN = 'spd_admin';
const DATA_VERSION = 'spd_data_v6'; // bump to force reset

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

const indicadores = [
  { indic: 'Índice de Qualidade da Água (IQA)', meta: 'IQA ≥ 98%', formula: '100 * QD007 / QD006 (%)\nMedição Diária', vars: 'QD006: Somatório da quantidade de medições de cloro residual livre, turbidez, cor e pH nos Ponto Medição (PM) de cada um dos Pontos de Entrega (PE);\nQD007: Somatório da quantidade de medições de cloro residual livre, turbidez e pH nos Ponto Medição (PM) de cada um dos Pontos de Entrega (PE) com resultado dentro do padrão.', obs: 'O atendimento a esse indicador não isenta a DESO da obrigatoriedade de atender plenamente ao Padrão de Potabilidade Brasileiro.' },
  { indic: 'Índice de Suficiência da Produção de Água (ISP)', meta: 'ISP ≥ 98%', formula: '100 * VAO / VAP (%)\nMedição Mensal', vars: 'VAO: Volume mensal de água tratada ofertado em cada um dos Pontos de Entrega (PE);\nVAP: Volume mensal de água tratada planejado para cada um dos Pontos de Entrega (PE).', obs: 'Esse índice visa mensurar a suficiência volumétrica da água bruta tratada fornecida pela DESO.' },
  { indic: 'Índice Duração Média de Paralisações Não Programadas (DMP)', meta: 'DMP ≤ 6 horas/paralisação', formula: 'QD003 / QD002 (h/p)\nMedição Mensal', vars: 'QD002: Somatório do número de paralisações não programadas, parciais ou totais, dos Sistemas de Produção, com duração superior a 4 horas;\nQD003: Somatória da duração de paralisações não programadas, parciais ou totais, dos Sistemas de Produção, com duração superior a 6 (seis) horas.', obs: 'Esse índice visa a estimular a DESO a realizar operações de manutenção preditiva e preventiva na infraestrutura de seus Sistemas Produtores.' }
];

const comunicacaoFallback = [
  { 
    evento: 'Impedimento de cumprimento pontual das obrigações', 
    fund: 'Cláusula 17.2.32 do Contrato de Produção de Água - Prejuízo ou impedimento do cumprimento de obrigações', 
    destino: 'AGRESE, Poder Concedente e Concessionária', 
    prazo: 'Até 1 (um) dia útil após ocorrência', 
    cont: 'Relatório detalhado sobre todo e qualquer evento que possa vir a prejudicar ou impedir o pontual e tempestivo cumprimento das obrigações da DESO, indicando as medidas tomadas ou em curso' 
  },
  { 
    evento: 'Alteração relevante a regular prestação dos Serviços Upstream', 
    fund: 'Cláusula 17.2.33 do Contrato de Produção de Água - Alteração relevante da prestação dos Serviços Upstream', 
    destino: 'AGRESE, Poder Concedente e Concessionária', 
    prazo: 'Até 1 (um) dia útil após ocorrência', 
    cont: 'Relatório detalhado sobre esses fatos, indicando as medidas tomadas ou em curso para superar ou sanar os fatos referidos, incluindo, se for o caso, contribuição de entidades especializadas' 
  },
  { 
    evento: 'Descumprimento de Normas de Segurança, Medicina do Trabalho e Meio Ambiente', 
    fund: 'Cláusula 17.2.36 do Contrato de Produção de Água - Inconformidades em Segurança e Meio Ambiente', 
    destino: 'AGRESE, Poder Concedente e Concessionária', 
    prazo: 'Até 1 (um) dia útil após ocorrência ou constatação', 
    cont: 'Relatório circunstanciado sobre a infração cometida, os riscos gerados e o plano de ação imediato para correção' 
  },
  { 
    evento: 'Eventos de Força Maior ou Caso Fortuito', 
    fund: 'Cláusula 24.1 do Contrato de Produção de Água - Excludentes de responsabilidade', 
    destino: 'AGRESE, Poder Concedente e Concessionária', 
    prazo: 'Imediato (máx. 24h)', 
    cont: 'Notificação por escrito descrevendo o evento, sua duração provável, as obrigações afetadas e as medidas mitigadoras adotadas' 
  },
  { 
    evento: 'Alteração no Controle da Concessionária', 
    fund: 'Cláusula 17.2.34 do Contrato de Produção de Água - Alteração do controle ou de participação societária', 
    destino: 'AGRESE, Poder Concedente e Concessionária', 
    prazo: 'Até 5 (cinco) dias úteis após ocorrência', 
    cont: 'Detalhes da alteração, indicando os novos controladores ou sócios e o impacto na prestação dos serviços' 
  },
  { 
    evento: 'Processos Administrativos ou Judiciais Relevantes', 
    fund: 'Cláusula 17.2.35 do Contrato de Produção de Água - Processos que possam afetar a prestação dos serviços', 
    destino: 'AGRESE, Poder Concedente e Concessionária', 
    prazo: 'Até 1 (um) dia útil após a citação ou notificação', 
    cont: 'Cópia da citação ou notificação e breve resumo do objeto do processo' 
  },
  { 
    evento: 'Redução de Volumes Entregues', 
    fund: 'Cláusula 10.12.1 do Contrato de Interdependência - Redução igual ou superior a 10% dos volumes previstos, por período superior a 12 (doze) horas', 
    destino: 'AGRESE e Concessionária', 
    prazo: 'Imediato', 
    cont: 'Relatório detalhado das causas da redução e as ações mitigadoras adotadas' 
  },
  { 
    evento: 'Paradas Programadas', 
    fund: 'Cláusula 10.13 do Contrato de Interdependência - Paradas programadas que acarretem mais de 3 horas de interrupção da adução de água tratada até os Pontos De Entrega. Ofício nº 212/2026-AGRESE (NTR 15/2026)', 
    destino: 'Concessionária / AGRESE', 
    prazo: 'Antecedência mínima de 02 dias úteis para Concessionária. / Antecedência mínima de 24 horas para AGRESE', 
    cont: 'Relatório com descrição técnica detalhada, que serve como base para a negociação com a Concessionária, visando, sempre que possível, que as manutenções da DESO coincidam com as da Concessionária para reduzir o impacto sistêmico' 
  },
  { 
    evento: 'Paradas decorrentes de Obras de Aperfeiçoamento do Sistema Upstream', 
    fund: 'Cláusula 10.8 do Contrato de Produção de Água - Evitar ou minimizar eventuais paralisações do sistema', 
    destino: 'AGRESE, Poder Concedente e Concessionária', 
    prazo: 'Com antecedência', 
    cont: 'Relatório com Plano de Mitigação de Paralisação atrelado aos projetos executivos, elaborado em conjunto pelas Diretorias Técnica e de Produção (DTEC e DPRQ)' 
  },
];

const cpa = [
  { fato: 'Multas Gerais por Descumprimento Contratual', clausula: '22.1.2; 22.4.2; 22.5.1', pen: 'De 100 a 10.000 UFP/SE', aloc: 'DESO', obs: 'A aplicação varia conforme gradação regulamentar. O pagamento antecipado sem apresentação de defesa reduz a multa em 10%; se houver defesa, mas não recurso subsequente, a redução é de 5%.' },
  { fato: 'Atraso no Pagamento de Faturas ou Multas', clausula: '22.6.4; 22.6.3.2', pen: 'Correção pelo IPCA + Juros de Mora de 1% ao mês (pro rata die)', aloc: 'DESO', obs: 'Incidência automática caso a multa fixada não seja liquidada no prazo estipulado de 20 (vinte) dias após notificação da decisão final.' },
  { fato: 'Fraude, Má-Fé ou Proveito Econômico', clausula: '22.12.1; 22.12.2', pen: 'Acréscimo de 30% no valor da multa', aloc: 'DESO', obs: 'Consiste em agravante de sanção caso a AGRESE comprove dolo na infração ou se esta objetivou lucro ilícito para a Companhia ou terceiros.' },
  { fato: 'Não Adoção de Medidas Mitigadoras', clausula: '22.12.3', pen: 'Acréscimo de 20% no valor da multa', aloc: 'DESO', obs: 'Agravante aplicada se a Companhia descumprir determinações expressas da AGRESE para cessação dos danos nos prazos fixados.' },
  { fato: 'Reincidência no cometimento de infração nos últimos 05 anos', clausula: '22.12.4', pen: 'Acréscimo de 5% no valor da multa', aloc: 'DESO', obs: 'Agravante aplicada se a Companhia reincidir no cometimento da mesma infração nos últimos 05 anos.' },
  { fato: 'Atraso do Estado no Pagamento de Indenizações', clausula: '23.3.5', pen: 'Multa moratória de 2% do valor em atraso + Juros de 1% ao mês', aloc: 'Poder Concedente', obs: 'Pune a falha do Poder Concedente.' },
];

const ci = [
  { fato: 'Obstrução de Instalações e Dados', clausula: '15.1.1', mult: 'Até 1% do valor da fatura referente ao mês da infração', aloc: 'Ambas', obs: 'Pune o impedimento proposital de acesso da outra parte aos dados, sistemas e dependências para fiscalização.' },
  { fato: 'Ausência de Substituição de Medidores', clausula: '15.1.2', mult: 'Até 1% do valor da fatura referente ao dia da ocorrência', aloc: 'Concessionária', obs: 'Incide diretamente pela desídia metrológica quando a Concessionária privada não trocar os aparelhos obsoletos.' },
  { fato: 'Atraso no Pagamento da Fatura de Água', clausula: '15.1.3', mult: 'Até 1,5% do valor da fatura por dia de atraso', aloc: 'Concessionária', obs: 'Multa moratória extrema para proteger o fluxo de caixa produtivo, incidindo independentemente da atualização pelo índice IPCA.' },
  { fato: 'Não Instalação Inicial de Macromedidores', clausula: '15.1.4', mult: 'Até 1% do valor da primeira fatura de água', aloc: 'Concessionária', obs: 'Sanção para garantir o cumprimento do cronograma de transição estipulado durante a etapa de transição (Operação Assistida).' },
  { fato: 'Água Fora dos Padrões de Potabilidade', clausula: '15.1.5', mult: 'Até 1% do valor da fatura do mês de ocorrência', aloc: 'DESO', obs: 'Penalização base devida pela quebra dos padrões normativos, em cumulação com a possível responsabilidade civil a terceiros.' },
  { fato: 'Não Fornecimento de Volumes Mínimos', clausula: '15.1.6', mult: 'Até 1% do valor da fatura do mês de ocorrência', aloc: 'DESO', obs: 'Punição em prol do distribuidor privado ante a ineficiência do fornecimento de volumes programados de garantia.' },
  { fato: 'Não Pagamento dos Volumes Mínimos', clausula: '15.1.7', mult: 'Até 2% do valor da fatura em atraso', aloc: 'Concessionária', obs: 'Mecanismo disciplinar para forçar a contraparte privada a respeitar as cláusulas de Take-or-Pay nos primeiros três anos.' },
  { fato: 'Ociosidade por Falso Planejamento', clausula: '10.5.3.3', mult: 'Multa fixa de 5% sobre os valores pendentes + IPCA', aloc: 'Concessionária', obs: 'Indenização punitiva caso a Concessionária exija obras de ampliação da DESO e depois cancele ou diminua seu planejamento de distribuição.' },
];

const volumesRaw = `Arauá	Na saída do RAP-01	430.752	430.948	433.989
Boquim	Saídas da EAT-1 para RAP’s 01 e 02	1.518.638	1.525.370	1.543.377
Cristinápolis	Na saída do RAP-01	1.105.004	1.099.589	1.101.135
Estância (Cidade Nova)	Na saída do RAP 1, na ETA	923.690	911.501	908.901
Estância (Sist. Piauitinga)	Na saída do RAP-01 (1100 m³)	5.674.543	5.599.568	5.583.393
Indiaroba	Na saída da Unidade de Desinfecção	512.501	511.557	515.835
Itaporanga D'Ajuda	Na saída da ETA	1.703.446	1.696.233	1.701.910
Pedrinhas	Na saída do RAP-01 (200 m³)	272.845	303.834	337.356
Poço Verde	Na entrada do REL 1	1.202.474	1.197.422	1.202.926
Salgado	Na saída da Unidade de Desinfecção	846.133	838.471	837.371
Santa Luzia do Itanhy	Na saída do REL 1	150.222	160.873	171.945
Tobias Barreto	Na saída do REL-1	3.292.304	3.271.209	3.283.459
Carmópolis	Na saída dos RAPs 1 e 2	1.307.578	1.304.024	1.311.566
Divina Pastora	Na saída da EEAT-1, EEAT-2 e CR (cx de reunião)	220.678	221.540	223.616
General Maynard	Na saída do RAP-1	200.733	201.455	203.181
Laranjeiras (Sede)	Na saída do RAP-1 (1.000 m³)	1.151.122	1.193.254	1.247.856
Laranjeiras (Pov. Pedra Branca)	Saídas REL-1, REL-2, RAP-01, UD-1 (Poço 1) e UD-5 (Poço 5)	360.169	373.351	390.436
Malhador	Na saída da EAT-01 para o REL 2	517.918	516.724	519.629
Maruim	Na saída da CR	1.023.612	1.020.058	1.026.999
Moita Bonita	Na saída do RAP-1 e do Poço 15	431.705	429.690	430.884
Riachuelo	Na saída do RAP-01 (150 m³)	684.552	683.487	688.947
Ribeirópolis	Na saída do RAP-1 e Poços P12 e P14	1.143.279	1.144.219	1.155.446
Rosário do Catete	Saídas do RAP-1 e REL-1	798.430	800.953	809.221
Santa Rosa de Lima	Saída da CR	111.712	120.124	129.564
Santo Amaro das Brotas	Saída do REL-1	703.209	701.138	705.879
Brejo Grande	Na saída do REL da ETA	355.446	354.017	355.393
Ilha das Flores	Na saída do REL da ETA	442.784	439.184	440.760
Japaratuba	Na saída da caixa de reunião	860.519	858.029	863.357
Japoatã	Na saída do REL 1 (isolado)	459.033	455.709	455.291
Malhada dos Bois	Na saída do REL 1 da ETA	156.397	156.352	156.809
Muribeca	Na saída do REL 1 e da EEAT-1	316.855	315.246	315.434
Neópolis	Na saída do REL 1 na ETA	927.546	915.231	911.792
Nossa Senhora das Dores	Na saída do REL 1 na ETA	1.664.167	1.655.042	1.660.721
Pacatuba	Nas saídas do RAP 1	332.427	332.407	334.808
Pirambu	Na saída do RAP 1 e do P-04	448.878	446.175	448.025
Santana de São Francisco	Nas 2 saídas do REL (previsão para demolição)	471.220	470.327	472.848
São Francisco	Na saída do REL 1	239.673	238.342	239.754
Siriri	Na saída da EEAT-1 na ETA	412.995	413.125	415.937
Canindé de São Francisco	Na saída da ETA	1.696.459	1.779.943	1.875.918
Gararu	Na saída da ETA	393.372	386.854	384.125
Propriá	Na saída do RAP, junto à ETA	2.570.191	2.549.173	2.556.820
Cedro de S. João	Na saída do REL, junto à ETA	483.505	479.176	481.446
Telha	Na saída da EEAT para o DIP	220.791	219.780	220.433
Umbaúba	Saída da EEAT-1 (DN 250) junto à ETA Umbaúba	1.059.588	1.100.967	1.149.623
Itabaianinha	Saída da EEAT-1 (DN 400) junto à ETA Umbaúba	1.754.102	1.750.317	1.759.340
Tomar do Geru	-	493.636	493.299	495.889
Lagarto / Simão Dias / Riachão do Dantas	Saída da ETA-02 (Dionízio Machado)	3.355.143	3.322.141	3.321.480
Lagarto / Simão Dias / Riachão do Dantas	Na saída da EAT-15 (DN 500) junto à ETA-03	2.611.500	2.585.775	2.585.537
Lagarto / Simão Dias / Riachão do Dantas	Na saída da EAT-01 (DN 400) junto à ETA-01	2.611.151	2.585.775	2.585.192
Lagarto / Simão Dias / Riachão do Dantas	Na adutora de reunião dos poços Pé de Serra	746.092	738.448	738.135
Areia Branca	Saída do REL 1 e REL 2 na ETA	878.973	877.742	882.765
Itabaiana	Na saída da ETA ITABAIANA (NOVA)	5.909.309	5.938.539	6.022.885
Campo do Brito	Na saída da EAT - Adutora p/ Campo do Brito	832.509	835.026	844.937
Macambira	-	292.059	291.432	292.650
São Domingos	-	476.867	476.075	478.694
Itabaiana	Na saída da EAT - Adutora p/ Itabaiana	1.397.413	1.377.931	1.375.559
Itabaiana	Na saída da EAT - Adutora p/ Pov. Mangueiras	146.728	144.683	144.434
Amparo do São Francisco	Na saída da EAT-2, junto à ETA	263.412	258.706	256.886
Canhoba	-	199.830	197.044	195.329
N. Sra. de Lourdes	-	404.900	398.911	396.505
Itabi	-	355.641	348.616	344.578
Aquidabã	-	1.480.559	1.458.196	1.450.183
Graccho Cardoso	-	367.170	362.740	362.116
Cumbe	-	309.178	303.489	301.592
Feira Nova	-	445.076	438.871	436.740
Nossa Sra. da Glória	-	201.926	197.734	198.768
Carira	-	70.919	70.619	70.498
Nossa Sra. da Glória	Na saída da EE-1A, junto à ETA	2.383.986	2.374.519	2.383.156
Nossa Sra. Aparecida	-	403.503	399.600	398.224
São Miguel do Aleixo	-	144.981	143.305	143.058
Carira	-	863.950	847.083	844.593
Frei Paulo	-	723.860	715.491	712.540
Pedra Mole	-	110.046	109.545	109.701
Pinhão	-	310.924	307.279	306.061
Porto da Folha	Na saída da EAT-1, junto à ETA	1.266.755	1.249.783	1.244.537
Poço Redondo	-	1.139.590	1.132.660	1.134.836
Monte Alegre	-	1.007.884	994.867	992.122
Nossa Sra. da Glória	-	1.392.173	1.385.166	1.390.346
Nossa Sra. Aparecida	-	217.298	214.958	214.243
São Miguel do Aleixo	-	77.905	77.165	77.032
Carira	-	495.732	493.988	492.794
Frei Paulo	-	389.528	385.131	384.813
Pedra Mole	-	59.390	58.562	59.149
Pinhão	-	167.340	165.352	165.067
Setor R-7	Na saída do RAP-2	1.333.132	1.297.667	1.277.550
Setor R-1	Na saída do RAP-1	4.588.392	4.524.234	4.524.905
Setor R-2	-	7.201.483	7.169.922	7.204.382
Setor R-3	-	2.464.257	2.431.645	2.425.169
Barra dos Coqueiros	-	1.344.632	1.350.878	1.369.698
Setor R-0	Saída do R-0 (DN 500)	11.536.157	11.492.464	11.556.339
Setor R-5	Saída do R-0 (DN 900)	17.708.786	17.933.873	18.249.671
Setor R-6	-	20.422.265	20.471.412	20.674.354
Setor R-10	-	2.579.623	2.629.437	2.780.349
Setor R2	Saída da EE-R0/R2 (DN 800)	7.201.483	7.169.922	7.204.869
Barra dos Coqueiros	-	1.344.992	1.351.243	1.370.072
Setor R-8	Saída da EE-R0/R8 (DN 400)	5.330.906	5.440.741	5.601.276
Setores R5 e R10	Na saída da ETA-Cabrita	7.241.938	7.108.640	7.064.074
Setores R-9 e R-11	Na saída da EE Ibura 1	5.953.755	5.882.252	5.883.438
Setor R-9	Nas saídas da ETA para os RAP's (2 x 10.000m³)	6.671.386	6.896.357	7.173.120
Povoados integrados	-	10.594.814	10.266.621	10.027.095
Povoados isolados	-	3.718.489	3.927.626	4.113.446
TOTAL GERAL	-	193.794.519	193.673.170	195.296.887`;

const volumesFallback = volumesRaw.split('\n').filter(Boolean).map(row => {
  const parts = row.split('\t');
  return {
    localidade: parts[0] || '',
    ponto: parts[1] || '',
    ano1: parts[2] || '',
    ano2: parts[3] || '',
    ano3: parts[4] || ''
  };
});

export default function TabelasReferencia() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('indicadores');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [comunicacao, setComunicacao] = useState<any[]>(comunicacaoFallback);
  const [volumes, setVolumes] = useState<any[]>(volumesFallback);
  
  const anosArray = Array.from({ length: 35 }, (_, i) => i + 1);

  // Estados de edição para volumes
  const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null);
  const [volumeFormData, setVolumeFormData] = useState<any>({});
  
  // Estados de edição para comunicação
  const [editingComId, setEditingComId] = useState<string | null>(null);
  const [comFormData, setComFormData] = useState<any>({});

  // Estados de edição para normas
  const [editingNormaId, setEditingNormaId] = useState<string | null>(null);
  const [normaFormData, setNormaFormData] = useState<any>({});
  const { updateSettings } = useSettings();

  useEffect(() => {
    setIsAdmin(lsGet<boolean>(LS_ADMIN, false));
    // Version check: reset localStorage if data is outdated
    const versionOk = lsGet<boolean>(DATA_VERSION, false);
    if (!versionOk) {
      lsSet(LS_COM, comunicacaoFallback);
      lsSet(LS_VOL, volumesFallback);
      lsSet(DATA_VERSION, true);
      setComunicacao(comunicacaoFallback);
      setVolumes(volumesFallback);
    } else {
      setComunicacao(lsGet(LS_COM, comunicacaoFallback));
      setVolumes(lsGet(LS_VOL, volumesFallback));
    }
  }, []);

  const fetchDatabaseData = () => {
    setComunicacao(lsGet(LS_COM, comunicacaoFallback));
    setVolumes(lsGet(LS_VOL, volumesFallback));
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      lsSet(LS_ADMIN, false);
      setIsAdmin(false);
    } else {
      const email = prompt('E-mail do Administrador:');
      if (email === ADMIN_EMAIL) {
        const password = prompt('Senha do Administrador:');
        if (password === ADMIN_PASSWORD) {
          lsSet(LS_ADMIN, true);
          setIsAdmin(true);
          alert('Bem-vindo, Administrador!');
        } else if (password !== null) {
          alert('Senha incorreta.');
        }
      } else if (email) {
        alert('Acesso restrito. Apenas ' + ADMIN_EMAIL + ' tem permissão.');
      }
    }
  };

  const handleRestoreDefaults = (tab: string) => {
    if (!isAdmin) return;
    if (!confirm('Deseja realmente restaurar os padrões iniciais? Todos os dados inseridos serão perdidos.')) return;
    if (tab === 'comunicacao') {
      lsSet(LS_COM, comunicacaoFallback);
      setComunicacao(comunicacaoFallback);
    } else if (tab === 'volumes') {
      lsSet(LS_VOL, volumesFallback);
      setVolumes(volumesFallback);
    }
    alert('Padrões restaurados com sucesso!');
  };

  // Funções CRUD Volumes
  const handleEditVolume = (vol: any) => {
    setEditingVolumeId(vol.id || vol.localidade + vol.ponto);
    setVolumeFormData({ ...vol });
  };
  
  const handleSaveVolume = () => {
    if (!isAdmin) return;
    let updated: typeof volumes;
    if (volumeFormData.id) {
      updated = volumes.map(v => v.id === volumeFormData.id ? volumeFormData : v);
    } else {
      updated = [...volumes, { ...volumeFormData, id: Date.now().toString() }];
    }
    lsSet(LS_VOL, updated);
    setVolumes(updated);
    setEditingVolumeId(null);
    setVolumeFormData({});
  };
  
  const handleDeleteVolume = (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Excluir este ponto de entrega?')) return;
    const updated = volumes.filter(v => v.id !== id);
    lsSet(LS_VOL, updated);
    setVolumes(updated);
  };

  // Funções CRUD Comunicação
  const handleEditCom = (com: any) => {
    setEditingComId(com.id || com.evento);
    setComFormData({ ...com });
  };
  
  const handleSaveCom = () => {
    if (!isAdmin) return;
    let updated: typeof comunicacao;
    if (comFormData.id) {
      updated = comunicacao.map(c => c.id === comFormData.id ? comFormData : c);
    } else {
      updated = [...comunicacao, { ...comFormData, id: Date.now().toString() }];
    }
    lsSet(LS_COM, updated);
    setComunicacao(updated);
    setEditingComId(null);
    setComFormData({});
  };

  const handleDeleteCom = (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Excluir este evento de comunicação?')) return;
    const updated = comunicacao.filter(c => c.id !== id);
    lsSet(LS_COM, updated);
    setComunicacao(updated);
  };

  // Funções CRUD Normas
  const handleEditNorma = (norma: any) => {
    setEditingNormaId(norma.id || 'new');
    setNormaFormData({ 
      id: norma.id || Date.now().toString(),
      titulo: norma.titulo || '',
      categoria: norma.categoria || 'INTERNO',
      link: norma.link || '',
      versao: norma.versao || '1.0',
      ultimaAtualizacao: norma.ultimaAtualizacao || new Date().toISOString()
    });
  };

  const handleSaveNorma = () => {
    if (!isAdmin) return;
    const currentNormas = settings.normas || [];
    let updated: any[];
    if (editingNormaId === 'new') {
      updated = [...currentNormas, normaFormData];
    } else {
      updated = currentNormas.map(n => n.id === editingNormaId ? normaFormData : n);
    }
    updateSettings({ normas: updated });
    setEditingNormaId(null);
    setNormaFormData({});
  };

  const handleDeleteNorma = (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Deseja excluir esta norma de referência?')) return;
    const updated = (settings.normas || []).filter(n => n.id !== id);
    updateSettings({ normas: updated });
  };

  const Th = ({ children }: { children: React.ReactNode }) => (
    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)', fontWeight: 600, color: 'var(--text-secondary)' }}>
      {children}
    </th>
  );

  const Td = ({ children }: { children: React.ReactNode }) => (
    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)', verticalAlign: 'middle', whiteSpace: 'pre-line' }}>
      {children}
    </td>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        {[
          { id: 'indicadores', label: 'Indicadores de Desempenho' },
          { id: 'comunicacao', label: 'Comunicação' },
          { id: 'cpa', label: 'Penalidades CPA' },
          { id: 'ci', label: 'Penalidades CI' },
          { id: 'normas', label: 'Documentos Normativos' },
          { id: 'volumes', label: 'Volumes Planejados' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              cursor: 'pointer',
              background: activeTab === t.id ? 'var(--brand-blue)' : 'var(--bg-secondary)',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            {t.label}
          </button>
        ))}
        
        <div style={{ flex: 1 }} />
        <button 
          onClick={handleAdminToggle}
          title={isAdmin ? "Sair do Modo Admin" : "Acesso Admin (Restrito)"}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px 8px'
          }}
        >
          {isAdmin ? '🔓' : '🔒'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: 24, overflowX: 'auto' }}>
        {loadingData && (activeTab === 'comunicacao' || activeTab === 'volumes') && (
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', color: 'var(--brand-blue)' }}>
            Sincronizando com o banco de dados...
          </div>
        )}

        {/* Tab Indicadores */}
        {activeTab === 'indicadores' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Indicadores de Desempenho (IQA, ISP, DMP)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <Th>Indicador</Th>
                  <Th>Meta</Th>
                  <Th>Fórmula e Frequência</Th>
                  <Th>Definição das Variáveis</Th>
                  <Th>Observação</Th>
                </tr>
              </thead>
              <tbody>
                {indicadores.map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                    <Td><strong>{row.indic}</strong></Td>
                    <Td>{row.meta}</Td>
                    <Td>{row.formula}</Td>
                    <Td>{row.vars}</Td>
                    <Td>{row.obs}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Penalidades CPA */}
        {activeTab === 'cpa' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Matriz de Penalidades do Contrato de Produção (CPA)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <Th>Fato Gerador / Infração</Th>
                  <Th>Cláusula</Th>
                  <Th>Penalidade / Valor Pecuniário</Th>
                  <Th>Alocação</Th>
                  <Th>Observações e Encargos</Th>
                </tr>
              </thead>
              <tbody>
                {cpa.map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                    <Td><strong>{row.fato}</strong></Td>
                    <Td>{row.clausula}</Td>
                    <Td>{row.pen}</Td>
                    <Td>{row.aloc}</Td>
                    <Td>{row.obs}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Penalidades CI */}
        {activeTab === 'ci' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Matriz de Penalidades do Contrato de Interdependência (CI)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <Th>Fato Gerador / Infração</Th>
                  <Th>Cláusula</Th>
                  <Th>Multa / Sanção Pecuniária</Th>
                  <Th>Alocação (Infrator)</Th>
                  <Th>Observações e Mecanismos</Th>
                </tr>
              </thead>
              <tbody>
                {ci.map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                    <Td><strong>{row.fato}</strong></Td>
                    <Td>{row.clausula}</Td>
                    <Td>{row.mult}</Td>
                    <Td>{row.aloc}</Td>
                    <Td>{row.obs}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Comunicação */}
        {activeTab === 'comunicacao' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Comunicação de Paradas, Interrupções e Redução de Volumes</h3>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEditCom({})} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 6, background: 'var(--brand-blue)', color: 'white', border: 'none', cursor: 'pointer' }}>+ Adicionar Evento</button>
                  <button onClick={() => handleRestoreDefaults('comunicacao')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 6, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>Restaurar Padrões</button>
                </div>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <Th>Comunicação / Evento</Th>
                  <Th>Fundamentação Regulatória</Th>
                  <Th>Destino</Th>
                  <Th>Prazo de Comunicação</Th>
                  <Th>Conteúdo Exigido</Th>
                  {isAdmin && <Th>Ações</Th>}
                </tr>
              </thead>
              <tbody>
                {comunicacao.map((row, i) => {
                  const isEditing = editingComId === (row.id || row.evento);
                  return (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                      {isEditing ? (
                        <>
                          <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} value={comFormData.evento || ''} onChange={e => setComFormData({...comFormData, evento: e.target.value})} /></Td>
                          <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} value={comFormData.fund || ''} onChange={e => setComFormData({...comFormData, fund: e.target.value})} /></Td>
                          <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} value={comFormData.destino || ''} onChange={e => setComFormData({...comFormData, destino: e.target.value})} /></Td>
                          <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} value={comFormData.prazo || ''} onChange={e => setComFormData({...comFormData, prazo: e.target.value})} /></Td>
                          <Td><textarea className="spd-input" style={{ width: '100%', minHeight: 60, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} value={comFormData.cont || ''} onChange={e => setComFormData({...comFormData, cont: e.target.value})} /></Td>
                          <Td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={handleSaveCom} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
                              <button onClick={() => setEditingComId(null)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                            </div>
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td><strong>{row.evento}</strong></Td>
                          <Td>{row.fund}</Td>
                          <Td>{row.destino}</Td>
                          <Td>{row.prazo}</Td>
                          <Td>{row.cont}</Td>
                          {isAdmin && (
                            <Td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleEditCom(row)} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }} title="Editar">✏️</button>
                                {row.id && <button onClick={() => handleDeleteCom(row.id)} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }} title="Excluir">🗑️</button>}
                              </div>
                            </Td>
                          )}
                        </>
                      )}
                    </tr>
                  );
                })}
                {isAdmin && editingComId === null && comFormData && Object.keys(comFormData).length > 0 && !comFormData.id && !comunicacao.find(c => c.evento === comFormData.evento) && (
                   <tr style={{ backgroundColor: 'rgba(59,130,246,0.05)' }}>
                     <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Novo Evento" value={comFormData.evento || ''} onChange={e => setComFormData({...comFormData, evento: e.target.value})} /></Td>
                     <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Fundamentação" value={comFormData.fund || ''} onChange={e => setComFormData({...comFormData, fund: e.target.value})} /></Td>
                     <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Destino" value={comFormData.destino || ''} onChange={e => setComFormData({...comFormData, destino: e.target.value})} /></Td>
                     <Td><input className="spd-input" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Prazo" value={comFormData.prazo || ''} onChange={e => setComFormData({...comFormData, prazo: e.target.value})} /></Td>
                     <Td><textarea className="spd-input" style={{ width: '100%', minHeight: 60, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Conteúdo" value={comFormData.cont || ''} onChange={e => setComFormData({...comFormData, cont: e.target.value})} /></Td>
                     <Td>
                       <div style={{ display: 'flex', gap: 4 }}>
                         <button onClick={handleSaveCom} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
                         <button onClick={() => setComFormData({})} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                       </div>
                     </Td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Volumes Planejados */}
        {activeTab === 'volumes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Volumes Planejados e Demandas Mínimas Disponibilizadas (Ano 1 a Ano 35)</h3>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEditVolume({})} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 6, background: 'var(--brand-blue)', color: 'white', border: 'none', cursor: 'pointer' }}>+ Adicionar Ponto</button>
                  <button onClick={() => handleRestoreDefaults('volumes')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 6, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>Restaurar Padrões</button>
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Para suportar o Take-or-Pay, a engenharia financeira do contrato garantiu as exigências contratuais fixadas abaixo. A DPRQ deve monitorar rigorosamente a entrega volumétrica nesses pontos.
            </p>
            
            <div style={{ maxWidth: '100%', overflowX: 'auto', border: '1px solid var(--border-primary)', borderRadius: 8 }}>
              <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <Th>Localidade / Setor</Th>
                    <Th>Ponto de Entrega (Interface)</Th>
                    {anosArray.map(a => <Th key={a}>Ano {a}</Th>)}
                    {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)', fontWeight: 600, color: 'var(--text-secondary)', position: 'sticky', right: 0, zIndex: 10 }}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {volumes.map((row, i) => {
                    const isEditing = editingVolumeId === (row.id || row.localidade + row.ponto);
                    return (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                        {isEditing ? (
                          <>
                            <Td><input className="spd-input" style={{ width: 150, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} value={volumeFormData.localidade || ''} onChange={e => setVolumeFormData({...volumeFormData, localidade: e.target.value})} /></Td>
                            <Td><input className="spd-input" style={{ width: 200, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} value={volumeFormData.ponto || ''} onChange={e => setVolumeFormData({...volumeFormData, ponto: e.target.value})} /></Td>
                            {anosArray.map(a => (
                              <Td key={a}>
                                <input className="spd-input" style={{ width: 80, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} value={volumeFormData[`ano${a}`] || ''} onChange={e => setVolumeFormData({...volumeFormData, [`ano${a}`]: e.target.value})} />
                              </Td>
                            ))}
                            <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', position: 'sticky', right: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={handleSaveVolume} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
                                <button onClick={() => setEditingVolumeId(null)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <Td><strong>{row.localidade}</strong></Td>
                            <Td>{row.ponto}</Td>
                            {anosArray.map(a => <Td key={a}>{row[`ano${a}`] || '-'}</Td>)}
                            {isAdmin && (
                              <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', position: 'sticky', right: 0, background: i % 2 === 0 ? 'white' : '#fcfcfc', zIndex: 10, boxShadow: '-5px 0 10px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => handleEditVolume(row)} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }} title="Editar">✏️</button>
                                  {row.id && <button onClick={() => handleDeleteVolume(row.id)} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }} title="Excluir">🗑️</button>}
                                </div>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {/* Linha de Adição */}
                  {isAdmin && editingVolumeId === null && volumeFormData && Object.keys(volumeFormData).length > 0 && !volumeFormData.id && !volumes.find(v => v.ponto === volumeFormData.ponto) && (
                    <tr style={{ backgroundColor: 'rgba(59,130,246,0.05)' }}>
                      <Td><input className="spd-input" style={{ width: 150, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nova Localidade" value={volumeFormData.localidade || ''} onChange={e => setVolumeFormData({...volumeFormData, localidade: e.target.value})} /></Td>
                      <Td><input className="spd-input" style={{ width: 200, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Novo Ponto" value={volumeFormData.ponto || ''} onChange={e => setVolumeFormData({...volumeFormData, ponto: e.target.value})} /></Td>
                      {anosArray.map(a => (
                        <Td key={a}>
                          <input className="spd-input" style={{ width: 80, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder={`Ano ${a}`} value={volumeFormData[`ano${a}`] || ''} onChange={e => setVolumeFormData({...volumeFormData, [`ano${a}`]: e.target.value})} />
                        </Td>
                      ))}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', position: 'sticky', right: 0, background: 'var(--bg-secondary)', zIndex: 10, boxShadow: '-5px 0 10px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={handleSaveVolume} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
                          <button onClick={() => setVolumeFormData({})} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Tab Documentos Normativos */}
        {activeTab === 'normas' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Biblioteca de Referências Normativas</h3>
              {isAdmin && (
                <button 
                  onClick={() => handleEditNorma({})} 
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 8, background: 'var(--brand-blue)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>+</span> Adicionar Referência
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Compilado de normas técnicas (ISO), resoluções regulatórias (ANA/AGRESE) e instrumentos contratuais que regem a operação e o compliance.
            </p>

            {/* Modal de Edição de Norma */}
            {editingNormaId && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: 24, background: 'white' }}>
                  <h4 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                    {editingNormaId === 'new' ? 'Adicionar Referência' : 'Editar Referência'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="spd-label" style={{ display: 'block', marginBottom: 4 }}>Título da Norma/Documento</label>
                      <input className="spd-input" style={{ width: '100%' }} value={normaFormData.titulo} onChange={e => setNormaFormData({...normaFormData, titulo: e.target.value})} placeholder="Ex: ISO 9001:2015" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label className="spd-label" style={{ display: 'block', marginBottom: 4 }}>Categoria</label>
                        <select className="spd-input" style={{ width: '100%' }} value={normaFormData.categoria} onChange={e => setNormaFormData({...normaFormData, categoria: e.target.value})}>
                          <option value="ANA">ANA</option>
                          <option value="AGRESE">AGRESE</option>
                          <option value="ABNT">ABNT</option>
                          <option value="CONTRATOS">CONTRATOS</option>
                          <option value="INTERNO">INTERNO</option>
                        </select>
                      </div>
                      <div>
                        <label className="spd-label" style={{ display: 'block', marginBottom: 4 }}>Versão</label>
                        <input className="spd-input" style={{ width: '100%' }} value={normaFormData.versao} onChange={e => setNormaFormData({...normaFormData, versao: e.target.value})} placeholder="Ex: 2.0" />
                      </div>
                    </div>
                    <div>
                      <label className="spd-label" style={{ display: 'block', marginBottom: 4 }}>Link do Documento (URL)</label>
                      <input className="spd-input" style={{ width: '100%' }} value={normaFormData.link} onChange={e => setNormaFormData({...normaFormData, link: e.target.value})} placeholder="https://..." />
                    </div>
                  </div>
                  <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="spd-button" onClick={() => setEditingNormaId(null)}>Cancelar</button>
                    <button className="spd-button" style={{ background: 'var(--brand-blue)', color: 'white' }} onClick={handleSaveNorma}>Salvar</button>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {['ANA', 'AGRESE', 'ABNT', 'CONTRATOS', 'INTERNO'].map(cat => {
                const filtered = (settings.normas || []).filter(n => n.categoria === cat);
                if (filtered.length === 0) return null;
                
                return (
                  <div key={cat} className="glass-card" style={{ padding: 16, background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(59,130,246,0.1)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: 12, borderBottom: '1px solid rgba(59,130,246,0.1)', paddingBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                      {cat}
                      <span style={{ fontSize: '0.7rem', background: 'var(--brand-blue)', color: 'white', padding: '2px 6px', borderRadius: 10 }}>{filtered.length}</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {filtered.map(norma => (
                        <div key={norma.id} style={{ position: 'relative' }}>
                          <a 
                            href={norma.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="norma-link"
                            style={{ 
                              fontSize: '0.8rem', 
                              color: 'var(--text-primary)', 
                              textDecoration: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 4,
                              padding: '10px 12px',
                              borderRadius: 8,
                              background: 'white',
                              border: '1px solid var(--border-primary)',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1rem' }}>📄</span>
                              <span style={{ flex: 1, fontWeight: 600 }}>{norma.titulo}</span>
                              <span style={{ opacity: 0.3, fontSize: '0.7rem' }}>↗</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              <span>Versão: <strong style={{ color: 'var(--brand-blue)' }}>{norma.versao || 'N/A'}</strong></span>
                              <span>Atualizado em: <strong>{norma.ultimaAtualizacao ? new Date(norma.ultimaAtualizacao).toLocaleDateString('pt-BR') : 'Desconhecido'}</strong></span>
                            </div>
                          </a>
                          {isAdmin && (
                            <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
                              <button 
                                onClick={(e) => { e.preventDefault(); handleEditNorma(norma); }} 
                                style={{ background: 'white', border: '1px solid #eee', borderRadius: 4, cursor: 'pointer', padding: '2px 4px', fontSize: '0.7rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={(e) => { e.preventDefault(); handleDeleteNorma(norma.id); }} 
                                style={{ background: 'white', border: '1px solid #eee', borderRadius: 4, cursor: 'pointer', padding: '2px 4px', fontSize: '0.7rem', color: '#ef4444', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                title="Excluir"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
