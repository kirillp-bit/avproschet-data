import { AV_ROLE_SCORING_RULES, ROLE_ALIASES, TEMPLATE_CATEGORY_TO_ROLE } from '../data/roleScoringRules.js';

const RULES_BY_ID = Object.fromEntries(AV_ROLE_SCORING_RULES.map(rule => [rule.id, rule]));
const ACCESSORY_TERMS = [
  'mount', 'bracket', 'wall mount', 'ceiling mount', 'крепление', 'крепления', 'кронштейн', 'кронштейны', 'подвес',
  'cable', 'кабель', 'patch cord', 'патч-корд', 'adapter', 'адаптер', 'connector', 'коннектор', 'разъем',
  'accessory', 'аксессуар', 'аксессуары', 'case', 'carry case', 'чехол', 'кейс', 'сумка', 'пульт', 'remote control', 'lamp', 'лампа', 'battery', 'аккумулятор',
  'module spare', 'запасной модуль', 'полка', 'shelf', 'organizer', 'органайзер'
];

export function normalizeRoleText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[–—]/g, '-')
    .replace(/[^a-zа-я0-9+#./\-\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function itemRoleText(item = {}) {
  if (item.__roleText) return item.__roleText;
  return normalizeRoleText([
    item.name, item.brand, item.model, item.article, item.supplierSku,
    item.category, item.supplierCategory, item.sourceCategory, item.categoryId, item.subcategoryId,
    item.description, item.note, ...(item.tags || []), ...(item.systemGroups || [])
  ].filter(Boolean).join(' '));
}

function termHit(text, term) {
  const t = normalizeRoleText(term);
  if (!t) return false;
  if (/^[a-z0-9]+$/i.test(t) && t.length <= 3) return new RegExp(`(^|\\s)${escapeRegExp(t)}($|\\s)`, 'i').test(text);
  return text.includes(t);
}

function hits(text, terms = []) { return terms.filter(term => termHit(text, term)); }
function contextHits(text, groups = []) { return groups.filter(group => group.every(term => termHit(text, term))).map(group => group.join(' + ')); }
function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function canonicalTemplateRole(roleOrCategory = '') {
  const exactCategory = TEMPLATE_CATEGORY_TO_ROLE[roleOrCategory];
  if (exactCategory) return exactCategory;
  const normalized = normalizeRoleText(roleOrCategory);
  return ROLE_ALIASES[normalized] || normalized || 'equipment';
}

export function templateRoleForCategory(category = '') {
  const roleId = canonicalTemplateRole(category);
  return RULES_BY_ID[roleId]?.label || category || 'equipment';
}

export function roleRuleFor(roleOrCategory = '') {
  return RULES_BY_ID[canonicalTemplateRole(roleOrCategory)] || null;
}

export function scoreRoleFit(item = {}, roleOrCategory = '', options = {}) {
  const roleId = canonicalTemplateRole(roleOrCategory || item.templateRole || item.replacementGroup || item.category || '');
  const rule = RULES_BY_ID[roleId];
  if (!rule) {
    return { roleId, roleLabel: roleOrCategory || roleId, score: 0, minScore: 999, passed: false, needsEngineerReview: true, reason: 'Нет scoring-rule для роли' };
  }

  const text = itemRoleText(item);
  const positiveHits = hits(text, rule.positives);
  const contextualHits = contextHits(text, rule.contextual);
  const negativeHits = hits(text, rule.negatives);
  const accessoryHits = hits(text, ACCESSORY_TERMS);
  const categoryText = normalizeRoleText([item.category, item.supplierCategory, item.categoryId, item.subcategoryId, item.replacementGroup, options.category].filter(Boolean).join(' '));
  const categoryHits = rule.categories.filter(category => termHit(categoryText, category));
  const brandHits = hits(normalizeRoleText([item.brand, item.supplier, item.supplierName].filter(Boolean).join(' ')), rule.brandHints || []);

  let score = 0;
  score += Math.min(55, positiveHits.length * 18);
  score += Math.min(36, contextualHits.length * 24);
  score += Math.min(26, categoryHits.length * 18);
  score += Math.min(8, brandHits.length * 4);
  if (item.relevance === 'av_core' || item.catalogRelevance === 'av_core') score += 8;
  if (item.relevance === 'av_infrastructure' || item.catalogRelevance === 'av_infrastructure') score += rule.allowAccessories ? 8 : 2;
  if (item.approvedForAutoEstimate || item.isPreferredForTemplates) score += 4;
  score -= Math.min(80, negativeHits.length * 30);
  if (rule.disallowAccessories && accessoryHits.length) score -= Math.min(55, accessoryHits.length * 20);

  const bounded = Math.max(0, Math.min(100, Math.round(score)));
  const closeToThreshold = bounded >= Math.max(1, rule.minScore - 8) && bounded < rule.minScore;
  const conflicting = negativeHits.length > 0 && positiveHits.length > 0;
  const needsEngineerReview = Boolean(item.requiresCatalogReview || closeToThreshold || conflicting || (item.relevance === 'questionable' || item.catalogRelevance === 'questionable'));
  const reasonParts = [];
  if (positiveHits.length) reasonParts.push(`positive: ${positiveHits.slice(0, 4).join(', ')}`);
  if (contextualHits.length) reasonParts.push(`context: ${contextualHits.slice(0, 3).join(', ')}`);
  if (categoryHits.length) reasonParts.push(`category: ${categoryHits.slice(0, 3).join(', ')}`);
  if (negativeHits.length) reasonParts.push(`negative: ${negativeHits.slice(0, 4).join(', ')}`);
  if (rule.disallowAccessories && accessoryHits.length) reasonParts.push(`accessory penalty: ${accessoryHits.slice(0, 4).join(', ')}`);

  return {
    roleId: rule.id,
    roleLabel: rule.label,
    score: bounded,
    minScore: rule.minScore,
    passed: bounded >= rule.minScore,
    needsEngineerReview,
    reason: reasonParts.join('; ') || 'Нет явных role-маркеров'
  };
}

export function enrichItemRoleFit(item = {}, roleOrCategory = '', options = {}) {
  const fit = scoreRoleFit(item, roleOrCategory, options);
  return {
    ...item,
    templateRole: fit.roleLabel,
    templateRoleId: fit.roleId,
    roleFitScore: fit.score,
    roleFitMinScore: fit.minScore,
    roleFitReason: fit.reason,
    needsEngineerReview: Boolean(item.needsEngineerReview || fit.needsEngineerReview),
    requiresEngineerReview: Boolean(item.requiresEngineerReview || fit.needsEngineerReview)
  };
}

export function roleFitPasses(item = {}, roleOrCategory = '', options = {}) {
  return scoreRoleFit(item, roleOrCategory, options).passed;
}

export { AV_ROLE_SCORING_RULES, TEMPLATE_CATEGORY_TO_ROLE };
