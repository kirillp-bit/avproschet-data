import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { getSettings, updateSettings } from '../app/state.js';
import { toast } from '../utils/dom.js';

export function SettingsPage(root) {
  const s = getSettings();
  root.innerHTML = AppLayout(`${PageHeader({ title: 'Настройки', description: 'Экспертные параметры. Изменения влияют на расчёт всех новых строк.', actions: '<button class="btn primary" data-save-settings>Сохранить настройки</button>' })}
  <div class="notice warn"><strong>Экспертная зона</strong><p>Меняйте эти параметры осознанно: они влияют на стоимость, КП и проверку бюджета.</p></div>
  <div class="settingsGrid">
    <section class="card"><h3>Финансы</h3>${input('usdRate','Курс USD → RUB',s.usdRate)}${input('defaultVatPct','НДС по умолчанию, %',s.defaultVatPct)}${input('defaultMarginPct','Наценка / маржа по умолчанию, %',s.defaultMarginPct)}<label class="field"><span>Режим по умолчанию</span><select data-setting="defaultMarginMode"><option value="markup" ${s.defaultMarginMode==='markup'?'selected':''}>Наценка</option><option value="margin" ${s.defaultMarginMode==='margin'?'selected':''}>Маржа</option></select></label><label class="field"><span>Целевой бюджет сравнивать с</span><select data-setting="targetBudgetIncludesVat"><option value="true" ${s.targetBudgetIncludesVat !== false ? 'selected' : ''}>ценой с НДС</option><option value="false" ${s.targetBudgetIncludesVat === false ? 'selected' : ''}>ценой без НДС</option></select></label></section>
    <section class="card"><h3>Валюты</h3><p class="muted">Сейчас расчёт поддерживает RUB и USD. EUR из прайсов уже пересчитан в RUB при импорте.</p><div class="summaryList"><div><span>Рабочий курс USD</span><strong>${s.usdRate}</strong></div></div></section>
    <section class="card"><h3>Ставки работ</h3>${input('installationPct','Монтаж, доля от оборудования',s.laborRates.installationPct,'0.01')}${input('pnrPct','ПНР, доля',s.laborRates.pnrPct,'0.01')}${input('contentPct','Контент / ПО, доля',s.laborRates.contentPct,'0.01')}${input('logisticsPct','Логистика, доля',s.laborRates.logisticsPct,'0.01')}${input('cablePct','Кабели и расходники, доля',s.laborRates.cablePct,'0.01')}${input('servicePct','Сервис, доля',s.laborRates.servicePct,'0.01')}</section>
    <section class="card"><h3>Коэффициенты</h3><p class="muted">Автоматические коэффициенты считаются из паспорта и зон. Ручные корректировки задавайте в паспорте проекта.</p></section>
    <section class="card"><h3>КП</h3><p class="muted">Параметры экспорта и клиентского представления собраны на странице КП.</p></section>
    <section class="card"><h3>Системные параметры</h3><p class="muted">Служебные версии и технические комментарии скрыты из рабочего интерфейса.</p></section>
  </div>`);
  bindLayoutActions(root);
  root.querySelector('[data-save-settings]')?.addEventListener('click',()=>{
    const laborRates = {...s.laborRates};
    root.querySelectorAll('[data-setting]').forEach(el=>{const k=el.dataset.setting; let value = el.type==='number' ? Number(el.value) : el.value; if(k === 'targetBudgetIncludesVat') value = el.value === 'true'; if(k in laborRates) laborRates[k]=Number(value); else s[k]=value;});
    updateSettings({...s, laborRates}); toast('Настройки сохранены');
  });
}
function input(key,label,value,step='1'){return `<label class="field"><span>${label}</span><input type="number" step="${step}" data-setting="${key}" value="${value}"></label>`}
