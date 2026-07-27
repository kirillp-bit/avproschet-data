import { AppLayout, bindLayoutActions } from '../components/AppLayout.js';
import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';
import { ProjectCard } from '../components/ProjectCard.js';
import { listProjects, createAndSaveProject, deleteProject, duplicateAndSaveProject, readProject } from '../app/storage.js';
import { setProject } from '../app/state.js';
import { navigate } from '../app/router.js';
import { toast } from '../utils/dom.js';
import { parseProjectJson, importProject } from '../export/exportJson.js';

export function ProjectsPage(root) {
  const projects = listProjects();
  root.innerHTML = AppLayout(`${PageHeader({ title: 'Проекты', description: 'Выберите расчёт или создайте новый.', actions: '<button class="btn primary" data-new-project>Создать первый проект</button><label class="btn ghost">Импортировать проект<input type="file" accept="application/json" data-import-json hidden></label>' })}
  ${projects.length ? `<div class="grid cols2">${projects.map(ProjectCard).join('')}</div>` : EmptyState({ title: 'Пока нет проектов', text: 'Создайте первый расчёт или импортируйте сохранённый JSON.', actions: '<button class="btn primary" data-new-project>Создать первый проект</button><label class="btn ghost">Импортировать проект<input type="file" accept="application/json" data-import-json hidden></label>' })}`);
  bindLayoutActions(root);
  root.querySelectorAll('[data-new-project]').forEach(btn => btn.addEventListener('click', () => { const p = createAndSaveProject(); setProject(p); navigate('passport'); }));
  root.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => { setProject(readProject(btn.dataset.open)); navigate('passport'); }));
  root.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => { if(confirm('Удалить проект?')) { deleteProject(btn.dataset.delete); toast('Проект удалён'); ProjectsPage(root); } }));
  root.querySelectorAll('[data-duplicate]').forEach(btn => btn.addEventListener('click', () => { const p = duplicateAndSaveProject(readProject(btn.dataset.duplicate)); setProject(p); toast('Проект продублирован'); ProjectsPage(root); }));
  root.querySelectorAll('[data-import-json]').forEach(input => input.addEventListener('change', async e => {
    const file = e.target.files?.[0]; if(!file) return;
    try { const parsed = await parseProjectJson(await file.text()); const p = importProject(parsed.project, parsed.conflict ? 'copy' : 'replace'); setProject(p); toast('JSON импортирован'); navigate('passport'); } catch (error) { alert(error?.message || 'Не удалось импортировать JSON'); }
  }));
}
