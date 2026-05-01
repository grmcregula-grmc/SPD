'use client';

import React, { useState, useCallback } from 'react';
import {
  calcularMultaAGRESE,
  AGRAVANTES_DISPONIVEIS,
  ATENUANTES_DISPONIVEIS,
  INFRACOES_COMUNS_AGRESE,
  PARAMETROS_DEFAULT,
  formatBRL,
  type ResultadoMultaAGRESE,
} from '@/lib/calculators';
import { useSettings } from '@/context/SettingsContext';
import { StatCard, BreakdownRow, RiskAlert, SectionHeader, ParamInput, ClausulaTag } from '@/components/ui';
import { generatePDFReport, captureElement } from '@/lib/reports';
import { useEstimates } from '@/context/EstimateContext';
import { HistoryPanel } from '@/components/HistoryPanel';

export default function SimuladorAGRESE() {
  const { settings } = useSettings();
  const [ufpQuantidade, setUfpQuantidade] = useState(2000);
  const [valorUfp, setValorUfp] = useState(settings.ufp_valor);
  const [agravantesIds, setAgravantesIds] = useState<string[]>([]);
  const [atenantesIds, setAtenuantesIds] = useState<string[]>([]);
  const [mesesMora, setMesesMora] = useState(0);
  const [ipcaAnual, setIpcaAnual] = useState(settings.ipca_anual);
  const [dataOcorrencia, setDataOcorrencia] = useState(new Date().toISOString().split('T')[0]);
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState('');
  const [tipoOcorrenciaId, setTipoOcorrenciaId] = useState('');
  const [resultado, setResultado] = useState<ResultadoMultaAGRESE | null>(null);
  const { addToHistory } = useEstimates();
  const resultRef = React.useRef<HTMLDivElement>(null);

  // Sincronizar com configurações globais
  React.useEffect(() => {
    setValorUfp(settings.ufp_valor);
    setIpcaAnual(settings.ipca_anual);
  }, [settings.ufp_valor, settings.ipca_anual]);

  const calcular = useCallback(() => {
    const res = calcularMultaAGRESE({
      ufp_quantidade: ufpQuantidade,
      valor_ufp: valorUfp,
      agravantes_ids: agravantesIds,
      atenuantes_ids: atenantesIds,
      meses_mora: mesesMora,
      ipca_anual: ipcaAnual,
    });
    setResultado(res);
  }, [ufpQuantidade, valorUfp, agravantesIds, atenantesIds, mesesMora, ipcaAnual]);

  const toggleAgravante = (id: string) => {
    setAgravantesIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleAtenuante = (id: string) => {
    setAtenuantesIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const limpar = () => {
    setUfpQuantidade(2000);
    setValorUfp(settings.ufp_valor);
    setAgravantesIds([]);
    setAtenuantesIds([]);
    setMesesMora(0);
    setIpcaAnual(settings.ipca_anual);
    setResultado(null);
  };

  const presets = [
    { label: 'Sim. I — Máx. Agravantes', ufp: 8500, ag: ['dolo_fraude', 'enriquecimento', 'desobediencia'], at: [], mora: 12 },
    { label: 'Sim. II — Mitigação Otimizada', ufp: 2000, ag: [], at: ['nexo_terceiro', 'primariedade', 'pagamento_antecipado'], mora: 0 },
    { label: 'Infração Leve (Piso)', ufp: 100, ag: [], at: ['primariedade'], mora: 0 },
    { label: 'Infração Grave (Teto)', ufp: 10000, ag: ['dolo_fraude', 'enriquecimento', 'desobediencia', 'reincidencia'], at: [], mora: 6 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* ===== PAINEL ESQUERDO — INPUTS ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Seletor de Infração Baseado em Regras */}
        <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(59,130,246,0.25)' }}>
          <SectionHeader
            title="Seleção por Conduta / Regra"
            subtitle="Estime com base na infração contratual descumprida"
            icon="⚖️"
            badge="Smart Estimate"
            badgeColor="#3b82f6"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="spd-label">Tipo de Ocorrência</label>
            <select 
              className="spd-input" 
              style={{ width: '100%', cursor: 'pointer' }}
              value={tipoOcorrenciaId}
              onChange={(e) => {
                const inf = INFRACOES_COMUNS_AGRESE.find(i => i.id === e.target.value);
                setTipoOcorrenciaId(e.target.value);
                if (inf) {
                  setUfpQuantidade(inf.ufp_sugerida);
                  setDescricaoOcorrencia(inf.nome);
                } else if (e.target.value === 'outros') {
                  setUfpQuantidade(100);
                  setDescricaoOcorrencia('Outra ocorrência não listada');
                }
              }}
            >
              <option value="">Selecione uma regra descumprida...</option>
              {INFRACOES_COMUNS_AGRESE.map(inf => (
                <option key={inf.id} value={inf.id}>
                  {inf.nome} ({inf.clausula})
                </option>
              ))}
              <option value="outros">Outros (Personalizado)</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="spd-label">Data da Ocorrência</label>
                <input 
                  type="date" 
                  className="spd-input" 
                  value={dataOcorrencia}
                  onChange={(e) => setDataOcorrencia(e.target.value)}
                />
              </div>
              <div>
                <label className="spd-label">Descrição da Ocorrência</label>
                <input 
                  className="spd-input" 
                  placeholder="Ex: Rompimento de adutora..."
                  value={descricaoOcorrencia}
                  onChange={(e) => setDescricaoOcorrencia(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(59,130,246,0.05)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.1)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Ao selecionar uma regra, o sistema preencherá automaticamente a <b>Quantidade de UFP/SE</b> sugerida conforme a gravidade da conduta prevista nos contratos e resoluções.
              </div>
            </div>
          </div>
        </div>

        {/* Presets rápidos */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Simulações Predefinidas"
            subtitle="Carregue cenários prontos para teste rápido"
            icon="⚡"
            badge="Quick Load"
            badgeColor="#8b5cf6"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {presets.map((p) => (
              <button
                key={p.label}
                className="btn-ghost"
                style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.78rem' }}
                onClick={() => {
                  setUfpQuantidade(p.ufp);
                  setAgravantesIds(p.ag);
                  setAtenuantesIds(p.at);
                  setMesesMora(p.mora);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Parâmetros base */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Parâmetros da Autuação"
            subtitle="Cláusula 22.1.2 do CPA — AGRESE"
            icon="📋"
            badge="CPA Cl. 22"
            badgeColor="#3b82f6"
          />
          <ParamInput
            label="Quantidade de UFP/SE"
            value={ufpQuantidade}
            onChange={setUfpQuantidade}
            min={100}
            max={10000}
            step={100}
            tooltip="Piso: 100 UFP/SE | Teto: 10.000 UFP/SE (Cl. 22.1.2 CPA)"
          />
          <ParamInput
            label="Valor da UFP/SE (R$)"
            value={valorUfp}
            onChange={setValorUfp}
            min={1}
            step={0.01}
            unit=" R$"
            tooltip="Valor dinâmico conforme configurações globais."
          />
          <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(59,130,246,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Valor Base Calculado</span>
              <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60a5fa' }}>
                {formatBRL(ufpQuantidade * valorUfp)}
              </span>
            </div>
          </div>
        </div>

        {/* Agravantes */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Fatores Agravantes"
            subtitle="Cláusulas 22.12 do CPA — Incidem cumulativamente sobre o valor majorado"
            icon="⬆️"
            badge={agravantesIds.length > 0 ? `+${agravantesIds.reduce((s, id) => s + (AGRAVANTES_DISPONIVEIS.find(a => a.id === id)?.percentual ?? 0), 0)}%` : 'Nenhum'}
            badgeColor={agravantesIds.length > 0 ? '#ef4444' : '#6b7280'}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {AGRAVANTES_DISPONIVEIS.map((ag) => (
              <label
                key={ag.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: agravantesIds.includes(ag.id) ? 'rgba(239,68,68,0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${agravantesIds.includes(ag.id) ? '#dc2626' : 'var(--border-primary)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="checkbox"
                  className="spd-checkbox"
                  checked={agravantesIds.includes(ag.id)}
                  onChange={() => toggleAgravante(ag.id)}
                  style={{ marginTop: 2 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: 600, color: agravantesIds.includes(ag.id) ? '#dc2626' : 'var(--text-primary)' }}>
                      {ag.nome}
                    </span>
                    <span className="badge-agravante">+{ag.percentual}%</span>
                  </div>
                  <ClausulaTag text={ag.clausula} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Atenuantes */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Fatores Atenuantes"
            subtitle="Cláusulas 22.11 do CPA — Redução sobre o valor já majorado"
            icon="⬇️"
            badge={atenantesIds.length > 0 ? `-${atenantesIds.reduce((s, id) => s + (ATENUANTES_DISPONIVEIS.find(a => a.id === id)?.percentual ?? 0), 0)}%` : 'Nenhum'}
            badgeColor={atenantesIds.length > 0 ? '#10b981' : '#6b7280'}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ATENUANTES_DISPONIVEIS.map((at) => (
              <label
                key={at.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: atenantesIds.includes(at.id) ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${atenantesIds.includes(at.id) ? '#10b981' : 'var(--border-primary)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="checkbox"
                  className="spd-checkbox"
                  checked={atenantesIds.includes(at.id)}
                  onChange={() => toggleAtenuante(at.id)}
                  style={{ marginTop: 2 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: 600, color: atenantesIds.includes(at.id) ? '#10b981' : 'var(--text-primary)' }}>
                      {at.nome}
                    </span>
                    <span className="badge-atenuante">-{at.percentual}%</span>
                  </div>
                  <ClausulaTag text={at.clausula} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Mora */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Simulação de Mora"
            subtitle="Após 20 dias do trânsito em julgado sem pagamento — IPCA + 1% a.m. pro rata die"
            icon="⏱️"
            badge="Opcional"
            badgeColor="#f59e0b"
          />
          <ParamInput
            label="Meses em Litígio / Mora"
            value={mesesMora}
            onChange={setMesesMora}
            min={0}
            max={60}
            step={1}
            tooltip="0 = sem mora. Cada mês adiciona IPCA/12 + 1% sobre o saldo devedor"
          />
          <ParamInput
            label="IPCA Anual Projetado (%)"
            value={ipcaAnual}
            onChange={setIpcaAnual}
            min={0}
            max={50}
            step={0.1}
            unit="%"
          />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" style={{ flex: 2 }} onClick={calcular}>
            🧮 CALCULAR PENALIDADE
          </button>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={limpar}>
            Limpar
          </button>
        </div>
      </div>

      {/* ===== PAINEL DIREITO — RESULTADO ===== */}
      <div ref={resultRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {resultado ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* KPIs principais */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn-primary" 
                onClick={async () => {
                  if (!resultado) return;

                  const imageData = await captureElement(resultRef.current);

                  const detalhes = [
                    { label: `Multa Base (${resultado.ufp_quantidade} UFP/SE)`, clause: 'CPA Cl. 22.1.2', value: resultado.valor_base },
                    ...resultado.agravantes.map(a => ({ label: `Agravante: ${a.nome}`, clause: a.clausula, value: resultado.valor_base * (a.percentual / 100) })),
                  ];

                  if (resultado.atenuantes.length > 0) {
                    detalhes.push(...resultado.atenuantes.map(a => ({ 
                      label: `Atenuante: ${a.nome}`, 
                      clause: a.clausula, 
                      value: -(resultado.valor_majorado * (a.percentual / 100)) 
                    })));
                  }

                  if (resultado.meses_mora > 0) {
                    detalhes.push({ 
                      label: `Mora (${resultado.meses_mora} meses — IPCA + 1% am)`, 
                      clause: 'Cl. 22 CPA / Mora', 
                      value: resultado.valor_com_mora - resultado.valor_final 
                    });
                  }

                  generatePDFReport({
                    titulo: 'Relatório de Estimativa de Penalidade',
                    subtitulo: `CPA — Regime Sancionatório AGRESE. Valor da UFP/SE: R$ ${resultado.valor_ufp.toFixed(2)}`,
                    total: resultado.valor_com_mora,
                    dataOcorrencia: dataOcorrencia,
                    descricaoOcorrencia: descricaoOcorrencia,
                    detalhes: detalhes,
                    identificador: `EST-AGRE-${Date.now().toString().slice(-6)}`,
                    image: imageData
                  });
                }}
                style={{ flex: 1, padding: '12px', fontSize: '0.8rem', fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                📄 EXPORTAR PDF
              </button>
              <button 
                onClick={async () => {
                  if (!resultado) return;

                  const imageData = await captureElement(resultRef.current);

                  const item = INFRACOES_COMUNS_AGRESE.find(i => i.ufp_sugerida === ufpQuantidade);
                  const detalhes = [
                    { label: `Multa Base (${resultado.ufp_quantidade} UFP/SE)`, clause: 'CPA Cl. 22.1.2', value: resultado.valor_base },
                    ...resultado.agravantes.map(a => ({ label: `Agravante: ${a.nome}`, clause: a.clausula, value: resultado.valor_base * (a.percentual / 100) })),
                    ...resultado.atenuantes.map(a => ({ label: `Atenuante: ${a.nome}`, clause: a.clausula, value: -(resultado.valor_majorado * (a.percentual / 100)) }))
                  ];
                  if (resultado.meses_mora > 0) {
                    detalhes.push({ label: 'Mora Acumulada', clause: 'Cl. 22 CPA', value: resultado.valor_com_mora - resultado.valor_final });
                  }

                  addToHistory({
                    source: 'AGRESE',
                    contract: 'CPA',
                    titulo: descricaoOcorrencia || item?.nome || 'Multa AGRESE personalizada',
                    descricao: `Data: ${dataOcorrencia.split('-').reverse().join('/')}. Simulação de penalidade baseada na Cláusula 22 do CPA. Qtd: ${resultado.ufp_quantidade} UFP/SE.`,
                    valor: resultado.valor_com_mora,
                    detalhes: detalhes,
                    image: imageData
                  });
                  alert('Estimativa salva no histórico da aba!');
                }}
                className="btn-success"
                style={{ flex: 1, padding: '12px', fontSize: '0.8rem', fontWeight: 700, gap: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#10b981', border: 'none', color: 'white' }}
              >
                💾 SALVAR ESTIMATIVA
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StatCard
                label="Valor Base"
                value={resultado.valor_base}
                isCurrency
                icon="📊"
                subtitle={`${resultado.ufp_quantidade} UFP/SE × R$ ${resultado.valor_ufp.toFixed(2)}`}
              />
              <StatCard
                label="Valor Final (sem mora)"
                value={resultado.valor_final}
                isCurrency
                icon="⚖️"
                variant={resultado.valor_final > 400000 ? 'danger' : resultado.valor_final > 100000 ? 'warning' : 'success'}
              />
            </div>

            {mesesMora > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <StatCard
                  label="Mora Acumulada"
                  value={resultado.valor_com_mora - resultado.valor_final}
                  isCurrency
                  icon="📈"
                  variant="warning"
                  subtitle={`IPCA ${resultado.ipca_periodo.toFixed(2)}% + Juros ${resultado.juros_mora.toFixed(2)}%`}
                />
                <StatCard
                  label="Total com Mora"
                  value={resultado.valor_com_mora}
                  isCurrency
                  icon="💸"
                  variant="danger"
                  size="md"
                />
              </div>
            )}

            {/* Balança Dosimétrica */}
            <div className="glass-card" style={{ padding: 20 }}>
              <SectionHeader title="Balança Dosimétrica" icon="⚖️" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    ⬆️ Agravantes
                  </div>
                  {resultado.agravantes.length > 0 ? resultado.agravantes.map((ag) => (
                    <div key={ag.id} style={{ fontSize: '0.78rem', color: '#dc2626', padding: '3px 0', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                      +{ag.percentual}% — {ag.nome}
                    </div>
                  )) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nenhum agravante</div>
                  )}
                  {resultado.agravantes.length > 0 && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', marginTop: 8 }}>
                      Total: +{resultado.percentual_agravantes}%
                    </div>
                  )}
                </div>
                <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    ⬇️ Atenuantes
                  </div>
                  {resultado.atenuantes.length > 0 ? resultado.atenuantes.map((at) => (
                    <div key={at.id} style={{ fontSize: '0.78rem', color: '#10b981', padding: '3px 0', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                      -{at.percentual}% — {at.nome}
                    </div>
                  )) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nenhum atenuante</div>
                  )}
                  {resultado.atenuantes.length > 0 && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginTop: 8 }}>
                      Total: -{resultado.percentual_atenuantes}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown detalhado */}
            <div className="glass-card" style={{ padding: 20 }}>
              <SectionHeader title="Breakdown Detalhado" subtitle="Composição passo a passo da penalidade" icon="🔍" />
              <div>
                {resultado.breakdown.map((item, idx) => (
                  <BreakdownRow key={idx} {...item} />
                ))}
              </div>
            </div>

            {/* Economia de pagamento antecipado */}
            {mesesMora > 0 && resultado.economia_pagamento_antecipado > 0 && (
              <div className="glass-card" style={{ padding: 18, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginBottom: 3 }}>
                      💡 ECONOMIA COM PAGAMENTO IMEDIATO
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Pagar agora vs. aguardar {mesesMora} meses com mora
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#34d399' }}>
                    {formatBRL(resultado.economia_pagamento_antecipado)}
                  </span>
                </div>
              </div>
            )}

            {/* Recomendação de risco */}
            <RiskAlert value={resultado.valor_com_mora} />

            {/* Fundamentação */}
            <div className="glass-card" style={{ padding: 16, background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                📚 Fundamentação Legal
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Multa aplicada com base na <b style={{ color: 'var(--text-secondary)' }}>Cláusula 22.1.2 do CPA</b> — 
                Regime sancionatório da AGRESE. UFP/SE conforme <b style={{ color: 'var(--text-secondary)' }}>Portaria SEFAZ-SE nº 86/2026</b>.
                Dosimetria: <b style={{ color: 'var(--text-secondary)' }}>Cláusulas 22.11 e 22.12 do CPA</b>.
                Mora: IPCA + 1% a.m. (pro rata die) após {PARAMETROS_DEFAULT.PRAZO_PAGAMENTO_DIAS} dias do trânsito em julgado.
                Resolução AGRESE nº 96/2025.
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚖️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Aguardando Parâmetros
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
              Configure os parâmetros da autuação à esquerda e clique em <b style={{ color: '#60a5fa' }}>Calcular Penalidade</b> para obter a dosimetria completa.
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300, margin: '24px auto 0' }}>
              {[
                'Valor Base = UFP/SE × Valor Unitário',
                'Majorado = Base × (1 + Σ Agravantes)',
                'Final = Majorado × (1 — Σ Atenuantes)',
                'Mora = Final × (1 + IPCA/12 + 1%)ⁿ',
              ].map((f, i) => (
                <div key={i} className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(59,130,246,0.05)', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.1)' }}>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <HistoryPanel source="AGRESE" />
      </div>
    </div>
  );
}
