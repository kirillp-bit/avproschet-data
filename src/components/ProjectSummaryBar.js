import { calculateProjectTotals } from '../engine/pricing.js';
import { validateProject } from '../engine/validation.js';
import { formatMoney } from '../utils/format.js';

const statusLabel = { draft: 'Черновик', estimate_ready: 'Смета готова', has_errors: 'Есть ошибки', proposal_ready: 'КП готово' };

export function ProjectSummaryBar(project) {
  if (!project) return '';
  const totals = calculateProjectTotals(project);
  const warnings = validateProject(project);
  const errors = warnings.filter(w => isCritical(w)).length;
  const risks = warnings.length - errors;
  const warningText = errors ? `${errors} ошибок` : risks ? `${risks} предупреждений` : 'Без ошибок';
  const warningTone = errors ? 'danger' : risks ? 'warn' : 'ok';
  return `<section class="projectSummaryBar">
    <div><span class="label">Статус</span><strong>${statusLabel[project.status] || 'Черновик'}</strong></div>
    <div><span class="label">Зоны</span><strong>${project.zones?.length || 0}</strong></div>
    <div><span class="label">Ориентир</span><strong>${formatMoney(totals.salePriceGross)}</strong></div>
    <div><span class="badge ${warningTone}">${warningText}</span></div>
  </section>`;
}

function isCritical(warning = {}) { return warning.severity === 'critical' || warning.severity === 'error'; }
