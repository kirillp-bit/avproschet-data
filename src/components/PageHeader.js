import { escapeHtml } from '../utils/format.js';
export function PageHeader({ title, description = '', actions = '' } = {}) {
  return `<div class="pageHead"><div class="pageTitle"><h2>${escapeHtml(title)}</h2>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
}
