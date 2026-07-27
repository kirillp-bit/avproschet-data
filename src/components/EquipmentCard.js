import { escapeAttr, escapeHtml, formatMoney } from '../utils/format.js';
import { itemUnitCostRub } from '../engine/currency.js';
import { rootCategoryName, subcategoryName } from '../data/equipmentCategories.js';
import { DependencyList } from './DependencyList.js';
import { AlternativeList } from './AlternativeList.js';
import { RelevanceBadge } from './RelevanceBadge.js';
import { classifySupplierItem } from '../engine/catalogRelevance.js';

export function EquipmentCard(item, settings, library = [], { showCurationActions = false } = {}) {
  item = classifySupplierItem(item);
  const quality = qualityBadge(item);
  const curationActions = showCurationActions ? `<button class="btn ghost small" data-mark-av="${escapeAttr(item.id)}">Пометить AV</button><button class="btn ghost small" data-mark-infra="${escapeAttr(item.id)}">Инфраструктура</button><button class="btn ghost small" data-mark-it="${escapeAttr(item.id)}">IT</button><button class="btn ghost small" data-mark-review="${escapeAttr(item.id)}">Спорное</button><button class="btn ghost small" data-toggle-auto="${escapeAttr(item.id)}">${item.approvedForAutoEstimate ? 'Запретить автосмету' : 'Разрешить автосмету'}</button><button class="btn ghost small" data-hide-library="${escapeAttr(item.id)}">Скрыть</button>` : '';
  return `<article class="card itemCard equipmentCard">
    <div class="itemCardTop"><div><div class="itemTitle">${escapeHtml(item.name)}</div><div class="muted">${escapeHtml([item.brand, item.model, item.article ? `арт. ${item.article}` : ''].filter(Boolean).join(' · ') || '—')}</div></div>${quality}</div>
    <div class="tagRow"><span class="badge">${escapeHtml(rootCategoryName(item.categoryId))}</span><span class="badge">${escapeHtml(subcategoryName(item.subcategoryId) || item.category)}</span><span class="badge lime">${escapeHtml(item.solutionLevel || 'standard')}</span>${item.supplier ? `<span class="badge">${escapeHtml(item.supplier)}</span>` : ''}${RelevanceBadge(item)}</div>
    <strong>${formatMoney(itemUnitCostRub(item, settings))}</strong>
    <div class="muted smallText">${escapeHtml(item.priceStatus || 'actual')} · ${item.currency === 'USD' ? `$${Number(item.unitCost || 0).toLocaleString('ru-RU')}` : formatMoney(item.unitCost)}</div>${item.relevanceReason ? `<div class="muted smallText">${escapeHtml(item.relevanceReason)}</div>` : ''}
    <details class="compactDetails"><summary>Подробнее</summary><div class="muted smallText">${escapeHtml(item.note || item.description || 'Дополнительного описания нет.')}</div></details>
    <details class="compactDetails"><summary>Зависимости</summary>${DependencyList(item)}</details>
    <details class="compactDetails"><summary>Альтернативы</summary>${AlternativeList(item, library)}</details>
    <div class="cardActions"><button class="btn primary small" data-add-library="${escapeAttr(item.id)}">Добавить в смету</button>${curationActions}</div>
  </article>`;
}
function qualityBadge(item) {
  if (item.requiresEngineerReview) return '<span class="badge warn">инж. проверка</span>';
  if (item.requiresPriceRequest || item.priceStatus === 'unknown') return '<span class="badge warn">запрос цены</span>';
  if (item.priceStatus === 'estimated') return '<span class="badge lime">estimated</span>';
  return '<span class="badge ok">ok</span>';
}
