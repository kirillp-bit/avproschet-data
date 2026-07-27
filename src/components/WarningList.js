import { escapeHtml } from '../utils/format.js';
import { WarningCard } from './WarningCard.js';
import { EmptyState } from './EmptyState.js';

const groupLabels = {
  data: 'Данные проекта',
  zones: 'Зоны',
  estimate: 'Смета',
  budget: 'Бюджет',
  commercial: 'Коммерческие параметры',
  currency: 'Валюты',
  engineering: 'Инженерная полнота',
  catalog: 'Каталог'
};

function visibleInQuick(warning = {}) { return warning.severity === 'critical' || warning.severity === 'error' || warning.severity === 'warning'; }

export function WarningList(warnings, options = {}) {
  const mode = options.mode === 'engineering' ? 'engineering' : 'quick';
  const visible = mode === 'quick' ? warnings.filter(visibleInQuick) : warnings;
  const hiddenCount = warnings.length - visible.length;
  if (!visible.length) {
    const text = hiddenCount ? `Критичных ошибок нет. ${hiddenCount} инженерных рекомендаций доступны в режиме «Инженерная проверка».` : 'Критичных ошибок и предупреждений нет.';
    return EmptyState({ title: 'Проект готов к КП', text, actions: '<a class="btn primary" href="#/proposal">Перейти к КП</a>' });
  }
  const groups = visible.reduce((acc, warning) => { const key = warning.type || 'engineering'; (acc[key] ||= []).push(warning); return acc; }, {});
  return `<div class="warningGroups">${mode === 'quick' && hiddenCount ? `<div class="notice"><strong>Быстрый пресейл</strong><p>${hiddenCount} технических рекомендаций скрыто. Для roleFitScore, replacementGroup и dependency details включите «Инженерную проверку».</p></div>` : ''}${Object.entries(groups).map(([key, items]) => `<section class="warningGroup"><div class="groupHeader"><h3>${escapeHtml(groupLabels[key] || key)}</h3><span class="badge">${items.length}</span></div><div class="grid">${items.map(item => WarningCard(item, { mode })).join('')}</div></section>`).join('')}</div>`;
}
