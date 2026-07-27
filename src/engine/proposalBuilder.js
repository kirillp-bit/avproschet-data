import { calculateProjectTotals, itemCostRub, mergedSettings, roundMoney } from './pricing.js';
import { validateProject } from './validation.js';
import { calculateBudgetStatus } from './budget.js';
import { normalizeProposalOptions } from './proposalOptions.js';

const EQUIPMENT_CATEGORIES = new Set([
  'LCD-панели','LED-экраны','Проекторы','Проекционные экраны','Интерактивные панели','ВКС-системы','PTZ-камеры',
  'Микрофоны','Акустика','DSP и усилители','Конференц-системы','Системы управления','Коммутация','Медиасерверы','ПК',
  'Сеть','ИБП','Крепления и конструкции','Кабельная инфраструктура','Интерактивные киоски','VR / AR','Свет','Доп. оборудование'
]);

const CLIENT_SECTION_ORDER = ['Оборудование', 'Монтажные работы', 'ПНР', 'Кабели и расходные материалы', 'Логистика', 'Документация и обучение', 'Сервис и гарантия', 'Прочее'];

export function buildInternalEstimateView(project = {}, settingsInput = null) {
  const settings = settingsInput || mergedSettings(project);
  const totals = calculateProjectTotals(project, settings);
  const warnings = validateProject(project, settings);
  const multiplier = totals.subtotalCost > 0 ? totals.salePriceNet / totals.subtotalCost : 1;
  const rows = buildCostRows(project, settings, totals, multiplier).map((row, index) => ({
    number: index + 1,
    ...row,
    unitSalePrice: row.qty ? roundMoney(row.totalSale / row.qty) : row.totalSale,
    profit: roundMoney(row.totalSale - row.totalCost),
    marginPct: row.totalSale > 0 ? Math.round((row.totalSale - row.totalCost) / row.totalSale * 10000) / 100 : 0,
    markupPct: row.totalCost > 0 ? Math.round((row.totalSale - row.totalCost) / row.totalCost * 10000) / 100 : 0
  }));
  return {
    type: 'internal-estimate',
    projectInfo: projectInfo(project),
    totals,
    rows,
    warnings,
    parameters: {
      usdRate: settings.usdRate,
      vatPct: totals.vatPct,
      marginMode: totals.marginMode,
      marginPct: totals.marginPct,
      complexity: totals.complexity,
      logisticsCoef: totals.logisticsCoef,
      schemaVersion: project.schemaVersion || 6,
      calculatedAt: new Date().toISOString()
    },
    marginInfo: {
      mode: totals.marginMode,
      pct: totals.marginPct,
      profit: totals.profit,
      actualMarginPct: totals.actualMarginPct,
      actualMarkupPct: totals.actualMarkupPct
    },
    budgetInfo: calculateBudgetStatus(project, totals, settings),
    priceSources: summarizePriceSources(rows)
  };
}

export function buildClientProposalView(project = {}, settingsInput = null, proposalOptions = null) {
  const settings = settingsInput || mergedSettings(project);
  const options = normalizeProposalOptions(proposalOptions || project.proposalOptions || {});
  const totals = calculateProjectTotals(project, settings);
  const warnings = validateProject(project, settings);
  const multiplier = totals.subtotalCost > 0 ? totals.salePriceNet / totals.subtotalCost : 1;
  const costRows = buildCostRows(project, settings, totals, multiplier);
  const safeRows = costRows.map(row => toClientRow(row, options));
  const sections = buildProposalSections(safeRows, options);
  const zones = buildProposalZones(project, safeRows, options);
  const projectType = project.passport?.projectType || 'AV-проект';
  const zoneNames = (project.zones || []).map(z => z.name).filter(Boolean);
  return {
    type: options.detailLevel === 'internal' ? 'internal-approval-preview' : 'client-proposal',
    options,
    projectInfo: projectInfo(project),
    customerInfo: { name: project.customerName || '', city: project.passport?.city || '', contact: project.customerContact || '' },
    documentInfo: {
      title: options.detailLevel === 'internal' ? 'Внутренняя смета' : 'Коммерческое предложение',
      proposalNumber: project.proposalNumber || '',
      date: new Date().toISOString(),
      validityDays: settings.proposalSettings?.validityDays || 14,
      managerContact: project.managerContact || settings.proposalSettings?.managerContact || ''
    },
    solutionSummary: buildSolutionSummary(project, projectType, zoneNames),
    sections,
    zones,
    totals: {
      salePriceNet: totals.salePriceNet,
      vatPct: totals.vatPct,
      vatAmount: totals.vatAmount,
      salePriceGross: totals.salePriceGross,
      showVat: options.showVat
    },
    assumptions: options.includeAssumptions ? defaultAssumptions(project) : [],
    exclusions: options.includeExclusions ? defaultExclusions() : [],
    timeline: options.includeTimeline ? buildTimeline(project) : null,
    warranty: options.includeWarranty ? (settings.proposalSettings?.warranty || '12 месяцев') : '',
    paymentTerms: options.includePaymentTerms ? (settings.proposalSettings?.paymentTerms || '70% аванс, 30% после готовности к отгрузке / завершения работ') : '',
    validity: `${settings.proposalSettings?.validityDays || 14} календарных дней`,
    footer: settings.proposalSettings?.footer || 'ООО «П-Медиа» · аудиовизуальные решения для бизнеса',
    companyInfo: companyInfo(settings),
    warnings: warnings.map(({id, severity, title, message}) => ({id, severity, title, message})),
    exportGuard: {
      hasCriticalErrors: warnings.some(w => w.severity === 'error'),
      isEstimateEmpty: !(project.estimateItems || []).length,
      softWarnings: [!project.customerName?.trim() ? 'Не указан заказчик' : '', !project.name?.trim() ? 'Не указано название проекта' : ''].filter(Boolean)
    }
  };
}

export function groupProposalItems(rows = [], mode = 'sections') {
  return rows.reduce((acc, row) => {
    const key = mode === 'zones' ? (row.zoneName || 'Без зоны') : mode === 'flat' ? 'Состав решения' : (row.section || 'Прочее');
    (acc[key] ||= []).push(row);
    return acc;
  }, {});
}

export function buildProposalSections(rows = [], options = {}) {
  const grouping = groupProposalItems(rows, options.groupingMode === 'zones' ? 'zones' : 'sections');
  return Object.entries(grouping).map(([title, items]) => ({
    title,
    total: roundMoney(items.reduce((sum, item) => sum + item.totalSale, 0)),
    items: options.detailLevel === 'brief'
      ? summarizeClientItems(items)
      : items.map(item => filterClientRowByOptions(item, options))
  })).sort((a, b) => sectionOrder(a.title) - sectionOrder(b.title));
}

function buildProposalZones(project, rows, options) {
  if (!options.showZoneBreakdown) return [];
  return (project.zones || []).map(zone => {
    const items = rows.filter(row => row.zoneId === zone.id);
    return {
      id: zone.id,
      name: zone.name || 'Зона',
      categoryName: zone.categoryName || '',
      area: zone.area || 0,
      total: roundMoney(items.reduce((sum, item) => sum + item.totalSale, 0)),
      items: options.detailLevel === 'detailed' || options.detailLevel === 'internal' ? items.map(item => filterClientRowByOptions(item, options)) : summarizeClientItems(items)
    };
  }).filter(zone => zone.items.length || zone.total);
}

function buildCostRows(project, settings, totals, multiplier) {
  const zoneName = id => (project.zones || []).find(z => z.id === id)?.name || '';
  const itemRows = (project.estimateItems || []).map(item => {
    const totalCost = itemCostRub(item, settings);
    return {
      id: item.id,
      sourceType: 'estimate-item',
      zoneId: item.zoneId || '',
      zoneName: zoneName(item.zoneId),
      section: sectionForCategory(item.category),
      name: item.name || 'Позиция',
      category: item.category || 'Оборудование',
      unit: item.unit || 'шт.',
      qty: Number(item.qty || 1),
      unitCost: Number(item.unitCost || 0),
      totalCost,
      totalSale: roundMoney(totalCost * multiplier),
      currency: item.currency || 'RUB',
      rate: item.currency === 'USD' ? settings.usdRate : 1,
      supplier: item.supplier || '',
      priceSource: item.priceSource || item.source || '',
      priceDate: item.priceDate || '',
      priceStatus: item.priceStatus || '',
      isManual: Boolean(item.isManual),
      isDerived: Boolean(item.isDerived),
      derivedKey: item.derivedKey || '',
      dependencies: item.dependencies || [],
      warnings: [item.requiresPriceRequest ? 'Нужно запросить цену' : '', item.requiresEngineerReview ? 'Нужна инженерная проверка' : ''].filter(Boolean),
      note: item.note || ''
    };
  });
  const workRows = [
    ['work-install', 'Монтажные работы', 'Монтажные работы', totals.installCost],
    ['work-pnr', 'ПНР', 'ПНР', totals.pnrCost],
    ['work-content', 'Документация и обучение', 'Контент / ПО', totals.contentCost],
    ['work-cables', 'Кабели и расходные материалы', 'Кабельная инфраструктура', totals.consumablesCost],
    ['work-construction', 'Монтажные работы', 'Строительные работы', totals.constructionCost],
    ['work-logistics', 'Логистика', 'Логистика', totals.logisticsCost],
    ['work-service', 'Сервис и гарантия', 'Сервис', totals.serviceCost]
  ].filter(([, , , cost]) => cost > 0).map(([id, section, category, totalCost]) => ({
    id,
    sourceType: 'calculated-work',
    zoneId: '',
    zoneName: '',
    section,
    name: category,
    category,
    unit: 'компл.',
    qty: 1,
    unitCost: totalCost,
    totalCost,
    totalSale: roundMoney(totalCost * multiplier),
    currency: 'RUB',
    rate: 1,
    supplier: '',
    priceSource: 'calculated',
    priceDate: '',
    priceStatus: 'calculated',
    isManual: false,
    isDerived: true,
    derivedKey: id,
    dependencies: [],
    warnings: [],
    note: 'Расчётная строка по настройкам проекта'
  }));
  return [...itemRows, ...workRows];
}

function toClientRow(row) {
  return {
    id: row.id,
    zoneId: row.zoneId,
    zoneName: row.zoneName,
    section: row.section,
    name: row.name,
    category: row.category,
    unit: row.unit,
    qty: row.qty,
    unitSalePrice: row.qty ? roundMoney(row.totalSale / row.qty) : row.totalSale,
    totalSale: row.totalSale,
    isOptional: false,
    description: clientDescription(row)
  };
}

function filterClientRowByOptions(row, options) {
  const out = { section: row.section, category: row.category, totalSale: row.totalSale, isOptional: row.isOptional };
  if (options.showEquipmentNames) out.name = row.name;
  else out.name = row.section === 'Оборудование' ? row.category : row.name;
  if (options.showQuantities) { out.qty = row.qty; out.unit = row.unit; }
  if (options.showUnitPrices) out.unitSalePrice = row.unitSalePrice;
  out.description = row.description;
  return out;
}

function summarizeClientItems(items = []) {
  const byCategory = groupProposalItems(items, 'sections');
  return Object.entries(byCategory).map(([title, rows]) => ({
    name: title,
    section: title,
    qty: rows.length,
    unit: 'групп',
    totalSale: roundMoney(rows.reduce((sum, row) => sum + row.totalSale, 0)),
    description: rows.slice(0, 4).map(row => row.category).filter(Boolean).join(', ')
  }));
}

function sectionForCategory(category = '') {
  if (['Монтажные работы','ПНР','Контент / ПО','Логистика','Сервис','Строительные работы'].includes(category)) return category === 'Контент / ПО' ? 'Документация и обучение' : category;
  if (String(category).toLowerCase().includes('кабель')) return 'Кабели и расходные материалы';
  if (EQUIPMENT_CATEGORIES.has(category)) return 'Оборудование';
  return 'Прочее';
}

function sectionOrder(title) {
  const index = CLIENT_SECTION_ORDER.indexOf(title);
  return index === -1 ? CLIENT_SECTION_ORDER.length : index;
}

function clientDescription(row) {
  if (row.sourceType === 'calculated-work') return 'Расчётная часть реализации проекта';
  return row.category || 'Позиция состава решения';
}

function summarizePriceSources(rows = []) {
  return rows.reduce((acc, row) => {
    const key = row.supplier || row.priceSource || 'Не указан';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function companyInfo(settings) {
  const ps = settings.proposalSettings || {};
  return {
    companyName: ps.companyName || 'П-Медиа',
    companyFullName: ps.companyFullName || 'ООО «П-Медиа»',
    inn: ps.inn || '7733899688',
    kpp: ps.kpp || '773301001',
    ogrn: ps.ogrn || '',
    legalAddress: ps.legalAddress || '125480, г. Москва, ул. Вилиса Лациса, д. 9, корп. 2, кв. 256',
    actualAddress: ps.actualAddress || '141401, Московская область, г. Химки, ул. Рабочая, д. 2А',
    bankAccount: ps.bankAccount || '40702810438000012696',
    bankName: ps.bankName || 'ПАО «Сбербанк России»',
    bik: ps.bik || '044525225',
    corrAccount: ps.corrAccount || '30101810400000000225',
    phone: ps.phone || '8 (495) 509-24-64',
    email: ps.email || 'info@mos99.ru',
    site: ps.site || 'www.mos99.ru'
  };
}

function projectInfo(project) {
  return {
    id: project.id,
    name: project.name || 'Новый AV-проект',
    customerName: project.customerName || '',
    type: project.passport?.projectType || '',
    city: project.passport?.city || project.passport?.cityTier || '',
    scenario: project.passport?.scenario || '',
    createdAt: project.createdAt || '',
    updatedAt: project.updatedAt || ''
  };
}

function buildSolutionSummary(project, projectType, zoneNames) {
  const zones = zoneNames.length ? zoneNames.slice(0, 5).join(', ') : 'типовые AV-зоны проекта';
  return [
    `Для проекта «${project.name || 'AV-проект'}» предлагается комплексное аудиовизуальное решение под формат ${projectType}.`,
    `Состав рассчитан по зонам: ${zones}${zoneNames.length > 5 ? ' и другие зоны' : ''}.`,
    'Решение включает оборудование, базовые работы по монтажу и пусконаладке, кабельную инфраструктуру и логистику в рамках указанных допущений.',
    'Финальная спецификация подлежит инженерной проверке перед закупкой и запуском работ.'
  ];
}

function defaultAssumptions(project) {
  return [
    'Расчёт выполнен по исходным данным, доступным на момент подготовки предложения.',
    'Точные трассы, крепления, питание и коммутация уточняются после обследования или получения проектной документации.',
    `Количество зон в расчёте: ${(project.zones || []).length || 0}.`,
    'Цены действуют в пределах срока действия КП и могут быть уточнены при изменении курса валют или наличия оборудования.'
  ];
}

function defaultExclusions() {
  return [
    'Строительные работы и подготовка проёмов, если они явно не включены в смету.',
    'Электропитание до точки подключения оборудования.',
    'Интернет, локальная сеть и IT-инфраструктура заказчика вне указанного состава.',
    'Производство контента, скрытые работы, ночные смены и согласования, если они не указаны отдельно.',
    'Разработка проектной документации стадии П/РД, если она не включена отдельной строкой.'
  ];
}

function buildTimeline(project) {
  const zones = Math.max(1, (project.zones || []).length);
  const installDays = Math.max(2, Math.ceil(zones * 1.5));
  const pnrDays = Math.max(1, Math.ceil(zones * 0.7));
  return {
    supply: 'ориентировочно 2–8 недель после аванса и подтверждения наличия',
    installation: `${installDays} рабочих дней после готовности площадки`,
    commissioning: `${pnrDays} рабочих дней`,
    total: 'ориентировочно 4–10 недель с учётом поставки оборудования'
  };
}
