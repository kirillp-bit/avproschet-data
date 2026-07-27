import { readProject, saveProject, createAndSaveProject, readSettings, saveSettings } from './storage.js';
import { DEFAULT_SETTINGS } from '../data/defaultSettings.js';
let currentProject = null;
let appSettings = {...DEFAULT_SETTINGS, ...readSettings()};
const listeners = new Set();
export function getProject() { return currentProject; }
export function setProject(project, persist = false) { currentProject = project; if (persist && project) saveProject(project); emit(); }
export function ensureProject() { if (!currentProject) currentProject = createAndSaveProject(); return currentProject; }
export function openProject(id) { const p = readProject(id); if (p) setProject(p); return p; }
export function persistProject() { if (currentProject) saveProject(currentProject); emit(); }
export function getSettings() { return appSettings; }
export function getUiMode() { return appSettings.uiMode === 'engineering' ? 'engineering' : 'quick'; }
export function setUiMode(mode = 'quick') { updateSettings({ uiMode: mode === 'engineering' ? 'engineering' : 'quick' }); }
export function updateSettings(patch) { appSettings = {...appSettings, ...patch}; saveSettings(appSettings); emit(); }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(fn => fn()); }
