import { canonicalSystemGroups, getZoneTemplate } from '../data/zoneTaxonomy.js';

export function buildZoneSystemModel(zone = {}) {
  const template = getZoneTemplate(zone.templateId);
  const requiredGroups = canonicalSystemGroups([
    ...(template?.requiredSystemGroups || []),
    ...(zone.requiredSystemGroups || [])
  ]);
  return {
    zoneId: zone.id || '',
    zoneName: zone.name || template?.name || 'Зона',
    categoryId: zone.categoryId || template?.categoryId || '',
    templateId: zone.templateId || '',
    requiredGroups,
    requiredDependencies: [...new Set([...(template?.requiredDependencies || []), ...(zone.requiredDependencies || [])])],
    typicalWorks: [...new Set([...(template?.typicalWorks || []), ...(zone.typicalWorks || [])])]
  };
}

export function buildProjectSystemModel(project = {}) {
  return (project.zones || []).map(buildZoneSystemModel);
}
