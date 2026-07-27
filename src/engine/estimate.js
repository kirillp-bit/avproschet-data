import { CATALOG } from '../data/catalog.js';
import { createEstimateItem } from './projectFactory.js';
import { normalizeCurrency, normalizePriceMode, convertToRub } from './currency.js';
import { DEFAULT_SETTINGS } from '../data/defaultSettings.js';
import { getZoneTemplate, canonicalSystemGroups } from '../data/zoneTaxonomy.js';
import { mapLegacyCategoryToEquipment, rootCategoryName, subcategoryName } from '../data/equipmentCategories.js';
import { dependenciesForItem, resolveMissingDependencies, createDependencyFallbackItem } from './dependencyResolver.js';
import { classifySupplierItem } from './catalogRelevance.js';
import { canUseItemInAutoEstimate, filterAutoEstimateCandidates } from './autoEstimateEligibility.js';
import { SUPPLIER_TEMPLATE_INDEX } from '../data/supplierTemplateIndex.js';
import { enrichItemRoleFit, scoreRoleFit, templateRoleForCategory } from './roleScoring.js';

const SOURCE_CATALOG = CATALOG;

function catalogDedupeKey(item = {}) {
  const norm = value => String(value || '').toLowerCase().replace(/[^a-zа-я0-9]+/gi, '');
  const composite = [norm(item.brand), norm(item.model), norm(item.article)].join('|');
  return composite.replace(/\|/g, '') ? composite : norm(item.name).slice(0, 100);
}

function supplierPriority(item = {}) {
  return Number(item.supplierPriority || (item.supplier ? 1 : 0));
}

export function buildLibrary(items = []) {
  const byKey = new Map();
  items.map(normalizeCatalogItem).forEach(item => {
    const key = catalogDedupeKey(item);
    const old = byKey.get(key);
    const score = [supplierPriority(item), item.category !== 'Доп. оборудование' ? 1 : 0, item.currency === 'RUB' ? 1 : 0, Number(item.unitCost || 0) > 0 ? 1 : 0];
    const oldScore = old ? [supplierPriority(old), old.category !== 'Доп. оборудование' ? 1 : 0, old.currency === 'RUB' ? 1 : 0, Number(old.unitCost || 0) > 0 ? 1 : 0] : [-1];
    if (!old || score.join('|') > oldScore.join('|')) byKey.set(key, item);
  });
  return [...byKey.values()].sort(compareCatalogItems);
}

function compareCatalogItems(a, b) {
  return supplierPriority(b) - supplierPriority(a)
    || String(a.category || '').localeCompare(String(b.category || ''), 'ru')
    || String(a.brand || '').localeCompare(String(b.brand || ''), 'ru')
    || String(a.model || a.name || '').localeCompare(String(b.model || b.name || ''), 'ru');
}

export function normalizeCatalogItem(item) {
  const mapped = mapLegacyCategoryToEquipment(item.category || item.subcategory || '', `${item.name || ''} ${item.brand || ''} ${item.model || ''}`);
  const currency = item.currency || (item.imported ? 'USD' : 'RUB');
  const unitCost = Number(item.unitCost ?? item.price_usd ?? item.priceUsd ?? item.price_rub ?? item.priceRub ?? item.price ?? 0);
  const normalizedCurrency = normalizeCurrency(currency);
  const priceMode = item.priceMode || (item.imported || normalizedCurrency === 'USD' ? 'indexed' : 'fixed');
  const solutionLevel = normalizeSolutionLevel(item.solutionLevel || item.scenario || 'standard');
  const priceStatus = item.priceStatus || (unitCost > 0 ? (item.imported || /ориентиров|примерн|estimated/i.test(item.note || '') ? 'estimated' : 'actual') : 'unknown');
  const name = item.name || [item.brand, item.model].filter(Boolean).join(' ') || item.description || 'Позиция каталога';
  const base = {
    id: item.id || `${item.brand || ''}_${item.model || item.name}`.replace(/\W+/g, '_').toLowerCase(),
    name,
    brand: item.brand || '',
    model: item.model || '',
    category: item.category || subcategoryName(mapped.subcategoryId) || rootCategoryName(mapped.categoryId),
    categoryId: item.categoryId || mapped.categoryId,
    subcategoryId: item.subcategoryId || mapped.subcategoryId,
    description: item.description || item.note || '',
    unit: item.unit || 'шт.',
    currency: normalizedCurrency,
    unitCost,
    price: unitCost,
    priceRub: convertToRub(unitCost, normalizedCurrency, DEFAULT_SETTINGS),
    priceMode,
    priceStatus,
    priceSource: item.priceSource || item.supplier || (item.imported ? 'market-estimate' : ''),
    priceDate: item.priceDate || '',
    solutionLevel,
    scenario: solutionLevel === 'standard' ? 'base' : solutionLevel,
    projectTypeIds: item.projectTypeIds || item.types || [],
    types: item.projectTypeIds || item.types || [],
    zoneCategoryIds: item.zoneCategoryIds || inferZoneCategories(mapped.categoryId, item.types || []),
    zoneTemplateIds: item.zoneTemplateIds || [],
    systemGroups: item.systemGroups || [mapped.categoryId, mapped.subcategoryId].filter(Boolean),
    dependencies: item.dependencies || [],
    alternatives: item.alternatives || [],
    tags: item.tags || [item.category, item.segment, item.supplier, solutionLevel].filter(Boolean),
    supplier: item.supplier || item.supplierName || '',
    supplierName: item.supplierName || item.supplier || '',
    supplierId: item.supplierId || '',
    supplierSku: item.supplierSku || item.sku || item.article || '',
    supplierCategory: item.supplierCategory || item.sourceCategory || item.category || '',
    catalogScope: item.catalogScope || item.catalogRelevance || item.relevance || '',
    catalogRelevance: item.catalogRelevance || item.relevance || item.catalogScope || '',
    relevance: item.relevance || item.catalogRelevance || item.catalogScope || '',
    relevanceScore: item.relevanceScore,
    relevanceReason: item.relevanceReason || '',
    requiresCatalogReview: Boolean(item.requiresCatalogReview),
    hiddenByDefault: Boolean(item.hiddenByDefault),
    qualityVisibility: item.qualityVisibility || (item.hiddenByDefault ? 'hiddenByDefault' : 'default'),
    approvedForAutoEstimate: Boolean(item.approvedForAutoEstimate),
    supplierPriority: supplierPriority(item),
    priorityScore: Number(item.priorityScore || supplierPriority(item) || 0),
    roleFitScore: item.roleFitScore !== undefined ? Number(item.roleFitScore) : undefined,
    roleFitMinScore: item.roleFitMinScore !== undefined ? Number(item.roleFitMinScore) : undefined,
    roleFitReason: item.roleFitReason || '',
    templateRoleId: item.templateRoleId || '',
    needsEngineerReview: Boolean(item.needsEngineerReview),
    sourceType: item.sourceType || ((item.supplier || item.supplierName || item.supplierId) ? 'supplier' : 'baseLibrary'),
    fallbackReason: item.fallbackReason || '',
    templateRole: item.templateRole || '',
    zoneTemplateId: item.zoneTemplateId || '',
    replacementGroup: item.replacementGroup || item.category || '',
    isPreferredForTemplates: Boolean(item.isPreferredForTemplates),
    article: item.article || item.supplierSku || '',
    leadTime: item.leadTime || '',
    warranty: item.warranty || '',
    isPlaceholder: Boolean(item.isPlaceholder || /placeholder|условн|резерв|tbd/i.test(name)),
    requiresEngineerReview: Boolean(item.requiresEngineerReview || item.needsEngineerReview || unitCost <= 0 || /условн|провер|расчет|расчёт/i.test(item.note || '')),
    requiresPriceRequest: Boolean(item.requiresPriceRequest || unitCost <= 0),
    note: item.note || item.description || '',
    imported: Boolean(item.imported)
  };
  base.dependencies = dependenciesForItem(base).map(dep => dep.id);
  return classifySupplierItem(base);
}

function normalizeSolutionLevel(value = 'standard') {
  const v = String(value || '').toLowerCase();
  if (v === 'base') return 'standard';
  if (['budget', 'standard', 'premium', 'expert', 'custom'].includes(v)) return v;
  return 'standard';
}

function inferZoneCategories(categoryId, types = []) {
  const typeSet = new Set(types || []);
  const result = [];
  const add = (...ids) => ids.forEach(id => { if (id && !result.includes(id)) result.push(id); });
  if (categoryId === 'vcs') add('meeting-vcs', 'education', 'corporate-spaces');
  if (categoryId === 'led' || categoryId === 'display') add('led-large-screens', 'retail-showroom', 'events-conference', 'museum-exposition', 'control-centers');
  if (categoryId === 'audio') add('meeting-vcs', 'events-conference', 'horeca-hospitality', 'sport-fitness', 'education');
  if (categoryId === 'interactive' || categoryId === 'content-software') add('museum-exposition', 'content-interactive', 'retail-showroom', 'education');
  if (categoryId === 'rack-power' || categoryId === 'cable' || categoryId === 'signal') add('infrastructure', 'meeting-vcs', 'events-conference', 'corporate-spaces');
  if (typeSet.has('museum')) add('museum-exposition');
  if (typeSet.has('retail')) add('retail-showroom');
  if (typeSet.has('conference') || typeSet.has('event')) add('events-conference');
  if (typeSet.has('education')) add('education');
  if (typeSet.has('control')) add('control-centers');
  return result;
}

export const LIBRARY = buildLibrary(SOURCE_CATALOG);

export function recommendedCategoriesForZone(zone = {}) {
  const template = getZoneTemplate(zone.templateId);
  const purpose = String(zone.purpose || zone.type || zone.categoryId || '').toLowerCase();
  const task = String(zone.primaryTask || zone.task || '').toLowerCase();
  const flags = zone.flags || {};
  const categories = [];
  const add = (...values) => values.forEach(v => { if (v && !categories.includes(v)) categories.push(v); });

  add(...canonicalSystemGroups([...(zone.requiredSystemGroups || []), ...(template?.requiredSystemGroups || [])]));
  add(...(zone.recommendedItems || template?.recommendedItems || []).map(item => item.category || item.group));
  if (zone.categoryId === 'meeting-vcs' || purpose.includes('conference') || purpose.includes('meeting') || task.includes('conference')) add('ВКС-системы', 'Конференц-системы', 'Микрофоны', 'LCD-панели', 'DSP и усилители', 'Коммутация');
  if (zone.categoryId === 'museum-exposition' || purpose.includes('hall') || purpose.includes('museum') || flags.content || task.includes('content')) add('LCD-панели', 'LED-экраны', 'Медиасерверы', 'Акустика', 'Коммутация');
  if (zone.categoryId === 'events-conference' || purpose.includes('stage') || purpose.includes('event')) add('Акустика', 'DSP и усилители', 'Микрофоны', 'Свет', 'Коммутация');
  if (zone.categoryId === 'education' || purpose.includes('class') || purpose.includes('education')) add('Интерактивные панели', 'Проекторы', 'Микрофоны', 'Акустика', 'Коммутация');
  if (zone.categoryId === 'led-large-screens' || purpose.includes('outdoor') || purpose.includes('screen')) add('LED-экраны', 'LCD-панели', 'Медиасерверы', 'Крепления и конструкции', 'Коммутация');
  if (zone.categoryId === 'control-centers') add('Видеостены', 'LCD-панели', 'Мониторы', 'Коммутация', 'Сеть', 'Кабельная инфраструктура');
  if (zone.categoryId === 'infrastructure') add('AV-стойки', 'Коммутация', 'Сеть', 'Питание', 'Кабельная инфраструктура');
  if (purpose.includes('vr') || task.includes('wow')) add('VR / AR', 'ПК', 'LCD-панели', 'Акустика');
  if (flags.metal) add('Крепления и конструкции');
  if (flags.delivery) add('Кабельная инфраструктура', 'Сеть');
  add('LCD-панели', 'Акустика', 'Коммутация', 'Кабельная инфраструктура');
  return canonicalSystemGroups(categories);
}

function itemMatchesContext(item, zone, project, scenario) {
  const projectType = project.passport?.projectType;
  const projectTypes = item.projectTypeIds || item.types || [];
  const zoneCategories = item.zoneCategoryIds || [];
  const templates = item.zoneTemplateIds || [];
  const contextOk = (!projectTypes.length || projectTypes.includes(projectType) || projectTypes.includes(zone.type) || projectTypes.includes(zone.purpose));
  const zoneOk = (!zoneCategories.length || zoneCategories.includes(zone.categoryId));
  const templateOk = (!templates.length || templates.includes(zone.templateId));
  return contextOk && zoneOk && templateOk && levelCompatible(item, scenario);
}

function levelCompatible(item, scenario = 'base') {
  const target = normalizeSolutionLevel(scenario);
  const level = item.solutionLevel || normalizeSolutionLevel(item.scenario);
  if (target === 'budget') return ['budget', 'standard'].includes(level);
  if (target === 'premium') return ['premium', 'standard', 'expert'].includes(level);
  if (target === 'expert') return ['expert', 'premium', 'custom', 'standard'].includes(level);
  return ['standard', 'budget', 'premium'].includes(level);
}

function levelDistance(item, scenario = 'base') {
  const order = ['budget', 'standard', 'premium', 'expert', 'custom'];
  const target = order.indexOf(normalizeSolutionLevel(scenario));
  const level = order.indexOf(item.solutionLevel || normalizeSolutionLevel(item.scenario));
  return Math.abs((target < 0 ? 1 : target) - (level < 0 ? 1 : level));
}

function validPriceScore(item = {}) {
  const price = Number(item.unitCost ?? item.priceRub ?? item.price ?? 0);
  return Number.isFinite(price) && price > 0 ? 1 : 0;
}

function candidatePrice(item = {}) {
  const price = Number(item.unitCost ?? item.priceRub ?? item.price ?? 0);
  return Number.isFinite(price) && price > 0 ? price : Number.POSITIVE_INFINITY;
}

function medianValidPrice(candidates = []) {
  const prices = candidates.map(candidatePrice).filter(Number.isFinite).sort((a, b) => a - b);
  if (!prices.length) return 0;
  const middle = Math.floor(prices.length / 2);
  return prices.length % 2 ? prices[middle] : (prices[middle - 1] + prices[middle]) / 2;
}

function priceDistanceFromMedian(item = {}, median = 0) {
  const price = candidatePrice(item);
  if (!Number.isFinite(price)) return Number.MAX_SAFE_INTEGER;
  return Math.abs(price - median);
}

export function selectBestCandidate(candidates = [], scenario) {
  if (!candidates.length) return undefined;
  const median = medianValidPrice(candidates);
  return [...candidates].sort((a, b) =>
    Number(b.roleFitScore || 0) - Number(a.roleFitScore || 0)
    || Number(isSupplierItem(b)) - Number(isSupplierItem(a))
    || levelDistance(a, scenario) - levelDistance(b, scenario)
    || Number(b.priorityScore || 0) - Number(a.priorityScore || 0)
    || supplierPriority(b) - supplierPriority(a)
    || validPriceScore(b) - validPriceScore(a)
    || priceDistanceFromMedian(a, median) - priceDistanceFromMedian(b, median)
    || candidatePrice(a) - candidatePrice(b)
    || String(a.name || '').localeCompare(String(b.name || ''), 'ru')
  )[0];
}

const SUPPLIER_TEMPLATE_LIBRARY = Object.fromEntries(Object.entries(SUPPLIER_TEMPLATE_INDEX).map(([category, items]) => [
  category,
  items.map(item => normalizeCatalogItem({ ...item, replacementGroup: item.replacementGroup || category, sourceType: 'supplier', isPreferredForTemplates: true }))
]));

function isSupplierItem(item = {}) { return item.sourceType === 'supplier' || Boolean(item.supplier || item.supplierName || item.supplierId); }
function sourceLabel(item = {}) { return isSupplierItem(item) ? 'supplier' : item.sourceType || 'baseLibrary'; }
function hasUsableSupplierData(item = {}) { return Boolean(item.name && (item.supplier || item.supplierName) && Number(item.unitCost ?? item.price ?? 0) > 0); }
function supplierTemplatePool(category = '') { return [...(SUPPLIER_TEMPLATE_LIBRARY[category] || [])]; }
function groupMatchesItem(item = {}, category = '') { return item.category === category || item.replacementGroup === category || item.systemGroups?.includes(category) || item.categoryId === category || item.subcategoryId === category || item.templateRole === templateRoleForCategory(category); }
function itemWithRoleFit(item = {}, category = '') {
  const role = templateRoleForCategory(category);
  return enrichItemRoleFit(item, role, { category });
}
function roleFitIsUsable(item = {}, category = '') {
  const fit = item.roleFitScore !== undefined && item.roleFitMinScore !== undefined
    ? { passed: Number(item.roleFitScore) >= Number(item.roleFitMinScore), score: Number(item.roleFitScore), minScore: Number(item.roleFitMinScore) }
    : scoreRoleFit(item, templateRoleForCategory(category), { category });
  return fit.passed;
}
function decoratePickedItem(item, { qty = 1, category = '', role = '', zone = {}, source = '', fallbackReason = '' } = {}) {
  const supplier = item.supplierName || item.supplier || '';
  return {
    ...item,
    recommendedQty: qty,
    sourceType: source || sourceLabel(item),
    supplierName: supplier,
    supplier: supplier || item.supplier || '',
    supplierSku: item.supplierSku || item.article || '',
    supplierCategory: item.supplierCategory || item.category || category,
    catalogRelevance: item.catalogRelevance || item.relevance || item.catalogScope || '',
    qualityVisibility: item.qualityVisibility || (item.hiddenByDefault ? 'hiddenByDefault' : 'default'),
    templateRole: role || item.templateRole || templateRoleForCategory(category),
    zoneTemplateId: zone.templateId || item.zoneTemplateId || '',
    replacementGroup: category || item.replacementGroup || item.category || '',
    roleFitScore: item.roleFitScore,
    roleFitMinScore: item.roleFitMinScore,
    roleFitReason: item.roleFitReason || '',
    templateRoleId: item.templateRoleId || '',
    needsEngineerReview: Boolean(item.needsEngineerReview),
    requiresEngineerReview: Boolean(item.requiresEngineerReview || item.needsEngineerReview),
    isPreferredForTemplates: source === 'supplier' || Boolean(item.isPreferredForTemplates),
    fallbackReason
  };
}

function selectSupplierCandidate(category, zone, project, scenario, context, seen) {
  const scored = supplierTemplatePool(category)
    .filter(item => !seen.has(item.id) && groupMatchesItem(item, category) && levelCompatible(item, scenario) && hasUsableSupplierData(item))
    .map(item => itemWithRoleFit(item, category))
    .filter(item => roleFitIsUsable(item, category));
  const pool = filterAutoEstimateCandidates(scored, { ...context, requiredCategory: category });
  return selectBestCandidate(pool, scenario);
}

function scoreFallbackPool(items, category) {
  return items.map(item => itemWithRoleFit(item, category)).filter(item => roleFitIsUsable(item, category));
}

function selectBaseLibraryFallback(category, zone, project, scenario, context, seen) {
  const strictPool = filterAutoEstimateCandidates(scoreFallbackPool(LIBRARY.filter(item =>
    !isSupplierItem(item)
    && !seen.has(item.id)
    && groupMatchesItem(item, category)
    && itemMatchesContext(item, zone, project, scenario)
  ), category), { ...context, requiredCategory: category });
  const loosePool = filterAutoEstimateCandidates(scoreFallbackPool(LIBRARY.filter(item =>
    !isSupplierItem(item)
    && !seen.has(item.id)
    && groupMatchesItem(item, category)
  ), category), { ...context, requiredCategory: category });
  const textPool = filterAutoEstimateCandidates(scoreFallbackPool(LIBRARY.filter(item =>
    !isSupplierItem(item)
    && !seen.has(item.id)
    && String(item.category || '').toLowerCase().includes(String(category).toLowerCase().split(' ')[0])
    && levelCompatible(item, scenario)
  ), category), { ...context, requiredCategory: category });
  return selectBestCandidate(strictPool, scenario) || selectBestCandidate(loosePool, scenario) || selectBestCandidate(textPool, scenario);
}

function pickCatalogItemsForZoneDetailed(zone, project, scenario, limit = 12) {
  const template = getZoneTemplate(zone.templateId);
  const context = { zone, project, template, source: 'auto-estimate' };
  const recommendedItems = (zone.recommendedItems && zone.recommendedItems.length ? zone.recommendedItems : template?.recommendedItems || [])
    .map(item => ({ ...item, category: canonicalSystemGroups([item.category || item.group])[0] }))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  const categories = recommendedCategoriesForZone(zone);
  const requiredRows = [];
  const rowKeys = new Set();
  const pushRequirement = (category, qty = 1, name = '') => {
    if (!category || rowKeys.has(category) || requiredRows.length >= limit) return;
    rowKeys.add(category);
    requiredRows.push({ category, qty, name, role: templateRoleForCategory(category) });
  };
  recommendedItems.forEach(item => pushRequirement(item.category, item.qty || 1, item.name || item.category));
  categories.forEach(category => pushRequirement(category, 1, category));

  const picked = [];
  const seen = new Set();
  const missingRoles = [];
  let supplierCount = 0;
  let fallbackCount = 0;

  for (const req of requiredRows) {
    if (picked.length >= limit) break;
    const supplierCandidate = selectSupplierCandidate(req.category, zone, project, scenario, context, seen);
    if (supplierCandidate) {
      picked.push(decoratePickedItem(supplierCandidate, { qty: req.qty, category: req.category, role: req.role, zone, source: 'supplier' }));
      seen.add(supplierCandidate.id);
      supplierCount += 1;
      continue;
    }
    const fallback = selectBaseLibraryFallback(req.category, zone, project, scenario, context, seen);
    if (fallback) {
      const reason = `Нет подходящей supplier-позиции для роли «${req.role}» / группы «${req.category}». Использована базовая библиотека.`;
      picked.push(decoratePickedItem(fallback, { qty: req.qty, category: req.category, role: req.role, zone, source: 'baseLibrary', fallbackReason: reason }));
      seen.add(fallback.id);
      fallbackCount += 1;
      continue;
    }
    missingRoles.push({ category: req.category, role: req.role, name: req.name || req.category, reason: 'Нет supplier-позиции и fallback в базовой библиотеке' });
  }

  return { items: picked, missingRoles, supplierCount, fallbackCount, requiredCount: requiredRows.length };
}

function pickCatalogItemsForZone(zone, project, scenario, limit = 12) {
  return pickCatalogItemsForZoneDetailed(zone, project, scenario, limit).items;
}

function addDerivedWorkItems(project, zone, existingKeys) {
  let added = 0;
  const works = Object.entries(zone.flags || {}).filter(([, enabled]) => enabled).map(([key]) => key);
  const deps = zone.requiredDependencies || [];
  const rows = [];
  if (works.includes('install')) rows.push(['Монтажные работы', 'Монтаж оборудования и кабельной инфраструктуры', 1, 0, 'install']);
  if (works.includes('pnr')) rows.push(['ПНР', 'Пусконаладка, настройка и пользовательские сценарии', 1, 0, 'pnr']);
  if (works.includes('content')) rows.push(['Контент / ПО', 'Подготовка, загрузка и проверка контента / ПО', 1, 0, 'content']);
  if (works.includes('delivery')) rows.push(['Логистика', 'Доставка, упаковка и перемещение оборудования', 1, 0, 'delivery']);
  if (works.includes('metal') || deps.some(d => /креп/i.test(d))) rows.push(['Крепления и конструкции', 'Крепления, конструкции и монтажные материалы', 1, 0, 'metal']);
  if (deps.some(d => /пит/i.test(d))) rows.push(['Питание', 'Проверка питания и резервов мощности', 1, 0, 'power']);
  rows.forEach(([category, name, qty, price, key]) => {
    const derivedKey = `${zone.id}:work:${key}`;
    if (existingKeys.has(derivedKey)) return;
    project.estimateItems.push(createEstimateItem({
      zoneId: zone.id, name, category, unit: 'компл.', qty, currency: 'RUB', unitCost: price,
      priceMode: 'fixed', source: 'derived', isManual: false, isDerived: true, derivedKey,
      note: `Автоматически добавлено по шаблону зоны «${zone.name}».`
    }));
    existingKeys.add(derivedKey);
    added += 1;
  });
  return added;
}


export function addCatalogItemToProject(project, catalogItem, zoneId = '', options = {}) {
  const item = createEstimateItem({
    zoneId,
    name: catalogItem.name,
    category: catalogItem.category,
    categoryId: catalogItem.categoryId || '',
    subcategoryId: catalogItem.subcategoryId || '',
    catalogItemId: catalogItem.id || '',
    sourceCatalogItemId: catalogItem.id || '',
    solutionLevel: catalogItem.solutionLevel || 'standard',
    priceStatus: catalogItem.priceStatus || 'actual',
    requiresPriceRequest: Boolean(catalogItem.requiresPriceRequest),
    requiresEngineerReview: Boolean(catalogItem.requiresEngineerReview || catalogItem.requiresCatalogReview),
    relevance: catalogItem.relevance || catalogItem.catalogScope || '',
    relevanceScore: catalogItem.relevanceScore,
    relevanceReason: catalogItem.relevanceReason || '',
    requiresCatalogReview: Boolean(catalogItem.requiresCatalogReview),
    approvedForAutoEstimate: Boolean(catalogItem.approvedForAutoEstimate),
    systemGroups: catalogItem.systemGroups || [],
    dependencies: catalogItem.dependencies || [],
    supplier: catalogItem.supplier || catalogItem.supplierName || '',
    supplierName: catalogItem.supplierName || catalogItem.supplier || '',
    supplierSku: catalogItem.supplierSku || catalogItem.article || '',
    supplierCategory: catalogItem.supplierCategory || catalogItem.category || '',
    sourceType: catalogItem.sourceType || '',
    catalogRelevance: catalogItem.catalogRelevance || catalogItem.relevance || catalogItem.catalogScope || '',
    qualityVisibility: catalogItem.qualityVisibility || (catalogItem.hiddenByDefault ? 'hiddenByDefault' : 'default'),
    priorityScore: catalogItem.priorityScore || 0,
    roleFitScore: catalogItem.roleFitScore,
    roleFitMinScore: catalogItem.roleFitMinScore,
    roleFitReason: catalogItem.roleFitReason || '',
    templateRoleId: catalogItem.templateRoleId || '',
    needsEngineerReview: Boolean(catalogItem.needsEngineerReview),
    fallbackReason: catalogItem.fallbackReason || '',
    templateRole: catalogItem.templateRole || '',
    zoneTemplateId: catalogItem.zoneTemplateId || '',
    replacementGroup: catalogItem.replacementGroup || catalogItem.category || '',
    isPreferredForTemplates: Boolean(catalogItem.isPreferredForTemplates),
    unit: catalogItem.unit,
    qty: options.qty ?? 1,
    currency: catalogItem.currency || 'RUB',
    unitCost: catalogItem.unitCost ?? catalogItem.priceRub ?? 0,
    priceMode: catalogItem.priceMode || (catalogItem.currency === 'USD' ? 'indexed' : 'fixed'),
    source: options.source || 'library',
    isManual: false,
    isDerived: Boolean(options.isDerived),
    derivedKey: options.derivedKey || '',
    note: [catalogItem.note, catalogItem.priceStatus === 'unknown' ? 'Нужно запросить цену.' : '', catalogItem.requiresEngineerReview ? 'Требуется инженерная проверка.' : ''].filter(Boolean).join(' ')
  });
  project.estimateItems.push(item);
  return item;
}


function addPremiumSupportItems(project, existingKeys) {
  let added = 0;
  const rows = [
    ['service-spare', 'Сервисный запас premium', 'Логистика и сервис', 'Сервисный запас и резерв критичных компонентов'],
    ['premium-pnr', 'Расширенная ПНР premium', 'Работы', 'Расширенное тестирование сценариев, ВКС, управления и отказов'],
    ['premium-docs', 'Исполнительная документация premium', 'Работы', 'Расширенная документация, маркировка и регламент эксплуатации'],
    ['premium-control', 'Проверка сценариев управления', 'Управление', 'Проверка пользовательских сценариев и правок интерфейса']
  ];
  rows.forEach(([key, name, category, note]) => {
    const derivedKey = `project:premium:${key}`;
    if (existingKeys.has(derivedKey)) return;
    project.estimateItems.push(createEstimateItem({ name, category, categoryId: key.includes('service') ? 'logistics-service' : key.includes('control') ? 'control' : 'works', unit: 'компл.', qty: 1, currency: 'RUB', unitCost: 0, priceMode: 'fixed', source: 'premium-policy', isDerived: true, derivedKey, priceStatus: 'unknown', requiresPriceRequest: true, requiresEngineerReview: true, note }));
    existingKeys.add(derivedKey);
    added += 1;
  });
  return added;
}

export function generateStarterEstimate(project, options = {}) {
  return generateEstimateFromZones(project, options);
}

export function generateEstimateFromZones(project, options = {}) {
  const mode = options.mode || 'replace';
  const report = { added: 0, processedZones: [], skippedZones: [], warnings: [], mode };
  project.estimateItems ||= [];
  project.zones ||= [];

  if (!project.zones.length) {
    report.warnings.push('Нет зон: смета не сгенерирована.');
    return report;
  }

  if (project.passport?.estimateMode === 'manual') {
    report.warnings.push('Включён ручной режим: добавьте позиции вручную или из библиотеки.');
    return report;
  }

  if (mode === 'replace') project.estimateItems = preserveManualItems(project.estimateItems);
  if (mode === 'recalculate-derived') project.estimateItems = preserveManualItems(project.estimateItems);
  if (mode === 'append') project.estimateItems = deduplicateEstimateItems(project.estimateItems);

  const existingKeys = new Set(project.estimateItems.map(i => i.derivedKey).filter(Boolean));
  const scenario = project.passport?.scenario || 'base';
  const zonesToProcess = options.zoneId ? project.zones.filter(zone => zone.id === options.zoneId) : project.zones;
  zonesToProcess.forEach(zone => {
    if (!zone.type) {
      report.skippedZones.push({ id: zone.id, name: zone.name, reason: 'Не выбран тип зоны' });
      return;
    }
    const selection = pickCatalogItemsForZoneDetailed(zone, project, scenario, 12);
    const matching = selection.items;
    zone.catalogSelectionWarnings = selection.missingRoles || [];
    if (!matching.length) {
      report.skippedZones.push({ id: zone.id, name: zone.name, reason: 'Нет подходящих AV-релевантных позиций каталога' });
      report.warnings.push(`Для зоны «${zone.name}» не найдены позиции, прошедшие фильтр релевантности. Используйте curated fallback или добавьте позицию вручную.`);
      return;
    }
    report.processedZones.push({ id: zone.id, name: zone.name, count: matching.length, supplierCount: selection.supplierCount, fallbackCount: selection.fallbackCount, missingRoles: selection.missingRoles, categoryId: zone.categoryId, templateId: zone.templateId });
    (selection.missingRoles || []).forEach(role => report.warnings.push(`Для зоны «${zone.name}» не найдена роль ${role.role} / ${role.category}: ${role.reason}.`));
    report.added += addDerivedWorkItems(project, zone, existingKeys);
    matching.forEach(item => {
      const derivedKey = `${zone.id}:${item.id}`;
      if (existingKeys.has(derivedKey)) return;
      addCatalogItemToProject(project, item, zone.id, { source: item.sourceType === 'supplier' ? 'supplier-first' : 'library-fallback', isDerived: true, derivedKey, qty: item.recommendedQty || 1 });
      existingKeys.add(derivedKey);
      report.added += 1;
    });
  });
  if (normalizeSolutionLevel(scenario) === 'premium') {
    report.added += addPremiumSupportItems(project, existingKeys);
  }
  const missingDependencies = resolveMissingDependencies(project, { onlyRequired: true }).slice(0, 20);
  report.missingDependencies = missingDependencies;
  missingDependencies.forEach(dep => report.warnings.push(`Не закрыта зависимость: ${dep.sourceItemName} → ${dep.fallbackName}.`));
  project.estimateItems = deduplicateEstimateItems(project.estimateItems);
  if (!report.added && !report.warnings.length) report.warnings.push('Новых строк не добавлено: расчётные позиции уже существуют.');
  return report;
}

export function regenerateDerivedItems(project) {
  return generateEstimateFromZones(project, { mode: 'recalculate-derived' });
}

export function preserveManualItems(items = []) {
  return items.filter(item => item.isManual || item.source === 'manual' || !item.isDerived);
}

export function deduplicateEstimateItems(items = []) {
  const seen = new Set();
  const result = [];
  items.forEach(item => {
    const key = item.derivedKey || (item.isDerived ? `${item.zoneId}:${item.name}:${item.category}` : item.id);
    if (item.isDerived && seen.has(key)) return;
    seen.add(key);
    item.currency = normalizeCurrency(item.currency);
    item.priceMode = normalizePriceMode(item.priceMode || (item.isManual ? 'manual' : item.currency === 'USD' ? 'indexed' : 'fixed'));
    result.push(item);
  });
  return result;
}

export function groupedEstimate(items = []) {
  return items.reduce((acc, item) => { (acc[item.category] ||= []).push(item); return acc; }, {});
}
