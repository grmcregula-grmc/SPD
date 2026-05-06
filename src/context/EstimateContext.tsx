'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ClassificacaoEstimate =
  | 'Penalidade de Fato'
  | 'Alto Risco de Penalização'
  | 'Risco Moderado de Penalização'
  | 'Baixo Risco de Penalização'
  // legacy — mantidos para compatibilidade com dados já salvos em localStorage
  | 'De Fato'
  | 'Potencial Alta'
  | 'Potencial Moderada'
  | 'Informativo'
  | 'Outros';

export interface SavedEstimate {
  id: string;
  source: 'AGRESE' | 'EQUACAO_D' | 'COMBINACAO_PENALIDADES' | 'MANUAL';
  contract?: 'CPA' | 'CI' | 'Lei 6.661/2009';
  titulo: string;
  descricao: string;
  valor: number;
  data: string;
  detalhes: { label: string; clause: string; value: number }[];
  classificacao?: ClassificacaoEstimate;
  identificador?: string;
  nomeCustom?: string;
  descricaoCustom?: string;
  image?: string;
}

export interface DraftProcess {
  id_doc: string;
  solicitante: string;
  assunto: string;
  data_recebimento: string;
  prazo_externo: string;
  data_final?: string;
  atraso_dias: number;
  infracao_sugerida: string;
  contexto: string;
}

interface EstimateContextType {
  history: SavedEstimate[];
  addToHistory: (estimate: Omit<SavedEstimate, 'id' | 'data'>) => void;
  removeFromHistory: (id: string) => void;

  consolidated: SavedEstimate[];
  addToConsolidated: (estimate: SavedEstimate) => void;
  removeFromConsolidated: (id: string) => void;
  clearConsolidated: () => void;
  updateClassificacao: (id: string, classificacao: ClassificacaoEstimate) => void;
  updateOcorrencia: (id: string, fields: Partial<Pick<SavedEstimate, 'identificador' | 'nomeCustom' | 'descricaoCustom' | 'classificacao' | 'data' | 'valor'>>) => void;

  draftProcess: DraftProcess | null;
  setDraftProcess: (draft: DraftProcess | null) => void;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export function EstimateProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<SavedEstimate[]>([]);
  const [consolidated, setConsolidated] = useState<SavedEstimate[]>([]);
  const [draftProcess, setDraftProcess] = useState<DraftProcess | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('spd_history');
    const savedConsolidated = localStorage.getItem('spd_consolidated');

    const legacyEstimates = localStorage.getItem('spd_estimates');
    if (legacyEstimates && !savedHistory && !savedConsolidated) {
      try {
        const parsed = JSON.parse(legacyEstimates);
        setConsolidated(parsed);
      } catch (e) {
        console.error('Erro ao carregar estimativas legadas', e);
      }
    } else {
      if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
      }
      if (savedConsolidated) {
        try { setConsolidated(JSON.parse(savedConsolidated)); } catch (e) {}
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('spd_history', JSON.stringify(history));
      localStorage.setItem('spd_consolidated', JSON.stringify(consolidated));
    }
  }, [history, consolidated, isLoaded]);

  const addToHistory = (estimate: Omit<SavedEstimate, 'id' | 'data'>) => {
    const newEstimate: SavedEstimate = {
      ...estimate,
      id: `EST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      data: new Date().toISOString(),
    };
    setHistory(prev => {
      const sourceItems = prev.filter(e => e.source === estimate.source);
      const otherItems = prev.filter(e => e.source !== estimate.source);
      const newSourceItems = [newEstimate, ...sourceItems];
      if (newSourceItems.length > 1000) newSourceItems.splice(1000);
      return [...newSourceItems, ...otherItems].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  };

  const addToConsolidated = (estimate: SavedEstimate) => {
    setConsolidated(prev => {
      if (prev.find(e => e.id === estimate.id)) return prev;
      return [{ ...estimate, classificacao: estimate.classificacao || 'De Fato' }, ...prev];
    });
  };

  const removeFromConsolidated = (id: string) => {
    setConsolidated(prev => prev.filter(e => e.id !== id));
  };

  const clearConsolidated = () => {
    setConsolidated([]);
  };

  const updateClassificacao = (id: string, classificacao: ClassificacaoEstimate) => {
    setHistory(prev => prev.map(e => e.id === id ? { ...e, classificacao } : e));
    setConsolidated(prev => prev.map(e => e.id === id ? { ...e, classificacao } : e));
  };

  const updateOcorrencia = (id: string, fields: Partial<Pick<SavedEstimate, 'identificador' | 'nomeCustom' | 'descricaoCustom' | 'classificacao' | 'data' | 'valor'>>) => {
    setHistory(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
    setConsolidated(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
  };

  return (
    <EstimateContext.Provider value={{
      history, addToHistory, removeFromHistory,
      consolidated, addToConsolidated, removeFromConsolidated, clearConsolidated,
      updateClassificacao, updateOcorrencia,
      draftProcess, setDraftProcess,
    }}>
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimates() {
  const context = useContext(EstimateContext);
  if (context === undefined) {
    throw new Error('useEstimates must be used within an EstimateProvider');
  }
  return context;
}
