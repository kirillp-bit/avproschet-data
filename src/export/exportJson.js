import { readProject, saveProject } from '../app/storage.js';
import { createId } from '../utils/ids.js';
import { normalizeProject } from '../engine/projectFactory.js';
import { buildClientProposalView, buildInternalEstimateView } from '../engine/proposalBuilder.js';
import { calculateProjectTotals } from '../engine/pricing.js';
import { validateProject } from '../engine/validation.js';
import { downloadText } from '../utils/dom.js';
import { safeFileName, dateStamp } from './exportHtml.js';
import { hasSuspiciousMarkup, sanitizeImportedProject } from '../utils/sanitize.js';

export const CURRENT_PROJECT_SCHEMA_VERSION = 9;
export const APP_VERSION = 'stage9-security-hotfix';

export function exportProjectJson(project) {
  const cleanProject = stripRuntimeProject(project);
  const payload = {
    exportMetadata: {
      schemaVersion: CURRENT_PROJECT_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      source: 'AV-PROSCHET AV presales calculator',
      checksum: checksum(JSON.stringify(cleanProject))
    },
    project: cleanProject,
    calculatedTotals: calculateProjectTotals(cleanProject),
    validationWarnings: validateProject(cleanProject)
  };
  return JSON.stringify(payload, null, 2);
}

export function exportProject(project) { return exportProjectJson(project); }

export function downloadProjectJson(project) {
  downloadText(safeFileName(`AVPROSCHET_project_${project.name || 'project'}_${dateStamp()}.json`), exportProjectJson(project), 'application/json');
}

export async function parseProjectJson(fileOrText) {
  const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error('Файл не является корректным JSON.'); }
  const suspicious = hasSuspiciousMarkup(text);
  const migrated = migrateProjectSchema(raw);
  const sanitized = sanitizeImportedProject(migrated);
  const project = validateImportedProject(sanitized);
  let conflict = false;
  try { conflict = Boolean(typeof localStorage !== 'undefined' && project.id && readProject(project.id)); } catch { conflict = false; }
  return { project, conflict, sanitized: suspicious };
}

export function validateImportedProject(data) {
  const candidate = data?.project || data;
  if (!candidate || typeof candidate !== 'object') throw new Error('В файле не найден объект проекта АВ-ПРОСЧЁТ.');
  if (!candidate.id || !candidate.name) throw new Error('В проекте отсутствуют ключевые поля id/name.');
  if (!Array.isArray(candidate.zones)) throw new Error('Поле zones должно быть массивом.');
  if (!Array.isArray(candidate.estimateItems) && !Array.isArray(candidate.estimate)) throw new Error('Поле estimateItems должно быть массивом.');
  const normalized = normalizeProject({...candidate, schemaVersion: candidate.schemaVersion || CURRENT_PROJECT_SCHEMA_VERSION});
  normalized.schemaVersion = CURRENT_PROJECT_SCHEMA_VERSION;
  normalized.appVersion = APP_VERSION;
  return normalized;
}

export function migrateProjectSchema(data) {
  const wrapper = data?.project ? {...data, project: {...data.project}} : { project: {...data} };
  const project = wrapper.project;
  project.schemaVersion = Number(project.schemaVersion || data?.exportMetadata?.schemaVersion || 1);
  if (!project.estimateItems && project.estimate) project.estimateItems = project.estimate;
  if (!project.proposalOptions) project.proposalOptions = {};
  if (!project.acceptedWarnings) project.acceptedWarnings = [];
  if (!project.settingsOverrides) project.settingsOverrides = {};
  if (!project.notes) project.notes = '';
  if (project.schemaVersion < CURRENT_PROJECT_SCHEMA_VERSION) {
    project.schemaVersion = CURRENT_PROJECT_SCHEMA_VERSION;
    project.migratedAt = new Date().toISOString();
  }
  return wrapper;
}

export function importProject(data, mode = 'replace') {
  const project = normalizeProject(data?.project || data);
  if (mode === 'copy') {
    project.id = createId('project');
    project.name = `${project.name || 'Проект'} · импорт`;
    project.createdAt = new Date().toISOString();
  }
  project.updatedAt = new Date().toISOString();
  project.schemaVersion = CURRENT_PROJECT_SCHEMA_VERSION;
  return saveProject(project);
}

export function stripRuntimeProject(project = {}) {
  const allowed = {
    id: project.id,
    name: project.name,
    customerName: project.customerName || '',
    proposalNumber: project.proposalNumber || '',
    customerContact: project.customerContact || '',
    managerContact: project.managerContact || '',
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    status: project.status,
    passport: project.passport || {},
    zones: project.zones || [],
    estimateItems: project.estimateItems || [],
    acceptedWarnings: project.acceptedWarnings || [],
    proposalOptions: project.proposalOptions || {},
    settingsOverrides: project.settingsOverrides || {},
    notes: project.notes || '',
    schemaVersion: CURRENT_PROJECT_SCHEMA_VERSION,
    appVersion: APP_VERSION
  };
  return JSON.parse(JSON.stringify(allowed));
}

export function buildExportSnapshot(project, settings = null, proposalOptions = null) {
  return {
    internalEstimateView: buildInternalEstimateView(project, settings),
    clientProposalView: buildClientProposalView(project, settings, proposalOptions)
  };
}

function checksum(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(16);
}
