import { classifyCatalogScope, visibleScopesForMode } from './catalogRelevance.js';

const indexCache = new WeakMap();

export function normalizeSearchText(value = '') {
  return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim();
}

export function buildSupplierSearchIndex(items = []) {
  if (indexCache.has(items)) return indexCache.get(items);
  const indexed = items.map(item => ({
    item,
    catalogScope: classifyCatalogScope(item),
    searchableText: normalizeSearchText(`${item.name || ''} ${item.brand || ''} ${item.model || ''} ${item.article || ''} ${item.category || ''} ${item.supplier || ''} ${(item.tags || []).join(' ')}`)
  }));
  indexCache.set(items, indexed);
  return indexed;
}

export function searchSupplierItems(items = [], filters = {}) {
  const {
    query = '',
    category = 'all',
    supplier = 'all',
    scopeMode = 'default',
    limit = 72,
    offset = 0
  } = filters;
  const terms = normalizeSearchText(query).split(' ').filter(Boolean);
  const visibleScopes = new Set(visibleScopesForMode(scopeMode));
  const matched = [];
  for (const row of buildSupplierSearchIndex(items)) {
    const item = row.item;
    if (!visibleScopes.has(row.catalogScope)) continue;
    if (category !== 'all' && item.categoryId !== category && item.subcategoryId !== category && item.category !== category) continue;
    if (supplier !== 'all' && item.supplier !== supplier && item.supplierId !== supplier) continue;
    if (terms.length && !terms.every(term => row.searchableText.includes(term))) continue;
    matched.push(item);
  }
  return {
    total: matched.length,
    items: matched.slice(offset, offset + limit),
    hasMore: matched.length > offset + limit
  };
}
