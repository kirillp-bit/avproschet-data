import { createProject, duplicateProject, normalizeProject } from '../engine/projectFactory.js';
const INDEX_KEY = 'avproschet.stage1.projects.index';
const PROJECT_KEY = id => `avproschet.stage1.projects.${id}`;
const SETTINGS_KEY = 'avproschet.stage1.settings';

function safeStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = '__avproschet_storage_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

function readJson(key, fallback) {
  const storage = safeStorage();
  if (!storage) return fallback;
  try { return JSON.parse(storage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}

function writeJson(key, value) {
  const storage = safeStorage();
  if (!storage) return value;
  storage.setItem(key, JSON.stringify(value));
  return value;
}

export function listProjects() {
  const ids = readJson(INDEX_KEY, []);
  return ids.map(id => readProject(id)).filter(Boolean).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
export function readProject(id) {
  const storage = safeStorage();
  if (!storage || !id) return null;
  const raw = storage.getItem(PROJECT_KEY(id));
  if (!raw) return null;
  try { return normalizeProject(JSON.parse(raw)); } catch { return null; }
}
export function saveProject(project) {
  const normalized = normalizeProject(project || {});
  normalized.updatedAt = new Date().toISOString();
  const storage = safeStorage();
  if (!storage) return normalized;
  storage.setItem(PROJECT_KEY(normalized.id), JSON.stringify(normalized));
  const ids = new Set(readJson(INDEX_KEY, [])); ids.add(normalized.id);
  writeJson(INDEX_KEY, [...ids]);
  return normalized;
}
export function deleteProject(id) {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(PROJECT_KEY(id));
  const ids = readJson(INDEX_KEY, []).filter(x => x !== id);
  writeJson(INDEX_KEY, ids);
}
export function createAndSaveProject(seed = {}) { return saveProject(createProject(seed)); }
export function duplicateAndSaveProject(project) { return saveProject(duplicateProject(project)); }
export function exportProject(project) { return JSON.stringify(normalizeProject(project), null, 2); }
export function importProject(jsonText) {
  const parsed = JSON.parse(jsonText);
  const project = normalizeProject(parsed?.project || parsed);
  return saveProject(project);
}
export function readSettings() { return readJson(SETTINGS_KEY, {}); }
export function saveSettings(settings) { return writeJson(SETTINGS_KEY, settings || {}); }
