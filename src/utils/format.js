export const formatMoney = (value, currency = 'RUB') => new Intl.NumberFormat('ru-RU', {style:'currency', currency, maximumFractionDigits:0}).format(Number(value || 0));
export const formatDate = (value) => value ? new Intl.DateTimeFormat('ru-RU', {dateStyle:'medium', timeStyle:'short'}).format(new Date(value)) : '—';
export const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export { escapeHtml, escapeAttr, safeText, safeNumber, safeUrl, stripHtml, escapeSpreadsheetCell } from './sanitize.js';
