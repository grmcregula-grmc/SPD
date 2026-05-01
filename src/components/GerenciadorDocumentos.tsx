'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Trash2, Check, X,
  FilePlus, AlertCircle
} from 'lucide-react';
import { documentosService, DocumentoProcesso, TipoDocumento, StatusRevisao } from '@/lib/documentosService';

export default function GerenciadorDocumentos({ processoId }: { processoId: string }) {
  const [documentos, setDocumentos] = useState<DocumentoProcesso[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoDocumento>('Entrada');

  useEffect(() => {
    setDocumentos([]); // Limpa lista imediatamente ao trocar de processo para evitar "vazamento" visual
    carregarDocumentos();
  }, [processoId]);

  const carregarDocumentos = async () => {
    try {
      const cleanId = processoId.trim(); // Garante que espaços não causem falha na filtragem
      const docs = await documentosService.listarDocumentos(cleanId);
      setDocumentos(docs);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Converter para base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const novoDoc: DocumentoProcesso = {
          id: crypto.randomUUID(),
          processoId,
          tipo: tipoSelecionado,
          nomeArquivo: file.name,
          tamanho: file.size,
          dataUpload: new Date().toISOString(),
          conteudoBase64: base64,
          statusRevisao: tipoSelecionado === 'Revisao' ? 'Pendente' : undefined
        };

        await documentosService.salvarDocumento(novoDoc);
        await carregarDocumentos();
      };
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Ocorreu um erro ao salvar o documento.");
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDownload = (doc: DocumentoProcesso) => {
    const link = document.createElement('a');
    link.href = doc.conteudoBase64;
    link.download = doc.nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este documento?")) {
      await documentosService.excluirDocumento(id);
      await carregarDocumentos();
    }
  };

  const handleAtualizarStatus = async (id: string, status: StatusRevisao) => {
    await documentosService.atualizarStatusRevisao(id, status);
    await carregarDocumentos();
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0066b3]" />
          Documentos do Processo
        </h4>
      </div>

      {/* Upload Area */}
      <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-black/20 rounded-lg border border-white/5">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-1">Tipo de Documento</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#0066b3]"
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value as TipoDocumento)}
          >
            <option value="Entrada" className="bg-slate-800">Entrada (Subsídios)</option>
            <option value="Saida" className="bg-slate-800">Saída (Entregáveis)</option>
            <option value="Revisao" className="bg-slate-800">Revisão (Propostas / Atualizações)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-1">Anexar PDF</label>
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button 
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 bg-[#0066b3] hover:bg-[#004d88] disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      {documentos.length === 0 ? (
        <div className="text-center py-6 text-gray-500 flex flex-col items-center">
          <FilePlus className="w-8 h-8 mb-2 opacity-50" />
          <p>Nenhum documento anexado a este processo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documentos.map(doc => (
            <div key={doc.id} className="flex flex-wrap md:flex-nowrap items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5 gap-4">
              <div className="flex items-start gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg shrink-0 ${
                  doc.tipo === 'Entrada' ? 'bg-blue-500/20 text-blue-400' :
                  doc.tipo === 'Saida' ? 'bg-green-500/20 text-green-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate" title={doc.nomeArquivo}>
                    {doc.nomeArquivo}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-semibold">{doc.tipo}</span>
                    <span>•</span>
                    <span>{formatarTamanho(doc.tamanho)}</span>
                    <span>•</span>
                    <span>{new Date(doc.dataUpload).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status e Ações */}
              <div className="flex items-center gap-3 shrink-0 ml-auto">
                {doc.tipo === 'Revisao' && (
                  <div className="flex items-center gap-2 mr-2">
                    {doc.statusRevisao === 'Pendente' ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Pendente
                      </span>
                    ) : doc.statusRevisao === 'Aprovado' ? (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        Aprovado
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                        Rejeitado
                      </span>
                    )}

                    {doc.statusRevisao === 'Pendente' && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleAtualizarStatus(doc.id, 'Aprovado')}
                          className="p-1.5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 rounded transition-colors"
                          title="Aprovar Revisão"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAtualizarStatus(doc.id, 'Rejeitado')}
                          className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition-colors"
                          title="Rejeitar Revisão"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => handleDownload(doc)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                  title="Baixar Documento"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  title="Excluir Documento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
