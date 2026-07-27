import { buildClientProposalView, buildInternalEstimateView } from '../engine/proposalBuilder.js';
import { mergedSettings } from '../engine/pricing.js';
import { validateProject } from '../engine/validation.js';
import { downloadText } from '../utils/dom.js';
import { safeFileName, dateStamp } from './exportHtml.js';
import { escapeSpreadsheetCell } from '../utils/sanitize.js';

export function exportProjectWorkbook(project, settingsInput = null, proposalOptions = null) {
  const settings = settingsInput || mergedSettings(project);
  const internal = buildInternalEstimateView(project, settings);
  const client = buildClientProposalView(project, settings, proposalOptions || project.proposalOptions || {});
  const sheets = [
    buildSummarySheet(project, internal, client),
    buildClientProposalSheet(client),
    buildInternalEstimateSheet(internal),
    buildEquipmentSheet(internal),
    buildWorksSheet(internal),
    buildWarningsSheet(internal),
    buildParametersSheet(internal)
  ];
  return buildExcelXmlWorkbook(sheets);
}

export function downloadProjectWorkbook(project, settings = null, proposalOptions = null) {
  const content = exportProjectWorkbook(project, settings, proposalOptions);
  downloadText(safeFileName(`AVPROSCHET_${project.name || 'project'}_${dateStamp()}.xls`), content, 'application/vnd.ms-excel');
}

export function buildSummarySheet(project, internal, client) {
  const t = internal.totals;
  return sheet('Summary', [
    ['Параметр','Значение'],
    ['Название проекта', project.name || ''],
    ['Заказчик', project.customerName || ''],
    ['Дата', new Date().toLocaleDateString('ru-RU')],
    ['Тип проекта', project.passport?.projectType || ''],
    ['Город / регион', project.passport?.city || project.passport?.cityTier || ''],
    ['Сценарий', project.passport?.scenario || ''],
    ['Стоимость без НДС', t.salePriceNet],
    ['НДС', t.vatAmount],
    ['Стоимость с НДС', t.salePriceGross],
    ['Маржа / наценка', `${t.marginMode} ${t.marginPct}%`],
    ['Прибыль', t.profit],
    ['Целевой бюджет', t.targetBudget || 0],
    ['Отклонение от бюджета', t.targetBudgetDelta || 0],
    ['Статус проверки', internal.warnings.some(w => w.severity === 'error') ? 'Есть критичные ошибки' : 'Можно согласовывать']
  ]);
}

export function buildClientProposalSheet(client) {
  const rows = [['Раздел','Позиция','Описание','Кол-во','Ед.','Цена за ед.','Сумма']];
  client.sections.forEach(section => {
    section.items.forEach(item => rows.push([section.title, item.name || '', item.description || '', item.qty || '', item.unit || '', item.unitSalePrice || '', item.totalSale || 0]));
    rows.push([section.title, 'Итого по разделу', '', '', '', '', section.total || 0]);
  });
  rows.push([],[ 'Итого без НДС','','','','','',client.totals.salePriceNet ],[ `НДС ${client.totals.vatPct}%`,'','','','','',client.totals.vatAmount ],[ 'Итого с НДС','','','','','',client.totals.salePriceGross ]);
  return sheet('Client Proposal', rows);
}

export function buildInternalEstimateSheet(internal) {
  const rows = [['№','Зона','Раздел','Позиция','Категория','Ед.','Кол-во','Закупка ед.','Закупка сумма','Цена продажи ед.','Цена продажи сумма','Валюта','Курс','Поставщик','Источник цены','Дата цены','Статус цены','Маржа %','Наценка %','Прибыль','Manual','Derived','Dependencies','Warnings','Комментарий']];
  internal.rows.forEach(row => rows.push([row.number,row.zoneName,row.section,row.name,row.category,row.unit,row.qty,row.unitCost,row.totalCost,row.unitSalePrice,row.totalSale,row.currency,row.rate,row.supplier,row.priceSource,row.priceDate,row.priceStatus,row.marginPct,row.markupPct,row.profit,row.isManual ? 'yes':'no',row.isDerived ? 'yes':'no',(row.dependencies||[]).join(', '),(row.warnings||[]).join(', '),row.note]));
  return sheet('Internal Estimate', rows);
}

export function buildEquipmentSheet(internal) {
  const rows = [['Бренд','Модель / позиция','Категория','Количество','Цена закупки','Валюта','Поставщик','Срок поставки','Зона']];
  internal.rows.filter(row => row.sourceType === 'estimate-item').forEach(row => rows.push(['', row.name, row.category, row.qty, row.unitCost, row.currency, row.supplier, row.priceStatus || '', row.zoneName]));
  return sheet('Equipment', rows);
}

export function buildWorksSheet(internal) {
  const rows = [['Вид работ','Нормо-часы','Ставка','Себестоимость','Цена продажи','Комментарий']];
  internal.rows.filter(row => row.sourceType === 'calculated-work' || ['Монтажные работы','ПНР','Логистика','Документация и обучение','Сервис и гарантия'].includes(row.section)).forEach(row => rows.push([row.name, '', '', row.totalCost, row.totalSale, row.note || '']));
  return sheet('Works', rows);
}

export function buildWarningsSheet(internal) {
  const rows = [['Severity','Тип','Заголовок','Описание','Зона / позиция','Действие']];
  internal.warnings.forEach(w => rows.push([w.severity, w.type, w.title, w.message, w.entityId, w.actionLabel]));
  return sheet('Warnings', rows);
}

export function buildParametersSheet(internal) {
  const p = internal.parameters;
  return sheet('Parameters', [
    ['Параметр','Значение'],
    ['Курс USD', p.usdRate],
    ['НДС %', p.vatPct],
    ['Режим маржи', p.marginMode],
    ['Маржа / наценка %', p.marginPct],
    ['Коэффициент сложности', p.complexity],
    ['Коэффициент логистики', p.logisticsCoef],
    ['Дата расчёта', p.calculatedAt],
    ['Версия схемы проекта', p.schemaVersion]
  ]);
}

export function exportCsv(project) {
  const internal = buildInternalEstimateView(project);
  const header = ['Зона','Позиция','Категория','Ед.','Кол-во','Закупка','Сумма закупки','Цена продажи','Сумма продажи','Валюта','Источник'];
  const rows = internal.rows.map(i => [i.zoneName, i.name, i.category, i.unit, i.qty, i.unitCost, i.totalCost, i.unitSalePrice, i.totalSale, i.currency, i.priceSource]);
  return [header, ...rows].map(row => row.map(cell => `"${String(escapeSpreadsheetCell(cell ?? '')).replaceAll('"','""')}"`).join(';')).join('\n');
}

function sheet(name, rows) { return { name, rows }; }

function buildExcelXmlWorkbook(sheets) {
  return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#C7F55D" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style><Style ss:ID="Money"><NumberFormat ss:Format="# ##0 ₽"/></Style><Style ss:ID="Text"><Alignment ss:WrapText="1"/></Style></Styles>${sheets.map(renderWorksheet).join('')}</Workbook>`;
}

function renderWorksheet(s) {
  const rows = s.rows || [];
  const colCount = Math.max(...rows.map(r => r.length), 1);
  return `<Worksheet ss:Name="${xml(s.name).slice(0,31)}"><Table>${Array.from({length: colCount}).map(()=>'<Column ss:Width="140"/>').join('')}${rows.map((row, rIndex) => `<Row>${row.map(cell => renderCell(cell, rIndex === 0)).join('')}</Row>`).join('')}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><ActivePane>2</ActivePane></WorksheetOptions><AutoFilter x:Range="R1C1:R${Math.max(rows.length,1)}C${colCount}" xmlns="urn:schemas-microsoft-com:office:excel"/></Worksheet>`;
}

function renderCell(value, isHeader) {
  const safeValue = typeof value === 'number' ? value : escapeSpreadsheetCell(value ?? '');
  const type = typeof safeValue === 'number' ? 'Number' : 'String';
  const style = isHeader ? ' ss:StyleID="Header"' : typeof safeValue === 'number' ? ' ss:StyleID="Money"' : ' ss:StyleID="Text"';
  return `<Cell${style}><Data ss:Type="${type}">${xml(safeValue ?? '')}</Data></Cell>`;
}
function xml(value) { return String(value).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
