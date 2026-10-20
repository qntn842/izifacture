import type { jsPDF as JsPDF } from 'jspdf';
import { CompanySettings, Invoice, InvoiceStatus } from '@/types';
import { formatDateFR, formatFCFA, formatLocation, STATUS_CONFIG } from '@/lib/utils/format';

/**
 * Génère la facture en PDF A4 "dessiné" (texte vectoriel, sélectionnable).
 * Chaque élément est placé à une position précise : le rendu est identique
 * quel que soit le navigateur (Chrome, Firefox, Safari...) et rien ne dépasse de la page.
 * Reprend la mise en page de InvoicePaperPreview.
 */

type RGB = [number, number, number];

const C = {
  slate900: [15, 23, 42] as RGB,
  slate800: [30, 41, 59] as RGB,
  slate700: [51, 65, 85] as RGB,
  slate600: [71, 85, 105] as RGB,
  slate500: [100, 116, 139] as RGB,
  slate400: [148, 163, 184] as RGB,
  slate200: [226, 232, 240] as RGB,
  slate100: [241, 245, 249] as RGB,
  slate50: [248, 250, 252] as RGB,
  blue600: [37, 99, 235] as RGB,
  blue700: [29, 78, 216] as RGB,
  blue100: [219, 234, 254] as RGB,
  blue50: [239, 246, 255] as RGB,
  indigo600: [79, 70, 229] as RGB,
  rose600: [225, 29, 72] as RGB,
  emerald600: [5, 150, 105] as RGB,
  white: [255, 255, 255] as RGB,
};

// Couleurs des badges de statut (équivalent de STATUS_CONFIG en RGB)
const STATUS_COLORS: Record<InvoiceStatus, { bg: RGB; text: RGB; border: RGB; dot: RGB }> = {
  payee: { bg: [236, 253, 245], text: [4, 120, 87], border: [167, 243, 208], dot: [16, 185, 129] },
  envoyee: { bg: [255, 251, 235], text: [180, 83, 9], border: [253, 230, 138], dot: [245, 158, 11] },
  brouillon: { bg: [241, 245, 249], text: [71, 85, 105], border: [226, 232, 240], dot: [148, 163, 184] },
  en_retard: { bg: [255, 241, 242], text: [190, 18, 60], border: [254, 205, 211], dot: [244, 63, 94] },
  annulee: { bg: [244, 244, 245], text: [113, 113, 122], border: [228, 228, 231], dot: [161, 161, 170] },
};

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16; // marges
const CONTENT_W = PAGE_W - 2 * M;
const LINE = 4.2; // hauteur d'une ligne de texte 8.5pt

export async function generateInvoicePdf(invoice: Invoice, company: CompanySettings): Promise<JsPDF> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const font = (style: 'normal' | 'bold' | 'italic' | 'bolditalic', size: number, color: RGB) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };
  const hLine = (x1: number, x2: number, y: number, color: RGB, width = 0.2) => {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(width);
    pdf.line(x1, y, x2, y);
  };
  const wrap = (text: string, width: number): string[] => pdf.splitTextToSize(text, width);

  /* ---------- En-tête : entreprise (gauche) / FACTURE + dates (droite) ---------- */
  let y = M;
  const rightColW = 72;
  const leftColW = CONTENT_W - rightColW - 8;

  // Logo "IF"
  pdf.setFillColor(...C.blue600);
  pdf.roundedRect(M, y, 11, 11, 2.5, 2.5, 'F');
  font('bold', 11, C.white);
  pdf.text('IF', M + 5.5, y + 7.3, { align: 'center' });

  // Nom + ville
  font('bold', 13, C.slate900);
  const nameLines = wrap(company.company_name, leftColW - 14);
  pdf.text(nameLines, M + 14, y + 4.6);
  let leftY = y + 4.6 + (nameLines.length - 1) * 5.4;
  font('normal', 7.5, C.slate400);
  pdf.text(formatLocation(company.city, company.country).toUpperCase(), M + 14, leftY + 4.4, { charSpace: 0.2 });
  leftY = Math.max(leftY + 4.4, y + 11) + 6;

  // Coordonnées
  font('normal', 8.5, C.slate500);
  for (const value of [company.address_line1, company.phone, company.email]) {
    if (!value) continue;
    const lines = wrap(value, leftColW);
    pdf.text(lines, M, leftY);
    leftY += lines.length * LINE;
  }

  // FACTURE + badge de statut
  const statusKey: InvoiceStatus =
    invoice.is_late || invoice.status === 'en_retard' ? 'en_retard' : invoice.status;
  const statusColors = STATUS_COLORS[statusKey] ?? STATUS_COLORS.brouillon;
  const statusLabel = (STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.brouillon).label;

  font('normal', 8, statusColors.text);
  const pillW = pdf.getTextWidth(statusLabel) + 8;
  const pillH = 5.6;
  const pillX = PAGE_W - M - pillW;
  pdf.setFillColor(...statusColors.bg);
  pdf.setDrawColor(...statusColors.border);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(pillX, y + 1.6, pillW, pillH, pillH / 2, pillH / 2, 'FD');
  pdf.setFillColor(...statusColors.dot);
  pdf.circle(pillX + 3, y + 1.6 + pillH / 2, 0.7, 'F');
  pdf.text(statusLabel, pillX + 5, y + 1.6 + pillH / 2 + 1.1);

  font('bold', 24, C.slate900);
  pdf.text('FACTURE', pillX - 3, y + 8.4, { align: 'right' });

  font('bold', 10, C.slate500);
  pdf.text(`N° ${invoice.invoice_number}`, PAGE_W - M, y + 15, { align: 'right' });

  hLine(PAGE_W - M - rightColW, PAGE_W - M, y + 19, C.slate100);

  // Dates (empilées, alignées à droite)
  const dateRow = (label: string, value: string, valueColor: RGB, rowY: number) => {
    font('bold', 8.5, valueColor);
    pdf.text(value, PAGE_W - M, rowY, { align: 'right' });
    const valueW = pdf.getTextWidth(value);
    font('normal', 8.5, C.slate400);
    pdf.text(label, PAGE_W - M - valueW - 2.5, rowY, { align: 'right' });
  };
  dateRow('Émise le :', formatDateFR(invoice.issue_date), C.slate800, y + 24);
  dateRow('Échéance :', formatDateFR(invoice.due_date), C.rose600, y + 29);
  const rightY = y + 29;

  y = Math.max(leftY, rightY) + 5;
  hLine(M, PAGE_W - M, y, C.slate100);
  y += 7;

  /* ---------- Bloc Émetteur / Client ---------- */
  const colW = CONTENT_W / 2 - 8;
  const issuerLines = [
    ...(company.address_line1 ? wrap(company.address_line1, colW) : []),
    ...(formatLocation(company.city, company.country) ? wrap(formatLocation(company.city, company.country), colW) : []),
  ];
  const issuerExtra = [company.phone, company.registration_number ? `RC / NINEA : ${company.registration_number}` : '']
    .filter(Boolean) as string[];
  const clientLines = [invoice.client_email, invoice.client_phone].filter(Boolean) as string[];

  font('bold', 10.5, C.slate900);
  const issuerNameLines = wrap(company.company_name, colW);
  const clientNameLines = wrap(invoice.client_name, colW);
  const NAME_LINE = 4.3;
  const issuerH = 4 + 5 + (issuerNameLines.length - 1) * NAME_LINE + issuerLines.length * LINE + 1 + issuerExtra.length * LINE;
  const clientH = 4 + 5 + (clientNameLines.length - 1) * NAME_LINE + clientLines.length * LINE + 8;
  const boxH = Math.max(issuerH, clientH) + 9;

  pdf.setFillColor(...C.slate50);
  pdf.setDrawColor(...C.slate100);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(M, y, CONTENT_W, boxH, 3, 3, 'FD');

  const partyBlock = (x: number, label: string, nameLines: string[]) => {
    font('bold', 7, C.slate400);
    pdf.text(label.toUpperCase(), x, y + 7, { charSpace: 0.25 });
    font('bold', 10.5, C.slate900);
    pdf.text(nameLines, x, y + 12.5, { lineHeightFactor: 1.15 });
    return y + 12.5 + (nameLines.length - 1) * NAME_LINE + LINE + 0.5;
  };

  // Émetteur
  const x1 = M + 6;
  let py = partyBlock(x1, 'Émetteur', issuerNameLines);
  font('normal', 8.5, C.slate600);
  pdf.text(issuerLines, x1, py);
  py += issuerLines.length * LINE + 1;
  font('normal', 8, C.slate500);
  for (const line of issuerExtra) {
    pdf.text(wrap(line, colW)[0], x1, py);
    py += LINE;
  }

  // Client
  const x2 = M + CONTENT_W / 2 + 4;
  py = partyBlock(x2, 'Facturé à (client)', clientNameLines);
  font('normal', 8.5, C.slate600);
  for (const line of clientLines) {
    pdf.text(wrap(line, colW)[0], x2, py);
    py += LINE;
  }
  // Pastille devise
  const currencyText = `Devise : FCFA (${invoice.currency || company.currency})`;
  font('normal', 7.5, C.blue700);
  const curW = pdf.getTextWidth(currencyText) + 5;
  pdf.setFillColor(...C.blue50);
  pdf.setDrawColor(...C.blue100);
  pdf.roundedRect(x2, py - 0.5, curW, 5.2, 1.2, 1.2, 'FD');
  pdf.text(currencyText, x2 + 2.5, py + 3);

  y += boxH + 9;

  /* ---------- Tableau des prestations ---------- */
  const colQtyW = 16;
  const colUnitW = 34;
  const colTotalW = 36;
  const descW = CONTENT_W - colQtyW - colUnitW - colTotalW - 6;
  const xQty = M + descW + 3 + colQtyW / 2;
  const xUnit = M + descW + 3 + colQtyW + colUnitW;
  const xTotal = PAGE_W - M;

  const tableHeader = () => {
    font('bold', 7.5, C.slate400);
    pdf.text('DESCRIPTION', M, y, { charSpace: 0.25 });
    pdf.text('QTÉ', xQty, y, { align: 'center' });
    pdf.text('PRIX UNIT.', xUnit, y, { align: 'right' });
    pdf.text('TOTAL', xTotal, y, { align: 'right' });
    y += 3;
    hLine(M, PAGE_W - M, y, C.slate200, 0.3);
    y += 6;
  };
  const ensureSpace = (needed: number, withTableHeader = false) => {
    if (y + needed <= PAGE_H - M) return;
    pdf.addPage();
    y = M + 4;
    if (withTableHeader) tableHeader();
  };

  tableHeader();

  const items = invoice.items ?? [];
  if (items.length === 0) {
    font('italic', 8.5, C.slate400);
    pdf.text('Aucune ligne', PAGE_W / 2, y + 2, { align: 'center' });
    y += 10;
  }
  items.forEach((item, index) => {
    font('normal', 9.5, C.slate800);
    const descLines = wrap(item.description || 'Prestation sans nom', descW);
    const textH = (descLines.length - 1) * 3.9; // 9.5pt x 1.15 d'interligne
    ensureSpace(textH + 9, true);

    font('normal', 9.5, C.slate800);
    pdf.text(descLines, M, y, { lineHeightFactor: 1.15 });
    font('normal', 9, C.slate600);
    pdf.text(String(item.quantity || 1), xQty, y, { align: 'center' });
    pdf.text(formatFCFA(item.unit_price || 0), xUnit, y, { align: 'right' });
    font('bold', 9, C.slate900);
    pdf.text(formatFCFA(item.line_total || 0), xTotal, y, { align: 'right' });

    y += textH + 4.5;
    if (index < items.length - 1) hLine(M, PAGE_W - M, y, C.slate100);
    y += 6;
  });

  /* ---------- Paiement (gauche) + Totaux (droite) ---------- */
  const notesW = 82;
  font('italic', 8, C.slate600);
  const noteLines = invoice.notes ? wrap(`« ${invoice.notes} »`, notesW - 6) : [];
  const paymentBoxH = 4 + 2 * LINE + (noteLines.length ? 3 + noteLines.length * LINE : 0) + 2;
  const totalsH = 6 + 7 * (invoice.discount_amount > 0 ? 3 : 2) + 12;
  ensureSpace(Math.max(paymentBoxH + 8, totalsH) + 26);

  hLine(M, PAGE_W - M, y, C.slate200, 0.3);
  y += 7;
  const blockTop = y;

  // Moyens de paiement
  font('bold', 8.5, C.slate700);
  pdf.text('Moyens de paiement acceptés :', M, y);
  const boxTop = y + 3;
  pdf.setFillColor(...C.slate50);
  pdf.setDrawColor(...C.slate100);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(M, boxTop, notesW, paymentBoxH, 2.5, 2.5, 'FD');
  let ny = boxTop + 5;
  font('normal', 8, C.slate500);
  pdf.text('• Virement bancaire (RIB sur demande)', M + 3, ny);
  ny += LINE;
  pdf.text('• Mobile Money : Wave, Orange Money, MTN MoMo', M + 3, ny);
  ny += LINE;
  if (noteLines.length) {
    hLine(M + 3, M + notesW - 3, ny - 1.5, C.slate200);
    font('italic', 8, C.slate600);
    pdf.text(noteLines, M + 3, ny + 2.5);
  }
  const leftBottom = boxTop + paymentBoxH;

  // Totaux
  const totalsX = PAGE_W - M - 72;
  let ty = blockTop;
  const totalRow = (label: string, value: string, color: RGB, valueColor: RGB) => {
    font('normal', 8.5, color);
    pdf.text(label, totalsX, ty);
    font('bold', 8.5, valueColor);
    pdf.text(value, PAGE_W - M, ty, { align: 'right' });
    ty += 3;
  };
  totalRow('Sous-total HT', formatFCFA(invoice.subtotal), C.slate600, C.slate900);
  if (invoice.discount_amount > 0) {
    ty += 4;
    totalRow(`Remise (${invoice.discount_rate}%)`, `- ${formatFCFA(invoice.discount_amount)}`, C.emerald600, C.emerald600);
  }
  hLine(totalsX, PAGE_W - M, ty, C.slate100);
  ty += 4.5;
  totalRow(`TVA (${invoice.tax_rate}%)`, formatFCFA(invoice.tax_amount), C.slate600, C.slate900);
  ty += 1;
  hLine(totalsX, PAGE_W - M, ty, C.slate900, 0.6);
  ty += 7;
  font('bold', 13, C.slate900);
  pdf.text('Total TTC', totalsX, ty);
  font('bold', 13, C.blue600);
  pdf.text(formatFCFA(invoice.total), PAGE_W - M, ty, { align: 'right' });

  y = Math.max(leftBottom, ty) + 12;

  /* ---------- Pied de page ---------- */
  ensureSpace(16);
  hLine(M, PAGE_W - M, y, C.slate100);
  y += 6;
  font('normal', 8, C.slate400);
  pdf.text('Merci pour votre confiance.', M, y);
  font('normal', 7, C.slate400);
  pdf.text('IZI FACTURE — Facturation certifiée UEMOA/Afrique', M, y + 4);
  font('bolditalic', 9, C.slate700);
  const signatureLines = wrap(company.company_name, 85);
  pdf.text(signatureLines, PAGE_W - M, y, { align: 'right', lineHeightFactor: 1.15 });
  font('normal', 7, C.slate400);
  pdf.text('Signature autorisée', PAGE_W - M, y + 4 + (signatureLines.length - 1) * 4.1, { align: 'right' });

  pdf.setProperties({
    title: `Facture ${invoice.invoice_number}`,
    author: company.company_name,
    subject: `Facture pour ${invoice.client_name}`,
  });

  return pdf;
}

/** Génère et télécharge la facture en PDF. */
export async function downloadInvoicePdf(invoice: Invoice, company: CompanySettings) {
  const pdf = await generateInvoicePdf(invoice, company);
  pdf.save(`Facture-${invoice.invoice_number}.pdf`);
}
