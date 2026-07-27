import { escapeHtml } from '../utils/format.js';
import { dependenciesForItem } from '../engine/dependencyResolver.js';
import { rootCategoryName, subcategoryName } from '../data/equipmentCategories.js';

export function DependencyList(item) {
  const deps = dependenciesForItem(item);
  if (!deps.length) return '<div class="muted smallText">Для позиции нет описанных зависимостей.</div>';
  return `<div class="miniList">${deps.map(dep => `<div class="miniListItem"><span class="badge ${dep.required ? 'warn' : ''}">${dep.required ? 'required' : 'recommended'}</span><strong>${escapeHtml(dep.fallbackName || subcategoryName(dep.targetCategoryId) || rootCategoryName(dep.targetCategoryId))}</strong><small>${escapeHtml(dep.reason || '')}</small></div>`).join('')}</div>`;
}
