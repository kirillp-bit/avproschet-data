import { calculateProjectTotals } from '../engine/pricing.js';
import { validateProject } from '../engine/validation.js';
import { formatMoney } from '../utils/format.js';
export function TopSummary(project) {
  if (!project) return '';
  const t = calculateProjectTotals(project);
  const warnings = validateProject(project);
  const errors = warnings.filter(w => w.severity === 'error').length;
  const risks = warnings.length - errors;
  const commercialLabel = t.marginMode === 'margin' ? `Маржа ${t.actualMarginPct}%` : `Наценка ${t.actualMarkupPct}%`;
  return `<section class="panel card" style="margin-bottom:14px"><div class="summaryGrid">
    <div class="summaryBlock"><div class="label">Себестоимость</div><div class="value">${formatMoney(t.subtotalCost)}</div></div>
    <div class="summaryBlock"><div class="label">${commercialLabel}</div><div class="value">${formatMoney(t.profit)}</div></div>
    <div class="summaryBlock"><div class="label">Цена без НДС</div><div class="value">${formatMoney(t.salePriceNet)}</div></div>
    <div class="summaryBlock"><div class="label">Цена с НДС · ${errors} ошибок / ${risks} рисков</div><div class="value">${formatMoney(t.salePriceGross)}</div></div>
  </div></section>`;
}
