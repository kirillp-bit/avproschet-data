import { escapeHtml } from '../utils/format.js';

export function CatalogQualityReport(report = {}) {
  const cards = [
    ['Всего supplier-позиций', report.totalSupplierItems], ['Всего в библиотеке', report.totalItems], ['AV core', report.avCore], ['AV infrastructure', report.avInfrastructure], ['IT related', report.itRelated], ['Consumables', report.consumables], ['Questionable', report.questionable], ['Hidden', report.hidden], ['Без категории', report.withoutCategory], ['Без цены', report.withoutPrice], ['Requires review', report.requiresReview], ['Approved for auto estimate', report.approvedForAutoEstimate], ['Hidden by default', report.hiddenByDefault]
  ];
  return `<section class="card"><div class="sectionTitle"><div><h3>Catalog Quality Report</h3><p class="muted">Сводка пригодности каталога для AV-пресейла.</p></div><div class="actions"><button class="btn ghost small" data-export-quality-json>JSON</button><button class="btn ghost small" data-export-quality-csv>CSV</button></div></div><div class="grid cols4">${cards.map(([label, value]) => `<div class="metric"><span>${escapeHtml(label)}</span><strong>${Number(value || 0).toLocaleString('ru-RU')}</strong></div>`).join('')}</div></section>`;
}
