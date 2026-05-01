'use client';

import React, { useState, useMemo } from 'react';
import { GRUPOS_PROCESSOS, GrupoProcesso, EtapaProcesso } from '@/lib/processosPresidencia';

const EIXO_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'Eixo 1 — Regulatório / Financeiro': { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  'Eixo 2 — Produção e Qualidade':     { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
  'Eixo 3 — Investimentos / Patrimônio':{ color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
  'Eixo 4 — Institucional / Contencioso':{ color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' },
};

const LS_KEY = 'spd_etapas_custom';

function loadCustomEtapas(): Record<string, EtapaProcesso[]> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveCustomEtapas(data: Record<string, EtapaProcesso[]>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

const emptyEtapa = (): Omit<EtapaProcesso, 'id' | 'processo'> => ({
  etapa: '', origem: '', destino: '', prazoInterno: '', prazoExterno: '', entregavel: '', isFinal: false,
});

export default function ControleProcessos() {
  const [search, setSearch] = useState('');
  const [eixoFiltro, setEixoFiltro] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customEtapas, setCustomEtapas] = useState<Record<string, EtapaProcesso[]>>(loadCustomEtapas);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newEtapa, setNewEtapa] = useState(emptyEtapa());

  const grupos = useMemo(() => {
    let list = GRUPOS_PROCESSOS.map(g => {
      const extras = customEtapas[g.id] || [];
      return { ...g, etapas: [...g.etapas, ...extras] };
    });
    if (eixoFiltro) list = list.filter(g => g.eixo === eixoFiltro);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(g => g.processo.toLowerCase().includes(s) || g.id.toLowerCase().includes(s) ||
        g.etapas.some(e => e.origem.toLowerCase().includes(s) || e.destino.toLowerCase().includes(s) || e.entregavel.toLowerCase().includes(s)));
    }
    return list;
  }, [search, eixoFiltro, customEtapas]);

  const handleAddEtapa = (grupoId: string, processo: string) => {
    if (!newEtapa.etapa || !newEtapa.origem || !newEtapa.destino) return;
    const etapa: EtapaProcesso = { ...newEtapa, id: grupoId, processo };
    const updated = { ...customEtapas, [grupoId]: [...(customEtapas[grupoId] || []), etapa] };
    setCustomEtapas(updated);
    saveCustomEtapas(updated);
    setNewEtapa(emptyEtapa());
    setAddingTo(null);
  };

  const handleRemoveCustom = (grupoId: string, etapaNum: string) => {
    const updated = { ...customEtapas, [grupoId]: (customEtapas[grupoId] || []).filter(e => e.etapa !== etapaNum) };
    setCustomEtapas(updated);
    saveCustomEtapas(updated);
  };

  const eixos = Array.from(new Set(GRUPOS_PROCESSOS.map(g => g.eixo)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', borderRadius: 16, padding: '18px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900 }}>🏛️ Controle de Processos na Presidência</h2>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              Fluxo de etapas, prazos e entregáveis por processo regulatório
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800 }}>
              {GRUPOS_PROCESSOS.length} processos
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800 }}>
              {GRUPOS_PROCESSOS.reduce((a, g) => a + g.etapas.length, 0)} etapas
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <input type="text" placeholder="🔍 Buscar processo, origem, entregável..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={eixoFiltro} onChange={e => setEixoFiltro(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.8rem', background: 'white', cursor: 'pointer' }}>
          <option value="">Todos os Eixos</option>
          {eixos.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        {(search || eixoFiltro) && (
          <button onClick={() => { setSearch(''); setEixoFiltro(''); }}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Lista de processos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {grupos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '0.85rem', background: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
            Nenhum processo encontrado com os filtros aplicados.
          </div>
        )}
        {grupos.map(g => {
          const ec = EIXO_COLORS[g.eixo] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' };
          const isExpanded = expandedId === g.id;
          const customCount = (customEtapas[g.id] || []).length;

          return (
            <div key={g.id} style={{ background: 'white', borderRadius: 14, border: `1px solid ${isExpanded ? ec.color : '#e2e8f0'}`, overflow: 'hidden', boxShadow: isExpanded ? `0 8px 28px ${ec.color}18` : '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, border-color 0.2s' }}>
              {/* Cabeçalho do processo */}
              <div onClick={() => setExpandedId(isExpanded ? null : g.id)}
                style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, background: isExpanded ? ec.bg : 'transparent' }}>
                <div style={{ background: ec.color, color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                  {g.id}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.processo}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: ec.color, background: ec.bg, border: `1px solid ${ec.border}`, borderRadius: 20, padding: '2px 8px' }}>{g.eixo}</span>
                    <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>{g.etapas.length} etapa{g.etapas.length !== 1 ? 's' : ''}{customCount > 0 ? ` (+${customCount} custom)` : ''}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </div>

              {/* Tabela de etapas */}
              {isExpanded && (
                <div style={{ borderTop: `2px solid ${ec.color}30` }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {['Etapa', 'Origem', 'Destino', 'Prazo Interno', 'Prazo Externo', 'Entregável da Origem', ''].map((h, i) => (
                            <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {g.etapas.map((et, idx) => {
                          const isCustom = (customEtapas[g.id] || []).some(c => c.etapa === et.etapa);
                          return (
                            <tr key={idx} style={{ background: et.isFinal ? `${ec.color}06` : idx % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: et.isFinal ? ec.color : '#e2e8f0', color: et.isFinal ? 'white' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>
                                    {et.etapa}
                                  </span>
                                  {et.isFinal && <span style={{ fontSize: '0.58rem', background: ec.color, color: 'white', borderRadius: 4, padding: '1px 5px', fontWeight: 800 }}>FINAL</span>}
                                  {isCustom && <span style={{ fontSize: '0.58rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '1px 5px', fontWeight: 800 }}>+</span>}
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '3px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>{et.origem}</span>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ background: `${ec.color}12`, borderRadius: 6, padding: '3px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', fontWeight: 700, color: ec.color, whiteSpace: 'nowrap' }}>{et.destino}</span>
                              </td>
                              <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.75rem' }}>{et.prazoInterno}</td>
                              <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.72rem', fontStyle: 'italic' }}>{et.prazoExterno}</td>
                              <td style={{ padding: '10px 14px', color: '#334155', fontSize: '0.75rem', maxWidth: 320, lineHeight: 1.4 }}>{et.entregavel}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                {isCustom && (
                                  <button onClick={() => handleRemoveCustom(g.id, et.etapa)}
                                    style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: '0.65rem', color: '#dc2626', fontWeight: 700 }}>🗑️</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Formulário de nova etapa */}
                  {addingTo === g.id ? (
                    <div style={{ padding: '16px 20px', background: '#f0f9ff', borderTop: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>➕ Nova Etapa</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                        {[
                          { label: 'Etapa (nº)', key: 'etapa', placeholder: 'Ex: 5' },
                          { label: 'Origem', key: 'origem', placeholder: 'Ex: GRMC' },
                          { label: 'Destino', key: 'destino', placeholder: 'Ex: GAPR' },
                          { label: 'Prazo Interno', key: 'prazoInterno', placeholder: 'Ex: 5 dias úteis' },
                          { label: 'Prazo Externo', key: 'prazoExterno', placeholder: 'Ex: Mensalmente' },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</label>
                            <input value={(newEtapa as any)[f.key]} placeholder={f.placeholder}
                              onChange={e => setNewEtapa(prev => ({ ...prev, [f.key]: e.target.value }))}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid #bae6fd', fontSize: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        ))}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Entregável da Origem</label>
                          <textarea value={newEtapa.entregavel} placeholder="Descreva o entregável desta etapa..." rows={2}
                            onChange={e => setNewEtapa(prev => ({ ...prev, entregavel: e.target.value }))}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid #bae6fd', fontSize: '0.75rem', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="checkbox" checked={newEtapa.isFinal} onChange={e => setNewEtapa(prev => ({ ...prev, isFinal: e.target.checked }))} id="isFinal" />
                          <label htmlFor="isFinal" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Etapa Final (F)</label>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={() => handleAddEtapa(g.id, g.processo)}
                          style={{ padding: '7px 16px', background: '#0369a1', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                          ✓ Salvar Etapa
                        </button>
                        <button onClick={() => { setAddingTo(null); setNewEtapa(emptyEtapa()); }}
                          style={{ padding: '7px 14px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setAddingTo(g.id); setNewEtapa(emptyEtapa()); }}
                        style={{ padding: '6px 14px', background: 'white', border: `1px solid ${ec.color}`, color: ec.color, borderRadius: 8, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ➕ Adicionar Etapa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats rodapé */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 8 }}>
        {Object.entries(EIXO_COLORS).map(([eixo, ec]) => {
          const count = GRUPOS_PROCESSOS.filter(g => g.eixo === eixo).length;
          const label = eixo.split(' — ')[1];
          return (
            <div key={eixo} style={{ padding: '12px 16px', borderRadius: 12, background: ec.bg, border: `1px solid ${ec.border}` }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: ec.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: ec.color, marginTop: 4 }}>{count}</div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 2 }}>processos mapeados</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
