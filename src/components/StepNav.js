import { currentRoute } from '../app/router.js';
import { validateProject } from '../engine/validation.js';

const steps = [
  ['projects', 'Проекты'],
  ['passport', 'Паспорт'],
  ['zones', 'Зоны'],
  ['estimate', 'Смета'],
  ['check', 'Проверка'],
  ['proposal', 'КП']
];

export function StepNav(project) {
  const active = currentRoute();
  const warnings = project ? validateProject(project) : [];
  return `<nav class="stepNav" aria-label="Основной сценарий">${steps.map(([id, label], index) => {
    const status = stepStatus(id, project, warnings);
    return `<a href="#/${id}" data-route="${id}" class="stepItem ${active === id ? 'active' : ''} ${status}"><span class="stepNo">${index + 1}</span><span>${label}</span></a>`;
  }).join('')}</nav>`;
}

function stepStatus(id, project, warnings) {
  if (!project) return id === 'projects' ? 'ok' : 'locked';
  if (id === 'projects') return 'ok';
  if (id === 'passport') return warnings.some(w => w.type === 'data' && isCritical(w)) ? 'danger' : 'ok';
  if (id === 'zones') return project.zones?.length ? 'ok' : 'warn';
  if (id === 'estimate') return project.estimateItems?.length ? 'ok' : 'warn';
  if (id === 'check') return warnings.some(w => isCritical(w)) ? 'danger' : warnings.length ? 'warn' : 'ok';
  if (id === 'proposal') return warnings.some(w => isCritical(w)) ? 'warn' : 'ok';
  return '';
}

function isCritical(warning = {}) { return warning.severity === 'critical' || warning.severity === 'error'; }
