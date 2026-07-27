import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';
import { ZoneCard } from '../components/ZoneCard.js';
import { ensureProject, persistProject } from '../app/state.js';
import { createZone } from '../engine/projectFactory.js';
import { generateEstimateFromZones } from '../engine/estimate.js';
import { toast } from '../utils/dom.js';
import { PROJECT_TYPES } from '../data/projectTypes.js';
import { escapeAttr, escapeHtml } from '../utils/format.js';
import { ZONE_CATEGORIES, getCategoriesForProject, getProjectZoneModel, getTemplatesForProject, getZoneCategory, createZoneSeedFromTemplate } from '../data/zoneTaxonomy.js';

export function ZonesPage(root) {
  const p = ensureProject();
  const projectTypeId = p.passport?.projectType || 'corporate';
  const projectType = PROJECT_TYPES.find(t => t.id === projectTypeId) || PROJECT_TYPES[0];
  const model = getProjectZoneModel(projectTypeId);
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const search = q.get('q') || '';
  const categoryFilter = q.get('category') || 'all';
  const showAll = q.get('all') === '1';
  const categories = getCategoriesForProject(projectTypeId, showAll);
  const templates = getTemplatesForProject(projectTypeId, { showAll, search, categoryId: categoryFilter });
  const groupedTemplates = groupByCategory(templates);
  const typeLabel = projectType?.name || 'тип проекта';

  root.innerHTML = AppLayout(`${PageHeader({ title: 'Зоны', description: `Тип проекта: ${escapeHtml(typeLabel)}. Выберите типовые зоны или найдите нужный шаблон. Детали оборудования скрыты, чтобы не перегружать экран.`, actions: '<button class="btn primary" data-add-typical>Добавить типовые зоны</button><button class="btn ghost" data-add-zone>Вручную</button><button class="btn ghost" data-generate-estimate>Смета</button>' })}
  <section class="card zoneModelPanel">
    <div class="sectionTitle"><div><h3>Релевантные категории</h3><p class="muted">${escapeHtml(model.typicalScenario)}</p></div><span class="badge ${model.requiresEngineerReview ? 'warn' : 'ok'}">${model.requiresEngineerReview ? 'нужна проверка' : 'типовой сценарий'}</span></div>
    <div class="categoryPills">${categories.map(c => `<button class="categoryPill ${categoryFilter === c.id ? 'active' : ''} ${c.isRecommended ? '' : 'mutedPill'}" data-category-filter="${escapeAttr(c.id)}"><span>${escapeHtml(c.icon)}</span><strong>${escapeHtml(c.name)}</strong><small>${c.isRecommended ? 'релевантна' : 'нетиповая'}</small></button>`).join('')}</div>
    <div class="actions"><button class="btn ${categoryFilter === 'all' ? 'primary' : 'ghost'} small" data-category-filter="all">Все релевантные</button><button class="btn ${showAll ? 'warn' : 'ghost'} small" data-toggle-all>${showAll ? 'Скрыть нетиповые категории' : 'Показать все категории'}</button></div>
  </section>

  ${p.zones.length ? `<div class="grid zoneGrid">${p.zones.map((zone, idx) => ZoneCard(zone, idx, p)).join('')}</div>` : EmptyState({ title: 'Зоны ещё не добавлены', text: 'Добавьте default-набор для выбранного типа проекта или выберите конкретные шаблоны ниже.', actions: '<button class="btn primary" data-add-typical>Добавить типовые зоны</button><button class="btn ghost" data-add-zone>Добавить вручную</button>' })}

  <div class="separator"></div>
  <section class="card templatePanel"><div class="sectionTitle"><div><h3>Библиотека шаблонов</h3><p class="muted">Карточки компактные: состав оборудования раскрывается по клику.</p></div><span class="badge">${templates.length} шаблонов</span></div>
    <div class="grid cols3"><label class="field"><span>Поиск</span><input data-template-search value="${escapeAttr(search)}" placeholder="переговорная, LED, музей, операторская"></label><label class="field"><span>Категория</span><select data-template-category><option value="all" ${categoryFilter==='all'?'selected':''}>Все категории в выдаче</option>${ZONE_CATEGORIES.map(c=>`<option value="${escapeAttr(c.id)}" ${categoryFilter===c.id?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select></label><div class="field"><span>&nbsp;</span><button class="btn ghost" data-reset-template-filter>Сбросить</button></div></div>
    ${templates.length ? Object.entries(groupedTemplates).map(([categoryId, items]) => templateGroup(categoryId, items, model)).join('') : EmptyState({ title: 'Ничего не найдено', text: 'Сбросьте фильтры, включите все категории или добавьте зону вручную.', actions: '<button class="btn ghost" data-reset-template-filter>Сбросить фильтры</button><button class="btn primary" data-add-zone>Добавить зону</button>' })}
  </section>`);
  bindLayoutActions(root); bind(root,p,{search,categoryFilter,showAll,projectTypeId});
}

function groupByCategory(templates) {
  return templates.reduce((acc, template) => { (acc[template.categoryId] ||= []).push(template); return acc; }, {});
}

function templateGroup(categoryId, items, model) {
  const category = getZoneCategory(categoryId);
  const isRecommended = model.allowedZoneCategoryIds.includes(categoryId);
  return `<div class="templateCategoryGroup"><div class="groupHeader"><div><h3>${escapeHtml(`${category?.icon || '•'} ${category?.name || 'Категория'}`)}</h3><p class="muted">${escapeHtml(category?.description || '')}</p></div><span class="badge ${isRecommended ? 'ok' : 'warn'}">${isRecommended ? 'для типа проекта' : 'нетиповая'}</span></div>
  <div class="libraryGrid compactTemplates">${items.map(t=>templateCard(t, model)).join('')}</div></div>`;
}

function templateCard(t, model) {
  const category = getZoneCategory(t.categoryId);
  const isRecommended = model.allowedZoneCategoryIds.includes(t.categoryId);
  const isDefault = model.defaultZoneTemplateIds.includes(t.id);
  const why = isDefault ? 'Входит в типовой набор проекта.' : isRecommended ? `Релевантная категория: ${category?.name || 'категория зоны'}.` : 'Эта зона не типовая для выбранного типа проекта, но её можно добавить вручную.';
  const itemCount = t.recommendedItems?.length || t.requiredSystemGroups.length;
  return `<article class="card itemCard templateCardLite ${isRecommended ? '' : 'nonTypicalTemplate'}">
    <div class="templateLiteHead"><div><div class="itemTitle">${escapeHtml(t.name)}</div><div class="muted smallText">${escapeHtml(t.description)}</div></div><button class="btn ${isRecommended ? 'ghost' : 'warn'} small" data-template-zone="${escapeAttr(t.id)}">Добавить</button></div>
    <div class="zoneMeta"><span class="badge lime">${escapeHtml(category?.name || '')}</span>${isDefault ? '<span class="badge ok">типовая</span>' : ''}${t.requiresEngineerReview ? '<span class="badge warn">инж. проверка</span>' : ''}<span class="badge">${itemCount} групп</span></div>
    <details class="compactDetails"><summary>Оборудование и причина рекомендации</summary><p class="muted smallText">${escapeHtml(why)}</p><div class="zoneMeta">${(t.recommendedItems || []).slice(0,8).map(i=>`<span class="badge">${escapeHtml(i.name)}</span>`).join('')}${itemCount > 8 ? `<span class="badge">+${itemCount - 8}</span>` : ''}</div></details>
  </article>`;
}

function addTypicalZones(p) {
  const projectTypeId = p.passport?.projectType || 'corporate';
  const model = getProjectZoneModel(projectTypeId);
  const templates = getTemplatesForProject(projectTypeId, { showAll: true }).filter(t => model.defaultZoneTemplateIds.includes(t.id));
  const existing = new Set((p.zones || []).map(z => z.templateId).filter(Boolean));
  templates.forEach(t => {
    if (!existing.has(t.id)) p.zones.push(createZone(createZoneSeedFromTemplate(t, projectTypeId)));
  });
}

function bind(root,p,ctx){
  const setHash = (next = {}) => {
    const params = new URLSearchParams();
    const q = next.search ?? root.querySelector('[data-template-search]')?.value ?? ctx.search;
    const category = next.category ?? root.querySelector('[data-template-category]')?.value ?? ctx.categoryFilter;
    const all = next.showAll ?? ctx.showAll;
    if (q) params.set('q', q);
    if (category && category !== 'all') params.set('category', category);
    if (all) params.set('all', '1');
    location.hash = `#/zones${params.toString() ? `?${params}` : ''}`;
  };
  root.querySelectorAll('[data-add-zone]').forEach(btn=>btn.addEventListener('click',()=>{p.zones.push(createZone({name:`Зона ${p.zones.length+1}`, recommendationReason: 'Добавлена вручную. Выберите категорию / шаблон при необходимости.'})); persistProject(); ZonesPage(root);}));
  root.querySelectorAll('[data-add-typical]').forEach(btn=>btn.addEventListener('click',()=>{const before = p.zones.length; addTypicalZones(p); persistProject(); toast(`Типовые зоны добавлены: ${p.zones.length - before}`); ZonesPage(root);}));
  root.querySelector('[data-generate-estimate]')?.addEventListener('click',()=>{const report = generateEstimateFromZones(p, { mode: 'replace' }); persistProject(); toast(`Добавлено строк: ${report.added}`); location.hash = '#/estimate';});
  root.querySelectorAll('[data-template-zone]').forEach(btn=>btn.addEventListener('click',()=>{const t=getTemplatesForProject(ctx.projectTypeId, { showAll: true }).find(x=>x.id===btn.dataset.templateZone); if(!t) return; p.zones.push(createZone(createZoneSeedFromTemplate(t, ctx.projectTypeId))); persistProject(); if(!getProjectZoneModel(ctx.projectTypeId).allowedZoneCategoryIds.includes(t.categoryId)) toast('Зона добавлена как нетиповая для проекта'); ZonesPage(root);}));
  root.querySelectorAll('[data-zone-delete]').forEach(btn=>btn.addEventListener('click',()=>{p.zones=p.zones.filter(z=>z.id!==btn.dataset.zoneDelete); p.estimateItems.forEach(i=>{if(i.zoneId===btn.dataset.zoneDelete)i.zoneId='';}); persistProject(); ZonesPage(root);}));
  root.querySelectorAll('[data-zone-duplicate]').forEach(btn=>btn.addEventListener('click',()=>{const z=p.zones.find(x=>x.id===btn.dataset.zoneDuplicate); if(!z) return; p.zones.push(createZone({...structuredClone(z), id: undefined, name: `${z.name} · копия`})); persistProject(); ZonesPage(root);}));
  root.querySelectorAll('[data-zone-estimate]').forEach(btn=>btn.addEventListener('click',()=>{const report = generateEstimateFromZones(p, { mode: 'append', zoneId: btn.dataset.zoneEstimate }); persistProject(); toast(`Смета обновлена. Добавлено строк: ${report.added}`); location.hash = '#/estimate';}));
  root.querySelectorAll('[data-zone-field]').forEach(el=>el.addEventListener('input',()=>{const z=p.zones.find(x=>x.id===el.dataset.zoneId); z[el.dataset.zoneField]=el.type==='number'?Number(el.value):el.value; persistProject();}));
  root.querySelectorAll('[data-zone-flag]').forEach(el=>el.addEventListener('change',()=>{const z=p.zones.find(x=>x.id===el.dataset.zoneId); z.flags[el.dataset.zoneFlag]=el.checked; persistProject(); ZonesPage(root);}));
  root.querySelector('[data-template-search]')?.addEventListener('change',()=>setHash());
  root.querySelector('[data-template-category]')?.addEventListener('change',()=>setHash());
  root.querySelectorAll('[data-category-filter]').forEach(btn=>btn.addEventListener('click',()=>setHash({category: btn.dataset.categoryFilter})));
  root.querySelector('[data-toggle-all]')?.addEventListener('click',()=>setHash({showAll: !ctx.showAll}));
  root.querySelectorAll('[data-reset-template-filter]').forEach(btn=>btn.addEventListener('click',()=>{location.hash='#/zones';}));
}
