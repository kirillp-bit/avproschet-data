import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { KpiStrip } from '../components/KpiStrip.js';
import { GroupedEstimateTable } from '../components/GroupedEstimateTable.js';
import { BudgetStatus } from '../components/BudgetStatus.js';
import { ensureProject, persistProject, getUiMode } from '../app/state.js';
import { createEstimateItem } from '../engine/projectFactory.js';
import { generateEstimateFromZones } from '../engine/estimate.js';
import { calculateProjectTotals } from '../engine/pricing.js';
import { formatMoney } from '../utils/format.js';
import { toast } from '../utils/dom.js';

export function EstimatePage(root) {
  const p = ensureProject(); const t = calculateProjectTotals(p); const uiMode = getUiMode(); const q = new URLSearchParams(location.hash.split('?')[1] || ''); const mode = uiMode === 'engineering' && q.get('mode') === 'detailed' ? 'detailed' : 'compact';
  root.innerHTML = AppLayout(`${PageHeader({ title: 'Смета', description: 'Рабочая таблица расчёта. Компактный режим — для пресейла, подробный — для проверки закупки.', actions: '<button class="btn primary" data-generate="replace">Сгенерировать по зонам</button><button class="btn ghost" data-add-manual>Добавить ручную строку</button><a class="btn ghost" href="#/library">Добавить из библиотеки</a><button class="btn ghost" data-generate="recalculate-derived">Пересчитать derived</button>' })}
  ${KpiStrip([
    { label: 'Себестоимость', value: formatMoney(t.subtotalCost) },
    { label: 'Цена без НДС', value: formatMoney(t.salePriceNet) },
    { label: 'Цена с НДС', value: formatMoney(t.salePriceGross) },
    { label: 'Прибыль', value: formatMoney(t.profit) },
    { label: 'Отклонение от бюджета', value: budgetDelta(t), tone: t.targetBudgetStatus === 'over' ? 'warn' : 'ok' }
  ])}
  <div class="estimateToolbar"><div class="actions">${uiMode === 'engineering' ? `<a class="btn ${mode === 'compact' ? 'primary' : 'ghost'} small" href="#/estimate?mode=compact">Компактный</a><a class="btn ${mode === 'detailed' ? 'primary' : 'ghost'} small" href="#/estimate?mode=detailed">Подробный</a>` : '<span class="badge ok">Быстрый пресейл</span><span class="muted smallText">Технические поля скрыты.</span>'}</div><div class="actions"><button class="btn ghost small" data-generate="append">Дополнить</button><button class="btn ghost small" data-save>Сохранить</button></div></div>
  ${BudgetStatus(p)}<div class="separator"></div>${GroupedEstimateTable(p, mode)}`);
  bindLayoutActions(root); bind(root,p);
}
function budgetDelta(t){ if(!t.targetBudget) return 'не задан'; const sign = t.targetBudgetDelta > 0 ? '+' : ''; return `${sign}${formatMoney(t.targetBudgetDelta)}`; }
function bind(root,p){
  root.querySelectorAll('[data-generate]').forEach(btn=>btn.addEventListener('click',()=>{
    const report = generateEstimateFromZones(p, { mode: btn.dataset.generate });
    persistProject();
    const skipped = report.skippedZones.length ? ` Пропущено: ${report.skippedZones.length}.` : '';
    toast(`Добавлено строк: ${report.added}.${skipped}`);
    EstimatePage(root);
  }));
  root.querySelectorAll('[data-add-manual]').forEach(btn=>btn.addEventListener('click',()=>{p.estimateItems.push(createEstimateItem({name:'Новая ручная позиция', category:'Оборудование', currency:'RUB', priceMode:'manual', source:'manual', isManual:true, note:'ручное добавление'})); persistProject(); EstimatePage(root);}));
  root.querySelector('[data-save]')?.addEventListener('click',()=>{persistProject(); toast('Смета сохранена');});
  root.querySelectorAll('[data-item-field]').forEach(el=>el.addEventListener('input',()=>{const item=p.estimateItems.find(x=>x.id===el.dataset.itemId); if(!item) return; item[el.dataset.itemField]=el.type==='number'?Number(el.value):el.value; persistProject();}));
  root.querySelectorAll('[data-item-delete]').forEach(btn=>btn.addEventListener('click',()=>{p.estimateItems=p.estimateItems.filter(i=>i.id!==btn.dataset.itemDelete); persistProject(); EstimatePage(root);}));
}
