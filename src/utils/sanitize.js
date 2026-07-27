const MAX_TEXT_LENGTH = 5000;
const MAX_SHORT_TEXT_LENGTH = 280;
const DANGEROUS_FORMULA_PREFIX = /^[=+\-@]/;

export function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>"'`]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }[ch]));
}

export function escapeAttr(value = '') {
  return escapeHtml(value).replace(/[\u0000-\u001f\u007f]/g, '');
}

export function safeText(value, fallback = '') {
  if (value === null || value === undefined) return escapeHtml(fallback);
  return escapeHtml(value);
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function safeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '#';
  const normalized = raw.replace(/[\u0000-\u001f\u007f\s]+/g, '').toLowerCase();
  if (normalized.startsWith('javascript:')) return '#';
  if (normalized.startsWith('data:text/html')) return '#';
  if (normalized.startsWith('vbscript:')) return '#';
  if (/^(https?:\/\/|mailto:|tel:|\/|\.\/|\.\.\/|#)/i.test(raw)) return raw;
  return '#';
}

export function stripHtml(value = '') {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}

export function escapeSpreadsheetCell(value) {
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  const text = String(value ?? '');
  return DANGEROUS_FORMULA_PREFIX.test(text.trimStart()) ? `'${text}` : text;
}

export function trimText(value, maxLength = MAX_TEXT_LENGTH) {
  const text = String(value ?? '');
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function cleanText(value, maxLength = MAX_TEXT_LENGTH) {
  return trimText(stripHtml(value), maxLength);
}

function cleanId(value, fallback = '') {
  return trimText(String(value ?? fallback).replace(/[^a-zA-Z0-9_.:-]/g, ''), 140) || fallback;
}

function cleanNumber(value, fallback = 0) {
  return safeNumber(value, fallback);
}

function cleanStringArray(value, maxLength = MAX_SHORT_TEXT_LENGTH) {
  return Array.isArray(value) ? value.slice(0, 100).map(item => cleanText(item, maxLength)).filter(Boolean) : [];
}

export function sanitizeImportedProject(data = {}) {
  const raw = data?.project ? data.project : data;
  const project = { ...raw };
  project.id = cleanId(project.id, project.id || 'imported-project');
  project.name = cleanText(project.name || 'Импортированный проект', MAX_SHORT_TEXT_LENGTH);
  project.customerName = cleanText(project.customerName || project.customer || project.passport?.customerName || '', MAX_SHORT_TEXT_LENGTH);
  project.proposalNumber = cleanText(project.proposalNumber || '', MAX_SHORT_TEXT_LENGTH);
  project.customerContact = cleanText(project.customerContact || '', MAX_SHORT_TEXT_LENGTH);
  project.managerContact = cleanText(project.managerContact || '', MAX_SHORT_TEXT_LENGTH);
  project.status = cleanId(project.status || 'draft', 'draft');
  project.notes = cleanText(project.notes || '');
  project.passport = sanitizePlainObject(project.passport || {});
  project.passport.customerName = cleanText(project.passport.customerName || project.customerName || '', MAX_SHORT_TEXT_LENGTH);
  project.zones = Array.isArray(project.zones) ? project.zones.slice(0, 500).map(sanitizeZone) : [];
  project.estimateItems = Array.isArray(project.estimateItems || project.estimate) ? (project.estimateItems || project.estimate).slice(0, 5000).map(sanitizeEstimateItem) : [];
  project.acceptedWarnings = Array.isArray(project.acceptedWarnings) ? project.acceptedWarnings.slice(0, 500).map(sanitizeWarning) : [];
  project.proposalOptions = sanitizePlainObject(project.proposalOptions || {});
  project.settingsOverrides = sanitizePlainObject(project.settingsOverrides || {});
  project.schemaVersion = safeNumber(project.schemaVersion, 1);
  project.appVersion = cleanText(project.appVersion || '', MAX_SHORT_TEXT_LENGTH);
  return data?.project ? { ...data, project } : project;
}

function sanitizeZone(zone = {}) {
  return {
    ...zone,
    id: cleanId(zone.id, ''),
    name: cleanText(zone.name || zone.title || 'Зона', MAX_SHORT_TEXT_LENGTH),
    type: cleanText(zone.type || zone.purpose || zone.zoneType || '', MAX_SHORT_TEXT_LENGTH),
    categoryId: cleanId(zone.categoryId || '', ''),
    categoryName: cleanText(zone.categoryName || '', MAX_SHORT_TEXT_LENGTH),
    templateId: cleanId(zone.templateId || '', ''),
    area: cleanNumber(zone.area ?? zone.defaultArea, 0),
    task: cleanText(zone.task || zone.primaryTask || zone.defaultScenario || '', MAX_SHORT_TEXT_LENGTH),
    scenario: cleanText(zone.scenario || '', MAX_SHORT_TEXT_LENGTH),
    recommendationReason: cleanText(zone.recommendationReason || ''),
    notes: cleanText(zone.notes || ''),
    requiredSystemGroups: cleanStringArray(zone.requiredSystemGroups),
    requiredDependencies: cleanStringArray(zone.requiredDependencies),
    typicalWorks: Array.isArray(zone.typicalWorks) ? zone.typicalWorks.slice(0, 100).map(sanitizePlainObject) : [],
    flags: typeof zone.flags === 'object' && zone.flags ? Object.fromEntries(Object.entries(zone.flags).map(([key, value]) => [cleanId(key), Boolean(value)])) : {}
  };
}

function sanitizeEstimateItem(item = {}) {
  return {
    ...item,
    id: cleanId(item.id, ''),
    zoneId: cleanId(item.zoneId || item.zoneRef || '', ''),
    name: cleanText(item.name || 'Позиция', MAX_SHORT_TEXT_LENGTH),
    category: cleanText(item.category || 'Оборудование', MAX_SHORT_TEXT_LENGTH),
    categoryId: cleanId(item.categoryId || '', ''),
    subcategoryId: cleanId(item.subcategoryId || '', ''),
    catalogItemId: cleanId(item.catalogItemId || item.sourceCatalogItemId || '', ''),
    sourceCatalogItemId: cleanId(item.sourceCatalogItemId || item.catalogItemId || '', ''),
    solutionLevel: cleanText(item.solutionLevel || '', MAX_SHORT_TEXT_LENGTH),
    priceStatus: cleanText(item.priceStatus || '', MAX_SHORT_TEXT_LENGTH),
    priceSource: cleanText(item.priceSource || '', MAX_SHORT_TEXT_LENGTH),
    priceDate: cleanText(item.priceDate || '', MAX_SHORT_TEXT_LENGTH),
    supplier: cleanText(item.supplier || '', MAX_SHORT_TEXT_LENGTH),
    unit: cleanText(item.unit || 'шт.', 40),
    qty: cleanNumber(item.qty, 1),
    unitCost: cleanNumber(item.unitCost ?? item.priceRub ?? item.price_rub ?? item.price, 0),
    source: cleanText(item.source || 'manual', MAX_SHORT_TEXT_LENGTH),
    derivedKey: cleanText(item.derivedKey || '', MAX_SHORT_TEXT_LENGTH),
    note: cleanText(item.note || item.description || ''),
    systemGroups: cleanStringArray(item.systemGroups),
    dependencies: cleanStringArray(item.dependencies),
    alternatives: Array.isArray(item.alternatives) ? item.alternatives.slice(0, 100).map(sanitizePlainObject) : []
  };
}

function sanitizeWarning(warning = {}) {
  return {
    ...warning,
    id: cleanId(warning.id || '', ''),
    severity: cleanText(warning.severity || '', MAX_SHORT_TEXT_LENGTH),
    type: cleanText(warning.type || '', MAX_SHORT_TEXT_LENGTH),
    title: cleanText(warning.title || '', MAX_SHORT_TEXT_LENGTH),
    message: cleanText(warning.message || ''),
    recommendedAction: cleanText(warning.recommendedAction || warning.actionLabel || ''),
    actionLabel: cleanText(warning.actionLabel || '', MAX_SHORT_TEXT_LENGTH),
    actionType: cleanText(warning.actionType || '', MAX_SHORT_TEXT_LENGTH),
    entityId: cleanId(warning.entityId || '', ''),
    entityType: cleanText(warning.entityType || '', MAX_SHORT_TEXT_LENGTH),
    note: cleanText(warning.note || '')
  };
}

function sanitizePlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  Object.entries(value).slice(0, 200).forEach(([key, val]) => {
    const safeKey = cleanId(key, 'field');
    if (typeof val === 'string') result[safeKey] = cleanText(val);
    else if (typeof val === 'number') result[safeKey] = cleanNumber(val);
    else if (typeof val === 'boolean') result[safeKey] = val;
    else if (Array.isArray(val)) result[safeKey] = val.slice(0, 100).map(item => typeof item === 'string' ? cleanText(item) : item);
    else if (val && typeof val === 'object') result[safeKey] = sanitizePlainObject(val);
  });
  return result;
}

export function hasSuspiciousMarkup(value) {
  return /<\/?[a-z][\s\S]*>|javascript:|onerror\s*=|onload\s*=|onclick\s*=/i.test(String(value ?? ''));
}
