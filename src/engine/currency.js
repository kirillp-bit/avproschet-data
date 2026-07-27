import { DEFAULT_SETTINGS } from '../data/defaultSettings.js';
import { num } from '../utils/format.js';

export const SUPPORTED_CURRENCIES = ['RUB', 'USD'];
export const PRICE_MODES = ['fixed', 'indexed', 'manual'];

export function normalizeCurrency(currency = 'RUB') {
  const value = String(currency || 'RUB').toUpperCase();
  return SUPPORTED_CURRENCIES.includes(value) ? value : 'RUB';
}

export function normalizePriceMode(priceMode = 'manual') {
  return PRICE_MODES.includes(priceMode) ? priceMode : 'manual';
}

export function getRateForCurrency(currency = 'RUB', settings = DEFAULT_SETTINGS) {
  const normalized = normalizeCurrency(currency);
  if (normalized === 'RUB') return 1;
  if (normalized === 'USD') return num(settings.usdRate, DEFAULT_SETTINGS.usdRate);
  return 1;
}

export function shouldRecalculateByRate(item = {}) {
  return normalizeCurrency(item.currency) !== 'RUB' && normalizePriceMode(item.priceMode) === 'indexed';
}

export function convertToRub(value, currency = 'RUB', settings = DEFAULT_SETTINGS) {
  return num(value) * getRateForCurrency(currency, settings);
}

export function itemUnitCostRub(item = {}, settings = DEFAULT_SETTINGS) {
  const currency = normalizeCurrency(item.currency);
  return convertToRub(item.unitCost, currency, settings);
}
