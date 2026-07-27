import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { AdvancedPanel } from '../components/AdvancedPanel.js';
import { PrimaryActionBar } from '../components/PrimaryActionBar.js';
import { ensureProject, persistProject } from '../app/state.js';
import { navigate } from '../app/router.js';
import { PROJECT_TYPES } from '../data/projectTypes.js';
import { SCENARIOS } from '../data/scenarios.js';
import { CITY_TIERS } from '../data/cityTiers.js';
import { URGENCY } from '../data/urgency.js';
import { validateProject } from '../engine/validation.js';
import { calculateProjectTotals } from '../engine/pricing.js';
import { escapeAttr, escapeHtml, formatMoney } from '../utils/format.js';
import { toast } from '../utils/dom.js';

export function PassportPage(root) {
  const p = ensureProject(); const pp = p.passport; const totals = calculateProjectTotals(p); const missing = requiredMissing(p); const warnings = validateProject(p);
  const advanced = `<div class="grid cols3">
    <label class="field"><span>Коэффициент сложности</span><input type="number" step="0.01" data-override-field="complexityManual" value="${p.settingsOverrides?.complexityManual || ''}" placeholder="авто"></label>
    <label class="field"><span>Коэффициент логистики</span><input type="number" step="0.01" data-override-field="logisticsManual" value="${p.settingsOverrides?.logisticsManual || ''}" placeholder="авто"></label>
    <label class="field"><span>Режим генерации</span><select data-passport-field="estimateMode"><option value="auto" ${pp.estimateMode !== 'manual' ? 'selected' : ''}>Авто</option><option value="manual" ${pp.estimateMode === 'manual' ? 'selected' : ''}>Ручной</option></select></label>
    <label class="field"><span>Монтаж, доля</span><input type="number" step="0.01" data-labor-field="installationPct" value="${p.settingsOverrides?.laborRates?.installationPct || ''}" placeholder="из настроек"></label>
    <label class="field"><span>ПНР, доля</span><input type="number" step="0.01" data-labor-field="pnrPct" value="${p.settingsOverrides?.laborRates?.pnrPct || ''}" placeholder="из настроек"></label>
    <label class="field"><span>Сервис, доля</span><input type="number" step="0.01" data-labor-field="servicePct" value="${p.settingsOverrides?.laborRates?.servicePct || ''}" placeholder="из настроек"></label>
  </div>`;
  root.innerHTML = AppLayout(`${PageHeader({ title: 'Паспорт проекта', description: 'Заполните основные параметры, чтобы перейти к зонам.', actions: '<button class="btn ghost" data-save>Сохранить</button><button class="btn primary" data-next>Перейти к зонам</button>' })}
  <div class="passportGrid">
    <section class="card">
      <div class="sectionTitle"><h3>Основное</h3><span class="muted">Быстрый старт расчёта</span></div>
      <div class="grid cols2">${field('name','Название проекта',p.name)}${field('customerName','Заказчик',p.customerName)}
        <label class="field"><span>Тип проекта</span><select data-passport-field="projectType">${opt(PROJECT_TYPES,pp.projectType)}</select></label>
        <label class="field"><span>Город / регион</span><select data-passport-field="cityTier">${opt(CITY_TIERS,pp.cityTier)}</select></label>
        <label class="field"><span>Площадь, м²</span><input type="number" data-passport-field="area" value="${pp.area}"></label>
        <label class="field"><span>Этажей</span><input type="number" data-passport-field="floors" value="${pp.floors}"></label>
        <label class="field"><span>Высота потолков, м</span><input type="number" step="0.1" data-passport-field="ceilingHeight" value="${pp.ceilingHeight}"></label>
        <label class="field"><span>Срок проекта</span><select data-passport-field="urgency">${opt(URGENCY,pp.urgency)}</select></label>
        <label class="field"><span>Уровень решения</span><select data-passport-field="scenario">${opt(SCENARIOS,pp.scenario)}</select></label>
        <label class="field"><span>Целевой бюджет</span><input type="number" data-passport-field="targetBudget" value="${pp.targetBudget}"></label>
        <label class="field"><span>НДС, %</span><input type="number" data-passport-field="vatPct" value="${pp.vatPct}"></label>
        <label class="field"><span>${pp.marginMode === 'margin' ? 'Маржа, %' : 'Наценка, %'}</span><input type="number" data-passport-field="marginPct" value="${pp.marginPct}"></label>
      </div>
      <div class="grid cols2 compactControls">
        <label class="field"><span>Бюджет сравнивать с</span><select data-passport-field="targetBudgetIncludesVat"><option value="true" ${pp.targetBudgetIncludesVat !== false ? 'selected' : ''}>ценой с НДС</option><option value="false" ${pp.targetBudgetIncludesVat === false ? 'selected' : ''}>ценой без НДС</option></select></label>
        <label class="field"><span>Коммерческий режим</span><select data-passport-field="marginMode"><option value="markup" ${pp.marginMode==='markup'?'selected':''}>Наценка</option><option value="margin" ${pp.marginMode==='margin'?'selected':''}>Маржа</option></select></label>
      </div>
      ${AdvancedPanel('Экспертные параметры', advanced)}
    </section>
    <aside class="card projectSideSummary">
      <h3>Сводка</h3>
      <div class="summaryList"><div><span>Статус</span><strong>${escapeHtml(statusLabel(p.status))}</strong></div><div><span>Зоны</span><strong>${p.zones.length}</strong></div><div><span>Ориентировочная стоимость</span><strong data-passport-total-gross>${formatMoney(totals.salePriceGross)}</strong></div><div><span>Предупреждения</span><strong>${warnings.length}</strong></div></div>
      <div data-passport-missing>${missingNotice(missing)}</div>
      ${PrimaryActionBar('<button class="btn primary" data-next>Перейти к зонам</button>')}
    </aside>
  </div>`);
  bindLayoutActions(root); bind(root, p, missing);
}
function field(key,label,value){return `<label class="field"><span>${escapeHtml(label)}</span><input data-root-field="${escapeAttr(key)}" value="${escapeAttr(value || '')}"></label>`}
function opt(items, selected){return items.map(x=>`<option value="${escapeAttr(x.id)}" ${x.id===selected?'selected':''}>${escapeHtml(x.name)}</option>`).join('')}
function statusLabel(status){return ({draft:'Черновик',estimate_ready:'Смета готова',has_errors:'Есть ошибки',proposal_ready:'КП готово'}[status] || 'Черновик')}
function requiredMissing(p){const list=[]; const customer = String(p.customerName || p.customer || p.passport?.customerName || p.passport?.customer || ''); if(!String(p.name || '').trim()) list.push('название проекта'); if(!customer.trim()) list.push('заказчик'); if(!p.passport?.area) list.push('площадь'); return list;}
function missingNotice(missing){return missing.length ? `<div class="notice warn"><strong>Не хватает данных</strong><p>${missing.map(escapeHtml).join(', ')}</p></div>` : '<div class="notice ok"><strong>Паспорт заполнен</strong><p>Можно переходить к зонам.</p></div>'}
function bind(root,p,missing){
  const refreshMissing = () => { const currentMissing = requiredMissing(p); const holder = root.querySelector('[data-passport-missing]'); if(holder) holder.innerHTML = missingNotice(currentMissing); return currentMissing; };
  const refreshTotals = () => { const holder = root.querySelector('[data-passport-total-gross]'); if(holder) holder.textContent = formatMoney(calculateProjectTotals(p).salePriceGross); };
  root.querySelectorAll('[data-root-field]').forEach(el=>el.addEventListener('input',()=>{p[el.dataset.rootField]=el.value; if (el.dataset.rootField === 'customerName') p.passport.customerName = el.value; refreshMissing(); refreshTotals();}));
  root.querySelectorAll('[data-passport-field]').forEach(el=>el.addEventListener('input',()=>{const k=el.dataset.passportField; if(k === 'targetBudgetIncludesVat') p.passport[k] = el.value === 'true'; else p.passport[k]=el.type==='number'?Number(el.value):el.value; refreshMissing(); refreshTotals();}));
  root.querySelectorAll('[data-override-field]').forEach(el=>el.addEventListener('input',()=>{p.settingsOverrides ||= {}; p.settingsOverrides[el.dataset.overrideField]=el.value === '' ? undefined : Number(el.value); refreshTotals();}));
  root.querySelectorAll('[data-labor-field]').forEach(el=>el.addEventListener('input',()=>{p.settingsOverrides ||= {}; p.settingsOverrides.laborRates ||= {}; p.settingsOverrides.laborRates[el.dataset.laborField]=el.value === '' ? undefined : Number(el.value); refreshTotals();}));
  root.querySelector('[data-save]')?.addEventListener('click',()=>{persistProject(); toast('Паспорт сохранён');});
  root.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click',()=>{const currentMissing = refreshMissing(); persistProject(); if(currentMissing.length) toast(`Заполните: ${currentMissing.join(', ')}`); else navigate('zones');}));
}
