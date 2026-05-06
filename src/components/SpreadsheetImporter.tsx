'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useEstimates, DraftProcess } from '@/context/EstimateContext';
import { formatBRL } from '@/lib/calculators';
import { Search, RefreshCw, AlertTriangle, ArrowRight, Table, ExternalLink } from 'lucide-react';

interface SpreadsheetImporterProps {
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const SPREADSHEET_ID = '1lpMNjbnabICjblaGYCThDUN6lzCvJ7okDYUrUUdzSFo';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=PROCESSOS`;

export default function SpreadsheetImporter({ onClose, onNavigate }: SpreadsheetImporterProps) {
  const { setDraftProcess, addToConsolidated } = useEstimates();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(CSV_URL);
      const text = await response.text();
      
      // Simple CSV Parser for Google Sheets output
      const rows = text.split('\n').map(row => {
        // Handle quoted values with commas
        const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        return matches ? matches.map(m => m.replace(/^"|"$/g, '')) : [];
      });

      // Filter rows that look like data (starting after headers)
      // The browser analysis showed headers at row 4, data starts row 5.
      // But CSV output via gviz usually starts at the first row of data or has its own header.
      // We'll look for rows that have a document number in the first column (A)
      const parsedData = rows.filter(r => r.length > 5 && r[0] !== 'Nº Doc' && r[0] !== '');
      
      setData(parsedData);
    } catch (err) {
      console.error('Erro ao buscar planilha:', err);
      setError('Não foi possível conectar à planilha. Verifique sua conexão ou se o link está correto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(r => 
      r[0]?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r[1]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r[2]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const calculateAtraso = (prazoStr: string, finalStr: string) => {
    if (!prazoStr) return 0;
    
    const parseDate = (d: string) => {
      if (!d) return null;
      const parts = d.split('/');
      if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      return null;
    };

    const prazo = parseDate(prazoStr);
    const final = parseDate(finalStr) || new Date(); // Use today if not finished

    if (prazo && final > prazo) {
      const diffTime = Math.abs(final.getTime() - prazo.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };


  const handleImportToManagement = (row: any) => {
    const prazoExterno = row[7];
    const dataFinal = row[15];
    const atraso = calculateAtraso(prazoExterno, dataFinal);

    addToConsolidated({
      id: `REAL-IM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: 'MANUAL',
      titulo: row[1],
      descricao: row[12] || 'Importado da planilha via Painel.',
      valor: 0,
      data: new Date().toISOString(),
      detalhes: [
        { label: 'Infração Sugerida', clause: row[11] || 'Omissão/Atraso', value: 0 },
        { label: 'Atraso Calculado (Dias)', clause: 'Prazo Limite', value: atraso }
      ],
      identificador: row[0],
      classificacao: 'De Fato'
    });

    onNavigate('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Table className="w-6 h-6 text-blue-600" />
              Busca em Planilha GRMC (Tempo Real)
            </h2>
            <p className="text-sm text-slate-500">Selecione um processo para simular penalidades no SPD</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
              title="Atualizar dados da planilha"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold text-2xl px-2"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar por Nº Doc, Assunto ou Solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <RefreshCw className="w-12 h-12 animate-spin" />
              <p className="font-semibold">Sincronizando com Google Sheets...</p>
            </div>
          )}

          {error && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-red-500 gap-4">
              <AlertTriangle className="w-12 h-12" />
              <p className="font-bold">{error}</p>
              <button onClick={fetchData} className="px-6 py-2 bg-red-100 rounded-xl hover:bg-red-200 transition-all">Tentar Novamente</button>
            </div>
          )}

          {!loading && !error && filteredData.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
              <Search className="w-12 h-12 mb-4" />
              <p className="font-semibold">Nenhum processo encontrado para "{searchTerm}"</p>
            </div>
          )}

          {!loading && !error && filteredData.length > 0 && (
            <div className="space-y-3">
              {filteredData.map((row, idx) => {
                const atraso = calculateAtraso(row[7], row[15]);
                return (
                  <div key={idx} className="group p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black uppercase tracking-wider">
                          {row[0]}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                          {row[2]}
                        </span>
                      </div>
                      {atraso > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-black animate-pulse">
                          ⚠️ {atraso} DIAS DE ATRASO
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{row[1]}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{row[11] || 'Sem infração descrita na planilha'}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => handleImportToManagement(row)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                      >
                        IMPORTAR PARA GESTÃO ATIVA <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <a 
            href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-400 hover:text-blue-500 flex items-center justify-center gap-1 transition-colors"
          >
            ABRIR PLANILHA ORIGINAL <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
