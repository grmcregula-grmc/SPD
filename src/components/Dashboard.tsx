'use client';

import React from 'react';
import { formatBRL } from '@/lib/calculators';
import { useSettings } from '@/context/SettingsContext';
import { useEstimates } from '@/context/EstimateContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { generatePDFReport } from '@/lib/reports';
import { ParamInput } from '@/components/ui';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  onNavigate?: (modulo: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { settings, updateSettings } = useSettings();
  const { history, consolidated, addToConsolidated, clearConsolidated, updateClassificacao, removeFromConsolidated, updateOcorrencia } = useEstimates();
  const ufp = settings.ufp_valor;


  // Emissor state
  const [selectedEstimates, setSelectedEstimates] = React.useState<string[]>([]);
  const [editingOcorrId, setEditingOcorrId] = React.useState<string | null>(null);
  const [selectedContract, setSelectedContract] = React.useState<'Ambos' | 'CPA' | 'CI'>('Ambos');
  const [ocorrForm, setOcorrForm] = React.useState<{ identificador: string; nomeCustom: string; descricaoCustom: string; classificacao: string; data: string }>({ 
    identificador: '', 
    nomeCustom: '', 
    descricaoCustom: '', 
    classificacao: 'De Fato',
    data: ''
  });

  React.useEffect(() => {
    if (editingOcorrId) {
      const item = consolidated.find(e => e.id === editingOcorrId);
      if (item) {
        setOcorrForm({
          identificador: item.identificador || item.id.slice(4, 10).toUpperCase(),
          nomeCustom: item.nomeCustom || item.titulo,
          descricaoCustom: item.descricaoCustom || item.descricao,
          classificacao: item.classificacao || 'De Fato',
          data: item.data.split('T')[0]
        });
      }
    }
  }, [editingOcorrId, consolidated]);

  const filteredConsolidated = consolidated.filter(e => {
    if (selectedContract === 'Ambos') return true;
    return e.contract === selectedContract;
  });

  const totalSaved = filteredConsolidated
    .filter(e => e.classificacao !== 'Informativo')
    .reduce((acc, est) => acc + est.valor, 0);

  const handleGenerateReport = () => {
    const contributingCount = filteredConsolidated.filter(e => e.classificacao !== 'Informativo').length;
    
    generatePDFReport({
      titulo: 'Relatório Gestão de Penalidades Regulatórias',
      subtitulo: `Estimativa de Passivo Acumulado (${selectedContract === 'Ambos' ? 'CPA + CI' : selectedContract}) — ${contributingCount} ocorrência(s) com impacto financeiro`,
      total: totalSaved,
      detalhes: filteredConsolidated.flatMap(est => 
        est.detalhes.map(d => ({
          label: `[${est.source}] ${d.label}`,
          clause: d.clause,
          value: d.value
        }))
      ),
      // eslint-disable-next-line
      identificador: `GEST-SPD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`
    });
  };

  const kpis = [
    { label: 'UFP/SE Vigente', value: `R$ ${ufp.toFixed(2).replace('.', ',')}`, sub: 'Valor atualizado dinamicamente', cor: 'var(--brand-blue)', icon: '💹' },
    { label: 'Estimativas Consolidadas', value: formatBRL(totalSaved), sub: `${consolidated.length} itens no acumulado`, cor: 'var(--brand-green)', icon: '📥' },
    { label: 'Multa Máxima AGRESE', value: formatBRL(10000 * ufp), sub: '10.000 UFP/SE — Cl. 22.1.2 CPA', cor: '#ef4444', icon: '🚨' },
    { label: 'Taxas de Mora', value: `IPCA + ${settings.juros_mensal}%/mês`, sub: 'Configurado em Painel Global', cor: '#f59e0b', icon: '⏱️' },
  ];

  const simulados = [
    {
      titulo: 'Simulação I — Máx. Agravantes (CPA)',
      contexto: 'Tubulação subdimensionada + fraude técnica + desobediência à AGRESE + 12 meses de mora',
      resultado: formatBRL(1430000),
      nivel: 'CRÍTICO',
      cor: '#ef4444',
    },
    {
      titulo: 'Simulação II — Mitigação Otimizada (CPA)',
      contexto: 'Qualidade da água comprometida por falha de fornecedor + primariedade + pagamento antecipado',
      resultado: formatBRL(111860),
      nivel: 'MÉDIO',
      cor: '#eab308',
    },
    {
      titulo: 'Simulação III — Equação D Weekend (CI)',
      contexto: 'Avaria eletromecânica na ETA — 150.000 m³ não fornecidos durante um fim de semana',
      resultado: formatBRL(595662),
      nivel: 'ALTO',
      cor: '#f97316',
    },
    {
      titulo: 'Simulação IV — Combinação de Penalidades',
      contexto: 'Equação D + Multa AGRESE ISP abaixo da meta por 3 meses não consecutivos',
      resultado: formatBRL(875312),
      nivel: 'CRÍTICO',
      cor: '#ef4444',
    },
  ];

  const renderBadge = (label: React.ReactNode, color: string = '#64748b') => (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center',
      marginRight: 6, 
      padding: '2px 6px', 
      borderRadius: 4, 
      background: `${color}15`, 
      border: `1px solid ${color}30`, 
      color: color, 
      fontSize: '0.65rem', 
      fontWeight: 700, 
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      transform: 'translateY(-1px)'
    }}>
      {label}
    </span>
  );

  const fasesSancao = [
    { 
      fase: '1', 
      titulo: 'Autuação', 
      desc: <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>Identificada situação de descumprimento, a AGRESE notifica a DESO para apresentação de defesa prévia.</div>
      </div>, 
      status: 'neutro' 
    },
    { 
      fase: '2', 
      titulo: 'Defesa Prévia', 
      desc: <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>{renderBadge('Prazo')} Até 30 (trinta) dias contados da notificação da AGRESE.</div>
        <div>{renderBadge('Detalhes')} Prazo para contestação e busca de atenuantes na dosimetria da multa.</div>
        <div style={{ background: 'rgba(59,130,246,0.05)', padding: 8, borderRadius: 6, borderLeft: '3px solid #3b82f6', marginTop: 4 }}>
          {renderBadge('Oportunidade Crítica', '#3b82f6')}
          <strong>Reconhecimento Precoce:</strong> A DESO faz jus à redução de <strong>10%</strong> do valor da penalidade caso opte por pagá-la sem apresentar defesa ou realizar qualquer outro tipo de discussão administrativa.
        </div>
      </div>, 
      status: 'acao' 
    },
    { 
      fase: '3', 
      titulo: 'Decisão Preliminar (Lavratura do Auto de Infração)', 
      desc: <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>Analisada a defesa prévia e não sendo esta procedente, a AGRESE lavrará o respectivo auto de infração (que deve ser entregue mediante notificação com protocolo de recebimento).</div>
        <div>{renderBadge('Prazo de devolutiva da AGRESE', '#f59e0b')} Os contratos não estipulam um prazo específico para a agência proferir essa decisão preliminar.</div>
        <div style={{ background: 'rgba(59,130,246,0.05)', padding: 8, borderRadius: 6, borderLeft: '3px solid #3b82f6', marginTop: 4 }}>
          {renderBadge('Oportunidade', '#3b82f6')}
          <strong>Aceitação sem recurso:</strong> A DESO tem o direito à redução de <strong>5%</strong> do valor da penalidade se optar por pagá-lo sem interpor qualquer recurso administrativo.
        </div>
      </div>, 
      status: 'acao' 
    },
    { 
      fase: '4', 
      titulo: 'Recurso Administrativo', 
      desc: <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>{renderBadge('Prazo')} 15 (quinze) dias contados do recebimento da notificação para interposição do recurso pela DESO.</div>
        <div>{renderBadge('Detalhes')} O recurso tempestivo é recebido pela AGRESE com efeito suspensivo. A autoridade que lavrou o auto pode reconsiderar sua decisão; caso não reconsidere, os autos são encaminhados à autoridade superior para decisão motivada e fundamentada.</div>
        <div>{renderBadge('Prazo de devolutiva da AGRESE', '#f59e0b')} Os contratos não definem um prazo específico para a autoridade superior da AGRESE julgar e decidir o recurso.</div>
      </div>, 
      status: 'risco' 
    },
    { 
      fase: '5', 
      titulo: 'Trânsito em Julgado', 
      desc: <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>{renderBadge('Prazo Crítico', '#f97316')} Mantido o auto de infração (seja por falta de recurso, intempestividade ou decisão superior), a DESO será notificada para realizar o pagamento no prazo de <strong>20 (vinte) dias</strong>, contados do recebimento da notificação da decisão.</div>
      </div>, 
      status: 'critico' 
    },
    { 
      fase: '6', 
      titulo: 'Mora / Execução', 
      desc: <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>O não pagamento no prazo de 20 dias implicará a incidência de correção monetária pela variação do IPCA (ou índice que venha a substituí-lo).</div>
        <div style={{ background: 'rgba(239,68,68,0.05)', padding: 8, borderRadius: 6, borderLeft: '3px solid #ef4444', marginTop: 4, color: '#ef4444', fontWeight: 600 }}>
          Haverá também a incidência de juros de mora de 1% (um por cento) ao mês pro rata die.
        </div>
      </div>, 
      status: 'perigo' 
    },
  ];

  const statusColors = {
    neutro: '#64748b',
    acao: 'var(--brand-blue)',
    risco: '#f59e0b',
    critico: '#f97316',
    perigo: '#ef4444',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* HEADER DESO */}
      <div style={{ background: 'linear-gradient(135deg, #003087 0%, #0052cc 60%, #0070f3 100%)', borderRadius: 16, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,48,135,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 14px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', letterSpacing: 2 }}>DESO</span>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.25)' }} />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Companhia de Saneamento de Sergipe</div>
            <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800 }}>🛡️ Simulador de Penalidades — SPD</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase' }}>UFP/SE</div>
            <input type="number" value={settings.ufp_valor} onChange={(e) => updateSettings({ ufp_valor: parseFloat(e.target.value) })} style={{ width: 64, border: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: 900, color: 'white', outline: 'none', textAlign: 'center' }} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase' }}>Juros/mês</div>
            <input type="number" value={settings.juros_mensal} onChange={(e) => updateSettings({ juros_mensal: parseFloat(e.target.value) })} style={{ width: 48, border: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: 900, color: 'white', outline: 'none', textAlign: 'center' }} />
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.25)' }} />
          <div style={{ display: 'flex', gap: 8, fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
            <span>AGRESE</span><span style={{ opacity: 0.4 }}>|</span><span>MAES</span>
          </div>
          <div style={{ 
            background: isSupabaseConfigured ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)', 
            border: isSupabaseConfigured ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(245,158,11,0.5)', 
            borderRadius: 20, padding: '4px 12px', fontSize: '0.65rem', fontWeight: 800, 
            color: isSupabaseConfigured ? '#6ee7b7' : '#fcd34d', 
            display: 'flex', alignItems: 'center', gap: 6 
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSupabaseConfigured ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
            {isSupabaseConfigured ? 'Sistema Online' : 'Sistema Local (Guest)'}
          </div>
        </div>
      </div>
      {/* PESQUISA E ACESSOS RÁPIDOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'white' }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Pesquisar instrumentos, cláusulas, processos ou normas de compliance..." 
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', padding: '12px 0', background: 'transparent', fontWeight: 500 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '4px 8px', borderRadius: 6 }}>CTRL + K</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'AGRESE', icon: '🏛️', color: '#3b82f6', target: 'agrese', count: history.filter(h => h.source === 'AGRESE').length, val: history.filter(h => h.source === 'AGRESE').reduce((a,b) => a+b.valor, 0) },
            { label: 'Equação D', icon: '➗', color: '#8b5cf6', target: 'equacaod', count: history.filter(h => h.source === 'EQUACAO_D').length, val: history.filter(h => h.source === 'EQUACAO_D').reduce((a,b) => a+b.valor, 0) },
            { label: 'Penalidades', icon: '⚖️', color: '#ef4444', target: 'combinacao', count: history.filter(h => h.source === 'COMBINACAO_PENALIDADES').length, val: history.filter(h => h.source === 'COMBINACAO_PENALIDADES').reduce((a,b) => a+b.valor, 0) },
            { label: 'Matriz/Processos', icon: '📋', color: '#10b981', target: 'matriz', count: history.filter(h => h.source === 'MANUAL').length, val: history.filter(h => h.source === 'MANUAL').reduce((a,b) => a+b.valor, 0) },
          ].map(eixo => (
            <button 
              key={eixo.label} 
              onClick={() => onNavigate && onNavigate(eixo.target)}
              className="card-hover-effect" 
              style={{ 
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ 
                width: 44, height: 44, borderRadius: 12, background: `${eixo.color}10`, color: eixo.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
              }}>
                {eixo.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{eixo.label}</div>
                  <span style={{ fontSize: '0.6rem', color: eixo.color, fontWeight: 700, opacity: 0.7 }}>ACESSAR ↗</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>{eixo.count}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: eixo.color }}>{formatBRL(eixo.val)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PAINEL EXECUTIVO PREMIUM */}
      <div className="glass-card executive-panel" style={{ 
        padding: '24px 30px', 
        border: '1px solid rgba(59,130,246,0.15)', 
        background: 'rgba(255,255,255,0.7)', 
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 40px rgba(0,48,135,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow effect */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: 200, height: 200, background: 'rgba(59,130,246,0.05)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-blue)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
              Painel Executivo de Riscos e Penalidades
              <span style={{ fontSize: '0.6rem', background: '#3b82f6', color: 'white', padding: '3px 10px', borderRadius: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Live Update</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>Gestão Integrada de Passivos Regulatórios e Monitoramento de Inconformidades</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, border: '1px solid var(--border-primary)' }}>
              {(['Ambos', 'CPA', 'CI'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedContract(c)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800,
                    background: selectedContract === c ? 'white' : 'transparent',
                    color: selectedContract === c ? 'var(--brand-blue)' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer', boxShadow: selectedContract === c ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {c === 'Ambos' ? 'Todos os Contratos' : c}
                </button>
              ))}
            </div>
            <button 
              onClick={handleGenerateReport} 
              disabled={filteredConsolidated.length === 0} 
              className="btn-primary premium-button"
              style={{ 
                padding: '0 24px', height: 48, borderRadius: 12, fontSize: '0.85rem', fontWeight: 800, 
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📊</span>
              Exportar Relatório Consolidado
            </button>
             <button 
              onClick={() => {
                const reportHtml = `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <title>Evidências de Simulação - SPD</title>
                      <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; padding: 40px; color: #1e293b; margin: 0; }
                        .container { max-width: 900px; margin: 0 auto; }
                        .header { background: white; padding: 30px; border-radius: 16px; margin-bottom: 30px; border-left: 6px solid #3b82f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                        h1 { margin: 0; font-size: 24px; color: #1e3a8a; }
                        .item { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; margin-bottom: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden; page-break-inside: avoid; }
                        .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
                        .title { font-size: 1.4rem; font-weight: 800; color: #1e3a8a; }
                        .meta { font-size: 0.9rem; color: #64748b; margin-top: 4px; }
                        .price { font-size: 1.8rem; font-weight: 900; color: #1e293b; }
                        .desc { font-size: 1rem; color: #475569; line-height: 1.6; margin-bottom: 25px; }
                        .img-container { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 10px; text-align: center; }
                        img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                        .no-img { font-style: italic; color: #94a3b8; padding: 40px; text-align: center; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; }
                        .no-print { margin-bottom: 20px; display: flex; gap: 10px; align-items: center; }
                        .btn-print { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
                        @media print { .no-print { display: none; } body { padding: 0; background: white; } .container { max-width: 100%; } .item { box-shadow: none; border: 1px solid #eee; } }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="no-print">
                          <button class="btn-print" onclick="window.print()">🖨️ Imprimir PDF / Salvar</button>
                          <span style="font-size: 0.85rem; color: #64748b;">Este documento reúne as capturas de tela das simulações da Gestão Ativa.</span>
                        </div>
                        <div class="header">
                          <h1>Dossiê de Evidências Regulatórias</h1>
                          <div style="font-size: 0.9rem; color: #64748b; margin-top: 5px;">Sistema de Proteção de Caixa (SPD) — Gerado em ${new Date().toLocaleString('pt-BR')}</div>
                        </div>
                        ${filteredConsolidated.map(e => `
                          <div class="item">
                            <div class="item-header">
                              <div>
                                <div class="title">${e.nomeCustom || e.titulo}</div>
                                <div class="meta">${e.source} | ${e.contract || 'Geral'} | ID: ${e.identificador || e.id.slice(4, 10).toUpperCase()}</div>
                                <div class="meta">Data: ${new Date(e.data).toLocaleDateString('pt-BR')}</div>
                              </div>
                              <div class="price">${formatBRL(e.valor)}</div>
                            </div>
                            <div class="desc">${e.descricaoCustom || e.descricao}</div>
                            <div class="img-container">
                              ${e.image ? `<img src="${e.image}" alt="Captura da Simulação" />` : '<div class="no-img">Nenhuma captura de tela disponível para esta estimativa.</div>'}
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </body>
                  </html>
                `;

                const blob = new Blob([reportHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              }} 
              disabled={filteredConsolidated.length === 0} 
              className="btn-ghost"
              style={{ 
                padding: '0 20px', height: 48, borderRadius: 12, fontSize: '0.85rem', fontWeight: 800, 
                display: 'flex', alignItems: 'center', gap: 10,
                border: '1px solid var(--border-primary)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🖼️</span>
              Ver Evidências
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          
          {/* BLOCO FINANCEIRO */}
          <div className="card-hover-effect" style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '20px', borderRadius: 16, background: 'linear-gradient(135deg, #003087 0%, #0052cc 100%)', color: 'white', boxShadow: '0 8px 20px rgba(0,48,135,0.15)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Exposição Financeira {selectedContract !== 'Ambos' ? `(${selectedContract})` : 'Total'}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{formatBRL(totalSaved)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', width: 'fit-content', padding: '4px 10px', borderRadius: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                  {filteredConsolidated.length} Ocorrências {selectedContract !== 'Ambos' ? `em ${selectedContract}` : ''}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>UFP/SE (Valor)</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>R$ {ufp.toFixed(2)}</div>
                </div>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Juros / Mora</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{settings.juros_mensal}% / mês</div>
                </div>
              </div>
            </div>
          </div>

          {/* LINHA DO TEMPO INTERATIVA */}
          <div className="card-hover-effect" style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Histórico de Simulações</h3>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>Últimos 6 meses</div>
            </div>
            <div style={{ flex: 1, minHeight: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.slice().reverse().map(h => ({ name: new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: h.valor }))}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(v: any) => [formatBRL(v), 'Simulado']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '0.75rem' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* COMPOSIÇÃO POR CONTRATO */}
          {selectedContract === 'Ambos' && (
            <div className="card-hover-effect" style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribuição por Contrato</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center' }}>
                {[
                  { label: 'CPA (Produção)', color: '#3b82f6', value: consolidated.filter(e => e.contract === 'CPA').reduce((a, b) => a + b.valor, 0), count: consolidated.filter(e => e.contract === 'CPA').length },
                  { label: 'CI (Interdependência)', color: '#8b5cf6', value: consolidated.filter(e => e.contract === 'CI').reduce((a, b) => a + b.valor, 0), count: consolidated.filter(e => e.contract === 'CI').length },
                ].map(c => {
                  const total = consolidated.reduce((a, b) => a + b.valor, 0) || 1;
                  return (
                    <div key={c.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e293b' }}>{c.label}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: c.color }}>{formatBRL(c.value)}</span>
                      </div>
                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(c.value / total) * 100}%`, background: c.color }} />
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'right', fontWeight: 600 }}>{c.count} Ocorrências ({Math.round((c.value / total) * 100)}%)</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMPOSIÇÃO POR CLASSIFICAÇÃO */}
          {(() => {
            const cats = [
              { label: 'De Fato', color: '#ef4444', value: filteredConsolidated.filter(e => e.classificacao === 'De Fato' || !e.classificacao).reduce((a, b) => a + b.valor, 0) },
              { label: 'Inércia', color: '#f59e0b', value: filteredConsolidated.filter(e => e.classificacao?.startsWith('Potencial')).reduce((a, b) => a + b.valor, 0) },
              { label: 'Informativo', color: '#94a3b8', value: filteredConsolidated.filter(e => e.classificacao === 'Informativo').reduce((a, b) => a + b.valor, 0) },
            ];
            const grandTotal = cats.reduce((a, b) => a + b.value, 0) || 1;
            const pieData = cats.filter(c => c.value > 0);
            
            return (
              <div className="card-hover-effect" style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Densidade de Risco</h3>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <div style={{ width: '40%', height: 100 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData.length > 0 ? pieData : [{ label: 'Empty', value: 1 }]} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                          {pieData.length > 0 ? pieData.map((c, i) => <Cell key={i} fill={c.color} />) : <Cell fill="#f1f5f9" />}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cats.map(c => (
                      <div key={c.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569' }}>{c.label}</span>
                          </div>
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>{Math.round((c.value / grandTotal) * 100)}%</span>
                        </div>
                        <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(c.value / grandTotal) * 100}%`, background: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* GRID DE GESTÃO DE OCORRÊNCIAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
        
        {/* COLUNA 1: SELEÇÃO E HISTÓRICO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24, height: 440, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Histórico de Estimativas</h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Selecione itens para consolidar o relatório</p>
              </div>
              <span style={{ background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{history.length} Simulações</span>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 8 }}>
              {history.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 12 }}>
                  <span style={{ fontSize: '2.5rem' }}>📭</span>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nenhuma simulação salva ainda.</p>
                </div>
              ) : (
                history.map((est, idx) => (
                  <div key={est.id} className="history-item" style={{ 
                    padding: '14px', borderRadius: 16, background: selectedEstimates.includes(est.id) ? 'rgba(59,130,246,0.05)' : 'white',
                    border: selectedEstimates.includes(est.id) ? '1px solid var(--brand-blue)' : '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedEstimates.includes(est.id)}
                        onChange={(e) => e.target.checked ? setSelectedEstimates(p => [...p, est.id]) : setSelectedEstimates(p => p.filter(id => id !== est.id))}
                        className="spd-checkbox"
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--brand-blue)', textTransform: 'uppercase' }}>{est.source}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e293b' }}>{formatBRL(est.valor)}</span>
                        </div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', lineHeight: 1.3 }}>{est.titulo}</h4>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{new Date(est.data).toLocaleDateString('pt-BR')}</span>
                          {est.image && <span style={{ color: '#3b82f6', fontSize: '0.6rem' }}>🖼️ Com Captura</span>}
                        </div>
                      </div>
                    </div>
                    {est.image && (
                      <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid #f1f5f9', height: 40, background: '#f8fafc' }}>
                        <img src={est.image} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <button 
              disabled={selectedEstimates.length === 0}
              onClick={() => {
                selectedEstimates.forEach(id => {
                  const est = history.find(e => e.id === id);
                  if (est) addToConsolidated(est);
                });
                setSelectedEstimates([]);
              }}
              className="btn-primary"
              style={{ marginTop: 20, height: 48, borderRadius: 12, fontWeight: 800, fontSize: '0.85rem' }}
            >
              Adicionar Selecionados à Gestão 📥
            </button>
          </div>
        </div>

        {/* COLUNA 2: GESTÃO ATIVA E COMPOSIÇÃO RÁPIDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24, height: 440, display: 'flex', flexDirection: 'column', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: 1 }}>Itens de Gestão Ativa</h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ocorrências integradas ao cálculo de passivo</p>
              </div>
              <button onClick={clearConsolidated} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Limpar Gestão</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
              {filteredConsolidated.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 12 }}>
                  <span style={{ fontSize: '2.5rem' }}>🍃</span>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nenhum item {selectedContract !== 'Ambos' ? `em ${selectedContract}` : ''} na gestão ativa.</p>
                </div>
              ) : filteredConsolidated.map((est, idx) => (
                <div key={est.id} style={{ 
                  padding: '16px', borderRadius: 18, background: 'white', border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 8, background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>{idx + 1}</div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>{est.source}</span>
                      {est.contract && <span style={{ fontSize: '0.6rem', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{est.contract}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setEditingOcorrId(est.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'none', fontSize: '0.7rem', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => removeFromConsolidated(est.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{est.nomeCustom || est.titulo}</h4>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4, fontStyle: est.descricaoCustom ? 'normal' : 'italic' }}>
                        {est.descricaoCustom || est.descricao}
                      </p>
                      {est.data && (
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--brand-blue)', marginTop: 6 }}>
                          📅 {new Date(est.data).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 16 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>{formatBRL(est.valor)}</div>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b' }}>UFP: {(est.valor / ufp).toFixed(1)}</span>
                    </div>
                  </div>

                  {est.image && (
                    <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid #f1f5f9', maxHeight: 120, position: 'relative' }}>
                      <img src={est.image} alt="Evidência" style={{ width: '100%', objectFit: 'cover', opacity: 0.8 }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.4))', padding: '10px', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>Clique em "Ver Evidências" para ampliar</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginTop: 12 }}>
                    {['De Fato', 'Potencial Alta', 'Potencial Moderada', 'Informativo', 'Outros'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => updateClassificacao(est.id, cat as any)}
                        style={{ 
                          padding: '5px 0', borderRadius: 8, fontSize: '0.52rem', fontWeight: 800, border: '1px solid transparent',
                          background: est.classificacao === cat ? 'rgba(59,130,246,0.1)' : '#f8fafc',
                          color: est.classificacao === cat ? '#2563eb' : '#64748b',
                          borderColor: est.classificacao === cat ? '#3b82f6' : 'transparent',
                          transition: 'all 0.2s', cursor: 'pointer'
                        }}
                      >
                        {cat === 'De Fato' ? '⚖️ Fato' : cat.split(' ')[1] || cat}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EDITOR RÁPIDO DE PARÂMETROS */}
      <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: '1rem' }}>⚙️</span>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parâmetros Regulatórios Ativos</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <ParamInput label="UFP/SE (R$)" value={settings.ufp_valor} onChange={() => {}} />
          <ParamInput label="Tarifa Média (R$)" value={settings.tarifa_media} onChange={() => {}} />
          <ParamInput label="IPCA Anual (%)" value={settings.ipca_anual} onChange={() => {}} />
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 4 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              * Os valores são gerenciados globalmente na aba <b>Configurações</b> para garantir integridade entre simuladores.
            </p>
          </div>
        </div>
      </div>


      {/* Grid principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Simulações de referência */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>📋 Simulações de Referência</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Casuística do Caderno Técnico Paramétrico</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {simulados.map((s) => (
              <div key={s.titulo} style={{ padding: '14px', borderRadius: 10, background: `${s.cor}08`, border: `1px solid ${s.cor}20` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1, marginRight: 10 }}>{s.titulo}</span>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', fontWeight: 700, color: s.cor }}>{s.resultado}</div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: s.cor, textTransform: 'uppercase' }}>{s.nivel}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.contexto}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rito sancionatório */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>⚖️ Rito Processual Sancionatório</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 18 }}>Fluxo do processo administrativo — AGRESE / DESO</p>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: 'rgba(59,130,246,0.15)', borderRadius: 1 }} />
            {fasesSancao.map((f, idx) => {
              const cor = statusColors[f.status as keyof typeof statusColors];
              return (
                <div key={f.fase} style={{ display: 'flex', gap: 16, marginBottom: idx < fasesSancao.length - 1 ? 16 : 0, position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: `2px solid ${cor}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: cor, zIndex: 1, background: 'var(--bg-primary)' }}>
                    {f.fase}
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.titulo}</span>
                      {(f.status === 'acao') && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.12)', borderRadius: 20, padding: '1px 7px', border: '1px solid rgba(59,130,246,0.25)' }}>OPORTUNIDADE</span>}
                      {f.status === 'critico' && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,0.12)', borderRadius: 20, padding: '1px 7px', border: '1px solid rgba(249,115,22,0.25)' }}>PRAZO CRÍTICO</span>}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela dosimetria */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>📐 Tabela Completa de Dosimetria Contratual</h2>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16 }}>Cláusulas 22.11 (atenuantes) e 22.12 (agravantes) do CPA — Aplicação cumulativa</p>
        <table className="spd-table">
          <thead>
            <tr>
              <th>Conduta</th>
              <th>Fundamentação</th>
              <th>Tipo</th>
              <th style={{ textAlign: 'right' }}>Impacto %</th>
            </tr>
          </thead>
          <tbody>
            {[
              { conduta: 'Reconhecimento Precoce e Liquidação Voluntária', clausula: 'Cl. 22.4.2 CPA', tipo: 'Atenuante', pct: -10 },
              { conduta: 'Aceitação Pós-Decisão Preliminar (sem recurso)', clausula: 'Cl. 22.5.1 (ii) CPA', tipo: 'Atenuante', pct: -5 },
              { conduta: 'Inexistência de Antecedentes — Primariedade 5 anos', clausula: 'Cl. 22.11.4 CPA', tipo: 'Atenuante', pct: -5 },
              { conduta: 'Reparação Voluntária e Mitigação Espontânea', clausula: 'Cl. 22.11.3 CPA', tipo: 'Atenuante', pct: -10 },
              { conduta: 'Nexo Causal Indireto por Agente Terceiro', clausula: 'Cl. 22.11.2 CPA', tipo: 'Atenuante', pct: -15 },
              { conduta: 'Dolo, Omissão Dolosa ou Ocultação', clausula: 'Cl. 22.12.1 CPA', tipo: 'Agravante', pct: +30 },
              { conduta: 'Busca por Enriquecimento Ilícito', clausula: 'Cl. 22.12.2 CPA', tipo: 'Agravante', pct: +30 },
              { conduta: 'Desobediência à Ordem Mitigadora', clausula: 'Cl. 22.12.3 CPA', tipo: 'Agravante', pct: +20 },
              { conduta: 'Reincidência Operacional Específica', clausula: 'Cl. 22.12.4 CPA / Res. 96/2025', tipo: 'Agravante', pct: +5 },
            ].map((r) => (
              <tr key={r.conduta}>
                <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>{r.conduta}</td>
                <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#64748b', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 4, padding: '1px 6px' }}>{r.clausula}</span></td>
                <td><span className={r.tipo === 'Atenuante' ? 'badge-atenuante' : 'badge-agravante'}>{r.tipo}</span></td>
                <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: r.pct > 0 ? '#f87171' : '#4ade80', fontSize: '0.9rem' }}>
                  {r.pct > 0 ? '+' : ''}{r.pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: '#f5f3ff', border: '1px solid rgba(139,92,246,0.15)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <b style={{ color: '#7c3aed' }}>⚠️ Atenção:</b> Acúmulo máximo de agravantes (Dolo+Enriquecimento+Desobediência) = <b style={{ color: '#dc2626' }}>+80%</b> sobre o valor base. 
          Acúmulo máximo de atenuantes (Terceiro+Antecipado+Voluntário+Primário) = <b style={{ color: '#16a34a' }}>-40%</b> sobre o valor majorado.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { icon: '📄', titulo: 'Prazo As-Built', desc: 'Submeter projetos técnicos conclusivos à AGRESE em até 90 dias após comissionamento das obras', nivel: 'critico', cor: '#ef4444' },
          { icon: '💧', titulo: 'ISP — Produção Mínima', desc: 'Monitorar Índice de Suficiência da Produção em tempo real. Paralisações acima da reservação acionam Equação D', nivel: 'alto', cor: '#f97316' },
          { icon: '📊', titulo: 'Cadeia de Suprimentos', desc: 'Monitorar inadimplência com fornecedores críticos (energia, químicos) antes do gatilho de Assunção de Encargos', nivel: 'alto', cor: '#f97316' },
        ].map((a) => (
          <div key={a.titulo} style={{ padding: '18px', borderRadius: 14, background: `${a.cor}06`, border: `1px solid ${a.cor}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
              <span style={{ fontSize: '0.83rem', fontWeight: 700, color: a.nivel === 'critico' ? '#f87171' : '#fb923c' }}>{a.titulo}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.desc}</p>
          </div>
        ))}
      </div>
      {/* MODAL DE EDIÇÃO DE OCORRÊNCIA */}
      {editingOcorrId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: 500, padding: 32, background: 'white',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid var(--border-primary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-blue)' }}>Editar Ocorrência</h3>
              <button onClick={() => setEditingOcorrId(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Protocolo / ID</label>
                  <input 
                    type="text"
                    value={ocorrForm.identificador}
                    onChange={(e) => setOcorrForm(p => ({ ...p, identificador: e.target.value }))}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Data da Ocorrência</label>
                  <input 
                    type="date"
                    value={ocorrForm.data}
                    onChange={(e) => setOcorrForm(p => ({ ...p, data: e.target.value }))}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Título / Nome do Evento</label>
                <input 
                  type="text"
                  value={ocorrForm.nomeCustom}
                  onChange={(e) => setOcorrForm(p => ({ ...p, nomeCustom: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Descrição da Ocorrência</label>
                <textarea 
                  rows={3}
                  value={ocorrForm.descricaoCustom}
                  onChange={(e) => setOcorrForm(p => ({ ...p, descricaoCustom: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 500, resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Tipo / Classificação de Risco</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {['De Fato', 'Potencial Alta', 'Potencial Moderada', 'Informativo', 'Outros'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setOcorrForm(p => ({ ...p, classificacao: cat }))}
                      style={{
                        padding: '10px 4px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 800,
                        border: '1px solid',
                        background: ocorrForm.classificacao === cat ? 'rgba(59,130,246,0.1)' : '#f8fafc',
                        color: ocorrForm.classificacao === cat ? '#2563eb' : '#64748b',
                        borderColor: ocorrForm.classificacao === cat ? '#3b82f6' : '#e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  onClick={() => setEditingOcorrId(null)}
                  style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (editingOcorrId) {
                      updateOcorrencia(editingOcorrId, {
                        identificador: ocorrForm.identificador,
                        nomeCustom: ocorrForm.nomeCustom,
                        descricaoCustom: ocorrForm.descricaoCustom,
                        classificacao: ocorrForm.classificacao as any,
                        data: ocorrForm.data ? new Date(ocorrForm.data).toISOString() : undefined
                      });
                      setEditingOcorrId(null);
                    }
                  }}
                  className="btn-primary"
                  style={{ flex: 2, padding: '14px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  Salvar Alterações 💾
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}
