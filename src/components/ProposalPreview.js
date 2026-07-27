import { escapeHtml } from '../utils/format.js';
import { formatMoney } from '../utils/format.js';

export function ProposalPreview(view) {
  if (view.exportGuard?.isEstimateEmpty) {
    return `<div class="proposalDocument proposalEmpty"><h1>Коммерческое предложение</h1><p>Смета пока пустая. Документ не готов к отправке клиенту.</p><a class="btn primary" href="#/estimate">Открыть смету</a></div>`;
  }
  const softWarnings = view.exportGuard?.softWarnings || [];
  return `<article class="proposalDocument" data-proposal-document>
    <header class="proposalCover">
      <div class="proposalLogo"><span>П</span><strong>${escapeHtml(view.companyInfo?.companyName || 'П-Медиа')}</strong></div>
      <div class="proposalMeta">
        <h1>${escapeHtml(view.documentInfo.title)}</h1>
        <p>${escapeHtml(view.projectInfo.name)}</p>
        <dl>
          <div><dt>Заказчик</dt><dd>${escapeHtml(view.customerInfo.name || 'Не указан')}</dd></div>
          <div><dt>Дата</dt><dd>${dateOnly(view.documentInfo.date)}</dd></div>
          <div><dt>№ КП</dt><dd>${escapeHtml(view.documentInfo.proposalNumber || '—')}</dd></div>
          <div><dt>Срок действия</dt><dd>${escapeHtml(view.validity)}</dd></div>
          ${view.documentInfo.managerContact ? `<div><dt>Контакт</dt><dd>${escapeHtml(view.documentInfo.managerContact)}</dd></div>` : ''}
        </dl>
      </div>
    </header>
    ${softWarnings.length ? `<section class="proposalNotice"><strong>Документ можно экспортировать, но стоит уточнить данные:</strong><p>${softWarnings.map(escapeHtml).join(', ')}</p></section>` : ''}
    <section class="proposalSection"><h2>Краткое описание решения</h2>${view.solutionSummary.map(text => `<p>${escapeHtml(text)}</p>`).join('')}</section>
    ${renderComposition(view)}
    ${renderFinancialBlock(view)}
    ${renderIncludes(view)}
    ${view.exclusions?.length ? renderList('Что не входит', view.exclusions) : ''}
    ${view.timeline ? renderTimeline(view.timeline) : ''}
    ${renderTerms(view)}
    ${renderRequisites(view.companyInfo)}
    <footer class="proposalFooter"><strong>${escapeHtml(view.companyInfo?.companyFullName || 'ООО «П-Медиа»')}</strong><span>${escapeHtml(view.footer || '')}</span></footer>
  </article>`;
}

function renderRequisites(info = {}) {
  const rows = [
    [info.companyFullName, info.inn ? `ИНН ${info.inn}` : '', info.kpp ? `КПП ${info.kpp}` : '', info.ogrn ? `ОГРН ${info.ogrn}` : ''].filter(Boolean).join(' · '),
    info.legalAddress ? `Юридический адрес: ${info.legalAddress}` : '',
    info.actualAddress ? `Фактический адрес: ${info.actualAddress}` : '',
    [info.bankAccount ? `Р/с ${info.bankAccount}` : '', info.bankName || '', info.bik ? `БИК ${info.bik}` : '', info.corrAccount ? `к/с ${info.corrAccount}` : ''].filter(Boolean).join(' · '),
    [info.phone ? `Тел.: ${info.phone}` : '', info.email ? `E-mail: ${info.email}` : '', info.site || ''].filter(Boolean).join(' · ')
  ].filter(Boolean);
  if (!rows.length) return '';
  return `<section class="proposalRequisites"><h3>Реквизиты исполнителя</h3>${rows.map(row => `<p>${escapeHtml(row)}</p>`).join('')}</section>`;
}

function renderComposition(view) {
  const showZones = view.options.showZoneBreakdown && view.zones?.length;
  return `<section class="proposalSection pageAvoid"><h2>Состав решения</h2>
    ${showZones ? `<div class="zoneBreakdown">${view.zones.map(renderZone).join('')}</div>` : ''}
    <div class="proposalTables">${(view.sections || []).map(section => renderSectionTable(section, view.options)).join('')}</div>
  </section>`;
}

function renderZone(zone) {
  return `<div class="proposalZone"><div><strong>${escapeHtml(zone.name)}</strong><small>${escapeHtml(zone.categoryName || '')}${zone.area ? ` · ${escapeHtml(zone.area)} м²` : ''}</small></div><b>${formatMoney(zone.total)}</b></div>`;
}

function renderSectionTable(section, options) {
  const cols = 2 + (options.showQuantities ? 1 : 0) + (options.showUnitPrices ? 1 : 0) + (options.showSectionPrices ? 1 : 0);
  return `<div class="proposalTableBlock pageAvoid"><h3>${escapeHtml(section.title)}</h3>
  <table class="proposalTable"><thead><tr><th>Состав</th><th>Описание</th>${options.showQuantities ? '<th>Кол-во</th>' : ''}${options.showUnitPrices ? '<th>Цена за ед.</th>' : ''}${options.showSectionPrices ? '<th>Сумма</th>' : ''}</tr></thead>
  <tbody>${(section.items || []).map(item => `<tr><td>${escapeHtml(item.name || item.category || 'Позиция')}</td><td>${escapeHtml(item.description || item.section || '')}</td>${options.showQuantities ? `<td>${escapeHtml(item.qty ?? '')} ${escapeHtml(item.unit || '')}</td>` : ''}${options.showUnitPrices ? `<td>${formatMoney(item.unitSalePrice || 0)}</td>` : ''}${options.showSectionPrices ? `<td>${formatMoney(item.totalSale || 0)}</td>` : ''}</tr>`).join('') || `<tr><td colspan="${cols}">Нет строк для отображения</td></tr>`}</tbody>
  ${options.showSectionPrices ? `<tfoot><tr><td colspan="${cols - 1}">Итого по разделу</td><td>${formatMoney(section.total || 0)}</td></tr></tfoot>` : ''}</table></div>`;
}

function renderFinancialBlock(view) {
  return `<section class="proposalSection proposalFinancial pageAvoid"><h2>Финансовый блок</h2>
    <div class="financialGrid">
      <div><span>Стоимость без НДС</span><strong>${formatMoney(view.totals.salePriceNet)}</strong></div>
      ${view.totals.showVat ? `<div><span>НДС ${view.totals.vatPct}%</span><strong>${formatMoney(view.totals.vatAmount)}</strong></div><div class="accent"><span>Стоимость с НДС</span><strong>${formatMoney(view.totals.salePriceGross)}</strong></div>` : `<div class="accent"><span>Итого</span><strong>${formatMoney(view.totals.salePriceNet)}</strong></div>`}
    </div>
    <p class="muted">Стоимость действительна в пределах срока действия предложения и зависит от наличия оборудования у поставщиков.</p>
  </section>`;
}

function renderIncludes(view) {
  const items = ['Оборудование', 'Монтажные работы', 'ПНР', 'Кабели и расходные материалы', 'Логистика', 'Базовая документация'];
  if (view.options.includeWarranty) items.push('Гарантийная поддержка');
  return renderList('Что входит', items);
}

function renderTerms(view) {
  const blocks = [];
  if (view.paymentTerms) blocks.push(`<div><h3>Условия оплаты</h3><p>${escapeHtml(view.paymentTerms)}</p></div>`);
  if (view.warranty) blocks.push(`<div><h3>Гарантия</h3><p>${escapeHtml(view.warranty)}</p></div>`);
  if (view.assumptions?.length) blocks.push(`<div>${renderList('Допущения', view.assumptions)}</div>`);
  return blocks.length ? `<section class="proposalSection proposalTerms"><h2>Условия и допущения</h2><div class="termsGrid">${blocks.join('')}</div></section>` : '';
}

function renderList(title, items) {
  return `<section class="proposalSection pageAvoid"><h2>${escapeHtml(title)}</h2><ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;
}

function renderTimeline(timeline) {
  return `<section class="proposalSection pageAvoid"><h2>Сроки реализации</h2><div class="timelineGrid">
    <div><span>Поставка</span><strong>${escapeHtml(timeline.supply)}</strong></div>
    <div><span>Монтаж</span><strong>${escapeHtml(timeline.installation)}</strong></div>
    <div><span>ПНР</span><strong>${escapeHtml(timeline.commissioning)}</strong></div>
    <div><span>Ориентир всего</span><strong>${escapeHtml(timeline.total)}</strong></div>
  </div></section>`;
}

function dateOnly(value) {
  try { return new Intl.DateTimeFormat('ru-RU').format(new Date(value)); } catch { return '—'; }
}
