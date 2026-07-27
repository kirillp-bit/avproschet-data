import { escapeAttr, escapeHtml } from '../utils/format.js';
import { catalogScopeLabel, getRelevanceCounters } from '../engine/catalogRelevance.js';

const TABS = [
  ['default', 'AV + инфраструктура'],
  ['av', 'AV-оборудование'],
  ['infrastructure', 'Инфраструктура'],
  ['it', 'IT / компьютеры'],
  ['consumables', 'Расходники'],
  ['questionable', 'Спорное'],
  ['hidden', 'Скрытое'],
  ['all', 'Всё']
];

function hrefFor(scope) { return `#/library?scope=${escapeAttr(scope)}`; }

export function CatalogQualityFilters({ scope = 'default', items = [] } = {}) {
  const counters = getRelevanceCounters(items);
  return `<section class="card catalogQualityFilters">
    <div class="sectionTitle"><div><h3>Фильтр качества supplier-каталога</h3><p class="muted">По умолчанию показываются только AV-релевантные позиции и инфраструктура. IT, расходники, спорные и скрытые позиции включаются отдельно.</p></div><span class="badge">${escapeHtml(String(counters.total))} в текущей библиотеке</span></div>
    <div class="quickFilters">${TABS.map(([id, label]) => `<a class="btn ${scope === id ? 'primary' : 'ghost'} small" href="${hrefFor(id)}">${escapeHtml(label)}</a>`).join('')}</div>
    <div class="tagRow">${['av_core','av_infrastructure','it_related','consumables','questionable','hidden'].map(key => `<span class="badge">${escapeHtml(catalogScopeLabel(key))}: ${Number(counters[key] || 0).toLocaleString('ru-RU')}</span>`).join('')}<span class="badge warn">Проверка: ${Number(counters.requiresReview || 0).toLocaleString('ru-RU')}</span><span class="badge">Auto: ${Number(counters.approvedForAutoEstimate || 0).toLocaleString('ru-RU')}</span></div>
  </section>`;
}
