export function AdvancedPanel(title, body, { open = false, hint = 'Изменяйте только при необходимости.' } = {}) {
  return `<details class="advancedPanel" ${open ? 'open' : ''}><summary><span>${title}</span><small>${hint}</small></summary><div class="advancedBody">${body}</div></details>`;
}
