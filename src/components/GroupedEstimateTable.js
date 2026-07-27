import { itemCostRub, mergedSettings } from '../engine/pricing.js';
import { escapeAttr, escapeHtml, formatMoney } from '../utils/format.js';
import { EmptyState } from './EmptyState.js';

const preferredGroups = ['Оборудование', 'LCD-панели', 'LED-экраны', 'Проекторы', 'Интерактивные панели', 'Акустика', 'Микрофоны', 'DSP и усилители', 'ВКС-системы', 'Коммутация', 'Системы управления', 'Кабельная инфраструктура', 'Крепления и конструкции', 'Монтаж', 'ПНР', 'Контент / ПО', 'Логистика', 'Сервис'];

export function GroupedEstimateTable(project, mode = 'compact') {
  if (!project.estimateItems.length) return EmptyState({
    title: 'Смета ещё не создана',
    text: 'Сгенерируйте её по зонам или добавьте первую позицию вручную.',
    actions: '<button class="btn primary" data-generate="replace">Сгенерировать по зонам</button><button class="btn ghost" data-add-manual>Добавить позицию вручную</button><a class="btn ghost" href="#/zones">Перейти к зонам</a>'
  });
  const settings = mergedSettings(project);
  const zoneName = id => project.zones.find(z => z.id === id)?.name || '—';
  const groups = groupItems(project.estimateItems);
  return `<div class="estimateModeNote"><span class="badge ${mode === 'detailed' ? 'lime' : ''}">${mode === 'detailed' ? 'Подробный режим' : 'Компактный режим'}</span></div>
    <div class="groupedEstimate">${groups.map(([category, items]) => `<section class="estimateGroup"><div class="groupHeader"><h3>${escapeHtml(category)}</h3><span class="badge">${items.length} поз.</span></div><div class="tableWrap"><table><thead>${header(mode)}</thead><tbody>${items.map(item => row(item, zoneName, settings, mode)).join('')}</tbody></table></div></section>`).join('')}</div>`;
}

function header(mode) {
  const compact = '<tr><th>Зона</th><th>Позиция</th><th>Категория</th><th>Кол-во</th><th>Цена</th><th>Сумма</th><th></th></tr>';
  const detailed = '<tr><th>Зона</th><th>Позиция</th><th>Категория</th><th>Ед.</th><th>Кол-во</th><th>Цена</th><th>Валюта</th><th>Источник</th><th>Role fit</th><th>AV-роль</th><th>Комментарий</th><th>Сумма</th><th></th></tr>';
  return mode === 'detailed' ? detailed : compact;
}
function row(item, zoneName, settings, mode) {
  const sum = formatMoney(itemCostRub(item, settings));
  const sourceBadge = sourceBadgeHtml(item);
  if (mode === 'detailed') return `<tr>
    <td>${escapeHtml(zoneName(item.zoneId))}</td><td><input data-item-field="name" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.name)}"></td><td><input data-item-field="category" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.category)}"></td><td><input data-item-field="unit" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.unit)}"></td><td><input type="number" step="0.1" data-item-field="qty" data-item-id="${escapeAttr(item.id)}" value="${item.qty}"></td><td><input type="number" step="1" data-item-field="unitCost" data-item-id="${escapeAttr(item.id)}" value="${item.unitCost}"></td><td><select data-item-field="currency" data-item-id="${escapeAttr(item.id)}"><option value="RUB" ${item.currency==='RUB'?'selected':''}>RUB</option><option value="USD" ${item.currency==='USD'?'selected':''}>USD</option></select></td><td>${sourceBadge}</td><td>${roleFitHtml(item)}</td><td>${roleMetaHtml(item)}</td><td><input data-item-field="note" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.note || '')}"></td><td class="money">${sum}</td><td><button class="btn danger small" data-item-delete="${escapeAttr(item.id)}">Удалить</button></td>
  </tr>`;
  return `<tr><td>${escapeHtml(zoneName(item.zoneId))}</td><td><input data-item-field="name" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.name)}"><div class="smallText muted">${sourceBadge}</div></td><td><input data-item-field="category" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.category)}"></td><td><input type="number" step="0.1" data-item-field="qty" data-item-id="${escapeAttr(item.id)}" value="${item.qty}"></td><td><input type="number" step="1" data-item-field="unitCost" data-item-id="${escapeAttr(item.id)}" value="${item.unitCost}"></td><td class="money">${sum}</td><td><button class="btn danger small" data-item-delete="${escapeAttr(item.id)}">Удалить</button></td></tr>`;
}


function roleFitHtml(item = {}) {
  if (item.roleFitScore === undefined || item.roleFitScore === null) return '<span class="muted smallText">—</span>';
  const score = Number(item.roleFitScore || 0);
  const tone = score >= Number(item.roleFitMinScore || 55) ? 'ok' : 'warn';
  const reason = item.roleFitReason ? `<div class="muted smallText">${escapeHtml(item.roleFitReason)}</div>` : '';
  return `<span class="badge ${tone}">${score}</span>${reason}`;
}
function roleMetaHtml(item = {}) {
  return `<div class="smallText"><strong>${escapeHtml(item.templateRole || '—')}</strong></div><div class="muted smallText">${escapeHtml(item.replacementGroup || '')}${item.systemGroups?.length ? ` · ${escapeHtml(item.systemGroups.join(', '))}` : ''}</div>`;
}

function sourceBadgeHtml(item = {}) {
  if (item.sourceType === 'supplier') {
    const supplier = item.supplierName || item.supplier || 'поставщик';
    const sku = item.supplierSku ? ` · ${item.supplierSku}` : '';
    return `<span class="badge ok">supplier</span> <span class="muted smallText">${escapeHtml(supplier + sku)}</span>`;
  }
  if (item.sourceType === 'baseLibrary' || item.fallbackReason) return '<span class="badge warn">fallback library</span>';
  if (item.source === 'manual') return '<span class="badge">manual</span>';
  return `<span class="badge">${escapeHtml(item.source || 'calculated')}</span>`;
}

function groupItems(items) {
  const map = new Map();
  items.forEach(item => { const key = normalizeCategory(item.category); if (!map.has(key)) map.set(key, []); map.get(key).push(item); });
  return [...map.entries()].sort((a,b) => groupIndex(a[0]) - groupIndex(b[0]) || a[0].localeCompare(b[0], 'ru'));
}
function normalizeCategory(category = '') {
  const c = category || 'Оборудование';
  if (/монтаж/i.test(c)) return 'Монтаж';
  if (/пнр|пуск/i.test(c)) return 'ПНР';
  if (/контент|по|software/i.test(c)) return 'Контент / ПО';
  if (/кабель|расход/i.test(c)) return 'Кабельная инфраструктура';
  if (/креп|конструк|металл/i.test(c)) return 'Крепления и конструкции';
  if (/логист|достав/i.test(c)) return 'Логистика';
  if (/сервис/i.test(c)) return 'Сервис';
  return c;
}
function groupIndex(category) { const idx = preferredGroups.indexOf(category); return idx === -1 ? 100 : idx; }
