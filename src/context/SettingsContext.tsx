'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PARAMETROS_DEFAULT } from '@/lib/calculators';
import { NormaReferencia, NORMAS_INICIAIS } from '@/lib/normas';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Settings {
  ufp_valor: number;
  tarifa_media: number;
  ipca_anual: number;
  juros_mensal: number;
  margem_ebitda: number;
  ica_cobertura: number;
  ice_cobertura: number;
  ipd: number;
  portaria_ref: string;
  resolucao_ref: string;
  normas: NormaReferencia[];
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const INITIAL_SETTINGS: Settings = {
  ufp_valor: PARAMETROS_DEFAULT.UFP_SE_VALOR,
  tarifa_media: PARAMETROS_DEFAULT.TARIFA_MEDIA,
  ipca_anual: PARAMETROS_DEFAULT.IPCA_ANUAL,
  juros_mensal: PARAMETROS_DEFAULT.JUROS_MORA_MENSAL,
  margem_ebitda: PARAMETROS_DEFAULT.MARGEM_EBITDA,
  ica_cobertura: PARAMETROS_DEFAULT.ICA_COBERTURA_AGUA,
  ice_cobertura: PARAMETROS_DEFAULT.ICE_COBERTURA_ESGOTO,
  ipd: PARAMETROS_DEFAULT.IPD_PADRAO,
  portaria_ref: 'Portaria SEFAZ-SE nº 86/2026',
  resolucao_ref: 'AGRESE 96/2025',
  normas: NORMAS_INICIAIS,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      // 1. Carregar local como base
      const saved = localStorage.getItem('spd_settings');
      let currentSettings = INITIAL_SETTINGS;
      
      if (saved) {
        try {
          currentSettings = { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
        } catch (e) {}
      }

      // 2. Tentar sincronizar com Supabase para parâmetros globais
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('parametros_sistema')
            .select('chave, valor');

          if (data && !error) {
            const supabaseMap: Record<string, any> = {};
            data.forEach(item => {
              const val = parseFloat(item.valor);
              if (!isNaN(val)) {
                if (item.chave === 'UFP_SE_VALOR') supabaseMap.ufp_valor = val;
                if (item.chave === 'TARIFA_MEDIA') supabaseMap.tarifa_media = val;
                if (item.chave === 'IPCA_ANUAL') supabaseMap.ipca_anual = val;
                if (item.chave === 'JUROS_MORA_MENSAL') supabaseMap.juros_mensal = val;
                if (item.chave === 'MARGEM_EBITDA') supabaseMap.margem_ebitda = val;
              }
            });
            currentSettings = { ...currentSettings, ...supabaseMap };
          }
        } catch (err) {
          console.warn("Supabase sync failed, using local/defaults.");
        }
      }

      setSettings(currentSettings);
      setIsLoaded(true);
    }

    loadSettings();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('spd_settings', JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
