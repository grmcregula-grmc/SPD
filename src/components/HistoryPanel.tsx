'use client';

import React from 'react';
import { useEstimates, SavedEstimate } from '@/context/EstimateContext';
import { generatePDFReport } from '@/lib/reports';
import { formatBRL } from '@/lib/calculators';

interface HistoryPanelProps {
  source: SavedEstimate['source'];
}

export function HistoryPanel({ source }: HistoryPanelProps) {
  const { history, removeFromHistory } = useEstimates();

  const myHistory = history.filter(e => e.source === source);

  if (myHistory.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: 24, marginTop: 24, border: '1px solid var(--border-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>⏱️ Histórico Recente</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Últimas 10 estimativas geradas nesta aba</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {myHistory.map((est) => (
          <div 
            key={est.id} 
            style={{ 
              background: 'var(--bg-secondary)', 
              padding: 16, 
              borderRadius: 12, 
              border: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--brand-blue)', textTransform: 'uppercase', background: 'white', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--brand-blue)20' }}>
                {new Date(est.data).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatBRL(est.valor)}
              </span>
            </div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{est.titulo}</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{est.descricao}</p>
            
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
              <button 
                onClick={() => {
                  generatePDFReport({
                    titulo: 'Relatório de Estimativa de Penalidade',
                    subtitulo: est.descricao,
                    total: est.valor,
                    detalhes: est.detalhes,
                    identificador: est.id
                  });
                }}
                className="btn-ghost"
                style={{ flex: 1, padding: '6px 0', fontSize: '0.7rem', color: '#10b981', borderColor: '#10b98140' }}
              >
                📄 PDF
              </button>
              <button 
                onClick={() => removeFromHistory(est.id)}
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: '0.7rem', color: '#ef4444', borderColor: '#ef444440' }}
                title="Excluir do histórico"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
