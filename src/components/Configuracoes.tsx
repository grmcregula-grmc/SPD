'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';

export default function Configuracoes() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [normaSearch, setNormaSearch] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNorma, setEditingNorma] = useState<any>(null);

  const filteredNormas = useMemo(() => {
    const s = normaSearch.toLowerCase();
    return (settings.normas || []).filter(n => 
      n.titulo.toLowerCase().includes(s) || 
      n.categoria.toLowerCase().includes(s)
    );
  }, [settings.normas, normaSearch]);

  const triggerSaveFeedback = (msg = 'Alterações salvas com sucesso! ✨') => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const persistToSupabase = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { chave: 'UFP_SE_VALOR', valor: settings.ufp_valor.toString() },
        { chave: 'TARIFA_MEDIA', valor: settings.tarifa_media.toString() },
        { chave: 'IPCA_ANUAL', valor: settings.ipca_anual.toString() },
        { chave: 'JUROS_MORA_MENSAL', valor: settings.juros_mensal.toString() },
        { chave: 'MARGEM_EBITDA', valor: settings.margem_ebitda.toString() },
      ];

      for (const item of updates) {
        await supabase
          .from('parametros_sistema')
          .update({ valor: item.valor })
          .eq('chave', item.chave);
      }
      
      triggerSaveFeedback('Configurações salvas no Banco de Dados! 🚀');
    } catch (err) {
      console.error("Erro ao salvar no Supabase", err);
      triggerSaveFeedback('Salvo apenas localmente (Erro no DB).');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNorma = (e: React.FormEvent) => {
    e.preventDefault();
    const novas = [...settings.normas];
    if (editingNorma.id.startsWith('new-')) {
      const nova = { ...editingNorma, id: `norma-${Date.now()}` };
      updateSettings({ normas: [nova, ...settings.normas] });
    } else {
      const idx = novas.findIndex(n => n.id === editingNorma.id);
      if (idx !== -1) {
        novas[idx] = editingNorma;
        updateSettings({ normas: novas });
      }
    }
    setIsModalOpen(false);
    triggerSaveFeedback();
  };

  const openAddModal = () => {
    setEditingNorma({
      id: `new-${Date.now()}`,
      titulo: '',
      link: '',
      categoria: 'ABNT',
      versao: '',
      ultimaAtualizacao: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (norma: any) => {
    setEditingNorma({ ...norma });
    setIsModalOpen(true);
  };

  const catColors: Record<string, string> = {
    'ANA': '#2563eb',
    'AGRESE': '#dc2626',
    'ABNT': '#059669',
    'CONTRATOS': '#7c3aed',
    'INTERNO': '#475569'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Feedback Toast */}
      {saveStatus && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
          padding: '12px 24px', background: '#10b981', color: 'white',
          borderRadius: 12, fontWeight: 700, boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {saveStatus}
        </div>
      )}

      {/* Modal Editor de Norma */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 600, padding: 32, background: 'white' }}>
            <h3 style={{ marginBottom: 24, fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-blue)' }}>
              {editingNorma.id.startsWith('new-') ? '➕ Adicionar Nova Referência' : '✏️ Editar Referência Normativa'}
            </h3>
            
            <form onSubmit={handleSaveNorma} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label className="spd-label">Título da Norma/Portaria</label>
                <input 
                  required
                  className="spd-input" 
                  value={editingNorma.titulo}
                  onChange={e => setEditingNorma({ ...editingNorma, titulo: e.target.value })}
                  placeholder="Ex: ABNT NBR ISO 31000..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="input-group">
                  <label className="spd-label">Categoria</label>
                  <select 
                    className="spd-input"
                    value={editingNorma.categoria}
                    onChange={e => setEditingNorma({ ...editingNorma, categoria: e.target.value as any })}
                  >
                    {Object.keys(catColors).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="spd-label">Versão/Edição</label>
                  <input 
                    className="spd-input"
                    value={editingNorma.versao}
                    onChange={e => setEditingNorma({ ...editingNorma, versao: e.target.value })}
                    placeholder="Ex: 2018"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="spd-label">Link do Documento (PDF/Drive)</label>
                <input 
                  required
                  className="spd-input"
                  value={editingNorma.link}
                  onChange={e => setEditingNorma({ ...editingNorma, link: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="input-group">
                <label className="spd-label">Última Atualização</label>
                <input 
                  type="date"
                  className="spd-input"
                  value={editingNorma.ultimaAtualizacao}
                  onChange={e => setEditingNorma({ ...editingNorma, ultimaAtualizacao: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Salvar Referência</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="spd-button" style={{ flex: 1, border: '1px solid #e2e8f0' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: 32 }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-blue)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.6rem' }}>⚙️</span> Parâmetros Regulatórios Ativos
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {/* UFP/SE */}
          <div className="input-group">
            <label className="spd-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Valor da UFP/SE 
              <span style={{ fontSize: '0.65rem', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: 4 }}>Vigência Trimestral</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, opacity: 0.5 }}>R$</span>
              <input 
                type="number" 
                className="spd-input" 
                style={{ paddingLeft: 36 }}
                value={settings.ufp_valor}
                onChange={(e) => updateSettings({ ufp_valor: parseFloat(e.target.value) })}
                step="0.01"
              />
            </div>
          </div>

          {/* Tarifa Média */}
          <div className="input-group">
            <label className="spd-label">Tarifa Média de Referência (TM)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, opacity: 0.5 }}>R$</span>
              <input 
                type="number" 
                className="spd-input" 
                style={{ paddingLeft: 36 }}
                value={settings.tarifa_media}
                onChange={(e) => updateSettings({ tarifa_media: parseFloat(e.target.value) })}
                step="0.01"
              />
            </div>
          </div>

          {/* EBITDA */}
          <div className="input-group">
            <label className="spd-label">Margem EBITDA Contratual (ME)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, opacity: 0.5 }}>%</span>
              <input 
                type="number" 
                className="spd-input" 
                value={settings.margem_ebitda}
                onChange={(e) => updateSettings({ margem_ebitda: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 16, borderTop: '1px solid var(--border-primary)', paddingTop: 32 }}>
          <button 
            disabled={isSaving}
            className="spd-button" 
            style={{ background: 'var(--brand-blue)', color: 'white', padding: '12px 32px', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(59,130,246,0.2)', opacity: isSaving ? 0.7 : 1 }}
            onClick={persistToSupabase}
          >
            {isSaving ? 'Salvando...' : '✓ Aplicar Todas as Mudanças'}
          </button>
          <button 
            className="spd-button" 
            style={{ background: 'transparent', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
            onClick={() => {
              if(confirm('Isso restaurará os valores originais. Continuar?')) resetSettings();
            }}
          >
            Restaurar Padrões
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: '1.6rem' }}>📚</span> Repositório Normativo & Portarias
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Base legal dinâmica para fundamentação de notificações e auditorias.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input 
                placeholder="Pesquisar norma..." 
                className="spd-input"
                style={{ paddingLeft: 40, background: 'rgba(255,255,255,0.8)' }}
                value={normaSearch}
                onChange={e => setNormaSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={openAddModal}
              className="spd-button"
              style={{ background: 'var(--brand-blue)', color: 'white', whiteSpace: 'nowrap', padding: '0 24px', fontWeight: 800 }}
            >
              + Adicionar Referência
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
          {filteredNormas.map((norma) => (
            <div 
              key={norma.id} 
              className="glass-card" 
              style={{ 
                padding: 20, background: 'white', border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ 
                  padding: '6px 14px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 900,
                  background: (catColors[norma.categoria] || '#64748b') + '15', color: catColors[norma.categoria] || '#64748b',
                  border: `2px solid ${(catColors[norma.categoria] || '#64748b')}30`,
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {norma.categoria}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEditModal(norma)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>✏️</button>
                  <button onClick={() => {
                    if (confirm('Excluir esta referência?')) {
                      updateSettings({ normas: settings.normas.filter(n => n.id !== norma.id) });
                    }
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>🗑️</button>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.4 }}>{norma.titulo}</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>VERSÃO: {norma.versao || 'N/A'}</span>
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>ATU: {norma.ultimaAtualizacao}</span>
                </div>
                <button 
                  onClick={() => window.open(norma.link, '_blank')}
                  className="spd-button"
                  style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--brand-blue)', padding: '6px 12px', fontSize: '0.75rem', border: 'none' }}
                >
                  Acessar Documento ↗
                </button>
              </div>
            </div>
          ))}

          {filteredNormas.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', opacity: 0.5 }}>
              Nenhuma referência encontrada para "{normaSearch}".
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 24, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', borderRadius: 20, border: '1px solid rgba(59,130,246,0.2)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-blue)', marginBottom: 12 }}>🛡️ Governança de Dados Regulatórios</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 800 }}>
          Este painel centraliza as variáveis críticas dos contratos <b>CPA</b> e <b>CI</b>. 
          A alteração da UFP/SE ou da Tarifa Média (TM) impacta em tempo real os simuladores de penalidades e recomposição financeira. 
          Mantenha as referências normativas atualizadas para garantir a validade jurídica das notificações geradas.
        </p>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
