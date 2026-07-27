import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';
import { ensureProject, persistProject, getSettings, getUiMode } from '../app/state.js';
import { LIBRARY, addCatalogItemToProject } from '../engine/estimate.js';
import { createEstimateItem, createZone } from '../engine/projectFactory.js';
import { toast } from '../utils/dom.js';
import { escapeAttr, escapeHtml } from '../utils/format.js';
import { LibraryFilters } from '../components/LibraryFilters.js';
import { EquipmentCard } from '../components/EquipmentCard.js';
import { InstallationTemplateList } from '../components/InstallationTemplateList.js';
import { INSTALLATION_TEMPLATES } from '../data/installationTemplates.js';
import { catalogQualitySummary } from '../engine/catalogValidation.js';
import { resolveMissingDependencies, createDependencyFallbackItem } from '../engine/dependencyResolver.js';
import { replacementImpact } from '../engine/alternativeResolver.js';
import { loadSuppliersMeta, loadSupplierById, loadSupplierCatalog, getLoadedSupplierLibrary, getSupplierCatalogStatus } from '../data/suppliers/loadSupplierCatalog.js';
import { classifySupplierItem, classifyCatalogScope, catalogScopeLabel, visibleScopesForMode } from '../engine/catalogRelevance.js';
import { CatalogQualityFilters } from '../components/CatalogQualityFilters.js';
import { CatalogQualityReport } from '../components/CatalogQualityReport.js';
import { buildCatalogQualityReport, catalogQualityReportToCsv } from '../engine/catalogQualityReport.js';
import { saveCatalogRelevanceOverride } from '../storage/catalogRelevanceOverrides.js';
import { canUseItemInAutoEstimate } from '../engine/autoEstimateEligibility.js';

let supplierMeta = null;
let supplierMetaPromise = null;

function requestSupplierMeta(root) {
  if (supplierMeta) return;
  if (!supplierMetaPromise) {
    supplierMetaPromise = loadSuppliersMeta()
      .then(meta => { supplierMeta = meta; LibraryPage(root); })
      .catch(error => { console.error(error); toast('Не удалось загрузить метаданные поставщиков'); });
  }
}

export function LibraryPage(root) {
  const p = ensureProject();
  const settings = getSettings();
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const uiMode = getUiMode();
  const engineering = uiMode === 'engineering';
  const state = { ...readState(q), advanced: engineering && readState(q).advanced };
  const tab = q.get('tab') || 'equipment';
  const loadAll = q.get('loadSuppliers') === 'all';
  const requestedSupplierId = q.get('supplier') || '';
  const supplierStatus = getSupplierCatalogStatus();

  requestSupplierMeta(root);

  if (loadAll && supplierMeta && supplierStatus.loadedItemCount < supplierMeta.totalItems) {
    root.innerHTML = loadingLayout('Загружаем полный прайс поставщиков', 'Позиции поставщиков подгружаются только после явного действия пользователя. Быстрая библиотека остаётся доступной отдельно.');
    bindLayoutActions(root);
    loadSupplierCatalog().then(() => LibraryPage(root)).catch(error => { console.error(error); toast('Не удалось загрузить полный каталог поставщиков'); location.hash = '#/library'; });
    return;
  }

  if (requestedSupplierId && supplierMeta && !supplierStatus.loadedSupplierIds.includes(requestedSupplierId)) {
    const supplier = supplierMeta.suppliers.find(item => item.id === requestedSupplierId);
    root.innerHTML = loadingLayout(`Загружаем поставщика ${escapeHtml(supplier?.name || requestedSupplierId)}`, 'Остальные supplier-файлы не загружаются автоматически.');
    bindLayoutActions(root);
    loadSupplierById(requestedSupplierId).then(() => LibraryPage(root)).catch(error => { console.error(error); toast('Не удалось загрузить выбранного поставщика'); location.hash = '#/library'; });
    return;
  }

  const library = getLoadedSupplierLibrary(LIBRARY);
  const quality = catalogQualitySummary(library);
  const relevanceReport = buildCatalogQualityReport(library);
  const filteredItems = filterLibrary(library, state);
  const items = filteredItems.slice(0, Number(state.limit || 72));
  const templates = filterTemplates(INSTALLATION_TEMPLATES, state).slice(0, 30);
  const deps = resolveMissingDependencies(p).slice(0, 12);
  const supplierPanelHtml = supplierPanel(supplierMeta, supplierStatus, state);
  const supplierAction = supplierStatus.loadedItemCount
    ? '<a class="btn ghost small" href="#/library">Быстрый каталог</a>'
    : '<button class="btn ghost small" data-load-all-suppliers>Загрузить полный прайс поставщиков</button>';

  root.innerHTML = AppLayout(`${PageHeader({ title: 'Библиотека', description: 'Быстрая AV-библиотека доступна сразу. Полные прайсы поставщиков лежат в public/data/suppliers/*.json и загружаются только по кнопке или выбору поставщика.', actions: `<span class="badge lime">${LIBRARY.length} быстрых</span><span class="badge">${supplierStatus.loadedItemCount} supplier</span><span class="badge ${quality.errors ? 'warn' : 'ok'}">качество: ${quality.totalIssues}</span>${supplierAction}` })}
    ${supplierPanelHtml}
    <div class="libraryTabs"><a class="btn ${tab === 'equipment' ? 'primary' : 'ghost'} small" href="#/library?tab=equipment">Оборудование</a><a class="btn ${tab === 'templates' ? 'primary' : 'ghost'} small" href="#/library?tab=templates">Шаблоны инсталляций</a><a class="btn ${tab === 'quality' ? 'primary' : 'ghost'} small" href="#/library?tab=quality">Качество данных</a></div>
    ${tab === 'equipment' ? equipmentTab(p, settings, state, items, deps, library, filteredItems.length, engineering) : ''}
    ${tab === 'templates' ? templatesTab(state, templates) : ''}
    ${tab === 'quality' ? qualityTab(quality, deps, relevanceReport) : ''}`);
  bindLayoutActions(root); bind(root, p, state, library);
}

function loadingLayout(title, text) {
  return AppLayout(`${PageHeader({ title: 'Библиотека', description: 'Supplier-каталог вынесен из стартовой загрузки.', actions: '<a class="btn ghost" href="#/library">Вернуться в быстрый каталог</a>' })}<section class="card"><h3>${escapeHtml(title)}</h3><p class="muted">${escapeHtml(text)}</p></section>`);
}

function readState(q) {
  return {
    search: q.get('q') || '',
    category: q.get('category') || 'all',
    subcategory: q.get('subcategory') || 'all',
    level: q.get('level') || 'all',
    currency: q.get('currency') || 'all',
    price: q.get('price') || 'all',
    projectType: q.get('projectType') || 'all',
    zoneCategory: q.get('zoneCategory') || 'all',
    review: q.get('review') || 'all',
    scope: q.get('scope') || 'default',
    supplier: q.get('supplier') || 'all',
    limit: q.get('limit') || '72',
    advanced: q.get('advanced') === '1'
  };
}

function equipmentTab(project, settings, state, items, deps, library, total, engineering = false) {
  const shown = Math.min(total, Number(state.limit || 72));
  return `${engineering && state.advanced ? CatalogQualityFilters({ scope: state.scope, items: library }) : ''}${LibraryFilters({ ...state, zones: project.zones || [], suppliers: supplierMeta?.suppliers || [], advanced: engineering && state.advanced, allowAdvanced: engineering })}
    <div class="notice"><strong>Показано ${shown} из ${total}</strong><p>Каталог не рендерит десятки тысяч карточек сразу. Для supplier-позиций по умолчанию видны AV-оборудование, AV-инфраструктура и работы/услуги.</p>${total > shown ? `<div class="actions"><button class="btn ghost small" data-show-more>Показать ещё</button></div>` : ''}</div>
    ${deps.length ? `<div class="notice warn"><strong>В проекте есть незакрытые зависимости: ${deps.length}</strong><p>Откройте проверку или добавьте fallback-позиции вручную.</p><div class="actions">${deps.slice(0, 4).map(dep => `<button class="btn ghost small" data-add-dependency-fallback="${dep.id}">${dep.fallbackName}</button>`).join('')}<a class="btn ghost small" href="#/check">Проверка</a></div></div>` : ''}
    <div class="separator"></div>${items.length ? `<div class="libraryGrid">${items.map(item => EquipmentCard(item, settings, library, { showCurationActions: engineering })).join('')}</div>` : EmptyState({ title: 'Ничего не найдено', text: 'Сбросьте фильтры, выберите поставщика или загрузите полный прайс.', actions: '<button class="btn ghost" data-reset-library>Сбросить фильтры</button><button class="btn primary" data-add-manual-lib>Добавить ручную позицию</button>' })}`;
}

function supplierPanel(meta, status, state) {
  if (!meta) return `<section class="card"><div class="sectionTitle"><div><h3>Прайсы поставщиков</h3><p class="muted">Быстрый каталог уже доступен. Метаданные поставщиков загружаются отдельно маленьким JSON-файлом.</p></div><span class="badge">metadata</span></div></section>`;
  const visibleSuppliers = meta.suppliers.slice(0, 20);
  const scopeStats = Object.entries(meta.scopes || {}).map(([scope, count]) => `<span class="badge">${escapeHtml(catalogScopeLabel(scope))}: ${count.toLocaleString('ru-RU')}</span>`).join('');
  return `<section class="card supplierCatalogPanel">
    <div class="sectionTitle"><div><h3>Прайсы поставщиков</h3><p class="muted">${escapeHtml(meta.supplierCount)} поставщиков, ${escapeHtml(meta.totalItems.toLocaleString('ru-RU'))} позиций. Загружено в память: ${escapeHtml(status.loadedItemCount.toLocaleString('ru-RU'))}.</p></div><div class="actions"><button class="btn ghost small" data-load-all-suppliers>Загрузить всех поставщиков</button><a class="btn ghost small" href="#/library">Только быстрый каталог</a></div></div>
    <div class="tagRow">${scopeStats}</div>
    <div class="miniList">${visibleSuppliers.map(supplier => `<a class="miniListItem" href="#/library?supplier=${escapeAttr(supplier.id)}&scope=${escapeAttr(state.scope || 'default')}"><span class="badge ${status.loadedSupplierIds.includes(supplier.id) ? 'ok' : ''}">${status.loadedSupplierIds.includes(supplier.id) ? 'загружен' : 'по клику'}</span><strong>${escapeHtml(supplier.name)}</strong><small>${escapeHtml(supplier.itemCount.toLocaleString('ru-RU'))} позиций · ${(supplier.fileSize / 1024 / 1024).toFixed(1)} MB</small></a>`).join('')}</div>
  </section>`;
}

function templatesTab(state, templates) {
  return `${LibraryFilters({ ...state, zones: [], suppliers: supplierMeta?.suppliers || [], advanced: state.advanced, allowAdvanced: true })}<div class="separator"></div>${InstallationTemplateList(templates)}`;
}

function qualityTab(quality, deps, relevanceReport) {
  return `${CatalogQualityReport(relevanceReport)}<div class="separator"></div><div class="grid cols3"><div class="card"><div class="muted">Всего позиций</div><div class="valueBig">${quality.totalItems}</div></div><div class="card"><div class="muted">Ошибки</div><div class="valueBig">${quality.errors}</div></div><div class="card"><div class="muted">Предупреждения</div><div class="valueBig">${quality.warnings}</div></div></div>
  <div class="separator"></div><div class="grid cols2"><section class="card"><h3>Проверка каталога</h3><div class="miniList">${quality.sample.length ? quality.sample.map(issue => `<div class="miniListItem"><span class="badge ${issue.severity === 'error' ? 'danger' : 'warn'}">${escapeHtml(issue.issueType)}</span><strong>${escapeHtml(issue.itemId)}</strong><small>${escapeHtml(`${issue.message} ${issue.suggestedAction}`)}</small></div>`).join('') : '<div class="muted">Критичных проблем в нормализованной библиотеке не найдено.</div>'}</div></section><section class="card"><h3>Зависимости проекта</h3><div class="miniList">${deps.length ? deps.map(dep => `<div class="miniListItem"><span class="badge ${dep.required ? 'warn' : ''}">${escapeHtml(dep.dependencyType)}</span><strong>${escapeHtml(`${dep.sourceItemName} → ${dep.fallbackName}`)}</strong><small>${escapeHtml(dep.reason)}</small></div>`).join('') : '<div class="muted">Незакрытых зависимостей в текущей смете нет.</div>'}</div></section></div>`;
}

function filterLibrary(library, state) {
  const searchTerms = String(state.search || '').toLowerCase().replace(/ё/g, 'е').split(/\s+/).filter(Boolean);
  const visibleScopes = new Set(visibleScopesForMode(state.scope));
  return library.filter(item => {
    const classified = classifySupplierItem(item);
    const scope = classified.relevance;
    if ((item.supplier || item.supplierId) && !visibleScopes.has(scope)) return false;
    if (state.supplier !== 'all' && item.supplierId !== state.supplier && item.supplier !== state.supplier) return false;
    const haystack = `${item.name} ${item.brand} ${item.model} ${item.article || ''} ${item.category} ${item.supplier || ''} ${(item.tags || []).join(' ')}`.toLowerCase().replace(/ё/g, 'е');
    if (searchTerms.length && !searchTerms.every(term => haystack.includes(term))) return false;
    if (state.category !== 'all' && item.categoryId !== state.category) return false;
    if (state.subcategory !== 'all' && item.subcategoryId !== state.subcategory) return false;
    if (state.level !== 'all' && item.solutionLevel !== state.level) return false;
    if (state.currency !== 'all' && item.currency !== state.currency) return false;
    if (state.price !== 'all' && item.priceStatus !== state.price) return false;
    if (state.projectType !== 'all' && (item.projectTypeIds || item.types || []).length && !(item.projectTypeIds || item.types || []).includes(state.projectType)) return false;
    if (state.zoneCategory !== 'all' && (item.zoneCategoryIds || []).length && !item.zoneCategoryIds.includes(state.zoneCategory)) return false;
    if (state.review === 'yes' && !(item.requiresEngineerReview || classified.requiresCatalogReview)) return false;
    if (state.review === 'no' && (item.requiresEngineerReview || classified.requiresCatalogReview)) return false;
    return true;
  });
}

function filterTemplates(templates, state) {
  const search = state.search.toLowerCase();
  return templates.filter(t => {
    const haystack = `${t.name} ${t.group} ${t.description} ${(t.tags || []).join(' ')}`.toLowerCase();
    if (search && !haystack.includes(search)) return false;
    if (state.level !== 'all' && t.scenario !== state.level) return false;
    if (state.projectType !== 'all' && !t.projectTypeIds.includes(state.projectType)) return false;
    if (state.zoneCategory !== 'all' && !t.zoneCategoryIds.includes(state.zoneCategory)) return false;
    return true;
  });
}

function ensureTemplateZone(project, template) {
  const existing = (project.zones || []).find(zone => template.zoneTemplateIds.includes(zone.templateId) || template.zoneCategoryIds.includes(zone.categoryId));
  if (existing) return existing;
  const zone = createZone({
    name: template.name,
    categoryId: template.zoneCategoryIds[0] || '',
    templateId: template.zoneTemplateIds[0] || '',
    type: 'template',
    area: 25,
    requiredSystemGroups: template.items.map(item => item.categoryId),
    requiredDependencies: template.dependencies || [],
    typicalWorks: template.typicalWorks || [],
    requiresEngineerReview: template.requiresEngineerReview,
    notes: `Создано из шаблона инсталляции: ${template.name}`
  });
  project.zones ||= [];
  project.zones.push(zone);
  return zone;
}


function downloadBlob(blob, filename) {
  if (typeof URL === 'undefined' || typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function bind(root, p, state, library) {
  let searchTimer = null;
  const updateHash = (patch = {}) => {
    const params = new URLSearchParams();
    const current = new URLSearchParams(location.hash.split('?')[1] || '');
    params.set('tab', current.get('tab') || 'equipment');
    const fields = [
      ['q', '[data-lib-search]'], ['category', '[data-lib-category]'], ['subcategory', '[data-lib-subcategory]'], ['level', '[data-lib-level]'],
      ['currency', '[data-lib-currency]'], ['price', '[data-lib-price]'], ['projectType', '[data-lib-project-type]'], ['zoneCategory', '[data-lib-zone-category]'], ['review', '[data-lib-review]'], ['scope', '[data-lib-scope]'], ['supplier', '[data-lib-supplier]']
    ];
    fields.forEach(([key, selector]) => {
      const element = root.querySelector(selector);
      const fallback = key === 'q' ? '' : key === 'scope' ? 'default' : 'all';
      const value = element ? element.value : (current.get(key) || fallback);
      if (value && !(key !== 'q' && value === 'all') && !(key === 'scope' && value === 'default')) params.set(key, value);
    });
    const advancedValue = patch.advanced ?? current.get('advanced');
    if (advancedValue === '1') params.set('advanced', '1');
    Object.entries(patch).forEach(([key, value]) => { if (value === null) params.delete(key); else params.set(key, value); });
    location.hash = `#/library?${params.toString()}`;
  };
  root.querySelectorAll('[data-lib-category],[data-lib-subcategory],[data-lib-level],[data-lib-currency],[data-lib-price],[data-lib-project-type],[data-lib-zone-category],[data-lib-review],[data-lib-scope],[data-lib-supplier]').forEach(el => el.addEventListener('change', () => updateHash()));
  root.querySelector('[data-lib-search]')?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => updateHash(), 300); });
  root.querySelector('[data-load-all-suppliers]')?.addEventListener('click', () => updateHash({ loadSuppliers: 'all' }));
  root.querySelector('[data-toggle-library-advanced]')?.addEventListener('click', () => updateHash({ advanced: state.advanced ? null : '1' }));
  root.querySelector('[data-show-more]')?.addEventListener('click', () => updateHash({ limit: String(Number(state.limit || 72) + 72) }));
  root.querySelector('[data-reset-library]')?.addEventListener('click', () => { location.hash = '#/library'; });
  root.querySelector('[data-add-manual-lib]')?.addEventListener('click', () => { p.estimateItems.push(createEstimateItem({ name: 'Ручная позиция', category: 'Оборудование', currency: 'RUB', source: 'manual', isManual: true, note: 'добавлено из пустого состояния библиотеки' })); persistProject(); toast('Ручная позиция добавлена'); location.hash = '#/estimate?mode=detailed'; });
  root.querySelectorAll('[data-add-library]').forEach(btn => btn.addEventListener('click', () => { const item = library.find(i => i.id === btn.dataset.addLibrary); if (!item) return; addCatalogItemToProject(p, item, root.querySelector('[data-target-zone]')?.value || ''); persistProject(); toast('Позиция добавлена в смету'); }));
  root.querySelectorAll('[data-mark-review]').forEach(btn => btn.addEventListener('click', () => { const item = library.find(i => i.id === btn.dataset.markReview); if (!item) return; saveCatalogRelevanceOverride(item, { relevance: 'questionable', hiddenByDefault: true, reason: 'Ручная пометка: требуется проверка' }); toast('Позиция помечена как спорная'); LibraryPage(root); }));
  root.querySelectorAll('[data-mark-av]').forEach(btn => btn.addEventListener('click', () => { const item = library.find(i => i.id === btn.dataset.markAv); if (!item) return; saveCatalogRelevanceOverride(item, { relevance: 'av_core', hiddenByDefault: false, reason: 'Ручная пометка: AV-релевантное' }); toast('Позиция помечена как AV'); LibraryPage(root); }));
  root.querySelectorAll('[data-mark-infra]').forEach(btn => btn.addEventListener('click', () => { const item = library.find(i => i.id === btn.dataset.markInfra); if (!item) return; saveCatalogRelevanceOverride(item, { relevance: 'av_infrastructure', hiddenByDefault: false, reason: 'Ручная пометка: инфраструктура' }); toast('Позиция помечена как инфраструктура'); LibraryPage(root); }));
  root.querySelectorAll('[data-mark-it]').forEach(btn => btn.addEventListener('click', () => { const item = library.find(i => i.id === btn.dataset.markIt); if (!item) return; saveCatalogRelevanceOverride(item, { relevance: 'it_related', hiddenByDefault: true, reason: 'Ручная пометка: IT' }); toast('Позиция помечена как IT'); LibraryPage(root); }));
  root.querySelectorAll('[data-hide-library]').forEach(btn => btn.addEventListener('click', () => { const item = library.find(i => i.id === btn.dataset.hideLibrary); if (!item) return; saveCatalogRelevanceOverride(item, { relevance: 'hidden', hiddenByDefault: true, approvedForAutoEstimate: false, reason: 'Ручная пометка: скрыто по умолчанию' }); toast('Позиция скрыта по умолчанию'); LibraryPage(root); }));
  root.querySelectorAll('[data-toggle-auto]').forEach(btn => btn.addEventListener('click', () => { const item = library.find(i => i.id === btn.dataset.toggleAuto); if (!item) return; saveCatalogRelevanceOverride(item, { relevance: item.relevance || 'it_related', hiddenByDefault: item.hiddenByDefault, approvedForAutoEstimate: !item.approvedForAutoEstimate, reason: !item.approvedForAutoEstimate ? 'Ручное разрешение для автосметы' : 'Ручной запрет для автосметы' }); toast(!item.approvedForAutoEstimate ? 'Разрешено для автосметы' : 'Запрещено для автосметы'); LibraryPage(root); }));
  root.querySelector('[data-export-quality-json]')?.addEventListener('click', () => { const blob = new Blob([JSON.stringify(buildCatalogQualityReport(library), null, 2)], { type: 'application/json' }); downloadBlob(blob, 'catalog-quality-report.json'); });
  root.querySelector('[data-export-quality-csv]')?.addEventListener('click', () => { const blob = new Blob([catalogQualityReportToCsv(buildCatalogQualityReport(library))], { type: 'text/csv;charset=utf-8' }); downloadBlob(blob, 'catalog-quality-report.csv'); });
  root.querySelectorAll('[data-add-dependency-fallback]').forEach(btn => btn.addEventListener('click', () => { const dep = resolveMissingDependencies(p).find(item => item.id === btn.dataset.addDependencyFallback); if (!dep) return; p.estimateItems.push(createEstimateItem(createDependencyFallbackItem(dep, dep.zoneId))); persistProject(); toast('Fallback-зависимость добавлена в смету'); LibraryPage(root); }));

  root.querySelectorAll('[data-apply-template]').forEach(btn => btn.addEventListener('click', () => {
    const template = INSTALLATION_TEMPLATES.find(t => t.id === btn.dataset.applyTemplate);
    if (!template) return;
    const zone = ensureTemplateZone(p, template);
    let added = 0;
    template.items.forEach(templateItem => {
      const candidate = library.find(item => (item.subcategoryId === templateItem.categoryId || item.categoryId === templateItem.categoryId || (item.systemGroups || []).includes(templateItem.categoryId)) && canUseItemInAutoEstimate(item, { zone, template, requiredCategory: templateItem.categoryId, source: 'installation-template' }).allowed);
      if (candidate) addCatalogItemToProject(p, candidate, zone.id, { source: 'installation-template', qty: templateItem.qty || 1, derivedKey: `${zone.id}:${template.id}:${candidate.id}` });
      else p.estimateItems.push(createEstimateItem({ zoneId: zone.id, name: templateItem.fallbackName, category: templateItem.fallbackName, categoryId: templateItem.categoryId, subcategoryId: templateItem.categoryId, unit: 'компл.', qty: templateItem.qty || 1, currency: 'RUB', unitCost: 0, source: 'template-fallback', isManual: false, isDerived: true, derivedKey: `${zone.id}:${template.id}:${templateItem.id}`, priceStatus: 'unknown', requiresPriceRequest: true, requiresEngineerReview: true, note: 'Fallback-позиция: исходная позиция шаблона не найдена в библиотеке.' }));
      added += 1;
    });
    persistProject(); toast(`Шаблон добавлен: ${added} строк`); location.hash = '#/estimate?mode=detailed';
  }));
  root.querySelectorAll('[data-replace-library]').forEach(btn => btn.addEventListener('click', () => {
    const source = library.find(i => i.id === btn.dataset.replaceLibrary); const replacement = library.find(i => i.id === btn.dataset.replaceTo); if (!source || !replacement) return;
    const impact = replacementImpact(source, replacement);
    const targetRows = p.estimateItems.filter(row => row.catalogItemId === source.id || row.sourceCatalogItemId === source.id || row.name === source.name);
    if (!targetRows.length) { toast('Сначала добавьте исходную позицию в смету'); return; }
    targetRows.forEach(row => { row.replacedFrom ||= []; row.replacedFrom.push({ name: row.name, catalogItemId: row.catalogItemId, at: new Date().toISOString(), priceDelta: impact.priceDelta }); row.name = replacement.name; row.category = replacement.category; row.categoryId = replacement.categoryId; row.subcategoryId = replacement.subcategoryId; row.catalogItemId = replacement.id; row.sourceCatalogItemId = replacement.id; row.unitCost = replacement.unitCost; row.currency = replacement.currency; row.solutionLevel = replacement.solutionLevel; row.note = [row.note, `Заменено из библиотеки. Δ цены: ${Math.round(impact.priceDelta).toLocaleString('ru-RU')}.`].filter(Boolean).join(' '); });
    persistProject(); toast('Позиция заменена в смете'); LibraryPage(root);
  }));
}
