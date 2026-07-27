const STORAGE_KEY = 'avproschet.catalogRelevanceOverrides.v1';
let memoryOverrides = {};

function canUseLocalStorage() {
  try { return typeof localStorage !== 'undefined'; } catch { return false; }
}

export function catalogOverrideKey(item = {}) {
  return [item.supplierId || item.supplier || 'curated', item.id || item.article || item.name || 'unknown'].join('::');
}

export function loadCatalogRelevanceOverrides() {
  if (!canUseLocalStorage()) return { ...memoryOverrides };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCatalogRelevanceOverride(item = {}) {
  return loadCatalogRelevanceOverrides()[catalogOverrideKey(item)] || null;
}

export function saveCatalogRelevanceOverride(item = {}, patch = {}) {
  const overrides = loadCatalogRelevanceOverrides();
  const key = catalogOverrideKey(item);
  const existing = overrides[key] || {};
  const next = {
    itemId: item.id || existing.itemId || '',
    supplierId: item.supplierId || item.supplier || existing.supplierId || '',
    relevance: patch.relevance ?? existing.relevance ?? item.relevance,
    approvedForAutoEstimate: patch.approvedForAutoEstimate ?? existing.approvedForAutoEstimate ?? item.approvedForAutoEstimate ?? false,
    hiddenByDefault: patch.hiddenByDefault ?? existing.hiddenByDefault ?? item.hiddenByDefault ?? false,
    reason: patch.reason ?? existing.reason ?? 'Ручной override',
    updatedAt: new Date().toISOString()
  };
  overrides[key] = next;
  memoryOverrides = overrides;
  if (canUseLocalStorage()) localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  return next;
}

export function removeCatalogRelevanceOverride(item = {}) {
  const overrides = loadCatalogRelevanceOverrides();
  delete overrides[catalogOverrideKey(item)];
  memoryOverrides = overrides;
  if (canUseLocalStorage()) localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}
