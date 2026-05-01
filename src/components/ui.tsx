'use client';

import React from 'react';
import { formatBRL, getRiskLevel } from '@/lib/calculators';

interface StatCardProps {
  label?: string;
  title?: string;
  value: number | string;
  isCurrency?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function StatCard({ label, title, value, isCurrency = false, icon, subtitle, variant = 'default', size = 'md', color: customColor }: StatCardProps) {
  const colors = {
    default: { border: 'var(--border-primary)', glow: 'var(--brand-blue-glow)', text: 'var(--brand-blue)' },
    primary: { border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
    danger: { border: 'rgba(239,68,68,0.3)', glow: 'rgba(239,68,68,0.15)', text: '#f87171' },
    success: { border: 'rgba(16, 185, 129, 0.3)', glow: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
    warning: { border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  };
  const c = (colors[variant as keyof typeof colors] || colors.default) as { border: string; glow: string; text: string };

  const displayValue = isCurrency && typeof value === 'number' ? formatBRL(value) : value;
  const finalLabel = title || label || '';

  return (
    <div
      style={{
        background: `var(--bg-card)`,
        border: `1px solid ${customColor ? `${customColor}40` : c.border}`,
        borderRadius: 20,
        padding: size === 'lg' ? '24px' : size === 'sm' ? '12px 16px' : '18px 20px',
        boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="group hover:scale-[1.02] hover:shadow-xl transition-all"
    >
      {customColor && (
        <div style={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 80, 
          height: 80, 
          background: customColor, 
          opacity: 0.05, 
          borderRadius: '50%',
          filter: 'blur(20px)'
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400" style={{ flex: 1 }}>{finalLabel}</span>
        {icon && <span style={{ color: customColor || c.text, opacity: 0.8 }}>{icon}</span>}
      </div>
      <div
        className="mono"
        style={{
          fontSize: size === 'lg' ? '2rem' : size === 'sm' ? '1.1rem' : '1.4rem',
          fontWeight: 800,
          color: customColor || c.text,
          lineHeight: 1,
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {displayValue}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 6, opacity: 0.8 }}>{subtitle}</div>
      )}
    </div>
  );
}

// ======= Breakdown Row =======
interface BreakdownRowProps {
  descricao: string;
  valor: number;
  tipo: 'base' | 'agravante' | 'atenuante' | 'mora' | 'final';
  percentual?: number;
}

export function BreakdownRow({ descricao, valor, tipo, percentual }: BreakdownRowProps) {
  const config = {
    base: { bg: 'rgba(59,130,246,0.08)', color: '#60a5fa', prefix: '' },
    agravante: { bg: 'rgba(239,68,68,0.08)', color: '#f87171', prefix: '+' },
    atenuante: { bg: 'rgba(16,185,129,0.08)', color: '#34d399', prefix: '-' },
    mora: { bg: 'rgba(245,158,11,0.08)', color: '#fbbf24', prefix: '+' },
    final: { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa', prefix: '' },
  };
  const c = config[tipo];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 10,
        background: c.bg,
        marginBottom: 4,
        border: tipo === 'final' ? '1px solid var(--border-primary)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {percentual !== undefined && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: c.color,
              background: `${c.bg}`,
              border: `1px solid ${c.color}40`,
              borderRadius: 4,
              padding: '1px 6px',
              minWidth: 40,
              textAlign: 'center',
            }}
          >
            {c.prefix}{Math.abs(percentual)}%
          </span>
        )}
        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: tipo === 'final' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {descricao}
        </span>
      </div>
      <span
        className="mono"
        style={{
          fontSize: tipo === 'final' ? '0.95rem' : '0.85rem',
          fontWeight: tipo === 'final' ? 700 : 600,
          color: c.color,
          whiteSpace: 'nowrap',
        }}
      >
        {valor < 0 ? '-' : c.prefix}{formatBRL(Math.abs(valor))}
      </span>
    </div>
  );
}

// ======= Risk Alert =======
interface RiskAlertProps {
  value: number;
  label?: string;
}

export function RiskAlert({ value, label }: RiskAlertProps) {
  const risk = getRiskLevel(value);
  const messages = {
    CRÍTICO: 'Ação imediata obrigatória. Risco de comprometimento severo do fluxo de caixa.',
    ALTO: 'Atenção urgente necessária. Considere estratégias de mitigação.',
    MÉDIO: 'Monitoramento contínuo recomendado. Avalie medidas preventivas.',
    BAIXO: 'Risco gerenciável. Mantenha conformidade preventiva.',
  };

  return (
    <div
      style={{
        background: risk.bg,
        border: `1px solid ${risk.color}40`,
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginTop: 8,
      }}
      className={risk.label === 'CRÍTICO' ? 'animate-pulse-glow' : ''}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: `${risk.color}20`,
          border: `2px solid ${risk.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '1rem',
        }}
      >
        {risk.label === 'CRÍTICO' ? '🚨' : risk.label === 'ALTO' ? '⚠️' : risk.label === 'MÉDIO' ? '📊' : '✅'}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: risk.color, letterSpacing: '0.1em' }}>
            NÍVEL DE RISCO: {risk.label}
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {label || messages[risk.label as keyof typeof messages]}
        </div>
      </div>
    </div>
  );
}

// ======= Section Header =======
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, badge, badgeColor = '#3b82f6', icon }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        {icon && (
          <div style={{ 
            color: badgeColor, 
            background: `${badgeColor}15`, 
            padding: 8, 
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
        )}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h2>
        {badge && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: badgeColor,
              background: `${badgeColor}15`,
              border: `1px solid ${badgeColor}30`,
              borderRadius: 20,
              padding: '2px 10px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500, maxWidth: '600px' }}>{subtitle}</p>
      )}
    </div>
  );
}

// ======= Param Input Row =======
interface ParamInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  tooltip?: string;
}

export function ParamInput({ label, value, onChange, min, max, step = 0.01, unit, tooltip }: ParamInputProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label className="spd-label" style={{ marginBottom: 0 }}>
          {label}
          {tooltip && (
            <span className="tooltip-trigger" style={{ marginLeft: 4, color: 'var(--text-muted)', cursor: 'help' }}>
              ⓘ
              <span className="tooltip-content">{tooltip}</span>
            </span>
          )}
        </label>
        <span
          className="mono"
          style={{ fontSize: '0.875rem', fontWeight: 600, color: '#60a5fa' }}
        >
          {value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}{unit || ''}
        </span>
      </div>
      <input
        type="number"
        className="spd-input"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

// ======= Logo DESO =======
export function LogoDESO({ size = 48 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="48" fill="var(--brand-blue)" />
        <circle cx="50" cy="50" r="42" stroke="var(--brand-green)" strokeWidth="4" />
        {/* Pipe/Faucet Icon */}
        <rect x="36" y="25" width="6" height="50" rx="1" fill="white" />
        <rect x="42" y="42" width="22" height="6" rx="1" fill="white" />
        <rect x="52" y="36" width="2" height="6" rx="1" fill="white" />
        <rect x="48" y="34" width="10" height="2" rx="0.5" fill="white" />
      </svg>
      <div>
        <div style={{ 
          fontSize: size * 0.42, 
          fontWeight: 900, 
          color: 'var(--brand-blue)', 
          fontStyle: 'italic',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          position: 'relative',
          background: 'none',
          padding: '2px 0'
        }}>
          DESO
          {/* Decorative Green Lines */}
          <div style={{ position: 'absolute', top: -2, left: 0, right: 0, height: 1.5, background: 'var(--brand-green)', opacity: 0.8 }}></div>
          <div style={{ position: 'absolute', top: 1, left: 0, right: 0, height: 1.5, background: 'var(--brand-green)', opacity: 0.8 }}></div>
          <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 1.5, background: 'var(--brand-green)', opacity: 0.8 }}></div>
          <div style={{ position: 'absolute', bottom: 1, left: 0, right: 0, height: 1.5, background: 'var(--brand-green)', opacity: 0.8 }}></div>
        </div>
        <div style={{ 
          fontSize: size * 0.1, 
          fontWeight: 800, 
          color: 'var(--brand-blue)', 
          textTransform: 'uppercase', 
          marginTop: 6,
          letterSpacing: '0.02em',
          opacity: 0.9
        }}>
          Companhia de Saneamento de Sergipe
        </div>
      </div>
    </div>
  );
}

// ======= Brand Decorative Lines =======
export function BrandLines() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <div style={{ height: 1, background: 'var(--brand-green)', opacity: 0.8 }}></div>
      <div style={{ height: 1.5, background: 'var(--brand-green)', opacity: 0.5 }}></div>
      <div style={{ height: 1, background: 'var(--brand-green)', opacity: 0.2 }}></div>
    </div>
  );
}

// ======= Cláusula Tag =======
export function ClausulaTag({ text }: { text: string }) {
  return (
    <span
      style={{
        fontSize: '0.68rem',
        color: '#94a3b8',
        background: 'rgba(148,163,184,0.08)',
        border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 4,
        padding: '1px 6px',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {text}
    </span>
  );
}

