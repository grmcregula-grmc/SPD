'use client';

import React, { useState, useCallback } from 'react';
import {
  calcularCombinacao,
  calcularEquacaoD,
  calcularMultaAGRESE,
  MATRIZ_INFRACOES,
  PARAMETROS_DEFAULT,
  formatBRL,
  formatM3,
  type ResultadoCombinacao,
} from '@/lib/calculators';
import { useSettings } from '@/context/SettingsContext';
import { StatCard, RiskAlert, SectionHeader, ParamInput } from '@/components/ui';
import { generatePDFReport, captureElement } from '@/lib/reports';
import { useEstimates } from '@/context/EstimateContext';
import { HistoryPanel } from '@/components/HistoryPanel';

export default function SimuladorCombinacao() {
  const { settings } = useSettings();
  // Equação D params
  const [usarEquacaoD, setUsarEquacaoD] = useState(true);
  const [volumeNF, setVolumeNF] = useState(150000);
  const [ipd, setIpd] = useState(settings.ipd);
  const [tarifaMedia, setTarifaMedia] = useState(settings.tarifa_media);
  const [margemEbitda, setMargemEbitda] = useState(settings.margem_ebitda);
  const [icaAgua, setIcaAgua] = useState(PARAMETROS_DEFAULT.ICA_COBERTURA_AGUA);
  const [iceEsgoto, setIceEsgoto] = useState(PARAMETROS_DEFAULT.ICE_COBERTURA_ESGOTO);
  const [impostos, setImpostos] = useState(PARAMETROS_DEFAULT.IMPOSTOS_RECEITA);

  // Multa AGRESE params
  const [usarAGRESE, setUsarAGRESE] = useState(true);
  const [ufpAgrese, setUfpAgrese] = useState(100);
  const [gravidadeId, setGravidadeId] = useState<string>('');
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState<string>('');
  const [moresMora, setMesesMora] = useState(0);
  const [agravantesAgrese, setAgravantesAgrese] = useState<string[]>([]);

  // Multa CI params
  const [usarCI, setUsarCI] = useState(false);
  const [faturaMensal, setFaturaMensal] = useState(2000000);
  const [multatCIPerc, setMultaCIPerc] = useState(1);

  const [resultado, setResultado] = useState<ResultadoCombinacao | null>(null);
  const { addToHistory } = useEstimates();
  const resultRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIpd(settings.ipd);
    setTarifaMedia(settings.tarifa_media);
    setMargemEbitda(settings.margem_ebitda);
  }, [settings.ipd, settings.tarifa_media, settings.margem_ebitda]);

  const calcular = useCallback(() => {
    let desconto_d = 0;
    if (usarEquacaoD) {
      const resD = calcularEquacaoD({
        volume_nao_fornecido: volumeNF,
        ipd_percentual: ipd,
        tarifa_media: tarifaMedia,
        margem_ebitda: margemEbitda,
        ica_cobertura_agua: icaAgua,
        ice_cobertura_esgoto: iceEsgoto,
        impostos_percentual: impostos,
      });
      desconto_d = resD.desconto_d;
    }

    const res = calcularCombinacao({
      desconto_d: usarEquacaoD ? desconto_d : 0,
      ufp_multa_agrese: usarAGRESE ? ufpAgrese : 0,
      valor_ufp: settings.ufp_valor,
      agravantes_ids: agravantesAgrese,
      multa_ci_percentual: usarCI ? multatCIPerc : 0,
      fatura_mensal: usarCI ? faturaMensal : 0,
      meses_mora_agrese: moresMora,
    });
    setResultado(res);
  }, [usarEquacaoD, volumeNF, ipd, tarifaMedia, margemEbitda, icaAgua, iceEsgoto, impostos, usarAGRESE, ufpAgrese, agravantesAgrese, usarCI, multatCIPerc, faturaMensal, moresMora]);

  const toggleAG = (id: string) =>
    setAgravantesAgrese((p) => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const agravantesOpts = [
    { id: 'dolo_fraude', label: 'Dolo / Fraude (+30%)' },
    { id: 'enriquecimento', label: 'Enriquecimento Ilícito (+30%)' },
    { id: 'desobediencia', label: 'Desobediência à Ordem (+20%)' },
    { id: 'reincidencia', label: 'Reincidência Específica (+5%)' },
  ];

  const CheckToggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderRadius: 10, cursor: 'pointer', userSelect: 'none',
        background: on ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
        border: `1px solid ${on ? 'var(--brand-blue)' : 'var(--border-primary)'}`,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        width: 38, height: 20, borderRadius: 10,
        background: on ? 'linear-gradient(90deg,#2563eb,#3b82f6)' : 'rgba(71,85,105,0.6)',
        position: 'relative', transition: 'all 0.2s ease', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: on ? 20 : 2, width: 16, height: 16,
          borderRadius: '50%', background: '#fff', transition: 'all 0.2s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.83rem', fontWeight: 600, color: on ? 'var(--brand-blue)' : 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* ===== ESQUERDA — INPUTS ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(139,92,246,0.25)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            ⚠️ Combinação de Penalidades — Superposição Punitiva
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Quando bombas param, <b style={{ color: 'var(--text-secondary)' }}>múltiplas sanções podem incidir simultaneamente</b>: 
            a Equação D subtrai faturamento (CI) enquanto a AGRESE processa auto de infração (CPA). 
            Este módulo compila o impacto total.
          </div>
        </div>

        {/* Equação D */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <CheckToggle on={usarEquacaoD} onToggle={() => setUsarEquacaoD(!usarEquacaoD)} label="Incluir Equação D (CI Cl. 11.2)" />
          </div>
          {usarEquacaoD && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ParamInput label="Volume Não Fornecido (m³)" value={volumeNF} onChange={setVolumeNF} min={0} step={1000} />
              <ParamInput label="Índice de Perdas IPD (%)" value={ipd} onChange={setIpd} min={0} max={100} step={0.5} unit="%" />
              <ParamInput label="Tarifa Média (R$/m³)" value={tarifaMedia} onChange={setTarifaMedia} min={0} step={0.01} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ParamInput label="EBITDA (%)" value={margemEbitda} onChange={setMargemEbitda} min={0} max={100} step={0.5} unit="%" />
                <ParamInput label="Impostos (%)" value={impostos} onChange={setImpostos} min={0} max={30} step={0.25} unit="%" />
                <ParamInput label="ICA Água (%)" value={icaAgua} onChange={setIcaAgua} min={0} max={100} step={0.5} unit="%" />
                <ParamInput label="ICE Esgoto (%)" value={iceEsgoto} onChange={setIceEsgoto} min={0.1} max={100} step={0.5} unit="%" />
              </div>
            </div>
          )}
        </div>

        {/* Multa AGRESE */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <CheckToggle on={usarAGRESE} onToggle={() => setUsarAGRESE(!usarAGRESE)} label="Incluir Multa AGRESE (CPA Cl. 22)" />
          </div>
          {usarAGRESE && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="spd-label">Hipótese de Enquadramento</label>
                <select 
                  className="spd-input" 
                  style={{ width: '100%', cursor: 'pointer' }}
                  value={gravidadeId && descricaoOcorrencia ? `${gravidadeId}|${descricaoOcorrencia}` : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setGravidadeId("");
                      setDescricaoOcorrencia("");
                      return;
                    }
                    const [mId, ...rest] = val.split('|');
                    const hip = rest.join('|');
                    
                    setGravidadeId(mId);
                    setDescricaoOcorrencia(hip);
                    
                    const matriz = MATRIZ_INFRACOES.find(m => m.id === mId);
                    if (matriz) {
                      setUfpAgrese(matriz.ufp);
                    }
                  }}
                >
                  <option value="">Selecione o enquadramento...</option>
                  {MATRIZ_INFRACOES.map(m => (
                    <optgroup key={m.id} label={`${m.nome} — ${m.ufp} UFPs`}>
                      {m.hipoteses?.map((h, i) => (
                        <option key={`${m.id}-${i}`} value={`${m.id}|${h}`}>
                          {h.length > 100 ? h.substring(0, 100) + '...' : h}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {gravidadeId && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(59,130,246,0.05)', padding: '10px', borderRadius: 8, marginTop: 5 }}>
                    <div style={{ marginBottom: 6 }}><b>Classificação da Gravidade Automática:</b> {MATRIZ_INFRACOES.find(m => m.id === gravidadeId)?.nome}</div>
                    <div style={{ marginBottom: 6 }}><b>Base Legal:</b> {MATRIZ_INFRACOES.find(m => m.id === gravidadeId)?.fundamentacao}</div>
                    <div style={{ fontStyle: 'italic', color: '#666' }}>{descricaoOcorrencia}</div>
                  </div>
                )}
                <div style={{ opacity: 0.7, pointerEvents: 'none', marginTop: 12 }}>
                  <ParamInput
                    label="Quantidade de UFP/SE (Fixo por Lei)"
                    value={ufpAgrese}
                    onChange={() => {}}
                    min={100}
                    max={10000}
                    step={100}
                  />
                </div>
              </div>
              <ParamInput label="Meses com Mora" value={moresMora} onChange={setMesesMora} min={0} max={60} step={1} />
              <div>
                <label className="spd-label">Agravantes AGRESE</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {agravantesOpts.map((ag) => (
                    <label key={ag.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                      borderRadius: 8, cursor: 'pointer',
                      background: agravantesAgrese.includes(ag.id) ? 'rgba(239,68,68,0.08)' : 'transparent',
                      border: `1px solid ${agravantesAgrese.includes(ag.id) ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.08)'}`,
                    }}>
                      <input type="checkbox" className="spd-checkbox"
                        checked={agravantesAgrese.includes(ag.id)}
                        onChange={() => toggleAG(ag.id)} />
                      <span style={{ fontSize: '0.78rem', color: agravantesAgrese.includes(ag.id) ? '#dc2626' : 'var(--text-secondary)' }}>
                        {ag.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimativa AGRESE:</span>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>
                    {formatBRL(calcularMultaAGRESE({ ufp_quantidade: ufpAgrese, agravantes_ids: agravantesAgrese, atenuantes_ids: [], meses_mora: moresMora }).valor_com_mora)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Multa CI */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <CheckToggle on={usarCI} onToggle={() => setUsarCI(!usarCI)} label="Incluir Multa CI (Cl. 15.1.1–15.1.6)" />
          </div>
          {usarCI && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ParamInput label="Fatura Mensal Atacadista (R$)" value={faturaMensal} onChange={setFaturaMensal} min={0} step={10000} />
              <div>
                <label className="spd-label">Percentual da Multa CI (%)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 6 }}>
                  {[
                    { v: 1, label: '1% — Acesso/Potabilidade/Volume (Cl. 15.1)' },
                    { v: 1.5, label: '1,5%/dia — Atraso Pagamento Iguá (Cl. 15.1.3)' },
                    { v: 5, label: '5% — Ociosidade Planejamento (Cl. 10.5.3.3)' },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setMultaCIPerc(opt.v)}
                      style={{
                        padding: '8px', borderRadius: 8, fontSize: '0.72rem',
                        background: multatCIPerc === opt.v ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
                        border: `1px solid ${multatCIPerc === opt.v ? 'var(--brand-blue)' : 'var(--border-primary)'}`,
                        color: multatCIPerc === opt.v ? 'var(--brand-blue)' : 'var(--text-secondary)',
                        cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{opt.v}%</div>
                      <div style={{ fontSize: '0.65rem', lineHeight: 1.3 }}>{opt.label.split('—')[1]}</div>
                    </button>
                  ))}
                </div>
                <ParamInput label="Ou informe manualmente (%)" value={multatCIPerc} onChange={setMultaCIPerc} min={0} max={10} step={0.1} unit="%" />
              </div>
            </div>
          )}
        </div>

        <button className="btn-danger" onClick={calcular} style={{ padding: '14px', fontSize: '0.95rem', fontWeight: 700 }}>
          ⚡ CALCULAR IMPACTO TOTAL COMBINADO
        </button>
      </div>

      {/* ===== DIREITA — RESULTADO ===== */}
      <div ref={resultRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {resultado ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Total */}
            <div style={{
              background: 'linear-gradient(135deg, #2e54a3 0%, #1e3a8a 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: 18, padding: 28, textAlign: 'center',
              boxShadow: '0 12px 50px rgba(46, 84, 163, 0.3)',
            }} className="animate-pulse-glow">
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                🚨 IMPACTO FINANCEIRO TOTAL COMBINADO
              </div>
              <div className="mono" style={{ fontSize: '3.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {formatBRL(resultado.total_impacto)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
                {resultado.descricao_cenario}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn-primary" 
                onClick={async () => {
                  if (!resultado) return;
                  const imageData = await captureElement(resultRef.current);

                  const detalhes = [
                    { label: 'Equação D (CI Cl. 11.2)', clause: 'Cl. 11.2 CI', value: resultado.equacao_d },
                    { label: 'Multa AGRESE (CPA Cl. 22)', clause: 'Cl. 22 CPA', value: resultado.multa_agrese },
                    { label: 'Multa CI (Cl. 15)', clause: 'Cl. 15 CI', value: resultado.multa_ci },
                  ].filter(d => d.value > 0);

                  generatePDFReport({
                    titulo: 'Relatório de Impacto Combinado (Combinação de Penalidades)',
                    subtitulo: `Estimativa de Risco Multicontratual — CPA + CI. ${resultado.descricao_cenario}`,
                    total: resultado.total_impacto,
                    detalhes: detalhes,
                    identificador: `EST-COMB-${Date.now().toString().slice(-6)}`,
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

                  const detalhes = [
                    { label: 'Equação D (CI Cl. 11.2)', clause: 'Cl. 11.2 CI', value: resultado.equacao_d },
                    { label: 'Multa AGRESE (CPA Cl. 22)', clause: 'Cl. 22 CPA', value: resultado.multa_agrese },
                    { label: 'Multa CI (Cl. 15)', clause: 'Cl. 15 CI', value: resultado.multa_ci },
                  ].filter(d => d.value > 0);

                  addToHistory({
                    source: 'COMBINACAO_PENALIDADES',
                    contract: 'CPA',
                    titulo: 'Impacto Combinado (Combinação de Penalidades)',
                    descricao: `Simulação de múltiplas infrações simultâneas.`,
                    valor: resultado.total_impacto,
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

            {/* Breakdown por sanção */}
            <div className="glass-card" style={{ padding: 20 }}>
              <SectionHeader title="Composição do Dano" subtitle="Distribuição por instrumento contratual" icon="🔢" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Equação D (CI Cl. 11.2)', valor: resultado.equacao_d, cor: '#ef4444', pct: resultado.total_impacto ? (resultado.equacao_d / resultado.total_impacto) * 100 : 0, ativo: usarEquacaoD },
                  { label: 'Multa AGRESE (CPA Cl. 22)', valor: resultado.multa_agrese, cor: '#f97316', pct: resultado.total_impacto ? (resultado.multa_agrese / resultado.total_impacto) * 100 : 0, ativo: usarAGRESE },
                  { label: 'Multa CI (Cl. 15)', valor: resultado.multa_ci, cor: '#eab308', pct: resultado.total_impacto ? (resultado.multa_ci / resultado.total_impacto) * 100 : 0, ativo: usarCI },
                ].filter(s => s.ativo && s.valor > 0).map((s) => (
                  <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '14px', border: '1px solid var(--border-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</span>
                      <span className="mono" style={{ fontWeight: 700, color: s.cor, fontSize: '0.9rem' }}>{formatBRL(s.valor)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.cor}, ${s.cor}99)` }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {s.pct.toFixed(1)}% do impacto total
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {resultado.timeline.length > 0 && (
              <div className="glass-card" style={{ padding: 20 }}>
                <SectionHeader title="Linha do Tempo de Impacto" icon="📅" />
                <div style={{ position: 'relative', paddingLeft: 20 }}>
                  <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'rgba(59,130,246,0.2)', borderRadius: 1 }} />
                  {resultado.timeline.map((item, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: 16, paddingLeft: 20 }}>
                      <div style={{
                        position: 'absolute', left: -8, top: 6, width: 12, height: 12, borderRadius: '50%',
                        background: item.tipo === 'desconto' ? '#ef4444' : item.tipo === 'multa' ? '#f97316' : '#eab308',
                        border: '2px solid var(--bg-primary)',
                      }} />
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>Mês {item.mes}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, marginRight: 12 }}>{item.evento}</span>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f87171' }}>{formatBRL(item.valor)}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Acum.: {formatBRL(item.acumulado)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendação */}
            <RiskAlert
              value={resultado.total_impacto}
              label={`Impacto combinado de ${formatBRL(resultado.total_impacto)}. Redesenho de fluxos preventivos e instalação de bypasses de emergência é mais viável que absorver responsabilização.`}
            />

            {/* Vs. custo bypass */}
            <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', marginBottom: 6 }}>
                💡 ANÁLISE CUSTO-BENEFÍCIO
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                O investimento em estruturas redundantes de adução e manutenções preventivas programadas, cujo custo típico situa-se em <b style={{ color: '#34d399' }}>10–20% do impacto projetado</b>, representa o mecanismo de proteção de caixa mais eficiente. O simulador recomenda análise de viabilidade para todo evento acima de <b style={{ color: '#fbbf24' }}>R$ 200.000</b>.
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚡</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Combinação de Penalidades
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
              Combine múltiplas sanções simultâneas para ver o impacto total. Ative os módulos à esquerda e calcule.
            </p>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320, margin: '20px auto 0' }}>
              {['Equação D — CI Cláusula 11.2', 'Multa AGRESE — CPA Cláusula 22', 'Penalidade CI — Cláusula 15'].map((item) => (
                <div key={item} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)' }}>
                  <span style={{ color: '#60a5fa' }}>+</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <HistoryPanel source="COMBINACAO_PENALIDADES" />
      </div>
    </div>
  );
}
