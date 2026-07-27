import { classifySupplierItem } from './catalogRelevance.js';

const IT_REQUIRED_TERMS = ['media server', 'media player', 'mini pc', 'workstation', 'nas', 'vr', 'interactive', 'signage', 'медиасервер', 'медиаплеер', 'мини-пк', 'рабочая станция', 'интерактив', 'диспетчерская'];
function contextText(context = {}) { const zone = context.zone || {}; const template = context.template || {}; return [context.requiredCategory, context.source, zone.name, zone.categoryId, zone.templateId, zone.purpose, zone.primaryTask, template.id, template.name, template.description, ...(zone.requiredSystemGroups || []), ...(template.requiredSystemGroups || [])].filter(Boolean).join(' ').toLowerCase().replace(/ё/g, 'е'); }
export function templateRequiresIt(context = {}) { const text = contextText(context); return IT_REQUIRED_TERMS.some(term => text.includes(term.replace(/ё/g, 'е'))); }
export function canUseItemInAutoEstimate(item = {}, context = {}) {
  const c = classifySupplierItem(item);
  if (item.curated || (!item.supplier && !item.supplierId)) return { allowed: c.relevance !== 'hidden' && c.relevance !== 'questionable', reason: 'curated catalog item' };
  if (c.relevance === 'av_core' || c.relevance === 'av_infrastructure' || c.relevance === 'service') return { allowed: true, reason: c.relevanceReason || 'AV-релевантная supplier-позиция' };
  if (c.relevance === 'it_related') {
    const linked = Boolean(c.approvedForAutoEstimate || item.approvedForAutoEstimate || (item.zoneTemplateIds || []).length || (item.installationTemplateIds || []).length);
    if (linked && templateRequiresIt(context)) return { allowed: true, reason: 'IT-позиция явно связана с медиасервером/шаблоном' };
    return { allowed: false, reason: 'IT-позиция не используется в автосмете без явной связи с шаблоном' };
  }
  if (c.relevance === 'questionable') return { allowed: false, reason: 'Спорная позиция требует ручного подтверждения' };
  if (c.relevance === 'hidden') return { allowed: false, reason: 'Скрытая позиция запрещена для автосметы' };
  return { allowed: false, reason: 'Позиция не прошла фильтр качества каталога' };
}
export function filterAutoEstimateCandidates(items = [], context = {}) { return items.filter(item => canUseItemInAutoEstimate(item, context).allowed); }
