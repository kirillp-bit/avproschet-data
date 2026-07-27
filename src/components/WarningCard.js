import { escapeAttr, escapeHtml } from '../utils/format.js';
const severityLabel = { critical: 'Критично', error: 'Критично', warning: 'Предупреждение', review: 'Проверить', recommendation: 'Проверить', info: 'Инфо' };
const severityClass = { critical: 'danger', error: 'danger', warning: 'warn', review: 'lime', recommendation: 'lime', info: '' };
const typeLabel = { data: 'Данные проекта', zones: 'Зоны', estimate: 'Смета', budget: 'Бюджет', commercial: 'Коммерческие параметры', currency: 'Валюты', engineering: 'Инженерная полнота', catalog: 'Каталог' };

export function WarningCard(warning, options = {}) {
  const quick = options.mode === 'quick';
  const details = !quick && warning.groupedCount ? `<div class="muted smallText">Затронуто: ${escapeHtml(String(warning.groupedCount))}${warning.affectedZones?.length ? ` · ${escapeHtml(warning.affectedZones.join(', '))}` : ''}</div>` : '';
  return `<article class="warningCard ${severityClass[warning.severity] || ''}">
    <div class="warningMain"><span class="badge ${severityClass[warning.severity] || ''}">${escapeHtml(severityLabel[warning.severity] || warning.severity)}</span><h3>${escapeHtml(warning.title)}</h3><p>${escapeHtml(warning.message)}</p>${details}<div class="muted smallText">${typeLabel[warning.type] || 'Инженерная полнота'}${!quick && warning.entityType ? ` · ${escapeHtml(warning.entityType)}` : ''}</div></div>
    <div class="warningActions"><button class="btn primary small" data-warning-action="${escapeAttr(warning.actionType || '')}">${escapeHtml(warning.actionLabel || 'Исправить')}</button>${!quick ? `<button class="btn ghost small" data-accept-warning="${escapeAttr(warning.id)}">Принять риск</button><button class="btn ghost small" data-accept-warning="${escapeAttr(warning.id)}">Скрыть</button>` : ''}</div>
  </article>`;
}
