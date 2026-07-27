import { ITEM_DEPENDENCIES } from '../data/itemDependencies.js';
import { parentCategoryId, rootCategoryName, subcategoryName } from '../data/equipmentCategories.js';

export function dependenciesForItem(item = {}) {
  const ids = new Set([item.subcategoryId, item.categoryId, parentCategoryId(item.subcategoryId), parentCategoryId(item.categoryId), ...(item.systemGroups || [])].filter(Boolean));
  return ITEM_DEPENDENCIES.filter(dep => ids.has(dep.sourceCategoryId) || ids.has(dep.sourceItemId));
}

export function dependencyIsCovered(dep, items = []) {
  return items.some(item => {
    const ids = new Set([item.id, item.catalogItemId, item.sourceCatalogItemId, item.categoryId, item.subcategoryId, parentCategoryId(item.subcategoryId), parentCategoryId(item.categoryId), ...(item.systemGroups || [])].filter(Boolean));
    return (dep.targetItemId && ids.has(dep.targetItemId)) || (dep.targetCategoryId && ids.has(dep.targetCategoryId)) || (dep.targetSystemGroup && ids.has(dep.targetSystemGroup));
  });
}

export function resolveMissingDependencies(project = {}, options = {}) {
  const onlyRequired = Boolean(options.onlyRequired);
  const byZone = new Map();
  (project.estimateItems || []).forEach(item => {
    const zoneId = item.zoneId || '__project__';
    if (!byZone.has(zoneId)) byZone.set(zoneId, []);
    byZone.get(zoneId).push(item);
  });
  const missing = [];
  byZone.forEach((items, zoneId) => {
    items.forEach(item => {
      dependenciesForItem(item).forEach(dep => {
        if (onlyRequired && !dep.required) return;
        if (dependencyIsCovered(dep, items)) return;
        const key = `${zoneId}:${item.id}:${dep.id}`;
        missing.push({
          id: key,
          zoneId: zoneId === '__project__' ? '' : zoneId,
          sourceItemId: item.id,
          sourceItemName: item.name,
          dependencyId: dep.id,
          dependencyType: dep.dependencyType,
          required: dep.required,
          targetCategoryId: dep.targetCategoryId,
          targetCategoryName: subcategoryName(dep.targetCategoryId) || rootCategoryName(dep.targetCategoryId),
          fallbackName: dep.fallbackName,
          reason: dep.reason,
          severity: dep.severity || (dep.required ? 'warning' : 'recommendation')
        });
      });
    });
  });
  return dedupeMissing(missing);
}

export function createDependencyFallbackItem(dep, zoneId = '') {
  return {
    id: `fallback-${dep.dependencyId}-${Date.now()}`,
    name: dep.fallbackName || dep.targetCategoryName || 'Fallback-позиция зависимости',
    category: dep.targetCategoryName || 'Оборудование',
    categoryId: dep.targetCategoryId || '',
    subcategoryId: dep.targetCategoryId || '',
    unit: 'компл.',
    qty: 1,
    currency: 'RUB',
    unitCost: 0,
    priceStatus: 'unknown',
    requiresPriceRequest: true,
    requiresEngineerReview: true,
    zoneId,
    source: 'dependency-fallback',
    isManual: false,
    isDerived: true,
    note: `Fallback по зависимости: ${dep.reason || ''}`
  };
}

function dedupeMissing(list) {
  const seen = new Set();
  return list.filter(item => {
    const key = `${item.zoneId}:${item.sourceItemId}:${item.dependencyId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
