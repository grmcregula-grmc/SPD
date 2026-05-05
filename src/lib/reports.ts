import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBRL } from './calculators';

export const captureElement = async (element: HTMLElement | null) => {
  if (!element) return '';
  try {
    // Aguarda um pouco para garantir renderização final (ex: animações de charts)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#f8fafc',
      scale: 1.2, // Equilíbrio entre qualidade e tamanho no localStorage
      logging: false,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Força dimensões em elementos que usam ResponsiveContainer do Recharts
        const charts = clonedDoc.querySelectorAll('.recharts-responsive-container');
        charts.forEach((chart: any) => {
           chart.style.width = '800px';
           chart.style.height = '400px';
           chart.style.visibility = 'visible';
        });
      }
    });
    // JPEG 0.6 é muito mais leve que PNG para persistência em localStorage
    return canvas.toDataURL('image/jpeg', 0.6); 
  } catch (err) {
    console.error('Erro na captura de tela:', err);
    return '';
  }
};

export const generatePDFReport = (data: {
  titulo: string;
  subtitulo: string;
  total: number;
  dataOcorrencia?: string;
  descricaoOcorrencia?: string;
  detalhes: Record<string, unknown>[];
  parametrosTextuais?: { label: string; valor: string }[];
  identificador: string;
  image?: string;
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Branding Colors
  const desoBlue: [number, number, number] = [46, 84, 163]; // #2e54a3
  const desoGreen: [number, number, number] = [77, 175, 68]; // #4daf44

  // Header
  doc.setFillColor(desoBlue[0], desoBlue[1], desoBlue[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SPD - SIMULADOR DE PENALIDADES', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DESO • Companhia de Saneamento de Sergipe', 15, 28);
  doc.text(`Identificador: ${data.identificador} | Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, 33);

  // Content
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(16);
  doc.text(data.titulo.toUpperCase(), 15, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(data.subtitulo, 15, 62);

  let currentY = 70;

  // Occurrence Context (if available)
  if (data.descricaoOcorrencia || data.dataOcorrencia) {
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(15, 68, pageWidth - 30, 20, 'F');
    doc.setTextColor(desoBlue[0], desoBlue[1], desoBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA OCORRÊNCIA:', 20, 75);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    const dataFmt = data.dataOcorrencia ? data.dataOcorrencia.split('-').reverse().join('/') : '---';
    doc.text(`Data: ${dataFmt} | Descrição: ${data.descricaoOcorrencia || 'N/A'}`, 20, 81);
    currentY = 95;
  }

  // Textual Parameters (Justifications, Criteria, etc)
  if (data.parametrosTextuais && data.parametrosTextuais.length > 0) {
    let requiredHeight = 10;
    const splitTexts: any[] = [];
    data.parametrosTextuais.forEach(param => {
      const splitLabel = doc.splitTextToSize(`${param.label}: ${param.valor}`, pageWidth - 40);
      splitTexts.push(splitLabel);
      requiredHeight += (splitLabel.length * 5);
    });

    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(15, currentY, pageWidth - 30, requiredHeight, 'F');
    doc.setTextColor(desoBlue[0], desoBlue[1], desoBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PARÂMETROS E JUSTIFICATIVAS ADOTADOS:', 20, currentY + 7);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    
    let paramY = currentY + 13;
    splitTexts.forEach(splitLabel => {
      doc.text(splitLabel, 20, paramY);
      paramY += (splitLabel.length * 5);
    });
    
    currentY += requiredHeight + 5;
  }

  // Total Impact Highlight
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(15, currentY, pageWidth - 30, 25, 3, 3, 'FD');
  
  doc.setTextColor(desoBlue[0], desoBlue[1], desoBlue[2]);
  doc.setFontSize(12);
  doc.text('VALOR TOTAL ESTIMADO DA PENALIDADE:', 25, currentY + 10);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(formatBRL(data.total), 25, currentY + 18);

  // Details Table
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text('DETALHAMENTO CONTRATUAL:', 15, currentY + 40);
  currentY += 45;

  autoTable(doc, {
    startY: currentY,
    head: [['Item / Conduta', 'Fundamentação', 'Impacto Financeiro']],
    body: data.detalhes.map(d => [String(d.label), String(d.clause), formatBRL(Number(d.value))]),
    headStyles: { fillColor: desoBlue, textColor: 255, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
  });

  let finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Visual Evidence (Screenshot)
  if (data.image) {
    // Check if image fits in current page
    if (finalY + 100 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(desoBlue[0], desoBlue[1], desoBlue[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDÊNCIA VISUAL DA SIMULAÇÃO:', 15, finalY);
    
    try {
      // Calculate aspect ratio for image
      // Assuming capture is roughly 400-600px wide
      const imgWidth = pageWidth - 30;
      const imgHeight = (imgWidth * 0.75); // Default aspect ratio if unknown
      doc.addImage(data.image, 'PNG', 15, finalY + 5, imgWidth, imgHeight, undefined, 'FAST');
      finalY += imgHeight + 15;
    } catch (e) {
      console.error('Erro ao inserir imagem no PDF', e);
    }
  }

  // Regulatory Footer
  if (finalY + 20 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    finalY = 20;
  }
  
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Relatório gerado para fins de compliance regulatório. Valores sujeitos a apreciação final pela AGRESE.', 15, finalY + 10);
  doc.text('Resolução AGRESE 96/2025 • Contrato de Produção de Água CPA • Contrato de Interdependência CI', 15, finalY + 5);

  // Watermark decorative lines
  doc.setDrawColor(desoGreen[0], desoGreen[1], desoGreen[2]);
  doc.setLineWidth(1);
  doc.line(15, finalY + 12, pageWidth - 15, finalY + 12);

  doc.save(`SPD_Relatorio_${data.identificador}_${Date.now()}.pdf`);
};
