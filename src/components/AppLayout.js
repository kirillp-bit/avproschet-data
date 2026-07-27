import { currentRoute, navigate } from '../app/router.js';
import { getProject, persistProject, setProject, getUiMode, setUiMode } from '../app/state.js';
import { createAndSaveProject } from '../app/storage.js';
import { exportProject } from '../export/exportJson.js';
import { downloadText, toast } from '../utils/dom.js';
import { StepNav } from './StepNav.js';
import { ProjectSummaryBar } from './ProjectSummaryBar.js';

const expertRoutes = [['library','Библиотека'], ['settings','Настройки']];

export function AppLayout(contentHtml) {
  const p = getProject();
  const uiMode = getUiMode();
  const engineering = uiMode === 'engineering';
  return `<div class="appShell ${engineering ? 'engineeringMode' : 'quickMode'}" data-ui-mode="${uiMode}">
    <div class="topbar">
      <section class="brand"><div class="brandMark">А</div><div><h1>AV пресейл-калькулятор АВ-ПРОСЧЁТ</h1><p>Проект → зоны → смета → проверка → КП.</p></div></section>
      <section class="panel topActions">
        <div class="modeToggle" role="group" aria-label="Режим интерфейса"><button class="btn ${!engineering ? 'primary' : 'ghost'} small" data-ui-mode-set="quick">Быстрый пресейл</button><button class="btn ${engineering ? 'primary' : 'ghost'} small" data-ui-mode-set="engineering">Инженерная проверка</button></div>
        ${p ? `<button class="btn ghost" data-action="save-current">Сохранить</button><button class="btn ghost" data-action="export-current">JSON</button>` : ''}
        <button class="btn primary" data-action="new-project">Новый расчёт</button>
      </section>
    </div>
    ${StepNav(p)}
    ${ProjectSummaryBar(p)}
    <div class="layout">
      <aside class="panel sidebar">
        <div class="navGroupTitle">Дополнительно</div>${nav(expertRoutes)}
      </aside>
      <main class="panel content"><div class="page">${contentHtml}</div></main>
    </div>
  </div>`;
}
function nav(routes){ const active=currentRoute(); return routes.map(([id,name])=>`<a href="#/${id}" data-route="${id}" class="navLink ${active===id?'active':''}"><span>${name}</span></a>`).join(''); }
export function bindLayoutActions(root) {
  root.querySelector('[data-action="new-project"]')?.addEventListener('click', () => { const p = createAndSaveProject(); setProject(p); navigate('passport'); });
  root.querySelector('[data-action="save-current"]')?.addEventListener('click', () => { persistProject(); toast('Проект сохранён'); });
  root.querySelector('[data-action="export-current"]')?.addEventListener('click', () => {
    const p = getProject(); if (!p) return;
    downloadText(`${p.name || 'project'}.json`, exportProject(p));
  });
  root.querySelectorAll('[data-ui-mode-set]').forEach(btn => btn.addEventListener('click', () => { setUiMode(btn.dataset.uiModeSet); toast(btn.dataset.uiModeSet === 'engineering' ? 'Включена инженерная проверка' : 'Включён быстрый пресейл'); window.dispatchEvent(new HashChangeEvent('hashchange')); }));
}
