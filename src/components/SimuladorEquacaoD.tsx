'use client';

import React, { useState, useCallback } from 'react';
import {
  calcularEquacaoD,
  PARAMETROS_DEFAULT,
  formatBRL,
  formatM3,
  formatPercent,
  type ResultadoEquacaoD,
} from '@/lib/calculators';
import { useSettings } from '@/context/SettingsContext';
import { StatCard, RiskAlert, SectionHeader, ParamInput, BreakdownRow } from '@/components/ui';
import { generatePDFReport, captureElement } from '@/lib/reports';
import { useEstimates } from '@/context/EstimateContext';
import { HistoryPanel } from '@/components/HistoryPanel';

export default function SimuladorEquacaoD() {
  const { settings } = useSettings();
  const [volumeNaoFornecido, setVolumeNaoFornecido] = useState(150000);
  const [ipd, setIpd] = useState(settings.ipd);
  const [tarifaMedia, setTarifaMedia] = useState(settings.tarifa_media);
  const [margemEbitda, setMargemEbitda] = useState(settings.margem_ebitda);
  const [icaAgua, setIcaAgua] = useState(PARAMETROS_DEFAULT.ICA_COBERTURA_AGUA);
  const [iceEsgoto, setIceEsgoto] = useState(PARAMETROS_DEFAULT.ICE_COBERTURA_ESGOTO);
  const [impostos, setImpostos] = useState(PARAMETROS_DEFAULT.IMPOSTOS_RECEITA);
  const [resultado, setResultado] = useState<ResultadoEquacaoD | null>(null);
  const { addToHistory, draftProcess, setDraftProcess } = useEstimates();
  const resultRef = React.useRef<HTMLDivElement>(null);

  // Sincronizar com configurações globais
  React.useEffect(() => {
    setIpd(settings.ipd);
    setTarifaMedia(settings.tarifa_media);
    setMargemEbitda(settings.margem_ebitda);
  }, [settings.ipd, settings.tarifa_media, settings.margem_ebitda]);

  // Efeito para carregar rascunho da planilha
  React.useEffect(() => {
    if (draftProcess) {
      // Se o assunto envolver "Volume", "Parada" ou "Redução", preenchemos o contexto
      const assunto = draftProcess.assunto || '';
      const isVolume = assunto.toLowerCase().includes('volume') || 
                       assunto.toLowerCase().includes('parada') ||
                       assunto.toLowerCase().includes('redução');
      
      if (isVolume) {
        // Tenta encontrar um número que pareça volume (m3) no assunto/contexto
        const match = assunto.match(/(\d+[\d.,]*)\s*m³/i);
        if (match) {
          const val = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          if (!isNaN(val)) setVolumeNaoFornecido(val);
        }
      }
      
      // Limpa resultado anterior se houver
      setResultado(null);
      
      // Limpa o rascunho após carregar
      setDraftProcess(null);
    }
  }, [draftProcess, setDraftProcess]);

  const calcular = useCallback(() => {
    const res = calcularEquacaoD({
      volume_nao_fornecido: volumeNaoFornecido,
      ipd_percentual: ipd,
      tarifa_media: tarifaMedia,
      margem_ebitda: margemEbitda,
      ica_cobertura_agua: icaAgua,
      ice_cobertura_esgoto: iceEsgoto,
      impostos_percentual: impostos,
    });
    setResultado(res);
  }, [volumeNaoFornecido, ipd, tarifaMedia, margemEbitda, icaAgua, iceEsgoto, impostos]);

  const limpar = () => {
    setVolumeNaoFornecido(150000);
    setIpd(settings.ipd);
    setTarifaMedia(settings.tarifa_media);
    setMargemEbitda(settings.margem_ebitda);
    setIcaAgua(PARAMETROS_DEFAULT.ICA_COBERTURA_AGUA);
    setIceEsgoto(PARAMETROS_DEFAULT.ICE_COBERTURA_ESGOTO);
    setImpostos(PARAMETROS_DEFAULT.IMPOSTOS_RECEITA);
    setResultado(null);
  };

  const previewMultiplicador = 1 + (icaAgua / iceEsgoto);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* ===== ESQUERDO — PARÂMETROS ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(139,92,246,0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'linear-gradient(to bottom, #8b5cf6, #3b82f6)' }}></div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
            📐 Arquitetura da Equação D — CI Cláusula 11.2
          </div>
          
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '24px 32px', border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px dashed var(--border-primary)', paddingBottom: 20 }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1, fontFamily: 'serif', fontStyle: 'italic' }}>
                D
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--text-muted)' }}>=</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ 
                  fontFamily: 'JetBrains Mono, monospace', 
                  fontSize: '1.1rem', 
                  color: 'var(--brand-blue)',
                  padding: '0 8px'
                }}>
                  <span style={{ fontWeight: 800 }}>VN</span> × (1 - <span style={{ fontWeight: 800 }}>IPD</span>) × <span style={{ fontWeight: 800 }}>TM</span> × <span style={{ fontWeight: 800 }}>ME</span> × (1 + <span style={{ fontWeight: 800 }}>ICA</span>/<span style={{ fontWeight: 800 }}>ICE</span>)
                </div>
                <div style={{ width: '100%', height: 3, background: 'var(--text-primary)', borderRadius: 2 }}></div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--brand-green)', padding: '0 16px' }}>(1 + I)</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px 24px', marginTop: 8, padding: '16px', background: 'var(--bg-primary)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.8rem' }}><span style={{ fontWeight: 700, color: 'var(--brand-blue)', display: 'inline-block', width: 30 }}>VN</span> <span style={{ color: 'var(--text-secondary)' }}>Volume Não Fornecido (m³)</span></div>
              <div style={{ fontSize: '0.8rem' }}><span style={{ fontWeight: 700, color: 'var(--brand-blue)', display: 'inline-block', width: 30 }}>ME</span> <span style={{ color: 'var(--text-secondary)' }}>Margem EBITDA (%)</span></div>
              <div style={{ fontSize: '0.8rem' }}><span style={{ fontWeight: 700, color: 'var(--brand-blue)', display: 'inline-block', width: 30 }}>IPD</span> <span style={{ color: 'var(--text-secondary)' }}>Índice Perdas da Distribuição</span></div>
              <div style={{ fontSize: '0.8rem' }}><span style={{ fontWeight: 700, color: 'var(--brand-blue)', display: 'inline-block', width: 60 }}>ICA/ICE</span> <span style={{ color: 'var(--text-secondary)' }}>Cobertura Água/Esgoto</span></div>
              <div style={{ fontSize: '0.8rem' }}><span style={{ fontWeight: 700, color: 'var(--brand-blue)', display: 'inline-block', width: 30 }}>TM</span> <span style={{ color: 'var(--text-secondary)' }}>Tarifa Média (R$/m³)</span></div>
              <div style={{ fontSize: '0.8rem' }}><span style={{ fontWeight: 700, color: 'var(--brand-green)', display: 'inline-block', width: 30 }}>I</span> <span style={{ color: 'var(--text-secondary)' }}>Impostos sobre Receita</span></div>
            </div>
          </div>
        </div>

        {/* Volume não fornecido */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Volume Não Fornecido"
            subtitle="Déficit apurado pelo SCADA nos Pontos de Entrega"
            icon="💧"
            badge="Variável Central"
            badgeColor="#06b6d4"
          />
          <ParamInput
            label="Volume Não Fornecido (m³)"
            value={volumeNaoFornecido}
            onChange={setVolumeNaoFornecido}
            min={0}
            step={1000}
            tooltip="Soma das diferenças diárias positivas entre volume planejado e realizado (SCADA)"
          />
          <input
            type="range"
            className="spd-range"
            min={0}
            max={500000}
            step={5000}
            value={volumeNaoFornecido}
            onChange={(e) => setVolumeNaoFornecido(Number(e.target.value))}
            style={{ marginTop: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
            <span>0 m³</span>
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>{formatM3(volumeNaoFornecido)}</span>
            <span>500.000 m³</span>
          </div>
        </div>

        {/* Parâmetros da Rede */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Parâmetros da Rede Downstream"
            subtitle="Dados homologados no Indicador de Desempenho Geral (IDG)"
            icon="🔧"
          />
          <ParamInput
            label="Índice de Perdas de Distribuição — IPD (%)"
            value={ipd}
            onChange={setIpd}
            min={0}
            max={100}
            step={0.5}
            unit="%"
            tooltip="Reduz a base de cálculo: isenta DESO pelo volume que se perderia na rede da Iguá antes de atingir o hidrômetro"
          />
          <ParamInput
            label="Tarifa Média (R$/m³)"
            value={tarifaMedia}
            onChange={setTarifaMedia}
            min={0}
            step={0.01}
            tooltip="Receita anual / Volume total — Demonstrações Financeiras ano anterior da Iguá"
          />
          <ParamInput
            label="Margem EBITDA — ME (%)"
            value={margemEbitda}
            onChange={setMargemEbitda}
            min={0}
            max={100}
            step={0.5}
            unit="%"
            tooltip="Garante que DESO restitua apenas a rentabilidade frustrada, não os custos operacionais que a Iguá não incorreu"
          />
        </div>

        {/* Cobertura */}
        <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(245,158,11,0.2)' }}>
          <SectionHeader
            title="Índices de Cobertura (ICA / ICE)"
            subtitle="Inflator estrutural: interrupção de água arrasta o faturamento de esgoto"
            icon="📊"
            badge="Multiplicador de Dano"
            badgeColor="#f59e0b"
          />
          <ParamInput
            label="Cobertura de Água — ICA (%)"
            value={icaAgua}
            onChange={setIcaAgua}
            min={0}
            max={100}
            step={0.5}
            unit="%"
          />
          <ParamInput
            label="Cobertura de Esgoto — ICE (%)"
            value={iceEsgoto}
            onChange={setIceEsgoto}
            min={0.1}
            max={100}
            step={0.5}
            unit="%"
          />
          <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: 12, border: '1px solid rgba(245,158,11,0.15)', marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: '#f59e0b' }}>Multiplicador Esgoto (1 + ICA/ICE) =</span>
              <span className="mono" style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>×{previewMultiplicador.toFixed(3)}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              A DESO responde por {previewMultiplicador.toFixed(2)}× o valor base em razão do efeito cascata esgoto/água
            </div>
          </div>
        </div>

        {/* Impostos */}
        <div className="glass-card" style={{ padding: 20 }}>
          <SectionHeader
            title="Depuração Tributária"
            subtitle="Deflator do denominador — exclui impostos que a Iguá não pagaria"
            icon="🧾"
          />
          <ParamInput
            label="Alíquota de Impostos sobre Receita (%)"
            value={impostos}
            onChange={setImpostos}
            min={0}
            max={30}
            step={0.25}
            unit="%"
            tooltip="PIS + COFINS + ISS consolidados. Evita locupletamento — a Iguá não pode receber o tributo como lucro"
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-danger" style={{ flex: 2 }} onClick={calcular}>
            💧 CALCULAR DESCONTO D
          </button>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={limpar}>Limpar</button>
        </div>
      </div>

      {/* ===== DIREITO — RESULTADO ===== */}
      <div ref={resultRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {resultado ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* KPI principal */}
            <div
              style={{
                background: 'linear-gradient(135deg, #2e54a3 0%, #1e3a8a 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
                boxShadow: '0 8px 40px rgba(46, 84, 163, 0.3)',
              }}
              className="animate-pulse-glow"
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                🚨 DESCONTO D — DEDUÇÃO DA FATURA MENSAL
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {formatBRL(resultado.desconto_d)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                Será deduzido coercitivamente da próxima fatura atacadista
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn-primary" 
                onClick={async () => {
                  if (!resultado) return;
                  const imageData = await captureElement(resultRef.current);

                  const detalhes = resultado.etapas
                    .filter(e => e.unidade === 'R$' || e.numero === 7)
                    .map(e => ({ 
                      label: e.titulo, 
                      clause: 'CI Cl. 11.2', 
                      value: e.resultado 
                    }));

                  generatePDFReport({
                    titulo: 'Relatório de Cálculo — Equação D',
                    subtitulo: `Lucros Cessantes Automáticos (CI Cláusula 11.2). Volume Não Fornecido: ${formatM3(resultado.volume_nao_fornecido)}`,
                    total: resultado.desconto_d,
                    detalhes: detalhes,
                    identificador: `EST-EQD-${Date.now().toString().slice(-6)}`,
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

                  addToHistory({
                    source: 'EQUACAO_D',
                    contract: 'CI',
                    titulo: `Impacto CI — ${resultado.volume_nao_fornecido.toLocaleString()} m³`,
                    descricao: `Desconto por volume não fornecido conforme Cl. 11.2 do CI.`,
                    valor: resultado.desconto_d,
                    detalhes: resultado.etapas
                      .filter(e => e.unidade === 'R$' || e.numero === 7)
                      .map(e => ({ 
                        label: e.titulo, 
                        clause: 'Cálculo CI', 
                        value: e.resultado 
                      })),
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

            {/* KPIs secundários */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StatCard
                label="Volume Efetivo Afetado"
                value={formatM3(resultado.volume_efetivo)}
                icon="💧"
                subtitle={`Após desconto IPD ${resultado.ipd_percentual.toFixed(0)}%`}
              />
              <StatCard
                label="Fat. Bruto Frustrado"
                value={resultado.faturamento_potencial_bruto}
                isCurrency
                icon="📉"
                variant="warning"
              />
              <StatCard
                label="EBITDA Frustrado"
                value={resultado.lucro_ebitda}
                isCurrency
                icon="💰"
                variant="danger"
                subtitle={`Margem ${resultado.margem_ebitda.toFixed(0)}%`}
              />
              <StatCard
                label="Multiplicador Esgoto"
                value={`×${resultado.multiplicador_esgoto.toFixed(3)}`}
                icon="⬆️"
                variant="warning"
                subtitle={`ICA ${resultado.ica.toFixed(0)}% / ICE ${resultado.ice.toFixed(0)}%`}
              />
            </div>

            {/* Etapas de cálculo */}
            <div className="glass-card" style={{ padding: 20 }}>
              <SectionHeader title="Pipeline de Cálculo — Passo a Passo" icon="🔢" subtitle="Auditabilidade completa da Equação D" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resultado.etapas.map((etapa) => (
                  <div
                    key={etapa.numero}
                    style={{
                      background: etapa.numero === resultado.etapas.length ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                      border: `1px solid ${etapa.numero === resultado.etapas.length ? 'var(--brand-blue)' : 'var(--border-primary)'}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: etapa.numero === resultado.etapas.length ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.68rem', fontWeight: 700,
                            color: etapa.numero === resultado.etapas.length ? '#a78bfa' : '#60a5fa',
                            flexShrink: 0
                          }}>
                            {etapa.numero}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: etapa.numero === resultado.etapas.length ? 'var(--brand-blue)' : 'var(--text-primary)' }}>
                            {etapa.titulo}
                          </span>
                        </div>
                        <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: 30 }}>
                          {etapa.formula}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                        <span className="mono" style={{
                          fontSize: etapa.numero === resultado.etapas.length ? '1.1rem' : '0.9rem',
                          fontWeight: 700,
                          color: etapa.numero === resultado.etapas.length ? 'var(--brand-blue)' : 'var(--brand-blue)'
                        }}>
                          {etapa.unidade === 'R$' ? formatBRL(etapa.resultado) :
                            etapa.unidade === 'm³' ? formatM3(etapa.resultado) :
                              etapa.unidade === '%' ? formatPercent(etapa.resultado) :
                                `${etapa.resultado.toFixed(4)} ${etapa.unidade}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerta de risco */}
            <RiskAlert
              value={resultado.desconto_d}
              label={`Perda de ${formatBRL(resultado.desconto_d)} na próxima fatura. Volume não fornecido: ${formatM3(resultado.volume_nao_fornecido)}.`}
            />

            {/* Mini-tabela de sensibilidade */}
            <div className="glass-card" style={{ padding: 18 }}>
              <SectionHeader title="Análise de Sensibilidade" subtitle="Impacto por variação do volume não fornecido" icon="📈" />
              <table className="spd-table">
                <thead>
                  <tr>
                    <th>Volume Não Fornecido</th>
                    <th>Desconto D Estimado</th>
                    <th>Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {[0.25, 0.5, 1, 2, 5].map((mult) => {
                    const vol = Math.round(resultado.volume_nao_fornecido * mult);
                    const res = calcularEquacaoD({
                      volume_nao_fornecido: vol,
                      ipd_percentual: ipd,
                      tarifa_media: tarifaMedia,
                      margem_ebitda: margemEbitda,
                      ica_cobertura_agua: icaAgua,
                      ice_cobertura_esgoto: iceEsgoto,
                      impostos_percentual: impostos,
                    });
                    const risk = mult === 1 ? 'atual' : '';
                    return (
                      <tr key={mult} style={{ background: mult === 1 ? 'rgba(59,130,246,0.06)' : undefined }}>
                        <td className="mono" style={{ color: mult === 1 ? '#60a5fa' : undefined }}>
                          {mult === 1 && '▶ '}{formatM3(vol)}
                        </td>
                        <td className="mono" style={{ color: '#f87171' }}>{formatBRL(res.desconto_d)}</td>
                        <td><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{risk || `×${mult}`}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>💧</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Equação D — Lucros Cessantes
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 20px' }}>
              Configure o volume não fornecido e os parâmetros financeiros da Iguá para calcular o desconto obrigatório da fatura.
            </p>
            <div style={{ padding: '16px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', maxWidth: 320, margin: '0 auto' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600, marginBottom: 4 }}>⚠️ Risco Crítico</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                A Equação D representa o maior risco financeiro da DESO — supera multas tradicionais em eventos de desabastecimento relevante.
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <HistoryPanel source="EQUACAO_D" />
      </div>
    </div>
  );
}
