// ── Sonepar Webshop Integration ──────────────────────────
// Deeplink-Generator für den Sonepar Online-Shop
// Öffnet Artikelsuche direkt im Browser mit dem richtigen Suchbegriff

const SONEPAR_BASE_URL = 'https://www.sonepar.de';
const SONEPAR_SEARCH_PATH = '/c/suchergebnisseite';

/**
 * Erzeugt einen Sonepar-Webshop-Suchlink für einen Artikel.
 * Nutzt den Produktnamen – Sonepar's serverseitige Suche (per URL)
 * unterstützt keine Hersteller-Artikelnummern, nur Produktbeschreibungen.
 * 
 * @param {Object} material - Das Material-Objekt
 * @returns {string} Die Sonepar-URL mit Suchparameter
 */
export function getSoneparSearchUrl(material) {
  const query = material.name || material.article_number;
  return `${SONEPAR_BASE_URL}${SONEPAR_SEARCH_PATH}?query=${encodeURIComponent(query)}`;
}

/**
 * Erzeugt einen Sonepar-Deeplink für eine Artikelnummer.
 * Falls Sonepar die Artikelnummer erkennt, landet man direkt auf dem Produkt.
 * 
 * @param {string} articleNumber - Die Artikelnummer
 * @returns {string} Die Sonepar-Such-URL
 */
export function getSoneparArticleUrl(articleNumber) {
  return `${SONEPAR_BASE_URL}${SONEPAR_SEARCH_PATH}?query=${encodeURIComponent(articleNumber)}`;
}

/**
 * Öffnet den Sonepar-Shop in einem neuen Tab mit der Artikel-Suche.
 * Nutzt einen dynamischen Link-Klick statt window.open(), 
 * damit die Sonepar-Session/Cookies im neuen Tab erhalten bleiben.
 * 
 * @param {Event} e - Das Click-Event
 * @param {Object} material - Das Material-Objekt
 */
export function openSoneparForMaterial(e, material) {
  e.stopPropagation();
  const url = getSoneparSearchUrl(material);
  
  // Dynamischer <a>-Klick bewahrt die Browser-Session (Cookies)
  // window.open() aus einer anderen Domain (localhost) tut das nicht immer
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = '';
  link.click();
}

/**
 * Erzeugt eine "mailto:"-URL für eine Sammelbestellung per E-Mail an den Lieferanten.
 * 
 * @param {Array} items - Array von Material-Objekten mit reorder_quantity
 * @param {string} supplierEmail - E-Mail des Lieferanten
 * @param {string} supplierName - Name des Lieferanten
 * @returns {string} Die mailto-URL
 */
export function generateOrderMailto(items, supplierEmail, supplierName) {
  const subject = `Bestellung - ${new Date().toLocaleDateString('de-DE')}`;
  
  const body = [
    `Sehr geehrte Damen und Herren,`,
    ``,
    `bitte liefern Sie folgende Artikel:`,
    ``,
    `──────────────────────────────────`,
    ...items.map((item, i) => 
      `${i + 1}. ${item.name}\n   Art.-Nr.: ${item.article_number}\n   Menge: ${item.reorder_quantity} ${item.unit}\n   ${item.packaging_unit ? `VPE: ${item.packaging_unit}` : ''}`
    ),
    `──────────────────────────────────`,
    ``,
    `Gesamt: ${items.length} Positionen`,
    ``,
    `Mit freundlichen Grüßen`,
  ].join('\n');
  
  return `mailto:${supplierEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
