'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { LogoDESO, BrandLines } from '@/components/ui';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ 
    type: isSupabaseConfigured ? '' : 'warning', 
    text: isSupabaseConfigured ? '' : 'Acesso administrativo desativado: O sistema está operando em modo Local (Guest) sem conexão com o banco de dados.' 
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Verifique seu e-mail para confirmar o cadastro!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorText = 'Erro ao processar solicitação';
      
      if (error.name === 'AuthRetryableFetchError' || error.message?.includes('fetch')) {
        errorText = 'Falha de conexão com o servidor. Verifique sua internet ou as configurações do banco de dados.';
      } else if (error.message) {
        errorText = error.message;
      } else if (typeof error === 'object') {
        errorText = JSON.stringify(error) === '{}' ? 'Erro de rede ou conexão recusada' : JSON.stringify(error);
      }

      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-secondary)',
      padding: 20 
    }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: 420, 
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <LogoDESO size={60} />
          <div style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: 4 }}>
              Sistema SPD
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Simulador de Penalidades da DESO
            </p>
          </div>
        </div>

        <BrandLines />

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="spd-label">E-mail Institucional</label>
            <input
              type="email"
              className="spd-input"
              placeholder="seu.nome@deso-se.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="spd-label">Senha de Acesso</label>
            <input
              type="password"
              className="spd-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message.text && (
            <div style={{ 
              padding: '12px', 
              borderRadius: 8, 
              fontSize: '0.8rem',
              background: message.type === 'error' ? '#fef2f2' : (message.type === 'warning' ? '#fffbeb' : '#f0fdf4'),
              color: message.type === 'error' ? '#dc2626' : (message.type === 'warning' ? '#b45309' : '#16a34a'),
              border: `1px solid ${message.type === 'error' ? '#fecaca' : (message.type === 'warning' ? '#fef3c7' : '#bbf7d0')}`,
              textAlign: 'center'
            }}>
              {message.text}
            </div>
          )}

          <button 
            className="btn-primary" 
            type="submit" 
            disabled={loading || !isSupabaseConfigured}
            style={{ 
              padding: '12px', 
              fontSize: '1rem',
              opacity: !isSupabaseConfigured ? 0.6 : 1,
              cursor: !isSupabaseConfigured ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '0.82rem', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Já possui conta? Faça Login' : 'Primeiro acesso? Solicite cadastro'}
          </button>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          Ambiente restrito • Resolução AGRESE 96/2025
        </div>
      </div>
    </div>
  );
}
