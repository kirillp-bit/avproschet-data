export { ZONE_TEMPLATES, getZoneTemplate, getTemplatesForProject } from './zoneTaxonomy.js';
export function templatesForCategory(categoryId, templates = null) {
  const source = templates || [];
  return source.filter(t => t.categoryId === categoryId);
}
