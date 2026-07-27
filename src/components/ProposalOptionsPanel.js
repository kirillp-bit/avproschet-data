import { proposalPresets } from '../engine/proposalOptions.js';

export function ProposalOptionsPanel(options) {
  return `<section class="card proposalOptionsPanel">
    <div class="sectionTitle"><div><h3>Настройки КП</h3><p class="muted">Контролируют только клиентское представление. Закупка, маржа и поставщики в КП не выводятся.</p></div></div>
    <div class="presetRow">${Object.entries(proposalPresets).map(([id, preset]) => `<button class="btn ${options.preset === id ? 'primary' : 'ghost'} small" data-proposal-preset="${id}">${preset.label}</button>`).join('')}</div>
    <div class="grid cols3 proposalOptionsGrid">
      ${selectField('detailLevel', 'Детализация', options.detailLevel, [['brief','Кратко'],['zones','По зонам'],['detailed','Подробно'],['internal','Внутреннее согласование']])}
      ${selectField('groupingMode', 'Группировка', options.groupingMode, [['sections','По разделам'],['zones','По зонам'],['flat','Одним списком']])}
      ${checkbox('showVat', 'Показывать НДС', options.showVat)}
      ${checkbox('showZoneBreakdown', 'Блок по зонам', options.showZoneBreakdown)}
      ${checkbox('showEquipmentNames', 'Названия оборудования', options.showEquipmentNames)}
      ${checkbox('showQuantities', 'Количество', options.showQuantities)}
      ${checkbox('showUnitPrices', 'Цены за единицу', options.showUnitPrices)}
      ${checkbox('showSectionPrices', 'Итоги разделов', options.showSectionPrices)}
      ${checkbox('includeAssumptions', 'Допущения', options.includeAssumptions)}
      ${checkbox('includeExclusions', 'Исключения', options.includeExclusions)}
      ${checkbox('includeTimeline', 'Сроки', options.includeTimeline)}
      ${checkbox('includeWarranty', 'Гарантия', options.includeWarranty)}
      ${checkbox('includePaymentTerms', 'Оплата', options.includePaymentTerms)}
    </div>
  </section>`;
}

function selectField(name, label, value, options) {
  return `<label class="field"><span>${label}</span><select data-proposal-option="${name}">${options.map(([id, text]) => `<option value="${id}" ${value === id ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
}
function checkbox(name, label, checked) {
  return `<label class="check"><input type="checkbox" data-proposal-option="${name}" ${checked ? 'checked' : ''}> ${label}</label>`;
}
