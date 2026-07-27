import { CATALOG_RELEVANCE_RULES, DEFAULT_VISIBLE_RELEVANCE, RELEVANCE } from '../data/catalogRelevanceRules.js';
import { getCatalogRelevanceOverride } from '../storage/catalogRelevanceOverrides.js';

export const DEFAULT_VISIBLE_SCOPES = DEFAULT_VISIBLE_RELEVANCE;
export const ALL_CATALOG_SCOPES = [...Object.values(RELEVANCE)];

export function normalizeCatalogText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[–—]/g, '-')
    .replace(/[^a-zа-я0-9+#./\-\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function itemText(item = {}) {
  return normalizeCatalogText([
    item.name, item.category, item.subcategory, item.segment, item.brand, item.model, item.description, item.note,
    item.supplier, item.supplierId, item.categoryId, item.subcategoryId, ...(item.tags || []), ...(item.systemGroups || [])
  ].filter(Boolean).join(' '));
}

function hits(text, terms = []) { return terms.filter(term => text.includes(normalizeCatalogText(term))); }
function hasAny(text, terms = []) { return hits(text, terms).length > 0; }
function scoreFor(matches, weight, max) { return Math.min(max, matches.length * weight); }
function reason(label, matches) { return matches.length ? `${label}: ${matches.slice(0, 4).join(', ')}` : label; }

export function classifySupplierItem(item = {}) {
  const override = getCatalogRelevanceOverride(item);
  if (override?.relevance) {
    const relevance = override.relevance;
    const score = Number(override.relevanceScore || item.relevanceScore || (relevance === RELEVANCE.HIDDEN ? 10 : 95));
    return enrich(item, {
      relevance,
      relevanceScore: score,
      relevanceReason: override.reason || 'Ручной override имеет приоритет',
      requiresCatalogReview: relevance === RELEVANCE.QUESTIONABLE,
      hiddenByDefault: override.hiddenByDefault ?? !DEFAULT_VISIBLE_RELEVANCE.includes(relevance),
      approvedForAutoEstimate: Boolean(override.approvedForAutoEstimate),
      relevanceOverride: override
    });
  }

  if (item.relevance && item.relevanceScore !== undefined && item.relevanceReason) {
    return enrich(item, {
      relevance: item.relevance,
      relevanceScore: Number(item.relevanceScore),
      relevanceReason: item.relevanceReason,
      requiresCatalogReview: Boolean(item.requiresCatalogReview),
      hiddenByDefault: Boolean(item.hiddenByDefault),
      approvedForAutoEstimate: Boolean(item.approvedForAutoEstimate)
    });
  }

  const text = itemText(item);
  const k = CATALOG_RELEVANCE_RULES.keywords;
  const match = {
    hidden: hits(text, k.hidden),
    service: hits(text, k.service),
    av_core: hits(text, k.av_core),
    av_infrastructure: hits(text, k.av_infrastructure),
    it_related: hits(text, k.it_related),
    consumables: hits(text, k.consumables),
    strongAv: hits(text, CATALOG_RELEVANCE_RULES.strongAv),
    strongInfra: hits(text, CATALOG_RELEVANCE_RULES.strongInfrastructure),
    strongIt: hits(text, CATALOG_RELEVANCE_RULES.strongIt)
  };

  const categoryId = normalizeCatalogText(`${item.categoryId || ''} ${item.subcategoryId || ''} ${item.category || ''}`);
  if (item.imported && !item.supplier) match.av_core.push('curated imported catalog');
  if (['display', 'led', 'vcs', 'audio', 'interactive', 'control', 'content-software'].some(id => categoryId.includes(id))) match.av_core.push(`category:${categoryId.split(' ')[0]}`);
  if (['rack-power', 'cable', 'signal'].some(id => categoryId.includes(id))) match.av_infrastructure.push(`category:${categoryId.split(' ')[0]}`);

  const explicitHidden = match.hidden.length && !match.av_core.length && !match.av_infrastructure.length;
  if (explicitHidden) return enrich(item, { relevance: RELEVANCE.HIDDEN, relevanceScore: 8, relevanceReason: reason('Явно нерелевантная/офисно-бытовая позиция', match.hidden), requiresCatalogReview: false, hiddenByDefault: true });

  if (match.hidden.length && (match.av_core.length || match.av_infrastructure.length)) {
    return enrich(item, { relevance: RELEVANCE.QUESTIONABLE, relevanceScore: 55, relevanceReason: `Конфликт AV и hidden-маркеров: ${[...match.av_core, ...match.av_infrastructure, ...match.hidden].slice(0, 5).join(', ')}`, requiresCatalogReview: true, hiddenByDefault: true });
  }

  if (match.service.length && !match.hidden.length) return enrich(item, { relevance: RELEVANCE.SERVICE, relevanceScore: 80, relevanceReason: reason('Работы/услуги, оставлены в быстром каталоге', match.service), requiresCatalogReview: false, hiddenByDefault: false });

  const isAvSwitch = hasAny(text, CATALOG_RELEVANCE_RULES.avSwitchTerms);
  const isNetworkSwitch = hasAny(text, CATALOG_RELEVANCE_RULES.networkSwitchTerms);
  const isMediaServer = hasAny(text, CATALOG_RELEVANCE_RULES.mediaServerContext);
  const computerMonitor = /\bmonitor\b|\bмонитор\b/.test(text) && !/signage|professional display|lcd-панел|lcd панел|дисплей|видеостен|сенсорн/.test(text);

  if (match.strongAv.length || isAvSwitch || isMediaServer) {
    const score = 92 + Math.min(8, match.av_core.length + match.strongAv.length);
    return enrich(item, { relevance: RELEVANCE.AV_CORE, relevanceScore: score, relevanceReason: reason('Уверенные AV-признаки', [...match.strongAv, ...match.av_core]), requiresCatalogReview: false, hiddenByDefault: false });
  }

  if (match.strongInfra.length) {
    const score = 82 + Math.min(12, match.av_infrastructure.length);
    return enrich(item, { relevance: RELEVANCE.AV_INFRASTRUCTURE, relevanceScore: score, relevanceReason: reason('AV-инфраструктура', [...match.strongInfra, ...match.av_infrastructure]), requiresCatalogReview: false, hiddenByDefault: false });
  }

  if (match.strongIt.length || isNetworkSwitch || computerMonitor) {
    const score = isMediaServer ? 72 : 68;
    return enrich(item, { relevance: RELEVANCE.IT_RELATED, relevanceScore: score, relevanceReason: reason('IT/компьютерная позиция', [...match.strongIt, ...match.it_related]), requiresCatalogReview: false, hiddenByDefault: true });
  }

  const scores = {
    av_core: scoreFor(match.av_core, 18, 86),
    av_infrastructure: scoreFor(match.av_infrastructure, 16, 78),
    it_related: scoreFor(match.it_related, 16, 72),
    consumables: scoreFor(match.consumables, 18, 70)
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best[1] >= 70 && best[0] === RELEVANCE.AV_CORE) return enrich(item, { relevance: RELEVANCE.AV_CORE, relevanceScore: best[1], relevanceReason: reason('AV-маркеры', match.av_core), requiresCatalogReview: false, hiddenByDefault: false });
  if (best[1] >= 64 && best[0] === RELEVANCE.AV_INFRASTRUCTURE) return enrich(item, { relevance: RELEVANCE.AV_INFRASTRUCTURE, relevanceScore: best[1], relevanceReason: reason('Инфраструктурные маркеры', match.av_infrastructure), requiresCatalogReview: false, hiddenByDefault: false });
  if (best[1] >= 48 && best[0] === RELEVANCE.IT_RELATED) return enrich(item, { relevance: RELEVANCE.IT_RELATED, relevanceScore: best[1], relevanceReason: reason('IT-маркеры', match.it_related), requiresCatalogReview: false, hiddenByDefault: true });
  if (best[1] >= 36 && best[0] === RELEVANCE.CONSUMABLES) return enrich(item, { relevance: RELEVANCE.CONSUMABLES, relevanceScore: best[1], relevanceReason: reason('Расходные материалы', match.consumables), requiresCatalogReview: false, hiddenByDefault: true });

  return enrich(item, { relevance: RELEVANCE.QUESTIONABLE, relevanceScore: 50, relevanceReason: 'Недостаточно AV/IT-маркеров или слишком общее описание', requiresCatalogReview: true, hiddenByDefault: true });
}

function enrich(item, fields) {
  return {
    ...item,
    relevance: fields.relevance,
    catalogScope: fields.relevance,
    relevanceScore: Math.max(0, Math.min(100, Number(fields.relevanceScore || 0))),
    relevanceReason: fields.relevanceReason || '',
    requiresCatalogReview: Boolean(fields.requiresCatalogReview),
    hiddenByDefault: Boolean(fields.hiddenByDefault),
    approvedForAutoEstimate: Boolean(fields.approvedForAutoEstimate ?? item.approvedForAutoEstimate)
  };
}

export function classifySupplierCatalog(items = []) { return items.map(item => classifySupplierItem(item)); }
export function getRelevanceBadge(relevance) {
  const label = CATALOG_RELEVANCE_RULES.labels[relevance] || relevance || 'Не классифицировано';
  const tone = { av_core: 'ok', av_infrastructure: 'lime', it_related: '', consumables: 'warn', questionable: 'warn', hidden: 'danger', service: 'ok' }[relevance] || 'warn';
  return { label, tone };
}
export function shouldShowByDefault(item = {}) { const c = classifySupplierItem(item); return DEFAULT_VISIBLE_RELEVANCE.includes(c.relevance) && !c.hiddenByDefault; }
export function getRelevanceCounters(items = []) {
  const counters = { total: items.length, av_core: 0, av_infrastructure: 0, it_related: 0, consumables: 0, questionable: 0, hidden: 0, service: 0, requiresReview: 0, approvedForAutoEstimate: 0, hiddenByDefault: 0 };
  items.forEach(item => { const c = classifySupplierItem(item); counters[c.relevance] = (counters[c.relevance] || 0) + 1; if (c.requiresCatalogReview) counters.requiresReview += 1; if (c.approvedForAutoEstimate) counters.approvedForAutoEstimate += 1; if (c.hiddenByDefault) counters.hiddenByDefault += 1; });
  return counters;
}
export function classifyCatalogScope(item = {}) { return classifySupplierItem(item).relevance; }
export function catalogScopeLabel(scope) { return CATALOG_RELEVANCE_RULES.labels[scope] || scope || 'Не классифицировано'; }
export function withCatalogScope(item = {}) { return classifySupplierItem(item); }
export function visibleScopesForMode(mode = 'default') {
  if (mode === 'all') return [RELEVANCE.AV_CORE, RELEVANCE.AV_INFRASTRUCTURE, RELEVANCE.IT_RELATED, RELEVANCE.CONSUMABLES, RELEVANCE.QUESTIONABLE, RELEVANCE.SERVICE];
  if (mode === 'hidden') return [RELEVANCE.HIDDEN];
  if (mode === 'questionable' || mode === 'unknown') return [RELEVANCE.QUESTIONABLE];
  if (mode === 'it') return [RELEVANCE.IT_RELATED];
  if (mode === 'consumables') return [RELEVANCE.CONSUMABLES];
  if (mode === 'infrastructure') return [RELEVANCE.AV_INFRASTRUCTURE];
  if (mode === 'av') return [RELEVANCE.AV_CORE];
  return DEFAULT_VISIBLE_RELEVANCE;
}
