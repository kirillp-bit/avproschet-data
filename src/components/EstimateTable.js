import { itemCostRub, mergedSettings } from '../engine/pricing.js';
import { escapeAttr, escapeHtml, formatMoney } from '../utils/format.js';
export function EstimateTable(project) {
  if (!project.estimateItems.length) return '<div class="empty">Смета пустая. Добавьте позиции из библиотеки или сгенерируйте стартовую смету по зонам.</div>';
  const settings = mergedSettings(project);
  const zoneName = id => project.zones.find(z => z.id === id)?.name || '—';
  return `<div class="tableWrap"><table><thead><tr><th>Зона</th><th>Позиция</th><th>Категория</th><th>Ед.</th><th>Кол-во</th><th>Цена / ед.</th><th>Валюта</th><th>Режим</th><th>Сумма RUB</th><th>Источник</th><th></th></tr></thead><tbody>
  ${project.estimateItems.map(item => `<tr>
    <td>${escapeHtml(zoneName(item.zoneId))}</td>
    <td><input data-item-field="name" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.name)}"></td>
    <td><input data-item-field="category" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.category)}"></td>
    <td><input data-item-field="unit" data-item-id="${escapeAttr(item.id)}" value="${escapeAttr(item.unit)}"></td>
    <td><input type="number" step="0.1" data-item-field="qty" data-item-id="${escapeAttr(item.id)}" value="${item.qty}"></td>
    <td><input type="number" step="1" data-item-field="unitCost" data-item-id="${escapeAttr(item.id)}" value="${item.unitCost}"></td>
    <td><select data-item-field="currency" data-item-id="${escapeAttr(item.id)}"><option value="RUB" ${item.currency==='RUB'?'selected':''}>RUB</option><option value="USD" ${item.currency==='USD'?'selected':''}>USD</option></select></td>
    <td><select data-item-field="priceMode" data-item-id="${escapeAttr(item.id)}"><option value="manual" ${item.priceMode==='manual'?'selected':''}>manual</option><option value="fixed" ${item.priceMode==='fixed'?'selected':''}>fixed</option><option value="indexed" ${item.priceMode==='indexed'?'selected':''}>indexed</option></select></td>
    <td class="money">${formatMoney(itemCostRub(item, settings))}</td>
    <td><span class="badge">${escapeHtml(item.source)}${item.isDerived ? ' / derived' : ''}</span></td>
    <td><button class="btn danger small" data-item-delete="${escapeAttr(item.id)}">Удалить</button></td>
  </tr>`).join('')}</tbody></table></div>`;
}
