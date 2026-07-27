import { validateProject } from './validation.js';
import { resolveMissingDependencies } from './dependencyResolver.js';

const RULES = [
  { id: 'display-mount', item: /lcd|панел|display|монитор/i, required: /креп|mount|конструк/i, title: 'Дисплей без крепления' },
  { id: 'projector-screen', item: /проектор/i, required: /экран/i, title: 'Проектор без экрана' },
  { id: 'led-processor', item: /led/i, required: /процессор|controller|контроллер/i, title: 'LED без процессора' },
  { id: 'led-power', item: /led/i, required: /пит|pdu|ups|ибп/i, title: 'LED без питания' },
  { id: 'vcs-audio', item: /вкс|teams|zoom|video conference/i, required: /аудио|микрофон|dsp|акуст/i, title: 'ВКС без аудио' },
  { id: 'speaker-amplifier', item: /акуст|speaker/i, required: /усил|amplifier|dsp/i, title: 'Акустика без усилителя' },
  { id: 'rack-pdu', item: /стойк|rack/i, required: /pdu|пит|ибп/i, title: 'Стойка без PDU' }
];

export function validateAvSystem(project = {}) {
  const items = project.estimateItems || [];
  const text = items.map(i => `${i.name || ''} ${i.category || ''}`).join('\n');
  const warnings = [];
  for (const rule of RULES) {
    if (rule.item.test(text) && !rule.required.test(text)) {
      warnings.push({ id: `av-${rule.id}`, type: 'engineering', severity: 'warning', title: rule.title, message: 'Проверьте обязательную системную связку в составе сметы.' });
    }
  }
  for (const zone of project.zones || []) {
    const complex = zone.requiresEngineerReview || Number(zone.area || 0) >= 80 || ['hall','stage','event'].includes(zone.type);
    const hasPnr = items.some(i => i.zoneId === zone.id && /пнр|налад/i.test(`${i.name || ''} ${i.category || ''}`));
    if (complex && !hasPnr) warnings.push({ id: `av-zone-pnr-${zone.id}`, type: 'engineering', severity: 'warning', title: 'Сложная зона без ПНР', message: `Для зоны «${zone.name || 'Зона'}» желательно предусмотреть ПНР.` });
  }
  resolveMissingDependencies(project).forEach(dep => warnings.push({ id: `av-dep-${dep.id}`, type: 'engineering', severity: dep.required ? 'warning' : 'recommendation', title: dep.required ? 'Не закрыта обязательная зависимость' : 'Не закрыта рекомендуемая зависимость', message: `${dep.sourceItemName} → ${dep.fallbackName}` }));
  return warnings;
}

export function validateAvProject(project = {}, settings = null) {
  return [...validateProject(project, settings), ...validateAvSystem(project)];
}
