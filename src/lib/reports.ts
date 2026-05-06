import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBRL } from './calculators';

// ──────────────────────────────────────────────────────────────
// captureElement
// ──────────────────────────────────────────────────────────────
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
  isBold?: boolean;
  percentual?: string; // ex: "-10%" ou "+20%"
}

export interface PDFReportData {
  titulo: string;
  subtitulo: string;
  total: number;
  valorBase?: number;
  valorFinal?: number;
  dataOcorrencia?: string;
  descricaoOcorrencia?: string;
  agravantes?: PDFBalancaItem[];
  atenuantes?: PDFBalancaItem[];
  breakdown?: PDFBreakdownItem[];
  fundamentacaoLegal?: string;
  nivelRisco?: 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRITICO';
  detalhes: Record<string, unknown>[];
  parametrosTextuais?: { label: string; valor: string }[];
  identificador: string;
  image?: string;
}

// ──────────────────────────────────────────────────────────────
// Color palette (all pure RGB, no emoji in text)
// ──────────────────────────────────────────────────────────────
const C = {
  blue:         [46,  84,  163] as [number,number,number],
  green:        [16,  185, 129] as [number,number,number],
  red:          [220, 53,  69]  as [number,number,number],
  amber:        [217, 119, 6]   as [number,number,number],
  purple:       [109, 40,  217] as [number,number,number],
  slate100:     [241, 245, 249] as [number,number,number],
  slate200:     [226, 232, 240] as [number,number,number],
  dark:         [30,  41,  59]  as [number,number,number],
  muted:        [100, 116, 139] as [number,number,number],
  white:        [255, 255, 255] as [number,number,number],
  redLight:     [254, 226, 226] as [number,number,number],
  greenLight:   [220, 252, 231] as [number,number,number],
  purpleLight:  [237, 233, 254] as [number,number,number],
  blueLight:    [219, 234, 254] as [number,number,number],
};

function riskColors(nivel?: string): { bg: [number,number,number]; border: [number,number,number]; text: string } {
  switch (nivel) {
    case 'BAIXO':   return { bg: [220,252,231], border: C.green, text: 'NIVEL DE RISCO: BAIXO  -  Risco gerenciavel. Mantenha conformidade preventiva.' };
    case 'MODERADO': return { bg: [254,243,199], border: C.amber, text: 'NIVEL DE RISCO: MODERADO  -  Atencao regulatoria necessaria.' };
    case 'ALTO':    return { bg: [254,226,226], border: C.red,   text: 'NIVEL DE RISCO: ALTO  -  Impacto financeiro relevante. Acao imediata recomendada.' };
    case 'CRITICO': return { bg: [254,202,202], border: [127,29,29], text: 'NIVEL DE RISCO: CRITICO  -  Penalidade maxima. Avalie medidas mitigatorias urgentes.' };
    default:        return { bg: C.slate100, border: C.muted, text: '' };
  }
}

// ──────────────────────────────────────────────────────────────
// Guard: ensure we don't overflow page
// ──────────────────────────────────────────────────────────────
function guard(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

// ──────────────────────────────────────────────────────────────
// Section header bar (solid fill, white text)
// ──────────────────────────────────────────────────────────────
function sectionBar(doc: jsPDF, y: number, W: number, text: string): number {
  doc.setFillColor(...C.blue);
  doc.rect(15, y, W - 30, 11, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 20, y + 7.5);
  return y + 13;
}

// ──────────────────────────────────────────────────────────────
// generatePDFReport
// ──────────────────────────────────────────────────────────────
export const generatePDFReport = (data: PDFReportData) => {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 15;
  const CONTENT_W = W - MARGIN * 2;

  // ── HEADER ──────────────────────────────────────────────────
  doc.setFillColor(...C.blue);
  doc.rect(0, 0, W, 40, 'F');
  // green accent
  doc.setFillColor(...C.green);
  doc.rect(0, 39, W, 2.5, 'F');

  doc.setTextColor(...C.white);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('SPD - SIMULADOR DE PENALIDADES DESO', MARGIN, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('DESO  -  Companhia de Saneamento de Sergipe', MARGIN, 24);
  doc.text(
    `Identificador: ${data.identificador}   |   Emitido em: ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}`,
    MARGIN, 31
  );

  // ── TITULO ──────────────────────────────────────────────────
  let Y = 50;
  doc.setTextColor(...C.dark);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.titulo.toUpperCase(), CONTENT_W);
  doc.text(titleLines, MARGIN, Y);
  Y += titleLines.length * 6 + 2;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  const subLines = doc.splitTextToSize(data.subtitulo, CONTENT_W);
  doc.text(subLines, MARGIN, Y);
  Y += subLines.length * 5 + 6;

  // ── DADOS DA OCORRENCIA ──────────────────────────────────────
  if (data.descricaoOcorrencia || data.dataOcorrencia) {
    const dataFmt = data.dataOcorrencia
      ? data.dataOcorrencia.split('-').reverse().join('/') : '---';

    // Measure the description
    const descSafe = (data.descricaoOcorrencia || '').replace(/[\r\n]+/g, '  ');
    const descLines = doc.splitTextToSize(descSafe, CONTENT_W - 10);
    const boxH = 22 + (descLines.length - 1) * 5;

    Y = guard(doc, Y, boxH + 4);
    doc.setFillColor(...C.slate100);
    doc.setDrawColor(...C.slate200);
    doc.roundedRect(MARGIN, Y, CONTENT_W, boxH, 2, 2, 'FD');

    doc.setTextColor(...C.blue);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA OCORRENCIA:', MARGIN + 5, Y + 7);

    doc.setTextColor(...C.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Data: ${dataFmt}`, MARGIN + 5, Y + 14);

    doc.setFont('helvetica', 'normal');
    doc.text(descLines, MARGIN + 5, Y + 20);

    Y += boxH + 8;
  }

  // ── CARTOES: VALOR BASE + VALOR FINAL ───────────────────────
  if (data.valorBase !== undefined || data.valorFinal !== undefined) {
    Y = guard(doc, Y, 34);
    const cardW = (CONTENT_W - 6) / 2;

    // Card esquerdo - Valor Base
    doc.setFillColor(...C.slate100);
    doc.setDrawColor(...C.slate200);
    doc.roundedRect(MARGIN, Y, cardW, 28, 2, 2, 'FD');
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('VALOR BASE', MARGIN + 5, Y + 8);
    doc.setTextColor(...C.blue);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(formatBRL(data.valorBase ?? 0), MARGIN + 5, Y + 20);

    // Card direito - Valor Final
    const x2 = MARGIN + cardW + 6;
    doc.setFillColor(...C.slate100);
    doc.setDrawColor(...C.slate200);
    doc.roundedRect(x2, Y, cardW, 28, 2, 2, 'FD');
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const labelFinal = (data.total > (data.valorFinal ?? data.total) + 0.01)
      ? 'VALOR FINAL (SEM MORA)' : 'VALOR FINAL';
    doc.text(labelFinal, x2 + 5, Y + 8);
    doc.setTextColor(...C.amber);
    doc.setFontSize(13);
    doc.text(formatBRL(data.valorFinal ?? data.total), x2 + 5, Y + 20);

    Y += 34;
  }

  // Card mora
  if (data.total > (data.valorFinal ?? data.total) + 0.01) {
    Y = guard(doc, Y, 24);
    doc.setFillColor(...C.redLight);
    doc.setDrawColor(...C.red);
    doc.roundedRect(MARGIN, Y, CONTENT_W, 20, 2, 2, 'FD');
    doc.setTextColor(...C.red);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('VALOR TOTAL COM MORA:', MARGIN + 5, Y + 8);
    doc.setFontSize(13);
    doc.text(formatBRL(data.total), MARGIN + 5, Y + 16);
    Y += 26;
  }

  // ── BALANCA DOSIMETRICA ──────────────────────────────────────
  const hasAgrav = data.agravantes && data.agravantes.length > 0;
  const hasAtenu = data.atenuantes && data.atenuantes.length > 0;

  if (hasAgrav || hasAtenu) {
    const rowsA = data.agravantes?.length ?? 0;
    const rowsT = data.atenuantes?.length ?? 0;
    const colH  = 16 + Math.max(rowsA, rowsT, 1) * 11 + (hasAtenu ? 8 : 0);
    Y = guard(doc, Y, colH + 14);
    Y = sectionBar(doc, Y, W, 'BALANCA DOSIMETRICA');

    const halfW = (CONTENT_W - 6) / 2;

    // Agravantes
    doc.setFillColor(...C.redLight);
    doc.setDrawColor(...C.red);
    doc.roundedRect(MARGIN, Y, halfW, colH, 2, 2, 'FD');
    doc.setTextColor(...C.red);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('AGRAVANTES', MARGIN + 5, Y + 8);
    if (!hasAgrav) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...C.muted);
      doc.text('Nenhum agravante', MARGIN + 5, Y + 17);
    } else {
      let iy = Y + 17;
      data.agravantes?.forEach(a => {
        doc.setTextColor(...C.red);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(`+${a.percentual}%`, MARGIN + 5, iy);
        doc.setTextColor(...C.dark);
        doc.setFont('helvetica', 'normal');
        const nLines = doc.splitTextToSize(a.nome, halfW - 25);
        doc.text(nLines, MARGIN + 22, iy);
        iy += nLines.length * 5 + 4;
      });
    }

    // Atenuantes
    const x2 = MARGIN + halfW + 6;
    doc.setFillColor(...C.greenLight);
    doc.setDrawColor(...C.green);
    doc.roundedRect(x2, Y, halfW, colH, 2, 2, 'FD');
    doc.setTextColor(...C.green);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ATENUANTES', x2 + 5, Y + 8);
    if (!hasAtenu) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...C.muted);
      doc.text('Nenhum atenuante', x2 + 5, Y + 17);
    } else {
      let iy = Y + 17;
      let totalAtenu = 0;
      data.atenuantes?.forEach(a => {
        totalAtenu += a.percentual;
        doc.setTextColor(...C.green);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(`-${a.percentual}%`, x2 + 5, iy);
        doc.setTextColor(...C.dark);
        doc.setFont('helvetica', 'normal');
        const nLines = doc.splitTextToSize(a.nome, halfW - 25);
        doc.text(nLines, x2 + 22, iy);
        iy += nLines.length * 5 + 4;
      });
      doc.setTextColor(...C.green);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`Total: -${totalAtenu}%`, x2 + 5, Y + colH - 5);
    }

    Y += colH + 8;
  }

  // ── BREAKDOWN DETALHADO ──────────────────────────────────────
  if (data.breakdown && data.breakdown.length > 0) {
    const estH = 14 + data.breakdown.length * 11 + 6;
    Y = guard(doc, Y, estH);
    Y = sectionBar(doc, Y, W, 'BREAKDOWN DETALHADO  -  Composicao passo a passo da penalidade');

    data.breakdown.forEach((row, idx) => {
      Y = guard(doc, Y, 12);
      const isLast   = idx === data.breakdown!.length - 1;
      const isNeg    = row.valor < 0;
      const hasBadge = !!row.percentual;

      // Row background
      const bgFill: [number,number,number] = isLast
        ? C.blueLight
        : idx % 2 === 0 ? C.slate100 : C.white;
      doc.setFillColor(...bgFill);
      doc.setDrawColor(...C.slate200);
      doc.roundedRect(MARGIN, Y, CONTENT_W, 10, 1, 1, 'FD');

      // Badge
      const badgeW = hasBadge ? 18 : 0;
      if (hasBadge) {
        const bColor: [number,number,number] = isNeg ? C.green : C.red;
        doc.setFillColor(...bColor);
        doc.roundedRect(MARGIN + 2, Y + 2, badgeW, 6, 1, 1, 'F');
        doc.setTextColor(...C.white);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(row.percentual!, MARGIN + 2 + badgeW / 2, Y + 6.5, { align: 'center' });
      }

      // Description
      const descX = MARGIN + (hasBadge ? badgeW + 5 : 4);
      const maxDescW = CONTENT_W - (hasBadge ? badgeW + 8 : 6) - 38;
      const descTxt = doc.splitTextToSize(row.descricao, maxDescW);
      const tColor: [number,number,number] = isLast ? C.blue : C.dark;
      doc.setTextColor(...tColor);
      doc.setFontSize(isLast ? 8 : 7.5);
      doc.setFont('helvetica', isLast ? 'bold' : 'normal');
      doc.text(descTxt[0], descX, Y + 6.5); // Only first line to avoid overflow

      // Value (right-aligned)
      const valStr = isNeg
        ? `-${formatBRL(Math.abs(row.valor))}`
        : formatBRL(row.valor);
      const vColor: [number,number,number] = isLast ? C.blue : isNeg ? C.green : C.dark;
      doc.setTextColor(...vColor);
      doc.setFontSize(isLast ? 8.5 : 8);
      doc.setFont('helvetica', 'bold');
      doc.text(valStr, MARGIN + CONTENT_W - 2, Y + 6.5, { align: 'right' });

      Y += 11;
    });
    Y += 5;
  }

  // ── NIVEL DE RISCO ───────────────────────────────────────────
  if (data.nivelRisco) {
    const { bg, border, text } = riskColors(data.nivelRisco);
    Y = guard(doc, Y, 22);

    // split label to avoid right overflow
    const riskLines = doc.splitTextToSize(text, CONTENT_W - 10);
    const riskH = 10 + riskLines.length * 5 + 4;

    doc.setFillColor(...bg);
    doc.setDrawColor(...border);
    doc.roundedRect(MARGIN, Y, CONTENT_W, riskH, 2, 2, 'FD');
    doc.setTextColor(border[0], border[1], border[2]);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(riskLines, MARGIN + 5, Y + 8);
    Y += riskH + 8;
  }

  // ── FUNDAMENTACAO LEGAL ──────────────────────────────────────
  if (data.fundamentacaoLegal) {
    // strip emojis/special chars for safe rendering
    const legalText = data.fundamentacaoLegal.replace(/[^\x00-\xFF]/g, '');
    const lLines = doc.splitTextToSize(legalText, CONTENT_W - 10);
    const lH = 14 + lLines.length * 5 + 4;
    Y = guard(doc, Y, lH + 4);

    doc.setFillColor(...C.purpleLight);
    doc.setDrawColor(...C.purple);
    doc.roundedRect(MARGIN, Y, CONTENT_W, lH, 2, 2, 'FD');

    doc.setTextColor(...C.purple);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FUNDAMENTACAO LEGAL:', MARGIN + 5, Y + 8);

    doc.setTextColor(79, 40, 180);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(lLines, MARGIN + 5, Y + 15);
    Y += lH + 8;
  }

  // ── PARAMETROS TEXTUAIS ──────────────────────────────────────
  if (data.parametrosTextuais && data.parametrosTextuais.length > 0) {
    const pLines: string[][] = [];
    let totalPH = 14;
    data.parametrosTextuais.forEach(p => {
      const safe = `- ${p.label}: ${p.valor}`.replace(/[^\x00-\xFF]/g, '');
      const lines = doc.splitTextToSize(safe, CONTENT_W - 10);
      pLines.push(lines);
      totalPH += lines.length * 5 + 2;
    });

    Y = guard(doc, Y, totalPH + 4);
    doc.setFillColor(...C.slate100);
    doc.setDrawColor(...C.slate200);
    doc.roundedRect(MARGIN, Y, CONTENT_W, totalPH, 2, 2, 'FD');
    doc.setTextColor(...C.blue);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PARAMETROS E JUSTIFICATIVAS ADOTADOS:', MARGIN + 5, Y + 8);
    let pY = Y + 15;
    doc.setTextColor(...C.dark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    pLines.forEach(lines => {
      doc.text(lines, MARGIN + 5, pY);
      pY += lines.length * 5 + 2;
    });
    Y += totalPH + 8;
  }

  // ── TABELA DE DETALHES ───────────────────────────────────────
  if (data.detalhes && data.detalhes.length > 0) {
    Y = guard(doc, Y, 20);
    doc.setTextColor(...C.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHAMENTO CONTRATUAL:', MARGIN, Y);
    Y += 5;

    autoTable(doc, {
      startY: Y,
      head: [['Item / Conduta', 'Fundamentacao', 'Impacto (R$)']],
      body: data.detalhes.map(d => [
        String(d.label).replace(/[^\x00-\xFF]/g, ''),
        String(d.clause).replace(/[^\x00-\xFF]/g, ''),
        formatBRL(Number(d.value)),
      ]),
      headStyles: { fillColor: C.blue, textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: C.dark },
      alternateRowStyles: { fillColor: C.slate100 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 },
        2: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    Y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // ── EVIDENCIA VISUAL ─────────────────────────────────────────
  if (data.image) {
    Y = guard(doc, Y, 20);
    doc.setTextColor(...C.blue);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDENCIA VISUAL DA SIMULACAO:', MARGIN, Y);
    Y += 4;

    try {
      const imgWidth  = CONTENT_W;
      const imgHeight = imgWidth * 0.6;
      Y = guard(doc, Y, imgHeight + 5);
      doc.addImage(data.image, 'JPEG', MARGIN, Y, imgWidth, imgHeight, undefined, 'FAST');
      Y += imgHeight + 10;
    } catch (e) {
      console.error('Erro ao inserir imagem no PDF', e);
    }
  }

  // ── RODAPE ───────────────────────────────────────────────────
  const totalPgs = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPgs; i++) {
    doc.setPage(i);
    const pH = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...C.green);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, pH - 16, W - MARGIN, pH - 16);

    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Relatorio gerado para fins de compliance regulatorio. Valores sujeitos a apreciacao final pela AGRESE.',
      MARGIN, pH - 10
    );
    doc.text(
      'Resolucao AGRESE 96/2025  -  Contrato CPA  -  Contrato CI',
      MARGIN, pH - 5
    );
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.blue);
    doc.text(`Pagina ${i} de ${totalPgs}`, W - MARGIN, pH - 7, { align: 'right' });
  }

  doc.save(`SPD_Relatorio_${data.identificador}_${Date.now()}.pdf`);
};
