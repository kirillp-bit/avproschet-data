import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';
import { ProposalPreview } from '../components/ProposalPreview.js';
import { ProposalOptionsPanel } from '../components/ProposalOptionsPanel.js';
import { ExportActions } from '../components/ExportActions.js';
import { bindImportProjectInput } from '../components/ImportProjectDialog.js';
import { ensureProject, persistProject, setProject } from '../app/state.js';
import { validateProject } from '../engine/validation.js';
import { buildClientProposalView, buildInternalEstimateView } from '../engine/proposalBuilder.js';
import { applyProposalPreset, normalizeProposalOptions } from '../engine/proposalOptions.js';
import { downloadProjectJson } from '../export/exportJson.js';
import { downloadProposalHtml } from '../export/exportHtml.js';
import { downloadProjectWorkbook } from '../export/exportExcel.js';
import { printProposal } from '../export/exportPrint.js';
import { toast } from '../utils/dom.js';
import { escapeHtml, formatMoney } from '../utils/format.js';

export function ProposalPage(root) {
  const project = ensureProject();
  project.proposalOptions = normalizeProposalOptions(project.proposalOptions || {});
  const warnings = validateProject(project);
  const errors = warnings.filter(w => w.severity === 'error');
  const clientView = buildClientProposalView(project, null, project.proposalOptions);
  const internalView = buildInternalEstimateView(project);
  const isEmpty = !(project.estimateItems || []).length;
  const actions = ExportActions({ hasErrors: Boolean(errors.length), isEmpty });
  root.innerHTML = AppLayout(`${PageHeader({ title: 'КП / экспорт', description: 'Безопасный предпросмотр клиентского КП, внутренняя смета и выгрузки для согласования.', actions })}
    ${renderGuard(warnings, isEmpty)}
    <div class="proposalWorkspace">
      <aside class="proposalSide">
        ${ProposalOptionsPanel(project.proposalOptions)}
        ${renderInternalSummary(internalView)}
      </aside>
      <section class="proposalPreviewShell">
        ${isEmpty ? EmptyState({ title: 'Смета пока пустая', text: 'КП не выглядит готовым документом, пока нет состава решения и итогов.', actions: '<a class="btn primary" href="#/estimate">Открыть смету</a>' }) : ProposalPreview(clientView)}
      </section>
    </div>`);
  bindLayoutActions(root);
  bindImportProjectInput(root);
  bindProposalEvents(root, project, errors);
}

function bindProposalEvents(root, project, errors) {
  root.querySelectorAll('[data-proposal-preset]').forEach(btn => btn.addEventListener('click', () => {
    project.proposalOptions = applyProposalPreset(project.proposalOptions, btn.dataset.proposalPreset);
    persistProject();
    ProposalPage(root);
  }));
  root.querySelectorAll('[data-proposal-option]').forEach(input => input.addEventListener('change', () => {
    const key = input.dataset.proposalOption;
    project.proposalOptions ||= {};
    project.proposalOptions[key] = input.type === 'checkbox' ? input.checked : input.value;
    project.proposalOptions.preset = '';
    project.proposalOptions = normalizeProposalOptions(project.proposalOptions);
    persistProject();
    ProposalPage(root);
  }));
  root.querySelector('[data-print]')?.addEventListener('click', () => guardedExport(errors, () => printProposal()));
  root.querySelector('[data-html]')?.addEventListener('click', () => guardedExport(errors, () => downloadProposalHtml(project, null, project.proposalOptions)));
  root.querySelector('[data-excel]')?.addEventListener('click', () => guardedExport(errors, () => downloadProjectWorkbook(project, null, project.proposalOptions)));
  root.querySelector('[data-json]')?.addEventListener('click', () => { downloadProjectJson(project); toast('JSON проекта выгружен'); });
}

function guardedExport(errors, action) {
  if (errors.length) {
    const ok = confirm('В проекте есть критичные ошибки проверки. Экспортировать всё равно?');
    if (!ok) return;
  }
  action();
}

function renderGuard(warnings, isEmpty) {
  const errors = warnings.filter(w => w.severity === 'error');
  const soft = warnings.filter(w => w.severity !== 'error');
  if (isEmpty) return '<div class="notice warn"><strong>Смета пустая</strong><p>Клиентское КП можно оформить только после заполнения состава решения.</p></div>';
  if (errors.length) return `<div class="notice warn"><strong>Есть критичные ошибки проверки</strong><p>${errors.map(w => escapeHtml(w.title)).join(', ')}. Перед отправкой клиенту лучше открыть этап проверки.</p><a class="btn ghost small" href="#/check">Открыть проверку</a></div>`;
  if (soft.length) return `<div class="notice ok"><strong>КП можно готовить</strong><p>Есть ${soft.length} некритичных замечаний. Внутренние поля не попадут в клиентский документ.</p></div>`;
  return '<div class="notice ok"><strong>КП готово к предпросмотру</strong><p>Клиентское представление отделено от внутренней инженерно-коммерческой сметы.</p></div>';
}

function renderInternalSummary(view) {
  return `<section class="card internalSummary"><h3>Внутренняя сводка</h3>
    <div class="summaryList">
      <div><span>Себестоимость</span><strong>${formatMoney(view.totals.subtotalCost)}</strong></div>
      <div><span>Цена без НДС</span><strong>${formatMoney(view.totals.salePriceNet)}</strong></div>
      <div><span>Прибыль</span><strong>${formatMoney(view.totals.profit)}</strong></div>
      <div><span>Факт. маржа</span><strong>${view.totals.actualMarginPct}%</strong></div>
      <div><span>Строк к проверке</span><strong>${view.warnings.length}</strong></div>
    </div>
    <p class="muted smallText">Эти данные видны только команде П-Медиа и не выводятся в клиентском КП.</p>
  </section>`;
}
