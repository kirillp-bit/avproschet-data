import { escapeHtml } from '../utils/format.js';
const routes = new Map();
const resolvedRoutes = new Map();
let renderVersion = 0;

export function registerRoute(id, rendererOrLoader) {
  routes.set(id, rendererOrLoader);
}

export function currentRoute() {
  const hash = globalThis.location?.hash || globalThis.window?.location?.hash || '#/projects';
  return (hash.replace('#/','').split('?')[0]) || 'projects';
}

export function navigate(route) {
  if (globalThis.location) globalThis.location.hash = `#/${escapeHtml(route)}`;
  else if (globalThis.window?.location) globalThis.window.location.hash = `#/${escapeHtml(route)}`;
}

async function resolveRenderer(route) {
  if (resolvedRoutes.has(route)) return resolvedRoutes.get(route);
  const entry = routes.get(route) || routes.get('projects');
  const maybeRenderer = entry();
  const renderer = typeof maybeRenderer?.then === 'function' ? await maybeRenderer : maybeRenderer;
  resolvedRoutes.set(route, renderer);
  return renderer;
}

function setActiveRoute(route) {
  document.querySelectorAll('[data-route]').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

function renderLoading(root, route) {
  root.innerHTML = `<main class="appShell loadingShell"><section class="card"><div class="sectionTitle"><div><h2>Открываем страницу</h2><p class="muted">Загружается модуль ${escapeHtml(route)}.</p></div><span class="badge">быстрый режим</span></div></section></main>`;
}

export function startRouter(root) {
  const render = async () => {
    const route = currentRoute();
    const version = ++renderVersion;
    const loadingTimer = setTimeout(() => renderLoading(root, route), 80);
    try {
      const renderer = await resolveRenderer(route);
      clearTimeout(loadingTimer);
      if (version !== renderVersion) return;
      renderer(root);
      setActiveRoute(route);
    } catch (error) {
      clearTimeout(loadingTimer);
      console.error('Route render failed', error);
      if (version !== renderVersion) return;
      root.innerHTML = `<main class="appShell"><section class="card"><h2>Страница не открылась</h2><p class="muted">Попробуйте обновить приложение. Ошибка не должна приводить к белому экрану.</p><pre>${escapeHtml(String(error?.message || error))}</pre><a class="btn primary" href="#/projects">К проектам</a></section></main>`;
    }
  };
  window.addEventListener('hashchange', render);
  render();
}
