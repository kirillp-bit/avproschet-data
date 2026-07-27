import { getItemAlternatives, replacementImpact } from '../engine/alternativeResolver.js';
import { escapeAttr, escapeHtml, formatMoney } from '../utils/format.js';

export function AlternativeList(item, library = []) {
  const alternatives = getItemAlternatives(item, library, 5);
  if (!alternatives.length) return '<div class="muted smallText">Альтернативы не найдены в текущей библиотеке.</div>';
  return `<div class="miniList">${alternatives.map(alt => {
    const impact = replacementImpact(item, alt.item);
    const sign = impact.priceDelta > 0 ? '+' : '';
    return `<div class="miniListItem"><span class="badge lime">${escapeHtml(alt.alternativeType)}</span><strong>${escapeHtml(alt.item.name)}</strong><small>${escapeHtml(`${alt.item.brand || ''} ${alt.item.model || ''} · ${alt.item.solutionLevel || 'standard'}`)} · ${sign}${formatMoney(impact.priceDelta)}</small><button class="btn ghost small" data-replace-library="${escapeAttr(item.id)}" data-replace-to="${escapeAttr(alt.item.id)}">Заменить позицию</button></div>`;
  }).join('')}</div>`;
}
