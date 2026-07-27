export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
export function html(strings, ...values) { return strings.map((s, i) => s + (values[i] ?? '')).join(''); }
export function downloadText(filename, text, mime = 'application/json') {
  const blob = new Blob([text], {type: `${mime};charset=utf-8`});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 300);
}
export function toast(message) {
  const node = document.createElement('div'); node.className = 'toast'; node.textContent = message; document.body.append(node);
  setTimeout(() => node.remove(), 2400);
}
