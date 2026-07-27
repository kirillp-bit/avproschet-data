import { escapeHtml } from '../utils/format.js';
export function KpiStrip(items = []) {
  return `<section class="kpiStrip">${items.map(item => `<div class="kpiCard ${escapeHtml(item.tone || '')}"><div class="label">${escapeHtml(item.label)}</div><div class="value">${escapeHtml(item.value)}</div>${item.hint ? `<div class="hint">${escapeHtml(item.hint)}</div>` : ''}</div>`).join('')}</section>`;
}
