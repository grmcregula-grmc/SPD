'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LogoDESO, BrandLines } from '@/components/ui';

const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });
const SimuladorAGRESE = dynamic(() => import('@/components/SimuladorAGRESE'), { ssr: false });
const SimuladorEquacaoD = dynamic(() => import('@/components/SimuladorEquacaoD'), { ssr: false });
const SimuladorCombinacao = dynamic(() => import('@/components/SimuladorCombinacao'), { ssr: false });
const MatrizRiscos = dynamic(() => import('@/components/MatrizRiscos'), { ssr: false });
const Configuracoes = dynamic(() => import('@/components/Configuracoes'), { ssr: false });
const FormularioRevisao = dynamic(() => import('@/components/FormularioRevisao'), { ssr: false });
const Auth = dynamic(() => import('@/components/Auth'), { ssr: false });

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useSettings } from '@/context/SettingsContext';

type Modulo = 'dashboard' | 'agrese' | 'equacaod' | 'combinacao' | 'matriz' | 'config';

const modulos = [
  { id: 'dashboard' as Modulo, icon: '🏠', label: 'Dashboard', desc: 'Visão Geral', cor: '#3b82f6' },
  { id: 'agrese' as Modulo, icon: '⚖️', label: 'Multa AGRESE', desc: 'CPA Cláusula 22', cor: '#ef4444' },
  { id: 'equacaod' as Modulo, icon: '💧', label: 'Equação D', desc: 'CI Cláusula 11.2', cor: '#06b6d4' },
  { id: 'combinacao' as Modulo, icon: '⚡', label: 'Combinação de Penalidades', desc: 'Infrações Combinadas', cor: '#8b5cf6' },
  { id: 'matriz' as Modulo, icon: '📊', label: 'Matriz de Riscos', desc: 'CPA / CI / Processos', cor: '#10b981' },
  { id: 'config' as Modulo, icon: '⚙️', label: 'Configurações', desc: 'Parâmetros Globais', cor: '#64748b' },
];

const titulos: Record<Modulo, { titulo: string; subtitulo: string }> = {
  dashboard: { titulo: 'Dashboard de Compliance', subtitulo: 'Parâmetros vigentes, simulações de referência e rito processual' },
  agrese: { titulo: 'Simulador de Multa AGRESE', subtitulo: 'Dosimetria contratual com agravantes e atenuantes — CPA Cláusula 22' },
  equacaod: { titulo: 'Equação D — Lucros Cessantes', subtitulo: 'Cálculo algorítmico do desconto por volume não fornecido — CI Cláusula 11.2' },
  combinacao: { titulo: 'Combinação de Penalidades', subtitulo: 'Superposição de sanções simultâneas de múltiplos instrumentos contratuais' },
  matriz: { titulo: 'Matriz de Riscos e Penalidades', subtitulo: 'Alocação de riscos CPA, sanções CI, instrumentos e controle de processos' },
  config: { titulo: 'Configurações de Parâmetros', subtitulo: 'Ajuste de UFP/SE, tarifas e índices contratuais dinâmicos' },
};

export default function Home() {
  const [moduloAtivo, setModuloAtivo] = useState<Modulo>('dashboard');
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    // Verificar conectividade real
    import('@/lib/supabase').then(({ checkSupabaseConnection }) => {
      checkSupabaseConnection().then(setIsOnline);
    });

    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(err => console.warn("Erro ao inicializar sessão:", err));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { titulo, subtitulo } = titulos[moduloAtivo];

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="app-sidebar" style={{ width: sidebarAberta ? 240 : 68, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="hide-on-mobile" style={{ padding: sidebarAberta ? '24px 20px 20px' : '24px 10px 20px', borderBottom: '1px solid rgba(59,130,246,0.1)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sidebarAberta ? <LogoDESO size={40} /> : <div style={{ padding: '0 4px' }}><svg width="32" height="32" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="var(--brand-blue)" /><circle cx="50" cy="50" r="41" stroke="var(--brand-green)" strokeWidth="6" /></svg></div>}
          {sidebarAberta && <BrandLines />}
        </div>
        <nav style={{ flex: 1, padding: '16px 10px' }}>
          <div className="app-sidebar-nav-container" style={{ marginBottom: 8 }}>
            {sidebarAberta && <div className="hide-on-mobile" style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 6px', marginBottom: 8 }}>Módulos</div>}
            {modulos.map((m) => {
              const ativo = moduloAtivo === m.id;
              return (
                <button key={m.id} onClick={() => setModuloAtivo(m.id)} title={!sidebarAberta ? m.label : undefined} style={{ display: 'flex', alignItems: 'center', gap: sidebarAberta ? 10 : 0, justifyContent: sidebarAberta ? 'flex-start' : 'center', padding: sidebarAberta ? '10px 12px' : '10px', borderRadius: 10, cursor: 'pointer', width: '100%', marginBottom: 4, background: ativo ? `${m.cor}18` : 'transparent', border: `1px solid ${ativo ? `${m.cor}40` : 'transparent'}`, color: ativo ? m.cor : 'var(--text-secondary)', transition: 'all 0.2s ease', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{m.icon}</span>
                  {sidebarAberta && <div><div style={{ fontSize: '0.82rem', fontWeight: ativo ? 700 : 500, color: ativo ? m.cor : 'var(--text-primary)', lineHeight: 1.1 }}>{m.label}</div><div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>{m.desc}</div></div>}
                </button>
              );
            })}
          </div>
        </nav>
        <div className="hide-on-mobile" style={{ padding: '12px 10px', borderTop: '1px solid rgba(59,130,246,0.1)' }}>
          {sidebarAberta ? (
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 3 }}>UFP/SE Vigente</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#60a5fa', fontSize: '0.95rem' }}>R$ {settings.ufp_valor.toFixed(2).replace('.', ',')}</div>
            </div>
          ) : null}
          <button onClick={() => setSidebarAberta(!sidebarAberta)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{sidebarAberta ? '◀ Recolher' : '▶'}</button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="app-header" style={{ background: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid var(--border-primary)', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{titulo}</h1><p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitulo}</p></div>
          <div className="app-header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', border: `1px solid ${isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)'}` }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? '#10b981' : '#64748b', boxShadow: isOnline ? '0 0 6px #10b981' : 'none' }} /><span style={{ fontSize: '0.72rem', fontWeight: 600, color: isOnline ? '#34d399' : '#94a3b8' }}>Sistema {isOnline ? 'Online' : 'Local (Guest)'}</span></div>
          </div>
        </header>
        <main className="app-main" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {moduloAtivo === 'dashboard' && <Dashboard onNavigate={(mod) => setModuloAtivo(mod as any)} />}
          {moduloAtivo === 'agrese' && <SimuladorAGRESE />}
          {moduloAtivo === 'equacaod' && <SimuladorEquacaoD />}
          {moduloAtivo === 'combinacao' && <SimuladorCombinacao />}
          {moduloAtivo === 'matriz' && <MatrizRiscos />}
          {moduloAtivo === 'config' && (session ? <Configuracoes /> : <Auth />)}
        </main>
        <footer style={{ padding: '12px 32px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SPD — Simulador de Penalidades DESO | AGRESE • CPA • CI • {settings.portaria_ref}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>UFP/SE: <span style={{ color: '#60a5fa', fontWeight: 600, fontFamily: 'monospace' }}>R$ {settings.ufp_valor.toFixed(2).replace('.', ',')}</span> • Res. <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{settings.resolucao_ref}</span></div>
        </footer>
      </div>
    </div>
  );
}
