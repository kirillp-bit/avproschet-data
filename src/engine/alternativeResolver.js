import { ITEM_ALTERNATIVES } from '../data/itemAlternatives.js';

const levelOrder = ['budget', 'standard', 'premium', 'expert', 'custom'];

export function getItemAlternatives(item = {}, library = [], limit = 8) {
  const explicit = ITEM_ALTERNATIVES
    .filter(alt => alt.sourceItemId === item.id)
    .map(alt => ({ ...alt, item: library.find(candidate => candidate.id === alt.alternativeItemId) }))
    .filter(alt => alt.item);
  const generated = library
    .filter(candidate => candidate.id !== item.id)
    .filter(candidate => candidate.subcategoryId === item.subcategoryId || candidate.categoryId === item.categoryId)
    .map(candidate => ({ id: `generated-alt-${item.id}-${candidate.id}`, sourceItemId: item.id, alternativeItemId: candidate.id, alternativeType: alternativeType(item, candidate), priceDeltaMode: priceDelta(item, candidate), comment: generatedComment(item, candidate), item: candidate }))
    .sort((a, b) => altRank(a.alternativeType) - altRank(b.alternativeType) || Math.abs(Number(a.item.unitCost || 0) - Number(item.unitCost || 0)) - Math.abs(Number(b.item.unitCost || 0) - Number(item.unitCost || 0)));
  const seen = new Set();
  return [...explicit, ...generated].filter(alt => {
    if (seen.has(alt.alternativeItemId)) return false;
    seen.add(alt.alternativeItemId);
    return true;
  }).slice(0, limit);
}

export function replacementImpact(source = {}, alternative = {}) {
  const sourceCost = Number(source.unitCost || 0);
  const alternativeCost = Number(alternative.unitCost || 0);
  return {
    priceDelta: alternativeCost - sourceCost,
    priceDeltaPct: sourceCost ? ((alternativeCost - sourceCost) / sourceCost) * 100 : 0,
    sourceLevel: source.solutionLevel || source.scenario || 'standard',
    alternativeLevel: alternative.solutionLevel || alternative.scenario || 'standard',
    levelDelta: levelOrder.indexOf(alternative.solutionLevel) - levelOrder.indexOf(source.solutionLevel),
    dependencyWarning: (alternative.dependencies || []).length !== (source.dependencies || []).length
  };
}

function alternativeType(source, candidate) {
  const sourceLevel = source.solutionLevel || 'standard';
  const candidateLevel = candidate.solutionLevel || 'standard';
  if (candidate.supplier && source.supplier && candidate.supplier === source.supplier) return 'preferredSupplier';
  if (candidate.leadTime && source.leadTime && Number(candidate.leadTime) < Number(source.leadTime)) return 'fasterDelivery';
  if (levelOrder.indexOf(candidateLevel) < levelOrder.indexOf(sourceLevel)) return 'budget';
  if (levelOrder.indexOf(candidateLevel) > levelOrder.indexOf(sourceLevel)) return 'premium';
  if (candidateLevel === 'standard') return 'standard';
  return 'sameLevel';
}
function priceDelta(source, candidate) {
  const delta = Number(candidate.unitCost || 0) - Number(source.unitCost || 0);
  if (delta < 0) return 'cheaper';
  if (delta > 0) return 'moreExpensive';
  return 'same';
}
function generatedComment(source, candidate) {
  const delta = Number(candidate.unitCost || 0) - Number(source.unitCost || 0);
  const sign = delta > 0 ? '+' : '';
  return `Автоподбор: та же категория, уровень ${candidate.solutionLevel || 'standard'}, изменение цены ${sign}${Math.round(delta).toLocaleString('ru-RU')}.`;
}
function altRank(type) {
  return { sameLevel: 1, standard: 2, budget: 3, premium: 4, preferredSupplier: 5, fasterDelivery: 6 }[type] || 9;
}
