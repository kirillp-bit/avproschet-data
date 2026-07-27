export function ExportActions({ hasErrors = false, isEmpty = false } = {}) {
  const disabled = isEmpty ? 'disabled title="Смета пустая"' : '';
  return `<div class="exportActions">
    ${hasErrors ? '<span class="badge danger">Есть критичные ошибки</span>' : ''}
    <button class="btn primary" data-print ${disabled}>Печать / PDF</button>
    <button class="btn ghost" data-html ${disabled}>HTML</button>
    <button class="btn ghost" data-excel ${disabled}>Excel</button>
    <button class="btn ghost" data-json>JSON проекта</button>
    <label class="btn ghost">Импорт JSON<input type="file" accept="application/json" data-import-json hidden></label>
  </div>`;
}
