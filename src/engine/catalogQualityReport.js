import { classifySupplierItem, getRelevanceCounters } from './catalogRelevance.js';
export function buildCatalogQualityReport(items = []) {
  const classified = items.map(item => classifySupplierItem(item));
  const counters = getRelevanceCounters(classified);
  const withoutCategory = classified.filter(item => !item.category && !item.categoryId).length;
  const withoutPrice = classified.filter(item => !Number(item.unitCost ?? item.price ?? item.priceRub ?? 0)).length;
  return { totalSupplierItems: classified.filter(item => item.supplier || item.supplierId).length, totalItems: classified.length, avCore: counters.av_core || 0, avInfrastructure: counters.av_infrastructure || 0, itRelated: counters.it_related || 0, consumables: counters.consumables || 0, questionable: counters.questionable || 0, hidden: counters.hidden || 0, service: counters.service || 0, withoutCategory, withoutPrice, requiresReview: counters.requiresReview || 0, approvedForAutoEstimate: counters.approvedForAutoEstimate || 0, hiddenByDefault: counters.hiddenByDefault || 0, generatedAt: new Date().toISOString() };
}
export function catalogQualityReportToCsv(report = {}) { return Object.entries(report).map(([key, value]) => `${key},${JSON.stringify(value)}`).join('\n'); }
