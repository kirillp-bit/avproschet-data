import { createId } from '../utils/ids.js';
import { DEFAULT_SETTINGS } from '../data/defaultSettings.js';
import { normalizeProposalOptions } from './proposalOptions.js';
import { normalizeCurrency, normalizePriceMode } from './currency.js';

export const PROJECT_STATUSES = [
  {id:'draft', name:'Черновик'},
  {id:'estimate_ready', name:'Смета готова'},
  {id:'has_errors', name:'Есть ошибки'},
  {id:'proposal_ready', name:'КП готово'}
];

export function createProject(seed = {}) {
  const now = new Date().toISOString();
  const id = seed.id || createId('project');
  return {
    id,
    name: seed.name || 'Новый AV-пресейл',
    customerName: seed.customerName || seed.customer || seed.passport?.customerName || seed.passport?.customer || '',
    createdAt: seed.createdAt || now,
    updatedAt: seed.updatedAt || now,
    status: seed.status || 'draft',
    passport: {
      projectType: 'corporate', cityTier: 'local', area: 350, floors: 1, ceilingHeight: 3.2,
      urgency: 'standard', scenario: 'base', targetBudget: 0,
      targetBudgetIncludesVat: DEFAULT_SETTINGS.targetBudgetIncludesVat,
      vatPct: DEFAULT_SETTINGS.defaultVatPct, marginMode: DEFAULT_SETTINGS.defaultMarginMode,
      marginPct: DEFAULT_SETTINGS.defaultMarginPct,
      ...(seed.passport || {})
    },
    zones: seed.zones || [],
    estimateItems: seed.estimateItems || [],
    acceptedWarnings: seed.acceptedWarnings || [],
    proposalOptions: normalizeProposalOptions(seed.proposalOptions || {}),
    settingsOverrides: seed.settingsOverrides || {},
    notes: seed.notes || '',
    schemaVersion: Math.max(Number(seed.schemaVersion || 0), 9) || 9,
    appVersion: seed.appVersion || 'stage9-security-hotfix',
    proposalNumber: seed.proposalNumber || '',
    managerContact: seed.managerContact || '',
    customerContact: seed.customerContact || ''
  };
}

export function createZone(seed = {}) {
  return {
    id: seed.id || createId('zone'),
    name: seed.name || 'Новая зона',
    type: seed.type || seed.purpose || seed.zoneType || 'conference',
    categoryId: seed.categoryId || '',
    categoryName: seed.categoryName || '',
    templateId: seed.templateId || '',
    area: seed.area ?? seed.defaultArea ?? 25,
    task: seed.task || seed.primaryTask || seed.defaultScenario || 'content',
    scenario: seed.scenario || seed.defaultScenario || '',
    requiredSystemGroups: seed.requiredSystemGroups || [],
    requiredDependencies: seed.requiredDependencies || [],
    catalogSelectionWarnings: seed.catalogSelectionWarnings || [],
    typicalWorks: seed.typicalWorks || [],
    requiresEngineerReview: Boolean(seed.requiresEngineerReview || seed.needsEngineerReview),
    nonTypicalForProject: Boolean(seed.nonTypicalForProject),
    recommendationReason: seed.recommendationReason || '',
    flags: { install:true, pnr:true, content:false, delivery:true, metal:false, service:false, ...(seed.flags || {}) },
    notes: seed.notes || ''
  };
}

export function createEstimateItem(seed = {}) {
  const currency = normalizeCurrency(seed.currency || 'RUB');
  const priceMode = normalizePriceMode(seed.priceMode || (seed.isManual ?? true ? 'manual' : currency === 'USD' ? 'indexed' : 'fixed'));
  return {
    id: seed.id || createId('item'),
    zoneId: seed.zoneId || seed.zoneRef || '',
    name: seed.name || 'Позиция',
    category: seed.category || 'Оборудование',
    categoryId: seed.categoryId || '',
    subcategoryId: seed.subcategoryId || '',
    catalogItemId: seed.catalogItemId || seed.sourceCatalogItemId || '',
    sourceCatalogItemId: seed.sourceCatalogItemId || seed.catalogItemId || '',
    solutionLevel: seed.solutionLevel || '',
    priceStatus: seed.priceStatus || '',
    priceSource: seed.priceSource || '',
    priceDate: seed.priceDate || '',
    requiresPriceRequest: Boolean(seed.requiresPriceRequest),
    requiresEngineerReview: Boolean(seed.requiresEngineerReview || seed.needsEngineerReview),
    isPlaceholder: Boolean(seed.isPlaceholder),
    systemGroups: seed.systemGroups || [],
    dependencies: seed.dependencies || [],
    alternatives: seed.alternatives || [],
    sourceType: seed.sourceType || (seed.supplier || seed.supplierName || seed.supplierId ? 'supplier' : seed.source === 'manual' ? 'manual' : seed.source === 'library-fallback' ? 'baseLibrary' : ''),
    supplier: seed.supplier || seed.supplierName || '',
    supplierName: seed.supplierName || seed.supplier || '',
    supplierSku: seed.supplierSku || seed.article || '',
    supplierCategory: seed.supplierCategory || '',
    catalogRelevance: seed.catalogRelevance || seed.relevance || '',
    qualityVisibility: seed.qualityVisibility || '',
    priorityScore: Number(seed.priorityScore || 0),
    roleFitScore: seed.roleFitScore !== undefined ? Number(seed.roleFitScore) : undefined,
    roleFitMinScore: seed.roleFitMinScore !== undefined ? Number(seed.roleFitMinScore) : undefined,
    roleFitReason: seed.roleFitReason || '',
    templateRoleId: seed.templateRoleId || '',
    needsEngineerReview: Boolean(seed.needsEngineerReview),
    fallbackReason: seed.fallbackReason || '',
    templateRole: seed.templateRole || '',
    zoneTemplateId: seed.zoneTemplateId || '',
    replacementGroup: seed.replacementGroup || '',
    isPreferredForTemplates: Boolean(seed.isPreferredForTemplates),
    unit: seed.unit || 'шт.',
    qty: Number(seed.qty ?? 1),
    currency,
    unitCost: Number(seed.unitCost ?? seed.priceRub ?? seed.price_rub ?? seed.price ?? 0),
    priceMode,
    source: seed.source || 'manual',
    isManual: seed.isManual ?? true,
    isDerived: seed.isDerived ?? false,
    derivedKey: seed.derivedKey || '',
    note: seed.note || seed.description || ''
  };
}

export function normalizeProject(raw) {
  raw ||= {};
  if (!raw.customerName && raw.passport) raw.customerName = raw.passport.customerName || raw.passport.customer || raw.customer || '';
  const project = createProject(raw || {});
  project.zones = (raw?.zones || []).map(createZone);
  project.estimateItems = (raw?.estimateItems || raw?.estimate || []).map(createEstimateItem);
  project.acceptedWarnings = raw?.acceptedWarnings || [];
  project.proposalOptions = normalizeProposalOptions(raw?.proposalOptions || project.proposalOptions || {});
  project.passport.targetBudgetIncludesVat = project.passport.targetBudgetIncludesVat ?? DEFAULT_SETTINGS.targetBudgetIncludesVat;
  project.schemaVersion = Math.max(Number(project.schemaVersion || 0), 9) || 9;
  project.appVersion = project.appVersion || 'stage9-security-hotfix';
  return project;
}

export function duplicateProject(project) {
  return createProject({
    ...structuredClone(project),
    id: createId('project'),
    name: `${project.name || 'Проект'} · копия`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft'
  });
}
