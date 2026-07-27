import { canonicalSystemGroups } from '../data/zoneTaxonomy.js';
import { canonicalTemplateRole } from './roleScoring.js';

const CATEGORY_TO_GROUPS = {
  'ВКС-системы': ['video', 'audio', 'control', 'ВКС-системы'],
  'Конференц-системы': ['audio', 'control', 'Конференц-системы', 'Микрофоны'],
  'LCD-панели': ['video', 'display', 'LCD-панели'],
  'Мониторы': ['video', 'display', 'LCD-панели'],
  'LED-экраны': ['video', 'display', 'LED-экраны'],
  'Видеостены': ['video', 'display', 'LED-экраны'],
  'Проекторы': ['video', 'display', 'Проекторы'],
  'Проекционные экраны': ['video', 'display', 'Проекционные экраны'],
  'Интерактивные панели': ['video', 'display', 'control', 'interactive', 'Интерактивные панели'],
  'Микрофоны': ['audio', 'Микрофоны'],
  'Акустика': ['audio', 'Акустика'],
  'DSP и усилители': ['audio', 'DSP и усилители'],
  'Коммутация': ['video', 'network', 'signal', 'Коммутация'],
  'Сеть': ['network', 'Сеть'],
  'Кабельная инфраструктура': ['cabling', 'signal', 'Кабельная инфраструктура'],
  'Крепления и конструкции': ['mounting', 'Крепления и конструкции'],
  'Медиасерверы': ['video', 'content', 'network', 'Медиасерверы'],
  'ПК': ['video', 'content', 'network', 'Медиасерверы', 'ПК'],
  'PTZ-камеры': ['video', 'camera', 'ВКС-системы', 'PTZ-камеры'],
  'Камеры': ['video', 'camera', 'PTZ-камеры'],
  'Свет': ['lighting', 'Свет'],
  'VR / AR': ['video', 'interactive', 'content', 'VR / AR'],
  'Системы управления': ['control', 'Системы управления'],
  'ИБП': ['power', 'ИБП'],
  'Питание': ['power', 'ИБП'],
  'AV-стойки': ['rack', 'infrastructure', 'Доп. оборудование'],
  'Доп. оборудование': ['rack', 'infrastructure', 'Доп. оборудование'],
  'Монтажные работы': ['works', 'Монтаж'],
  'Монтаж': ['works', 'Монтаж'],
  'ПНР': ['works', 'ПНР'],
  'Работы': ['works']
};

const ROLE_TO_GROUPS = {
  'display-panel': ['video', 'display', 'LCD-панели'],
  'projector': ['video', 'display', 'Проекторы'],
  'projection-screen': ['video', 'display', 'Проекционные экраны'],
  'led-wall': ['video', 'display', 'LED-экраны'],
  'ptz-camera': ['video', 'camera', 'PTZ-камеры'],
  'webcam-usb-camera': ['video', 'camera', 'ВКС-системы'],
  'microphone': ['audio', 'Микрофоны', 'Конференц-системы'],
  'speaker': ['audio', 'Акустика'],
  'dsp-audio-processor': ['audio', 'DSP и усилители'],
  'amplifier': ['audio', 'DSP и усилители'],
  'video-switcher-matrix-scaler': ['video', 'signal', 'network', 'Коммутация'],
  'control-processor': ['control', 'Системы управления'],
  'touch-panel-control-panel': ['control', 'Системы управления'],
  'network-switch': ['network', 'Сеть'],
  'rack-cabinet': ['rack', 'infrastructure', 'Доп. оборудование'],
  'mount-bracket': ['mounting', 'Крепления и конструкции'],
  'cable-infrastructure': ['cabling', 'signal', 'Кабельная инфраструктура'],
  'power-ups-pdu': ['power', 'ИБП'],
  'media-player': ['video', 'content', 'network', 'Медиасерверы', 'ПК'],
  'videoconference-codec': ['video', 'audio', 'control', 'network', 'ВКС-системы'],
  'interactive-display': ['video', 'display', 'control', 'interactive', 'Интерактивные панели'],
  'digital-signage': ['video', 'display', 'content', 'LCD-панели', 'Медиасерверы'],
  'lighting': ['lighting', 'Свет'],
  'vr-ar': ['video', 'interactive', 'content', 'VR / AR'],
  'works-installation-commissioning': ['works', 'Монтаж', 'ПНР']
};

const REQUIRED_GROUP_ALIASES = {
  video: ['video', 'display', 'signal', 'camera', 'content'],
  audio: ['audio'],
  control: ['control'],
  network: ['network'],
  cabling: ['cabling', 'signal'],
  cable: ['cabling', 'signal'],
  power: ['power'],
  display: ['video', 'display'],
  lighting: ['lighting'],
  rack: ['rack', 'infrastructure'],
  infrastructure: ['rack', 'network', 'cabling', 'power', 'infrastructure'],
  'LCD-панели': ['LCD-панели', 'display', 'video'],
  'Мониторы': ['LCD-панели', 'display', 'video'],
  'LED-экраны': ['LED-экраны', 'display', 'video'],
  'Проекторы': ['Проекторы', 'display', 'video'],
  'Проекционные экраны': ['Проекционные экраны', 'display', 'video'],
  'Камеры': ['PTZ-камеры', 'camera', 'video'],
  'PTZ-камеры': ['PTZ-камеры', 'camera', 'video'],
  'ВКС-системы': ['ВКС-системы', 'video', 'audio', 'control'],
  'Конференц-системы': ['Конференц-системы', 'Микрофоны', 'audio'],
  'Микрофоны': ['Микрофоны', 'audio'],
  'Акустика': ['Акустика', 'audio'],
  'DSP и усилители': ['DSP и усилители', 'audio'],
  'Коммутация': ['Коммутация', 'signal', 'video', 'network'],
  'Сеть': ['Сеть', 'network'],
  'Кабельная инфраструктура': ['Кабельная инфраструктура', 'cabling', 'signal'],
  'Крепления и конструкции': ['Крепления и конструкции', 'mounting'],
  'Питание': ['ИБП', 'power'],
  'ИБП': ['ИБП', 'power'],
  'AV-стойки': ['Доп. оборудование', 'rack', 'infrastructure'],
  'Доп. оборудование': ['Доп. оборудование', 'rack', 'infrastructure'],
  'Медиасерверы': ['Медиасерверы', 'content', 'video'],
  'ПК': ['ПК', 'Медиасерверы', 'content', 'video'],
  'Интерактивные панели': ['Интерактивные панели', 'interactive', 'display', 'video'],
  'Свет': ['Свет', 'lighting'],
  'VR / AR': ['VR / AR', 'interactive', 'video']
};

function addAll(set, values = []) { values.filter(Boolean).forEach(value => set.add(value)); }

export function resolveEstimateLineSystemGroups(line = {}) {
  const groups = new Set();
  addAll(groups, canonicalSystemGroups(line.systemGroups || []));
  addAll(groups, canonicalSystemGroups([line.category, line.replacementGroup, line.supplierCategory].filter(Boolean)));
  [line.category, line.replacementGroup, line.supplierCategory].forEach(value => addAll(groups, CATEGORY_TO_GROUPS[value] || []));
  [line.categoryId, line.subcategoryId].forEach(value => addAll(groups, CATEGORY_TO_GROUPS[value] || []));
  const roleId = line.templateRoleId || canonicalTemplateRole(line.templateRole || line.replacementGroup || line.category || '');
  addAll(groups, ROLE_TO_GROUPS[roleId] || []);
  return [...groups];
}

export function requiredGroupCoverageKeys(group = '') {
  const canonical = canonicalSystemGroups([group])[0] || group;
  return [...new Set([canonical, group, ...(REQUIRED_GROUP_ALIASES[canonical] || []), ...(CATEGORY_TO_GROUPS[canonical] || [])].filter(Boolean))];
}

export function estimateLineCoversGroup(line = {}, requiredGroup = '') {
  const covered = new Set(resolveEstimateLineSystemGroups(line));
  return requiredGroupCoverageKeys(requiredGroup).some(key => covered.has(key));
}

export function getCoveredSystemGroups(lines = []) {
  const groups = new Set();
  lines.forEach(line => addAll(groups, resolveEstimateLineSystemGroups(line)));
  return [...groups];
}
