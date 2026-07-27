import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { KpiStrip } from '../components/KpiStrip.js';
import { WarningList } from '../components/WarningList.js';
import { BudgetStatus } from '../components/BudgetStatus.js';
import { ensureProject, persistProject, getUiMode } from '../app/state.js';
import { navigate } from '../app/router.js';
import { validateProject } from '../engine/validation.js';
import { calculateProjectTotals } from '../engine/pricing.js';
import { formatMoney } from '../utils/format.js';
import { toast } from '../utils/dom.js';

export function CheckPage(root) {
  const p = ensureProject(); const uiMode = getUiMode(); const warnings = validateProject(p); const totals = calculateProjectTotals(p);
  const errors = warnings.filter(w => isCritical(w)).length; const risks = warnings.length - errors;
  const status = errors ? 'Есть критичные ошибки' : risks ? 'Есть предупреждения' : 'Готов к КП';
  root.innerHTML = AppLayout(`${PageHeader({ title: 'Проверка', description: 'Контрольный этап перед КП: данные, зоны, смета, бюджет и коммерческие параметры.', actions: errors ? '<button class="btn ghost" data-save>Сохранить</button>' : '<a class="btn primary" href="#/proposal">Перейти к КП</a><button class="btn ghost" data-save>Сохранить</button>' })}
  ${KpiStrip([
    { label: 'Статус проекта', value: status, tone: errors ? 'danger' : risks ? 'warn' : 'ok' },
    { label: 'Критичные ошибки', value: errors },
    { label: 'Предупреждения', value: risks },
    { label: 'Цена с НДС', value: formatMoney(totals.salePriceGross) }
  ])}
  ${!p.zones.length ? '<div class="notice warn"><strong>Сначала добавьте зоны</strong><p>Без зон смета будет неполной.</p><a class="btn ghost small" href="#/zones">Перейти к зонам</a></div>' : ''}
  ${!p.estimateItems.length ? '<div class="notice warn"><strong>Сначала создайте смету</strong><p>Проверка КП невозможна без сметных строк.</p><a class="btn ghost small" href="#/estimate">Открыть смету</a></div>' : ''}
  <div class="separator"></div>${BudgetStatus(p)}<div class="separator"></div>${WarningList(warnings, { mode: uiMode })}`);
  bindLayoutActions(root); bind(root,p);
}
function bind(root,p){
  root.querySelector('[data-save]')?.addEventListener('click',()=>{persistProject(); toast('Проверка сохранена');});
  root.querySelectorAll('[data-accept-warning]').forEach(btn=>btn.addEventListener('click',()=>{p.acceptedWarnings ||= []; if(!p.acceptedWarnings.includes(btn.dataset.acceptWarning)) p.acceptedWarnings.push(btn.dataset.acceptWarning); persistProject(); CheckPage(root);}));
  root.querySelectorAll('[data-warning-action]').forEach(btn=>btn.addEventListener('click',()=>{const action = btn.dataset.warningAction; const routes = { 'open-passport':'passport', 'open-zones':'zones', 'open-zone':'zones', 'open-estimate':'estimate', 'open-settings':'settings', 'regenerate-derived':'estimate' }; navigate(routes[action] || 'check');}));
}

function isCritical(warning = {}) { return warning.severity === 'critical' || warning.severity === 'error'; }
