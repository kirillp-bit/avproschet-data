export function EmptyState({ title, text = '', actions = '' } = {}) {
  return `<section class="emptyState"><div class="emptyIcon">＋</div><h3>${title}</h3>${text ? `<p>${text}</p>` : ''}${actions ? `<div class="actions center">${actions}</div>` : ''}</section>`;
}
