import { parseProjectJson, importProject } from '../export/exportJson.js';
import { setProject } from '../app/state.js';
import { navigate } from '../app/router.js';
import { toast } from '../utils/dom.js';

export function bindImportProjectInput(root) {
  root.querySelectorAll('[data-import-json]').forEach(input => input.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseProjectJson(file);
      let mode = 'replace';
      if (data.conflict) {
        const asCopy = confirm('Проект с таким id уже есть. Нажмите OK, чтобы импортировать как копию, или Отмена, чтобы заменить существующий проект.');
        mode = asCopy ? 'copy' : 'replace';
      }
      const project = importProject(data.project, mode);
      setProject(project);
      toast(data.sanitized ? 'Проект импортирован, потенциально опасная разметка была очищена' : 'Проект импортирован');
      navigate('passport');
    } catch (error) {
      alert(error?.message || 'Не удалось импортировать проект');
    } finally {
      event.target.value = '';
    }
  }));
}
