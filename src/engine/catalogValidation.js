import { EQUIPMENT_CATEGORY_TREE } from '../data/equipmentCategories.js';

const allowedCurrencies = new Set(['RUB', 'USD', 'EUR', 'CNY']);
const categoryIds = new Set(EQUIPMENT_CATEGORY_TREE.map(category => category.id));

export function validateCatalogQuality(items = []) {
  const issues = [];
  const ids = new Set();
  items.forEach((item, index) => {
    const ref = item.id || `row-${index}`;
    if (!item.id) push(issues, 'error', ref, 'missing-id', 'У позиции нет id.', 'Добавить стабильный id.');
    if (item.id && ids.has(item.id)) push(issues, 'error', ref, 'duplicate-id', `Повторяющийся id: ${item.id}.`, 'Объединить позиции или переименовать id.');
    if (item.id) ids.add(item.id);
    if (!String(item.name || '').trim()) push(issues, 'error', ref, 'empty-name', 'У позиции пустое название.', 'Заполнить name.');
    if (!item.categoryId || !categoryIds.has(item.categoryId)) push(issues, 'warning', ref, 'missing-category', `Неизвестная категория: ${item.categoryId || 'не задана'}.`, 'Назначить categoryId из EquipmentCategory.');
    if (item.subcategoryId && !categoryIds.has(item.subcategoryId)) push(issues, 'warning', ref, 'missing-subcategory', `Неизвестная подкатегория: ${item.subcategoryId}.`, 'Назначить subcategoryId из EquipmentCategory.');
    if (Number(item.unitCost || 0) < 0) push(issues, 'error', ref, 'negative-price', `Отрицательная цена у позиции «${item.name}».`, 'Исправить цену.');
    if (!allowedCurrencies.has(item.currency)) push(issues, 'error', ref, 'unknown-currency', `Неизвестная валюта: ${item.currency || 'не задана'}.`, 'Использовать RUB / USD / EUR / CNY.');
    if (item.priceStatus === 'unknown' && !item.requiresPriceRequest) push(issues, 'warning', ref, 'unknown-price-without-request', 'Цена неизвестна, но requiresPriceRequest не включён.', 'Установить requiresPriceRequest: true.');
    if (!item.solutionLevel) push(issues, 'warning', ref, 'missing-solution-level', 'Не указан уровень решения.', 'Назначить budget / standard / premium / expert / custom.');
  });
  return issues.map((issue, index) => ({ id: `catalog-quality-${index + 1}`, ...issue }));
}

export function catalogQualitySummary(items = []) {
  const issues = validateCatalogQuality(items);
  return {
    totalItems: items.length,
    totalIssues: issues.length,
    errors: issues.filter(issue => issue.severity === 'error').length,
    warnings: issues.filter(issue => issue.severity === 'warning').length,
    recommendations: issues.filter(issue => issue.severity === 'recommendation').length,
    sample: issues.slice(0, 30)
  };
}

function push(issues, severity, itemId, issueType, message, suggestedAction) {
  issues.push({ severity, itemId, issueType, message, suggestedAction });
}
