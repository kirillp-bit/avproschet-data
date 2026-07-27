import { formatMoney, num } from '../utils/format.js';

export function calculateBudgetStatus(project = {}, totals = {}, settings = {}) {
  const targetBudget = num(project.passport?.targetBudget, 0);
  const includesVat = project.passport?.targetBudgetIncludesVat ?? settings.targetBudgetIncludesVat ?? true;
  const currentPrice = includesVat ? num(totals.salePriceGross ?? totals.gross) : num(totals.salePriceNet ?? totals.net);
  if (targetBudget <= 0) {
    return { enabled: false, targetBudget: 0, currentPrice, includesVat, delta: 0, deltaPct: 0, status: 'not_set', title: 'Целевой бюджет не задан' };
  }
  const delta = currentPrice - targetBudget;
  const deltaPct = targetBudget ? delta / targetBudget * 100 : 0;
  const status = Math.abs(delta) < 1 ? 'equal' : delta > 0 ? 'over' : 'under';
  return {
    enabled: true,
    targetBudget,
    currentPrice,
    includesVat,
    delta,
    deltaPct,
    status,
    title: status === 'over' ? 'Бюджет превышен' : status === 'equal' ? 'Цена совпадает с бюджетом' : 'Цена ниже бюджета'
  };
}

export function getBudgetRecommendations(project = {}, totals = {}, budget = null) {
  const state = budget || calculateBudgetStatus(project, totals);
  if (!state.enabled || state.status !== 'over') return [];
  const recommendations = [];
  if (project.passport?.scenario === 'premium') recommendations.push('Проверить переход сценария с premium на standard/base.');
  recommendations.push('Проверить самые дорогие зоны и импортные indexed-позиции.');
  recommendations.push('Проверить ручные позиции, особенно без комментария или без категории.');
  recommendations.push('Оценить снижение наценки/маржи после согласования целевой экономики.');
  recommendations.push('Убрать необязательные опции только после подтверждения пользователя.');
  return recommendations;
}

export function describeBudgetStatus(state) {
  if (!state?.enabled) return 'Целевой бюджет не задан.';
  const sign = state.delta > 0 ? 'выше' : state.delta < 0 ? 'ниже' : 'равно';
  return `Текущая цена ${sign} бюджета на ${formatMoney(Math.abs(state.delta))} (${Math.abs(state.deltaPct).toFixed(1)}%).`;
}
