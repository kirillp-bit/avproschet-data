import { calculateProjectTotals } from './pricing.js';

export function calculateWorkBreakdown(project = {}, settings = null) {
  const totals = calculateProjectTotals(project, settings);
  return {
    installation: totals.installCost,
    pnr: totals.pnrCost,
    content: totals.contentCost,
    consumables: totals.consumablesCost,
    construction: totals.constructionCost,
    logistics: totals.logisticsCost,
    service: totals.serviceCost
  };
}
