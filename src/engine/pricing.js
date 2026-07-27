import { DEFAULT_SETTINGS } from '../data/defaultSettings.js';
import { num } from '../utils/format.js';
import { itemUnitCostRub, normalizeCurrency, normalizePriceMode } from './currency.js';
import { calculateBudgetStatus } from './budget.js';

export function mergedSettings(project) { return {...DEFAULT_SETTINGS, ...readRuntimeSettings(), ...(project?.settingsOverrides || {})}; }
function readRuntimeSettings() {
  try {
    if (typeof localStorage === 'undefined') return {};
    return JSON.parse(localStorage.getItem('avproschet.stage1.settings') || '{}');
  } catch { return {}; }
}
export function roundMoney(value) { return Math.round(num(value)); }
export function roundPct(value) { return Math.round(num(value) * 100) / 100; }

function positiveManualNumber(...values) {
  for (const value of values) {
    if (value === '' || value === null || value === undefined) continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export function resolveComplexityCoef(project = {}) {
  return positiveManualNumber(project.settingsOverrides?.complexityManual, project.passport?.complexityManual) ?? calculateComplexity(project);
}

export function resolveLogisticsCoef(project = {}) {
  return positiveManualNumber(project.settingsOverrides?.logisticsManual, project.passport?.logisticsManual) ?? calculateLogistics(project);
}

export function itemCostRub(item, settings = DEFAULT_SETTINGS) {
  return roundMoney(num(item.qty, 1) * itemUnitCostRub(item, settings));
}

export function calculateSalePrice(cost, pct, mode = 'markup') {
  const value = num(pct, 0);
  if (mode === 'margin') {
    if (value < 0 || value >= 100) return NaN;
    return cost / (1 - value / 100);
  }
  if (value < 0) return NaN;
  return cost * (1 + value / 100);
}
export function calculateVat(net, vatPct = DEFAULT_SETTINGS.defaultVatPct) { return net * Math.max(0, num(vatPct, 0)) / 100; }
export function calculateProfit(net, cost) { return net - cost; }
export function calculateActualMargin(net, cost) { return net > 0 ? (net - cost) / net * 100 : 0; }
export function calculateActualMarkup(net, cost) { return cost > 0 ? (net - cost) / cost * 100 : 0; }

export function calculateProjectTotals(project = {}, settingsInput = null) {
  const settings = settingsInput || mergedSettings(project);
  const rates = settings.laborRates || DEFAULT_SETTINGS.laborRates;
  const items = project.estimateItems || [];
  const equipmentCost = items.reduce((sum, item) => sum + itemCostRub(item, settings), 0);
  const complexity = resolveComplexityCoef(project);
  const logisticsCoef = resolveLogisticsCoef(project);
  const installCost = roundMoney(equipmentCost * num(rates.installationPct) * complexity);
  const pnrCost = roundMoney(equipmentCost * num(rates.pnrPct) * complexity);
  const contentCost = roundMoney(equipmentCost * num(rates.contentPct) * countFlag(project, 'content'));
  const consumablesCost = roundMoney(equipmentCost * num(rates.cablePct) * logisticsCoef);
  const constructionCost = roundMoney(equipmentCost * num(rates.constructionPct, 0));
  const logisticsCost = roundMoney(equipmentCost * num(rates.logisticsPct) * logisticsCoef);
  const serviceCost = roundMoney(equipmentCost * num(rates.servicePct) * countFlag(project, 'service'));
  const subtotalCost = roundMoney(equipmentCost + installCost + pnrCost + contentCost + consumablesCost + constructionCost + logisticsCost + serviceCost);
  const marginMode = project.passport?.marginMode || settings.defaultMarginMode || 'markup';
  const marginPct = num(project.passport?.marginPct, settings.defaultMarginPct);
  const rawNet = calculateSalePrice(subtotalCost, marginPct, marginMode);
  const salePriceNet = Number.isFinite(rawNet) ? roundMoney(rawNet) : 0;
  const vatPct = num(project.passport?.vatPct, settings.defaultVatPct);
  const vatAmount = roundMoney(calculateVat(salePriceNet, vatPct));
  const salePriceGross = roundMoney(salePriceNet + vatAmount);
  const profit = roundMoney(calculateProfit(salePriceNet, subtotalCost));
  const actualMarginPct = roundPct(calculateActualMargin(salePriceNet, subtotalCost));
  const actualMarkupPct = roundPct(calculateActualMarkup(salePriceNet, subtotalCost));
  const totals = {
    equipmentCost, installCost, pnrCost, contentCost, consumablesCost, constructionCost, logisticsCost, serviceCost,
    subtotalCost, salePriceNet, vatAmount, salePriceGross, profit, actualMarginPct, actualMarkupPct,
    complexity, logisticsCoef, marginMode, marginPct, vatPct,
    equipment: equipmentCost, install: installCost, pnr: pnrCost, content: contentCost, cables: consumablesCost,
    logistics: logisticsCost, service: serviceCost, cost: subtotalCost, margin: profit, net: salePriceNet, gross: salePriceGross
  };
  const budget = calculateBudgetStatus(project, totals, settings);
  totals.targetBudget = budget.targetBudget;
  totals.targetBudgetIncludesVat = budget.includesVat;
  totals.targetBudgetDelta = roundMoney(budget.delta);
  totals.targetBudgetDeltaPct = roundPct(budget.deltaPct);
  totals.targetBudgetStatus = budget.status;
  return totals;
}

export const calculateTotals = calculateProjectTotals;

function countFlag(project, flag) { return (project.zones || []).some(z => z.flags?.[flag]) ? 1 : 0; }
export function calculateComplexity(project) {
  const p = project.passport || {}; const zones = project.zones || [];
  let coef = 1 + Math.max(0, num(p.ceilingHeight,3)-3) * 0.03 + Math.max(0, zones.length-1) * 0.03;
  if (p.urgency === 'urgent') coef += 0.12;
  if (zones.some(z => ['interactive','wow','vc'].includes(z.task))) coef += 0.08;
  if (zones.some(z => ['outdoor','stage'].includes(z.type))) coef += 0.10;
  return Number(coef.toFixed(2));
}
export function calculateLogistics(project) {
  const tier = project.passport?.cityTier || 'local';
  const map = {local:1, regional:1.08, remote:1.18, hard:1.3, moscow:1, spb:1.03, region:1.12, far:1.25};
  return map[tier] || 1;
}

export function normalizeCommercialFields(project = {}, settings = DEFAULT_SETTINGS) {
  project.passport ||= {};
  project.passport.marginMode = ['markup','margin'].includes(project.passport.marginMode) ? project.passport.marginMode : settings.defaultMarginMode;
  project.passport.marginPct = num(project.passport.marginPct, settings.defaultMarginPct);
  project.passport.vatPct = num(project.passport.vatPct, settings.defaultVatPct);
  project.passport.targetBudgetIncludesVat = project.passport.targetBudgetIncludesVat ?? settings.targetBudgetIncludesVat;
  (project.estimateItems || []).forEach(item => {
    item.currency = normalizeCurrency(item.currency);
    item.priceMode = normalizePriceMode(item.priceMode || (item.isManual ? 'manual' : item.currency === 'USD' ? 'indexed' : 'fixed'));
  });
  return project;
}
