import { calculateProjectTotals } from './pricing.js';
export function calculateCablingCost(project = {}, settings = null) { return calculateProjectTotals(project, settings).consumablesCost; }
