import { buildLibrary } from '../../engine/estimate.js';
import { withCatalogScope } from '../../engine/catalogRelevance.js';
import { searchSupplierItems } from '../../engine/supplierSearch.js';

// Базовый путь к прайсам поставщиков. По умолчанию — локальная папка.
// Для облегчённой сборки его можно переопределить на внешний CDN, задав
// window.SUPPLIER_DATA_BASE в index.html до загрузки приложения.
const LOCAL_DATA_BASE = 'public/data/suppliers';
const DATA_BASE = (typeof window !== 'undefined' && window.SUPPLIER_DATA_BASE) || LOCAL_DATA_BASE;
// Версия данных для сброса кеша CDN/браузера при обновлении прайсов.
const DATA_VERSION = (typeof window !== 'undefined' && window.SUPPLIER_DATA_VERSION) || '20260727';
const status = {
  metaLoaded: false,
  loading: false,
  loadedSupplierIds: [],
  loadedItemCount: 0,
  error: null
};
let metaPromise = null;
let metaCache = null;
const supplierPromises = new Map();
const supplierItems = new Map();
let allLibraryCache = null;

async function fetchJson(path) {
  const isRemote = /^https?:\/\//i.test(DATA_BASE);
  const url = `${DATA_BASE}/${path}${path.includes('?') ? '&' : '?'}v=${DATA_VERSION}`;
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    // Для внешнего CDN используем обычный кеш с бюстером версии;
    // для локальных файлов — force-cache, чтобы не перезагружать прайсы.
    const response = await fetch(url, { cache: isRemote ? 'default' : 'force-cache' });
    if (!response.ok) throw new Error(`Supplier catalog request failed: ${response.status} ${url}`);
    return response.json();
  }
  const fs = await import('node:fs/promises');
  // Node-режим (тесты/скрипты): читаем только из локальной папки проекта.
  const fileUrl = new URL(`../../../${LOCAL_DATA_BASE}/${path}`, import.meta.url);
  return JSON.parse(await fs.readFile(fileUrl, 'utf8'));
}

export async function loadSuppliersMeta() {
  if (metaCache) return metaCache;
  if (!metaPromise) {
    metaPromise = fetchJson('suppliers-meta.json').then(data => {
      metaCache = data;
      status.metaLoaded = true;
      return data;
    }).catch(error => {
      status.error = error;
      metaPromise = null;
      throw error;
    });
  }
  return metaPromise;
}

export async function loadSupplierById(supplierId) {
  const meta = await loadSuppliersMeta();
  const supplier = meta.suppliers.find(item => item.id === supplierId || item.name === supplierId);
  if (!supplier) throw new Error(`Supplier not found: ${supplierId}`);
  if (supplierItems.has(supplier.id)) return supplierItems.get(supplier.id);
  if (!supplierPromises.has(supplier.id)) {
    status.loading = true;
    supplierPromises.set(supplier.id, fetchJson(supplier.file).then(items => {
      const prepared = items.map(item => withCatalogScope({ ...item, supplierId: supplier.id }));
      supplierItems.set(supplier.id, prepared);
      status.loadedSupplierIds = [...new Set([...status.loadedSupplierIds, supplier.id])];
      status.loadedItemCount = [...supplierItems.values()].reduce((sum, list) => sum + list.length, 0);
      status.loading = false;
      allLibraryCache = null;
      return prepared;
    }).catch(error => {
      status.loading = false;
      status.error = error;
      supplierPromises.delete(supplier.id);
      throw error;
    }));
  }
  return supplierPromises.get(supplier.id);
}

export async function loadSupplierCategory(categoryId, supplierId) {
  const items = supplierId ? await loadSupplierById(supplierId) : await loadSupplierCatalog();
  if (!categoryId || categoryId === 'all') return items;
  return items.filter(item => item.categoryId === categoryId || item.subcategoryId === categoryId || item.category === categoryId);
}

export async function loadSupplierCatalog() {
  const meta = await loadSuppliersMeta();
  const lists = await Promise.all(meta.suppliers.map(supplier => loadSupplierById(supplier.id)));
  return lists.flat();
}

export function getLoadedSupplierItems() {
  return [...supplierItems.values()].flat();
}

export function getLoadedSupplierLibrary(baseLibrary = []) {
  const loaded = getLoadedSupplierItems();
  if (!loaded.length) return baseLibrary;
  if (!allLibraryCache) allLibraryCache = buildLibrary([...loaded, ...baseLibrary]);
  return allLibraryCache;
}

export async function searchSupplierCatalog(query, filters = {}) {
  const supplierId = filters.supplierId || filters.supplier || 'all';
  if (supplierId && supplierId !== 'all') await loadSupplierById(supplierId);
  else if (filters.loadAll) await loadSupplierCatalog();
  return searchSupplierItems(getLoadedSupplierItems(), { ...filters, query });
}

export function getSupplierCatalogStatus() {
  return { ...status };
}
