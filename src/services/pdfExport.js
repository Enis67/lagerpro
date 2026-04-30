// ── PDF-Export Service ───────────────────────────────────
// Erzeugt professionelle PDF-Bestelllisten mit jsPDF

import { jsPDF } from 'jspdf';
import { UNIT_LABELS } from '../data/constants';

/**
 * Erzeugt ein PDF für die Nachbestellliste eines Lieferanten.
 * 
 * @param {Array} items - Array von Material-Objekten mit reorder_quantity
 * @param {string} supplierName - Name des Lieferanten
 */
export function generateReorderPDF(items, supplierName) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // ── Header ──────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`LagerPro – Bestellliste`, margin, y);
  doc.text(new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }), pageWidth - margin, y, { align: 'right' });
  y += 12;

  // Firmenname / Titel
  doc.setFontSize(18);
  doc.setTextColor(27, 42, 74); // Primary color
  doc.text(`Bestellung`, margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Lieferant: ${supplierName}`, margin, y);
  y += 10;

  // ── Trennlinie ──────────────────────────────────
  doc.setDrawColor(27, 42, 74);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ── Tabellen-Header ─────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Pos.', margin, y);
  doc.text('Artikelname', margin + 12, y);
  doc.text('Art.-Nr.', margin + 90, y);
  doc.text('Menge', margin + 125, y);
  doc.text('Einheit', margin + 143, y);
  doc.text('EK-Preis', pageWidth - margin, y, { align: 'right' });
  y += 2;

  doc.setDrawColor(200);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ── Tabellen-Inhalt ─────────────────────────────
  let totalCost = 0;
  doc.setTextColor(40);

  items.forEach((item, i) => {
    // Neue Seite wenn nötig
    if (y > 265) {
      doc.addPage();
      y = margin + 10;
    }

    const lineTotal = (item.purchase_price || 0) * item.reorder_quantity;
    totalCost += lineTotal;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`${i + 1}.`, margin, y);
    
    // Artikelname (gekürzt wenn zu lang)
    const name = item.name.length > 40 ? item.name.substring(0, 38) + '…' : item.name;
    doc.setFont(undefined, 'bold');
    doc.text(name, margin + 12, y);
    
    doc.setFont(undefined, 'normal');
    doc.text(item.article_number || '–', margin + 90, y);
    doc.text(`${item.reorder_quantity}`, margin + 125, y);
    doc.text(UNIT_LABELS[item.unit] || item.unit || '', margin + 143, y);
    doc.text(`${lineTotal.toFixed(2)} €`, pageWidth - margin, y, { align: 'right' });
    
    // Herstellernummer falls vorhanden
    if (item.manufacturer_number) {
      y += 4;
      doc.setFontSize(7);
      doc.setTextColor(130);
      doc.text(`Hersteller-Nr.: ${item.manufacturer_number}`, margin + 12, y);
      doc.setTextColor(40);
    }

    y += 7;

    // Trennlinie zwischen Artikeln
    doc.setDrawColor(230);
    doc.setLineWidth(0.1);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
  });

  // ── Summe ───────────────────────────────────────
  y += 5;
  doc.setDrawColor(27, 42, 74);
  doc.setLineWidth(0.5);
  doc.line(margin + 100, y - 3, pageWidth - margin, y - 3);

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(27, 42, 74);
  doc.text(`Gesamt: ${items.length} Positionen`, margin, y + 2);
  doc.text(`${totalCost.toFixed(2)} €`, pageWidth - margin, y + 2, { align: 'right' });

  // ── Footer ──────────────────────────────────────
  y += 20;
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(150);
  doc.text('Erstellt mit LagerPro – Materialverwaltung für Elektrobetriebe', margin, y);

  // ── Download ────────────────────────────────────
  const filename = `bestellung_${supplierName.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Erzeugt ein Gesamt-PDF für alle Lieferanten.
 */
export function generateFullReorderPDF(itemsBySupplier) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  let y = margin;
  let isFirstPage = true;

  // ── Deckblatt ───────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`LagerPro – Nachbestellliste`, margin, y);
  doc.text(new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }), pageWidth - margin, y, { align: 'right' });
  y += 15;

  doc.setFontSize(22);
  doc.setTextColor(27, 42, 74);
  doc.text(`Nachbestellliste`, margin, y);
  y += 10;

  const totalItems = Object.values(itemsBySupplier).reduce((sum, items) => sum + items.length, 0);
  const totalValue = Object.values(itemsBySupplier).reduce((sum, items) => 
    sum + items.reduce((s, i) => s + (i.purchase_price || 0) * i.reorder_quantity, 0), 0);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`${totalItems} Artikel bei ${Object.keys(itemsBySupplier).length} Lieferanten`, margin, y);
  y += 6;
  doc.text(`Geschätzter Gesamtwert: ${totalValue.toFixed(2)} €`, margin, y);
  y += 12;

  doc.setDrawColor(27, 42, 74);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── Pro Lieferant ────────────────────────────────
  Object.entries(itemsBySupplier).forEach(([supplierName, items]) => {
    if (y > 240) {
      doc.addPage();
      y = margin + 10;
    }

    // Lieferant-Header
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(27, 42, 74);
    doc.text(supplierName, margin, y);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`${items.length} Artikel`, pageWidth - margin, y, { align: 'right' });
    y += 6;

    // Tabelle
    items.forEach((item, i) => {
      if (y > 265) {
        doc.addPage();
        y = margin + 10;
      }

      const lineTotal = (item.purchase_price || 0) * item.reorder_quantity;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(40);
      doc.text(`${i + 1}.`, margin + 2, y);
      
      doc.setFont(undefined, 'bold');
      const name = item.name.length > 35 ? item.name.substring(0, 33) + '…' : item.name;
      doc.text(name, margin + 12, y);
      
      doc.setFont(undefined, 'normal');
      doc.text(`${item.reorder_quantity} ${UNIT_LABELS[item.unit] || ''}`, margin + 115, y);
      doc.text(`${lineTotal.toFixed(2)} €`, pageWidth - margin, y, { align: 'right' });
      y += 5.5;
    });

    // Lieferant-Summe
    const supplierTotal = items.reduce((sum, i) => sum + (i.purchase_price || 0) * i.reorder_quantity, 0);
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(margin + 100, y, pageWidth - margin, y);
    y += 4;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text(`Summe ${supplierName}: ${supplierTotal.toFixed(2)} €`, pageWidth - margin, y, { align: 'right' });
    y += 12;
  });

  // ── Footer ──────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(150);
  doc.text('Erstellt mit LagerPro – Materialverwaltung für Elektrobetriebe', margin, 285);

  const filename = `nachbestellliste_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
