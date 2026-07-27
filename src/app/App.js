import { registerRoute, startRouter } from './router.js';
import { mountWelcomeIntro } from '../components/WelcomeIntro.js';
import { mountAccessGate } from '../components/AccessGate.js';

const root = document.getElementById('app');

registerRoute('projects', () => import('../pages/ProjectsPage.js').then(m => m.ProjectsPage));
registerRoute('passport', () => import('../pages/PassportPage.js').then(m => m.PassportPage));
registerRoute('zones', () => import('../pages/ZonesPage.js').then(m => m.ZonesPage));
registerRoute('estimate', () => import('../pages/EstimatePage.js').then(m => m.EstimatePage));
registerRoute('check', () => import('../pages/CheckPage.js').then(m => m.CheckPage));
registerRoute('proposal', () => import('../pages/ProposalPage.js').then(m => m.ProposalPage));
registerRoute('library', () => import('../pages/LibraryPage.js').then(m => m.LibraryPage));
registerRoute('settings', () => import('../pages/SettingsPage.js').then(m => m.SettingsPage));

let appStarted = false;
function startApp() {
  if (appStarted) return;
  appStarted = true;
  startRouter(root);
  mountWelcomeIntro();
}

mountAccessGate(startApp);
