import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBRL } from './calculators';

export const captureElement = async (element: HTMLElement | null) => {
  if (!element) return '';
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    const canvas = await html2canvas(element, {
      backgroundColor: '#f8fafc',
      scale: 1.2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        const charts = clonedDoc.querySelectorAll('.recharts-responsive-container');
        charts.forEach((chart: any) => {
          chart.style.width = '800px';
          chart.style.height = '400px';
          chart.style.visibility = 'visible';
        });
      }
    });
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch (err) {
    console.error('Erro na captura de tela:', err);
    return '';
  }
};

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface PDFBalancaItem {
  nome: string;
  percentual: number;
  clausula?: string;
}

export interface PDFBreakdownItem {
  descricao: string;
  valor: number;
  isPositive?: boolean;   // true = soma, false = desconto
  isBold?: boolean;       // destaque (total)
  percentual?: string;    // badge ex: "-10%"
}

export interface PDFReportData {
  titulo: string;
  subtitulo: string;
  total: number;                      // Valor final com mora
  valorBase?: number;                 // Valor pré-dosimetria
  valorFinal?: number;                // Valor pós-dosimetria (sem mora)
  dataOcorrencia?: string;
  descricaoOcorrencia?: string;
  agravantes?: PDFBalancaItem[];
  atenuantes?: PDFBalancaItem[];
  breakdown?: PDFBreakdownItem[];
  fundamentacaoLegal?: string;
  nivelRisco?: 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  detalhes: Record<string, unknown>[];            // tabela legada
  parametrosTextuais?: { label: string; valor: string }[];
  identificador: string;
  image?: string;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const BLUE:  [number, number, number] = [46, 84, 163];
const GREEN: [number, number, number] = [16, 185, 129];
const RED:   [number, number, number] = [239, 68, 68];
const AMBER: [number, number, number] = [245, 158, 11];
const PURPLE:[number, number, number] = [139, 92, 246];
const SLATE: [number, number, number] = [241, 245, 249];
const SLATE_BORDER: [number, number, number] = [226, 232, 240];
const DARK:  [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];

function riskColor(nivel?: string): [number, number, number] {
  switch (nivel) {
    case 'BAIXO':   return GREEN;
    case 'MODERADO': return AMBER;
    case 'ALTO':    return RED;
    case 'CRÍTICO': return [127, 29, 29];
    default:        return MUTED;
  }
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    return 20;
  }
  return y;
}

// ──────────────────────────────────────────────────────────────
// Main Function
// ──────────────────────────────────────────────────────────────

export const generatePDFReport = (data: PDFReportData) => {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();

  // ── HEADER ────────────────────────────────────────────────
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 42, 'F');

  // Accent bar
  doc.setFillColor(...GREEN);
  doc.rect(0, 40, W, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SPD — SIMULADOR DE PENALIDADES DESO', 15, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('DESO • Companhia de Saneamento de Sergipe', 15, 27);
  doc.text(`Identificador: ${data.identificador}   |   Emitido em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 15, 34);

  // ── TÍTULO DO RELATÓRIO ───────────────────────────────────
  doc.setTextColor(...DARK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.titulo.toUpperCase(), 15, 56);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  const subtLines = doc.splitTextToSize(data.subtitulo, W - 30);
  doc.text(subtLines, 15, 63);

  let Y = 63 + subtLines.length * 5 + 6;

  // ── DADOS DA OCORRÊNCIA ───────────────────────────────────
  if (data.descricaoOcorrencia || data.dataOcorrencia) {
    Y = checkPageBreak(doc, Y, 28);
    const dataFmt = data.dataOcorrencia
      ? data.dataOcorrencia.split('-').reverse().join('/')
      : '---';

    doc.setFillColor(...SLATE);
    doc.setDrawColor(...SLATE_BORDER);
    doc.roundedRect(15, Y, W - 30, 24, 2, 2, 'FD');

    doc.setTextColor(...BLUE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA OCORRÊNCIA', 20, Y + 7);

    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`📅 Data: ${dataFmt}`, 20, Y + 14);
    const descLines = doc.splitTextToSize(data.descricaoOcorrencia || '', W - 70);
    doc.text(descLines, 20, Y + 20);
    Y += 30 + (descLines.length - 1) * 5;
  }

  // ── CARTÕES: VALOR BASE + VALOR FINAL ────────────────────
  if (data.valorBase !== undefined || data.valorFinal !== undefined) {
    Y = checkPageBreak(doc, Y, 32);
    const cardW = (W - 36) / 2;

    // Valor Base
    doc.setFillColor(...SLATE);
    doc.setDrawColor(...SLATE_BORDER);
    doc.roundedRect(15, Y, cardW, 28, 2, 2, 'FD');
    doc.setTextColor(...MUTED);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('VALOR BASE', 20, Y + 8);
    doc.setTextColor(...BLUE);
    doc.setFontSize(14);
    doc.text(formatBRL(data.valorBase ?? 0), 20, Y + 20);

    // Valor Final (sem mora)
    const x2 = 15 + cardW + 6;
    doc.setFillColor(...SLATE);
    doc.roundedRect(x2, Y, cardW, 28, 2, 2, 'FD');
    doc.setTextColor(...MUTED);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(data.total > (data.valorFinal ?? data.total) ? 'VALOR FINAL (SEM MORA)' : 'VALOR FINAL', x2 + 5, Y + 8);
    doc.setTextColor(245, 158, 11);  // amber
    doc.setFontSize(14);
    doc.text(formatBRL(data.valorFinal ?? data.total), x2 + 5, Y + 20);

    Y += 34;
  }

  // Valor com mora (se houver)
  if (data.total > (data.valorFinal ?? data.total) + 0.01) {
    Y = checkPageBreak(doc, Y, 22);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(...RED);
    doc.roundedRect(15, Y, W - 30, 18, 2, 2, 'FD');
    doc.setTextColor(...RED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠  VALOR TOTAL COM MORA:', 20, Y + 7);
    doc.setFontSize(13);
    doc.text(formatBRL(data.total), 20, Y + 14);
    Y += 24;
  }

  // ── BALANÇA DOSIMÉTRICA ───────────────────────────────────
  const hasAgrav = data.agravantes && data.agravantes.length > 0;
  const hasAtenu = data.atenuantes && data.atenuantes.length > 0;
  if (hasAgrav || hasAtenu) {
    Y = checkPageBreak(doc, Y, 14 + Math.max((data.agravantes?.length ?? 0), (data.atenuantes?.length ?? 0)) * 12 + 6);

    // Título da seção
    doc.setFillColor(...BLUE);
    doc.rect(15, Y, W - 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('⚖  BALANÇA DOSIMÉTRICA', 20, Y + 7);
    Y += 12;

    const halfW = (W - 36) / 2;

    // AGRAVANTES
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(...RED);
    const agravLines = data.agravantes?.length ?? 0;
    const agravH = 10 + agravLines * 12 + 6;
    doc.roundedRect(15, Y, halfW, agravH, 2, 2, 'FD');
    doc.setTextColor(...RED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('⬆  AGRAVANTES', 20, Y + 7);
    if (!hasAgrav) {
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum agravante', 20, Y + 17);
    } else {
      let iy = Y + 17;
      data.agravantes?.forEach(a => {
        doc.setTextColor(...RED);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(`+${a.percentual}%`, 20, iy);
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        const nm = doc.splitTextToSize(a.nome, halfW - 22);
        doc.text(nm, 32, iy);
        iy += nm.length * 5 + 4;
      });
    }

    // ATENUANTES
    const x2 = 15 + halfW + 6;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(...GREEN);
    const atenuLines = data.atenuantes?.length ?? 0;
    const atenuH = 10 + atenuLines * 12 + 6;
    const colH = Math.max(agravH, atenuH);
    doc.roundedRect(x2, Y, halfW, colH, 2, 2, 'FD');
    doc.setTextColor(...GREEN);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('⬇  ATENUANTES', x2 + 5, Y + 7);
    if (!hasAtenu) {
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum atenuante', x2 + 5, Y + 17);
    } else {
      let iy = Y + 17;
      let totalAtenu = 0;
      data.atenuantes?.forEach(a => {
        totalAtenu += a.percentual;
        doc.setTextColor(...GREEN);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(`-${a.percentual}%`, x2 + 5, iy);
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        const nm = doc.splitTextToSize(a.nome, halfW - 22);
        doc.text(nm, x2 + 18, iy);
        iy += nm.length * 5 + 4;
      });
      doc.setTextColor(...GREEN);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`Total: -${totalAtenu}%`, x2 + 5, iy + 2);
    }

    Y += Math.max(agravH, colH) + 8;
  }

  // ── BREAKDOWN DETALHADO ───────────────────────────────────
  if (data.breakdown && data.breakdown.length > 0) {
    Y = checkPageBreak(doc, Y, 14 + data.breakdown.length * 10 + 6);

    doc.setFillColor(...BLUE);
    doc.rect(15, Y, W - 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('🔍  BREAKDOWN DETALHADO — Composição passo a passo', 20, Y + 7);
    Y += 12;

    data.breakdown.forEach((row, idx) => {
      Y = checkPageBreak(doc, Y, 12);
      const isLast = idx === data.breakdown!.length - 1;
      const isDiscount = row.valor < 0;

      const bgColor: [number, number, number] = isLast
        ? [232, 247, 255]
        : idx % 2 === 0 ? [248, 250, 252] : [255, 255, 255];

      doc.setFillColor(...bgColor);
      doc.setDrawColor(...SLATE_BORDER);
      doc.roundedRect(15, Y, W - 30, 10, 1, 1, 'FD');

      // Badge percentual
      if (row.percentual) {
        const badgeColor: [number, number, number] = isDiscount ? GREEN : RED;
        doc.setFillColor(...badgeColor);
        doc.roundedRect(18, Y + 2, 16, 6, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(row.percentual, 26, Y + 6.5, { align: 'center' });
        doc.setTextColor(isLast ? BLUE[0] : DARK[0], isLast ? BLUE[1] : DARK[1], isLast ? BLUE[2] : DARK[2]);
        doc.setFontSize(isLast ? 8.5 : 8);
        doc.setFont('helvetica', isLast ? 'bold' : 'normal');
        doc.text(row.descricao, 37, Y + 6.5);
      } else {
        doc.setTextColor(isLast ? BLUE[0] : DARK[0], isLast ? BLUE[1] : DARK[1], isLast ? BLUE[2] : DARK[2]);
        doc.setFontSize(isLast ? 8.5 : 8);
        doc.setFont('helvetica', isLast ? 'bold' : 'normal');
        doc.text(row.descricao, 20, Y + 6.5);
      }

      const valColor: [number, number, number] = isLast ? BLUE : isDiscount ? GREEN : DARK;
      doc.setTextColor(...valColor);
      doc.setFontSize(isLast ? 9 : 8);
      doc.setFont('helvetica', 'bold');
      const valStr = isDiscount ? `-${formatBRL(Math.abs(row.valor))}` : formatBRL(row.valor);
      doc.text(valStr, W - 18, Y + 6.5, { align: 'right' });

      Y += 11;
    });
    Y += 4;
  }

  // ── NÍVEL DE RISCO ────────────────────────────────────────
  if (data.nivelRisco) {
    Y = checkPageBreak(doc, Y, 22);
    const rc = riskColor(data.nivelRisco);
    const bgRgb: [number, number, number] = [
      Math.round(rc[0] * 0.12 + 255 * 0.88),
      Math.round(rc[1] * 0.12 + 255 * 0.88),
      Math.round(rc[2] * 0.12 + 255 * 0.88),
    ];
    doc.setFillColor(...bgRgb);
    doc.setDrawColor(...rc);
    doc.roundedRect(15, Y, W - 30, 16, 2, 2, 'FD');

    doc.setTextColor(...rc);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const label =
      data.nivelRisco === 'BAIXO'    ? '✔  NÍVEL DE RISCO: BAIXO — Risco gerenciável. Mantenha conformidade preventiva.' :
      data.nivelRisco === 'MODERADO' ? '⚠  NÍVEL DE RISCO: MODERADO — Atenção regulatória necessária.' :
      data.nivelRisco === 'ALTO'     ? '⚠  NÍVEL DE RISCO: ALTO — Impacto financeiro relevante. Ação imediata recomendada.' :
                                       '🚨 NÍVEL DE RISCO: CRÍTICO — Penalidade máxima. Avalie medidas mitigatórias urgentes.';
    doc.text(label, 20, Y + 10);
    Y += 22;
  }

  // ── FUNDAMENTAÇÃO LEGAL ───────────────────────────────────
  if (data.fundamentacaoLegal) {
    Y = checkPageBreak(doc, Y, 30);
    doc.setFillColor(245, 243, 255);
    doc.setDrawColor(...PURPLE);
    const fLines = doc.splitTextToSize(data.fundamentacaoLegal, W - 50);
    const fH = 14 + fLines.length * 5 + 4;
    doc.roundedRect(15, Y, W - 30, fH, 2, 2, 'FD');

    doc.setTextColor(...PURPLE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('📚  FUNDAMENTAÇÃO LEGAL', 20, Y + 8);

    doc.setTextColor(79, 70, 229);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(fLines, 20, Y + 15);
    Y += fH + 8;
  }

  // ── PARÂMETROS TEXTUAIS ───────────────────────────────────
  if (data.parametrosTextuais && data.parametrosTextuais.length > 0) {
    Y = checkPageBreak(doc, Y, 20);
    const splitTexts: string[][] = [];
    let totalH = 14;
    data.parametrosTextuais.forEach(p => {
      const lines = doc.splitTextToSize(`• ${p.label}: ${p.valor}`, W - 40);
      splitTexts.push(lines);
      totalH += lines.length * 5 + 2;
    });

    doc.setFillColor(...SLATE);
    doc.setDrawColor(...SLATE_BORDER);
    doc.roundedRect(15, Y, W - 30, totalH, 2, 2, 'FD');

    doc.setTextColor(...BLUE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PARÂMETROS E JUSTIFICATIVAS ADOTADOS:', 20, Y + 8);

    let pY = Y + 15;
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    splitTexts.forEach(lines => {
      doc.text(lines, 20, pY);
      pY += lines.length * 5 + 2;
    });
    Y += totalH + 8;
  }

  // ── TABELA DE DETALHES ────────────────────────────────────
  if (data.detalhes && data.detalhes.length > 0) {
    Y = checkPageBreak(doc, Y, 20);
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHAMENTO CONTRATUAL:', 15, Y);
    Y += 5;

    autoTable(doc, {
      startY: Y,
      head: [['Item / Conduta', 'Fundamentação', 'Impacto Financeiro']],
      body: data.detalhes.map(d => [
        String(d.label),
        String(d.clause),
        formatBRL(Number(d.value))
      ]),
      headStyles: { fillColor: BLUE, textColor: 255, fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5, textColor: DARK },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 15, right: 15 },
    });

    Y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // ── EVIDÊNCIA VISUAL ──────────────────────────────────────
  if (data.image) {
    Y = checkPageBreak(doc, Y, 20);
    doc.setTextColor(...BLUE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDÊNCIA VISUAL DA SIMULAÇÃO:', 15, Y);
    Y += 5;

    try {
      const imgWidth = W - 30;
      const imgHeight = imgWidth * 0.6;
      Y = checkPageBreak(doc, Y, imgHeight + 5);
      doc.addImage(data.image, 'JPEG', 15, Y, imgWidth, imgHeight, undefined, 'FAST');
      Y += imgHeight + 10;
    } catch (e) {
      console.error('Erro ao inserir imagem no PDF', e);
    }
  }

  // ── RODAPÉ ────────────────────────────────────────────────
  Y = checkPageBreak(doc, Y, 18);
  doc.setFillColor(...GREEN);
  doc.rect(15, Y, W - 30, 1, 'F');
  Y += 5;

  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'italic');
  doc.text('Relatório gerado para fins de compliance regulatório. Valores sujeitos a apreciação final pela AGRESE.', 15, Y + 5);
  doc.text('Resolução AGRESE 96/2025 • Contrato de Produção de Água CPA • Contrato de Interdependência CI', 15, Y + 10);

  // Numeração de páginas
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`Página ${i} de ${totalPages}`, W - 15, doc.internal.pageSize.getHeight() - 5, { align: 'right' });
  }

  doc.save(`SPD_Relatorio_${data.identificador}_${Date.now()}.pdf`);
};
