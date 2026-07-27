import { calculateBudgetStatus, describeBudgetStatus, getBudgetRecommendations } from '../engine/budget.js';
import { calculateProjectTotals, mergedSettings } from '../engine/pricing.js';
import { formatMoney } from '../utils/format.js';

export function BudgetStatus(project) {
  const settings = mergedSettings(project);
  const totals = calculateProjectTotals(project, settings);
  const budget = calculateBudgetStatus(project, totals, settings);
  if (!budget.enabled) return '<div class="card"><h3>Целевой бюджет</h3><p class="muted">Бюджет не задан. Заполните поле в паспорте проекта.</p></div>';
  const cls = budget.status === 'over' ? 'danger' : budget.status === 'equal' ? 'ok' : 'lime';
  const recs = getBudgetRecommendations(project, totals, budget);
  return `<div class="card"><h3>Целевой бюджет</h3><div class="summaryGrid"><div class="summaryBlock"><div class="label">Бюджет</div><div class="value">${formatMoney(budget.targetBudget)}</div></div><div class="summaryBlock"><div class="label">Текущая цена ${budget.includesVat ? 'с НДС' : 'без НДС'}</div><div class="value">${formatMoney(budget.currentPrice)}</div></div><div class="summaryBlock"><div class="label">Отклонение</div><div class="value">${formatMoney(budget.delta)}</div></div><div class="summaryBlock"><div class="label">Статус</div><div class="value"><span class="badge ${cls}">${budget.title}</span></div></div></div><p class="muted">${describeBudgetStatus(budget)}</p>${recs.length ? `<ul>${recs.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}</div>`;
}
