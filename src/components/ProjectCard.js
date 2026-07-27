import { escapeAttr, escapeHtml, formatDate, formatMoney } from '../utils/format.js';
import { calculateTotals } from '../engine/pricing.js';
export function ProjectCard(project) {
  const t = calculateTotals(project);
  return `<article class="card projectCard">
    <div class="pageHead" style="margin:0"><div><h3 style="margin:0">${escapeHtml(project.name)}</h3><div class="muted">${escapeHtml(project.customerName || 'Заказчик не указан')}</div></div><span class="badge lime">${escapeHtml(statusName(project.status))}</span></div>
    <div class="projectMeta"><span class="badge">Обновлён: ${formatDate(project.updatedAt)}</span><span class="badge">Зон: ${project.zones.length}</span><span class="badge">Позиций: ${project.estimateItems.length}</span><span class="badge ok">${formatMoney(t.gross)}</span></div>
    <div class="actions"><button class="btn primary small" data-open="${escapeAttr(project.id)}">Открыть</button><button class="btn ghost small" data-duplicate="${escapeAttr(project.id)}">Дублировать</button><button class="btn danger small" data-delete="${escapeAttr(project.id)}">Удалить</button></div>
  </article>`;
}
function statusName(id){ return ({draft:'Черновик', estimate_ready:'Смета готова', has_errors:'Есть ошибки', proposal_ready:'КП готово'}[id] || id); }
