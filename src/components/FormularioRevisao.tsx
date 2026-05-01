'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AprovacaoGate {
  status: string;
  link?: string;
  data?: string;
  assinante?: string;
}

interface RevisaoRequest {
  id: string;
  data: string;
  solicitante: string;
  cargo: string;
  unidade: string;
  processo: string;
  codigo: string;
  etapa: string;
  tipos: string[];
  status: 'Pendente' | 'Em Análise' | 'Concluído';
  detalhes: {
    descricao: string;
    justificativa: string;
    impacto: string;
    anexos: string[];
  };
  aprovacoes: {
    gpin: AprovacaoGate;
    grmc: AprovacaoGate;
    sgoc: AprovacaoGate;
    presidencia: AprovacaoGate;
  };
}

export default function FormularioRevisao() {
  // 1. DADOS DO SOLICITANTE
  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [cargo, setCargo] = useState('');
  const [unidade, setUnidade] = useState('');
  const [dataSolicitacao, setDataSolicitacao] = useState(new Date().toISOString().split('T')[0]);

  // 2. IDENTIFICAÇÃO DO PROCESSO
  const [nomeProcesso, setNomeProcesso] = useState('');
  const [idProcesso, setIdProcesso] = useState('');
  const [etapa, setEtapa] = useState('');

  // 3. DETALHAMENTO DA SOLICITAÇÃO
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [outrosDesc, setOutrosDesc] = useState('');
  const [descricao, setDescricao] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [impacto, setImpacto] = useState('');

  // 4. ANEXOS
  const [anexos, setAnexos] = useState<string[]>(['', '', '', '', '']);

  const [history, setHistory] = useState<RevisaoRequest[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewDetail, setViewDetail] = useState<RevisaoRequest | null>(null);

  useEffect(() => {
    const pending = localStorage.getItem('spd_pending_revision');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        setNomeProcesso(data.processo || '');
        setIdProcesso(data.codigo || '');
        localStorage.removeItem('spd_pending_revision');
      } catch (e) {
        console.error("Erro ao carregar revisão pendente", e);
      }
    }

    const saved = localStorage.getItem('spd_revisao_requests_v2');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }
  }, []);

  const handleTipoToggle = (tipo: string) => {
    setTiposSelecionados(prev => 
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };

  const handleAnexoChange = (index: number, value: string) => {
    const newAnexos = [...anexos];
    newAnexos[index] = value;
    setAnexos(newAnexos);
  };

  const gerarProtocoloPDF = (reqData: RevisaoRequest) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(46, 84, 163);
      doc.text('PROTOCOLO DE REVISÃO DE PROCESSO', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`ID: ${reqData.id}`, 20, 35);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('1. DADOS DO SOLICITANTE', 20, 55);
      doc.setFontSize(10);
      doc.text(`Nome: ${reqData.solicitante}`, 25, 62);
      doc.text(`Cargo: ${reqData.cargo}`, 25, 67);
      doc.text(`Unidade: ${reqData.unidade}`, 25, 72);
      
      doc.setFontSize(12);
      doc.text('2. IDENTIFICAÇÃO DO PROCESSO', 20, 85);
      doc.setFontSize(10);
      doc.text(`Processo: ${reqData.processo}`, 25, 92);
      doc.text(`Código: ${reqData.codigo}`, 25, 97);
      doc.text(`Etapa: ${reqData.etapa}`, 25, 102);
      
      doc.setFontSize(12);
      doc.text('3. DETALHAMENTO', 20, 115);
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(reqData.detalhes.descricao || 'N/A', pageWidth - 40);
      doc.text(descLines, 25, 122);

      const fileName = `Protocolo_Revisao_${reqData.id}.pdf`;
      doc.save(fileName);
      
      console.log("PDF Simples Gerado:", fileName);
    } catch (err) {
      console.error("Erro no PDF Simples:", err);
      alert("Erro ao gerar PDF simples. Verifique o console.");
    }
  };

  const handleSubmit = () => {
    if (!nomeSolicitante || !nomeProcesso) {
      alert("Por favor, preencha o nome do solicitante e do processo.");
      return;
    }

    const newRequest: RevisaoRequest = {
      id: `REV-${Date.now().toString().slice(-6)}`,
      data: dataSolicitacao,
      solicitante: nomeSolicitante,
      cargo: cargo,
      unidade: unidade,
      processo: nomeProcesso,
      codigo: idProcesso,
      etapa: etapa,
      tipos: tiposSelecionados,
      status: 'Pendente',
      detalhes: {
        descricao,
        justificativa,
        impacto,
        anexos: anexos.filter(a => a !== '')
      },
      aprovacoes: {
        gpin: { status: 'Pendente' },
        grmc: { status: 'Pendente' },
        sgoc: { status: 'Pendente' },
        presidencia: { status: 'Pendente' }
      }
    };

    const newHistory = [newRequest, ...history];
    setHistory(newHistory);
    localStorage.setItem('spd_revisao_requests_v2', JSON.stringify(newHistory));
    
    // Gerar o PDF profissional
    gerarProtocoloPDF(newRequest);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);

    // Reset fields
    setNomeSolicitante(''); setCargo(''); setUnidade('');
    setNomeProcesso(''); setIdProcesso(''); setEtapa('');
    setTiposSelecionados([]); setDescricao(''); setJustificativa(''); setImpacto('');
    setAnexos(['', '', '', '', '']);

    gerarProtocoloPDF(newRequest);
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      'Pendente': { bg: '#fff7ed', text: '#c2410c' },
      'Aprovado': { bg: '#f0fdf4', text: '#15803d' },
      'Validado': { bg: '#f0fdf4', text: '#15803d' },
      'Reprovado': { bg: '#fef2f2', text: '#b91c1c' },
      'Necessita Ajustes': { bg: '#eff6ff', text: '#1d4ed8' },
      'Em Análise': { bg: '#f0f9ff', text: '#0369a1' }
    };
    const style = colors[status] || { bg: '#f9fafb', text: '#374151' };
    return (
      <span style={{ 
        padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
        background: style.bg, color: style.text, border: `1px solid ${style.text}20`
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {showSuccess && (
        <div style={{ background: '#10b981', color: 'white', padding: '16px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
          <span style={{ fontSize: '1.5rem' }}>✅</span>
          <div>
            <strong style={{ display: 'block' }}>Solicitação Enviada com Sucesso!</strong>
            <span style={{ fontSize: '0.85rem' }}>O protocolo PDF foi gerado e a solicitação registrada no histórico.</span>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-blue)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          📝 FORMULÁRIO DE SOLICITAÇÃO DE REVISÃO DE PROCESSOS
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'justify' }}>
          Formulário destinado a todos os envolvidos, direta ou indiretamente, na execução dos processos, com a finalidade de formalizar solicitações de revisão contínua e de atualização do Plano de Gestão do Prestador (PGP), em conformidade com os critérios e responsabilidades definidos no Capítulo 6 (Mecanismos de Revisão e Atualização do Plano).
        </p>
        <div style={{ marginTop: 16, padding: '12px 20px', background: 'rgba(59,130,246,0.05)', borderRadius: 10, borderLeft: '5px solid var(--brand-blue)', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          As solicitações serão submetidas à análise da <strong>GRMC</strong> e da <strong>GPIN</strong>, que emitirão os respectivos pareceres técnicos e regulatórios. Após essa etapa, o pleito será encaminhado para validação e aprovação pela <strong>SGOC</strong> e pela <strong>Presidência</strong>.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
        {/* COLUNA 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 1. DADOS SOLICITANTE */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, borderBottom: '1px solid var(--border-primary)', paddingBottom: 8 }}>1. DADOS DO SOLICITANTE</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="spd-label">Nome do Solicitante</label>
                <input className="spd-input" placeholder="Digite seu nome completo" value={nomeSolicitante} onChange={e => setNomeSolicitante(e.target.value)} />
              </div>
              <div>
                <label className="spd-label">Cargo / Função</label>
                <input className="spd-input" placeholder="Ex: Analista de Saneamento" value={cargo} onChange={e => setCargo(e.target.value)} />
              </div>
              <div>
                <label className="spd-label">Unidade</label>
                <input className="spd-input" placeholder="Ex: GPIN / GRMC" value={unidade} onChange={e => setUnidade(e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="spd-label">Data da Solicitação</label>
                <input className="spd-input" type="date" value={dataSolicitacao} onChange={e => setDataSolicitacao(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 2. IDENTIFICAÇÃO PROCESSO */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, borderBottom: '1px solid var(--border-primary)', paddingBottom: 8 }}>2. IDENTIFICAÇÃO DO PROCESSO</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="spd-label">Nome do Processo</label>
                <input className="spd-input" placeholder="Ex: Faturamento de Água" value={nomeProcesso} onChange={e => setNomeProcesso(e.target.value)} />
              </div>
              <div>
                <label className="spd-label">Código/ID do Processo</label>
                <input className="spd-input" placeholder="Ex: PR-2.1.4" value={idProcesso} onChange={e => setIdProcesso(e.target.value)} />
              </div>
              <div>
                <label className="spd-label">Etapa Envolvida</label>
                <input className="spd-input" placeholder="Ex: Leitura de Hidrômetros" value={etapa} onChange={e => setEtapa(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 4. ANEXOS */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, borderBottom: '1px solid var(--border-primary)', paddingBottom: 8 }}>4. ANEXOS COMPROBATÓRIOS (Até 5 Documentos)</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Insira links públicos para documentos (Google Drive, SharePoint, etc.)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {anexos.map((link, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--brand-blue)', width: 60 }}>ANEXO {i+1}</span>
                  <input 
                    className="spd-input" 
                    placeholder="Cole o link do documento aqui..." 
                    value={link} 
                    onChange={e => handleAnexoChange(i, e.target.value)} 
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 3. DETALHAMENTO */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, borderBottom: '1px solid var(--border-primary)', paddingBottom: 8 }}>3. DETALHAMENTO DA SOLICITAÇÃO</h3>
            
            <label className="spd-label" style={{ marginBottom: 12 }}>Tipo de Solicitação</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                'Correção de Erro ou Falha',
                'Melhoria Contínua (Ciclo PDCA)',
                'Atualização devido a Nova Normativa/Regulação',
                'Inclusão de Nova Etapa/Processo',
                'Exclusão de Etapa Obsoleta',
                'Outros'
              ].map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: tiposSelecionados.includes(t) ? 'rgba(59,130,246,0.05)' : 'transparent', border: `1px solid ${tiposSelecionados.includes(t) ? 'var(--brand-blue)' : 'transparent'}` }}>
                  <input type="checkbox" checked={tiposSelecionados.includes(t)} onChange={() => handleTipoToggle(t)} style={{ width: 16, height: 16 }} />
                  {t}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="spd-label">Descrição da Solicitação</label>
                <textarea 
                  className="spd-input" rows={4} value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder="(Detalhe a alteração proposta no fluxo ou procedimento)"
                />
              </div>
              <div>
                <label className="spd-label">Justificativa</label>
                <textarea 
                  className="spd-input" rows={3} value={justificativa} onChange={e => setJustificativa(e.target.value)}
                  placeholder="(Fundamente a necessidade com base na gestão estratégica, mitigação de riscos ou ciclo PDCA)"
                />
              </div>
              <div>
                <label className="spd-label">Impacto Operacional</label>
                <textarea 
                  className="spd-input" rows={3} value={impacto} onChange={e => setImpacto(e.target.value)}
                  placeholder="(Quais outras áreas ou cláusulas contratuais são afetadas?)"
                />
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              className="btn-primary"
              style={{ width: '100%', padding: '18px', marginTop: 24, fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              🚀 Finalizar Solicitação e Gerar Protocolo
            </button>
          </div>

          {/* 5. VISUALIZAÇÃO DE STATUS (DADO EXEMPLO) */}
          <div className="glass-card" style={{ padding: 24, background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1px dashed var(--border-primary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🛡️ 5. VALIDAÇÃO E APROVAÇÃO INSTITUCIONAL
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Esta seção será preenchida pelas unidades competentes (GPIN, GRMC, SGOC e Presidência) no protocolo oficial gerado após o envio.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['Parecer GPIN', 'Parecer GRMC', 'Validação SGOC', 'Aprovação Final'].map(gate => (
                <div key={gate} style={{ padding: 12, background: 'white', borderRadius: 10, border: '1px solid var(--border-primary)', opacity: 0.6 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>{gate}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 4 }}>Aguardando Submissão</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HISTÓRICO E ACOMPANHAMENTO */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: 12 }}>
            📋 Histórico e Acompanhamento de Protocolos
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Geral: <b>{history.length} Solicitações</b></span>
          </div>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>📭</span>
            Ainda não há solicitações registradas no sistema.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-primary)' }}>
                  <th style={{ padding: 12 }}>ID</th>
                  <th style={{ padding: 12 }}>Processo</th>
                  <th style={{ padding: 12 }}>Solicitante</th>
                  <th style={{ padding: 12 }}>GPIN</th>
                  <th style={{ padding: 12 }}>GRMC</th>
                  <th style={{ padding: 12 }}>SGOC</th>
                  <th style={{ padding: 12 }}>PR</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {history.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-primary)' }} className="hover-row">
                    <td style={{ padding: 12, fontWeight: 800, color: 'var(--brand-blue)' }}>{req.id}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{req.processo}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{req.codigo} • {req.data.split('-').reverse().join('/')}</div>
                    </td>
                    <td style={{ padding: 12 }}>{req.solicitante}</td>
                    <td style={{ padding: 12 }}>{getStatusBadge(req.aprovacoes.gpin.status)}</td>
                    <td style={{ padding: 12 }}>{getStatusBadge(req.aprovacoes.grmc.status)}</td>
                    <td style={{ padding: 12 }}>{getStatusBadge(req.aprovacoes.sgoc.status)}</td>
                    <td style={{ padding: 12 }}>{getStatusBadge(req.aprovacoes.presidencia.status)}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button 
                          onClick={() => {
                            const newHistory = history.map(h => {
                              if (h.id === req.id) {
                                const gates = {...h.aprovacoes};
                                if (gates.gpin.status === 'Pendente') gates.gpin.status = 'Em Análise';
                                else if (gates.gpin.status === 'Em Análise') gates.gpin.status = 'Aprovado';
                                else if (gates.grmc.status === 'Pendente') gates.grmc.status = 'Em Análise';
                                else if (gates.grmc.status === 'Em Análise') gates.grmc.status = 'Aprovado';
                                else if (gates.sgoc.status === 'Pendente') gates.sgoc.status = 'Validado';
                                else if (gates.presidencia.status === 'Pendente') gates.presidencia.status = 'Aprovado';
                                else {
                                  gates.gpin.status = 'Pendente';
                                  gates.grmc.status = 'Pendente';
                                  gates.sgoc.status = 'Pendente';
                                  gates.presidencia.status = 'Pendente';
                                }
                                return { ...h, aprovacoes: gates };
                              }
                              return h;
                            });
                            setHistory(newHistory);
                            localStorage.setItem('spd_revisao_requests_v2', JSON.stringify(newHistory));
                          }}
                          style={{ background: 'var(--brand-blue)10', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', fontSize: '0.9rem', color: 'var(--brand-blue)' }}
                          title="Simular Avanço"
                        >
                          ⏭️
                        </button>
                        <button 
                          onClick={() => gerarProtocoloPDF(req)}
                          style={{ background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, color: 'var(--brand-blue)', fontSize: '0.8rem', fontWeight: 700 }}
                          title="Download PDF"
                        >
                          📥 PDF
                        </button>
                        <button 
                          onClick={() => setViewDetail(req)}
                          style={{ background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewDetail && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 40, background: 'white', position: 'relative' }}>
            <button onClick={() => setViewDetail(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-blue)' }}>Detalhes do Protocolo</h3>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>ID: {viewDetail.id}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Data da Solicitação</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{viewDetail.data.split('-').reverse().join('/')}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }}>
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--brand-blue)', textTransform: 'uppercase', marginBottom: 12, borderBottom: '2px solid var(--brand-blue)10', paddingBottom: 4 }}>Solicitante</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontWeight: 700 }}>{viewDetail.solicitante}</div>
                  <div style={{ fontSize: '0.85rem' }}>{viewDetail.cargo}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{viewDetail.unidade}</div>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--brand-blue)', textTransform: 'uppercase', marginBottom: 12, borderBottom: '2px solid var(--brand-blue)10', paddingBottom: 4 }}>Processo Alvo</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontWeight: 700 }}>{viewDetail.processo}</div>
                  <div style={{ fontSize: '0.85rem' }}>Código: {viewDetail.codigo}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Etapa: {viewDetail.etapa}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--brand-blue)', textTransform: 'uppercase', marginBottom: 12, borderBottom: '2px solid var(--brand-blue)10', paddingBottom: 4 }}>Detalhamento</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {viewDetail.tipos.map(t => (
                  <span key={t} style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--brand-blue)05', color: 'var(--brand-blue)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--brand-blue)20' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>DESCRIÇÃO</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{viewDetail.detalhes.descricao}</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>JUSTIFICATIVA</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{viewDetail.detalhes.justificativa}</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4 }}>IMPACTO</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{viewDetail.detalhes.impacto}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--brand-blue)', textTransform: 'uppercase', marginBottom: 16, borderBottom: '2px solid var(--brand-blue)10', paddingBottom: 4 }}>Fluxo de Aprovação</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'GPIN (Técnico)', status: viewDetail.aprovacoes.gpin.status },
                  { label: 'GRMC (Regulatório)', status: viewDetail.aprovacoes.grmc.status },
                  { label: 'SGOC (Validação)', status: viewDetail.aprovacoes.sgoc.status },
                  { label: 'Presidência (Final)', status: viewDetail.aprovacoes.presidencia.status }
                ].map(gate => (
                  <div key={gate.label} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-primary)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{gate.label}</div>
                    {getStatusBadge(gate.status)}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => gerarProtocoloPDF(viewDetail)} className="btn-primary" style={{ padding: '12px 24px' }}>Baixar PDF Completo</button>
              <button onClick={() => setViewDetail(null)} className="spd-button" style={{ padding: '12px 24px' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-row:hover { background: rgba(59,130,246,0.02); }
      `}</style>
    </div>
  );
}

