import { EQUIPMENT_CATEGORIES, childCategories, QUICK_EQUIPMENT_FILTERS } from '../data/equipmentCategories.js';
import { ZONE_CATEGORIES } from '../data/zoneTaxonomy.js';
import { escapeAttr, escapeHtml } from '../utils/format.js';

export function LibraryFilters({ search = '', category = 'all', subcategory = 'all', level = 'all', currency = 'all', price = 'all', projectType = 'all', zoneCategory = 'all', review = 'all', scope = 'default', supplier = 'all', zones = [], suppliers = [], advanced = false, allowAdvanced = true } = {}) {
  const subcategories = category === 'all' ? [] : childCategories(category);
  const advancedButtonText = advanced ? 'Скрыть расширенные фильтры' : 'Показать больше фильтров';
  return `<div class="card libraryFilters">
    <div class="quickFilters"><a class="btn ${category === 'all' ? 'primary' : 'ghost'} small" href="#/library">Все</a>${QUICK_EQUIPMENT_FILTERS.map(f => `<a class="btn ${category === f.id ? 'primary' : 'ghost'} small" href="#/library?category=${escapeAttr(f.id)}">${escapeHtml(f.label)}</a>`).join('')}</div>
    <div class="grid cols4 libraryFiltersBasic">
      <label class="field"><span>Поиск</span><input data-lib-search value="${escapeAttr(search)}" placeholder="название, бренд, модель, тег, поставщик"></label>
      <label class="field"><span>Категория</span><select data-lib-category><option value="all">Все категории</option>${EQUIPMENT_CATEGORIES.map(c => `<option value="${escapeAttr(c.id)}" ${c.id === category ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Поставщик</span><select data-lib-supplier><option value="all">Все загруженные</option>${suppliers.map(s => `<option value="${escapeAttr(s.id)}" ${s.id === supplier ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Зона для добавления</span><select data-target-zone><option value="">Без зоны</option>${zones.map(z => `<option value="${escapeAttr(z.id)}">${escapeHtml(z.name)}</option>`).join('')}</select></label>
    </div>
    ${allowAdvanced ? `<div class="actions"><button class="btn ghost small" data-toggle-library-advanced>${escapeHtml(advancedButtonText)}</button></div>` : ''}
    ${advanced && allowAdvanced ? `<div class="grid cols4 libraryFiltersAdvanced" data-library-advanced-filters>
      <label class="field"><span>Подкатегория</span><select data-lib-subcategory><option value="all">Все подкатегории</option>${subcategories.map(c => `<option value="${escapeAttr(c.id)}" ${c.id === subcategory ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Уровень</span><select data-lib-level>${['all','budget','standard','premium','expert','custom'].map(v => `<option value="${escapeAttr(v)}" ${v === level ? 'selected' : ''}>${v === 'all' ? 'Все уровни' : v}</option>`).join('')}</select></label>
      <label class="field"><span>Валюта</span><select data-lib-currency>${['all','RUB','USD','EUR','CNY'].map(v => `<option value="${escapeAttr(v)}" ${v === currency ? 'selected' : ''}>${v === 'all' ? 'Все валюты' : v}</option>`).join('')}</select></label>
      <label class="field"><span>Тип проекта</span><select data-lib-project-type><option value="all">Все типы</option>${['corporate','museum','conference','retail','education','control','hospitality','sport','event','public','vr'].map(v => `<option value="${escapeAttr(v)}" ${v === projectType ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select></label>
      <label class="field"><span>Категория зоны</span><select data-lib-zone-category><option value="all">Все зоны</option>${ZONE_CATEGORIES.map(z => `<option value="${escapeAttr(z.id)}" ${z.id === zoneCategory ? 'selected' : ''}>${escapeHtml(z.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Статус цены</span><select data-lib-price>${['all','actual','estimated','unknown'].map(v => `<option value="${escapeAttr(v)}" ${v === price ? 'selected' : ''}>${v === 'all' ? 'Любой' : v}</option>`).join('')}</select></label>
      <label class="field"><span>Релевантность</span><select data-lib-scope><option value="default" ${scope === 'default' ? 'selected' : ''}>AV + инфраструктура</option><option value="av" ${scope === 'av' ? 'selected' : ''}>Только AV-оборудование</option><option value="infrastructure" ${scope === 'infrastructure' ? 'selected' : ''}>Только инфраструктура</option><option value="it" ${scope === 'it' ? 'selected' : ''}>IT / компьютеры</option><option value="consumables" ${scope === 'consumables' ? 'selected' : ''}>Расходники</option><option value="questionable" ${scope === 'questionable' || scope === 'unknown' ? 'selected' : ''}>Требует проверки</option><option value="hidden" ${scope === 'hidden' ? 'selected' : ''}>Скрытое</option><option value="all" ${scope === 'all' ? 'selected' : ''}>Показать всё</option></select></label>
      <label class="field"><span>Проверка</span><select data-lib-review><option value="all" ${review === 'all' ? 'selected' : ''}>Любой статус</option><option value="yes" ${review === 'yes' ? 'selected' : ''}>Требует проверки</option><option value="no" ${review === 'no' ? 'selected' : ''}>Без проверки</option></select></label>
    </div>` : ''}
  </div>`;
}
