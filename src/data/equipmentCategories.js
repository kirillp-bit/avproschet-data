export const EQUIPMENT_CATEGORY_TREE = [
  { id: 'display', name: 'Отображение', parentId: '', description: 'LCD, проекторы, экраны и профессиональные панели.', sortOrder: 10, icon: '▣', systemGroup: 'display' },
  { id: 'display-lcd', name: 'Дисплеи', parentId: 'display', sortOrder: 11, icon: '▣', systemGroup: 'display' },
  { id: 'display-professional-panel', name: 'Профессиональные панели', parentId: 'display', sortOrder: 12, icon: '▣', systemGroup: 'display' },
  { id: 'display-interactive-panel', name: 'Интерактивные панели', parentId: 'display', sortOrder: 13, icon: '◌', systemGroup: 'interactive' },
  { id: 'display-lcd-videowall', name: 'Видеостены LCD', parentId: 'display', sortOrder: 14, icon: '▦', systemGroup: 'display' },
  { id: 'display-projector', name: 'Проекторы', parentId: 'display', sortOrder: 15, icon: '◉', systemGroup: 'display' },
  { id: 'display-projection-screen', name: 'Проекционные экраны', parentId: 'display', sortOrder: 16, icon: '▭', systemGroup: 'display' },

  { id: 'led', name: 'LED', parentId: '', description: 'LED-экраны, процессинг, модули и конструкции.', sortOrder: 20, icon: '▦', systemGroup: 'led' },
  { id: 'led-module', name: 'LED-модули', parentId: 'led', sortOrder: 21, icon: '▦', systemGroup: 'led' },
  { id: 'led-cabinet', name: 'LED-кабинеты', parentId: 'led', sortOrder: 22, icon: '▦', systemGroup: 'led' },
  { id: 'led-processor', name: 'LED-процессоры', parentId: 'led', sortOrder: 23, icon: '◈', systemGroup: 'led' },
  { id: 'led-receiving-card', name: 'Receiving cards', parentId: 'led', sortOrder: 24, icon: '◈', systemGroup: 'led' },
  { id: 'led-media-server', name: 'Media server для LED', parentId: 'led', sortOrder: 25, icon: '◧', systemGroup: 'media' },
  { id: 'led-spare-module', name: 'Запасные модули', parentId: 'led', sortOrder: 26, icon: '+', systemGroup: 'led' },
  { id: 'led-structure', name: 'LED-конструкции', parentId: 'led', sortOrder: 27, icon: '⌁', systemGroup: 'mounting' },

  { id: 'vcs', name: 'ВКС', parentId: '', description: 'Камеры, видеобары, USB/BYOD, Teams и Zoom Room.', sortOrder: 30, icon: '◉', systemGroup: 'vcs' },
  { id: 'vcs-camera', name: 'Камеры', parentId: 'vcs', sortOrder: 31, icon: '◉', systemGroup: 'vcs' },
  { id: 'vcs-ptz-camera', name: 'PTZ-камеры', parentId: 'vcs', sortOrder: 32, icon: '◉', systemGroup: 'vcs' },
  { id: 'vcs-usb-camera', name: 'USB-камеры', parentId: 'vcs', sortOrder: 33, icon: '◉', systemGroup: 'vcs' },
  { id: 'vcs-videobar', name: 'Видеобары', parentId: 'vcs', sortOrder: 34, icon: '▭', systemGroup: 'vcs' },
  { id: 'vcs-room-kit', name: 'Teams / Zoom Room комплекты', parentId: 'vcs', sortOrder: 35, icon: '▣', systemGroup: 'vcs' },
  { id: 'vcs-control-panel', name: 'Панели управления ВКС', parentId: 'vcs', sortOrder: 36, icon: '◧', systemGroup: 'control' },
  { id: 'vcs-usb-bridge', name: 'USB bridges', parentId: 'vcs', sortOrder: 37, icon: '⌁', systemGroup: 'signal' },
  { id: 'vcs-byod', name: 'BYOD-комплекты', parentId: 'vcs', sortOrder: 38, icon: '⌁', systemGroup: 'vcs' },

  { id: 'audio', name: 'Звук', parentId: '', description: 'Акустика, DSP, усилители, микрофоны и аудиоинтерфейсы.', sortOrder: 40, icon: '◌', systemGroup: 'audio' },
  { id: 'audio-speaker', name: 'Акустика', parentId: 'audio', sortOrder: 41, icon: '◌', systemGroup: 'audio' },
  { id: 'audio-ceiling-speaker', name: 'Потолочная акустика', parentId: 'audio', sortOrder: 42, icon: '◌', systemGroup: 'audio' },
  { id: 'audio-wall-speaker', name: 'Настенная акустика', parentId: 'audio', sortOrder: 43, icon: '◌', systemGroup: 'audio' },
  { id: 'audio-subwoofer', name: 'Сабвуферы', parentId: 'audio', sortOrder: 44, icon: '◌', systemGroup: 'audio' },
  { id: 'audio-amplifier', name: 'Усилители', parentId: 'audio', sortOrder: 45, icon: '▤', systemGroup: 'audio' },
  { id: 'audio-dsp', name: 'DSP', parentId: 'audio', sortOrder: 46, icon: '▤', systemGroup: 'audio' },
  { id: 'audio-mixer', name: 'Микшеры', parentId: 'audio', sortOrder: 47, icon: '▤', systemGroup: 'audio' },
  { id: 'audio-microphone', name: 'Микрофоны', parentId: 'audio', sortOrder: 48, icon: '◉', systemGroup: 'audio' },
  { id: 'audio-wireless', name: 'Радиосистемы', parentId: 'audio', sortOrder: 49, icon: '◉', systemGroup: 'audio' },
  { id: 'audio-interface', name: 'Аудиоинтерфейсы', parentId: 'audio', sortOrder: 50, icon: '⌁', systemGroup: 'audio' },

  { id: 'signal', name: 'Коммутация и транспорт сигнала', parentId: '', description: 'Кабельные и сетевые AV-тракты.', sortOrder: 60, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-hdmi', name: 'HDMI', parentId: 'signal', sortOrder: 61, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-hdbaset', name: 'HDBaseT', parentId: 'signal', sortOrder: 62, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-sdi', name: 'SDI', parentId: 'signal', sortOrder: 63, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-avoip', name: 'AVoIP', parentId: 'signal', sortOrder: 64, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-ndi', name: 'NDI', parentId: 'signal', sortOrder: 65, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-matrix', name: 'Матрицы', parentId: 'signal', sortOrder: 66, icon: '▦', systemGroup: 'signal' },
  { id: 'signal-splitter', name: 'Сплиттеры', parentId: 'signal', sortOrder: 67, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-scaler', name: 'Скейлеры', parentId: 'signal', sortOrder: 68, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-converter', name: 'Конвертеры', parentId: 'signal', sortOrder: 69, icon: '⌁', systemGroup: 'signal' },
  { id: 'signal-extender', name: 'Extenders', parentId: 'signal', sortOrder: 70, icon: '⌁', systemGroup: 'signal' },

  { id: 'control', name: 'Управление', parentId: '', description: 'Контроллеры, панели, реле, ПО и лицензии управления.', sortOrder: 80, icon: '◧', systemGroup: 'control' },
  { id: 'control-controller', name: 'Контроллеры', parentId: 'control', sortOrder: 81, icon: '◧', systemGroup: 'control' },
  { id: 'control-touch-panel', name: 'Сенсорные панели', parentId: 'control', sortOrder: 82, icon: '◧', systemGroup: 'control' },
  { id: 'control-button-panel', name: 'Кнопочные панели', parentId: 'control', sortOrder: 83, icon: '◧', systemGroup: 'control' },
  { id: 'control-relay', name: 'Реле', parentId: 'control', sortOrder: 84, icon: '⌁', systemGroup: 'control' },
  { id: 'control-io', name: 'IR / RS-232 / GPIO', parentId: 'control', sortOrder: 85, icon: '⌁', systemGroup: 'control' },
  { id: 'control-software', name: 'ПО управления', parentId: 'control', sortOrder: 86, icon: '◧', systemGroup: 'control' },
  { id: 'control-license', name: 'Лицензии управления', parentId: 'control', sortOrder: 87, icon: '◧', systemGroup: 'control' },

  { id: 'interactive', name: 'Интерактив', parentId: '', description: 'Киоски, трекинг, VR/AR и игровые контроллеры.', sortOrder: 90, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-kiosk', name: 'Сенсорные киоски', parentId: 'interactive', sortOrder: 91, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-table', name: 'Сенсорные столы', parentId: 'interactive', sortOrder: 92, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-wall', name: 'Интерактивные стены', parentId: 'interactive', sortOrder: 93, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-sensor', name: 'Датчики', parentId: 'interactive', sortOrder: 94, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-tracking', name: 'Трекинг', parentId: 'interactive', sortOrder: 95, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-vr', name: 'VR-комплекты', parentId: 'interactive', sortOrder: 96, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-ar', name: 'AR-комплекты', parentId: 'interactive', sortOrder: 97, icon: '✦', systemGroup: 'interactive' },
  { id: 'interactive-game-controller', name: 'Игровые контроллеры', parentId: 'interactive', sortOrder: 98, icon: '✦', systemGroup: 'interactive' },

  { id: 'compute', name: 'Медиаплееры и вычисления', parentId: '', description: 'Плееры, ПК, серверы, NAS, GPU и видеосерверы.', sortOrder: 100, icon: '◧', systemGroup: 'compute' },
  { id: 'compute-media-player', name: 'Медиаплееры', parentId: 'compute', sortOrder: 101, icon: '◧', systemGroup: 'media' },
  { id: 'compute-mini-pc', name: 'Мини-ПК', parentId: 'compute', sortOrder: 102, icon: '◧', systemGroup: 'compute' },
  { id: 'compute-workstation', name: 'Рабочие станции', parentId: 'compute', sortOrder: 103, icon: '◧', systemGroup: 'compute' },
  { id: 'compute-server', name: 'Серверы', parentId: 'compute', sortOrder: 104, icon: '◧', systemGroup: 'compute' },
  { id: 'compute-video-server', name: 'Видеосерверы', parentId: 'compute', sortOrder: 105, icon: '◧', systemGroup: 'media' },
  { id: 'compute-nas', name: 'NAS', parentId: 'compute', sortOrder: 106, icon: '◧', systemGroup: 'compute' },
  { id: 'compute-gpu', name: 'GPU-системы', parentId: 'compute', sortOrder: 107, icon: '◧', systemGroup: 'compute' },

  { id: 'cable', name: 'Кабели и расходники', parentId: '', description: 'Сигнальные, силовые, сетевые кабели и расходные материалы.', sortOrder: 110, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-hdmi', name: 'HDMI-кабели', parentId: 'cable', sortOrder: 111, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-usb', name: 'USB-кабели', parentId: 'cable', sortOrder: 112, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-utp', name: 'Витая пара', parentId: 'cable', sortOrder: 113, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-fiber', name: 'Оптика', parentId: 'cable', sortOrder: 114, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-speaker', name: 'Акустический кабель', parentId: 'cable', sortOrder: 115, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-power', name: 'Силовой кабель', parentId: 'cable', sortOrder: 116, icon: '⌁', systemGroup: 'power' },
  { id: 'cable-connector', name: 'Коннекторы', parentId: 'cable', sortOrder: 117, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-patchcord', name: 'Патч-корды', parentId: 'cable', sortOrder: 118, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-labeling', name: 'Маркировка', parentId: 'cable', sortOrder: 119, icon: '⌁', systemGroup: 'cable' },
  { id: 'cable-consumable', name: 'Расходники', parentId: 'cable', sortOrder: 120, icon: '⌁', systemGroup: 'cable' },

  { id: 'mounting', name: 'Крепления и конструкции', parentId: '', description: 'Кронштейны, стойки, фермы, корпуса и кожухи.', sortOrder: 130, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-display', name: 'Кронштейны для дисплеев', parentId: 'mounting', sortOrder: 131, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-projector', name: 'Потолочные крепления проекторов', parentId: 'mounting', sortOrder: 132, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-speaker', name: 'Крепления акустики', parentId: 'mounting', sortOrder: 133, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-camera', name: 'Крепления камер', parentId: 'mounting', sortOrder: 134, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-stand', name: 'Стойки', parentId: 'mounting', sortOrder: 135, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-truss', name: 'Фермы', parentId: 'mounting', sortOrder: 136, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-metal', name: 'Металлоконструкции', parentId: 'mounting', sortOrder: 137, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-case', name: 'Корпуса', parentId: 'mounting', sortOrder: 138, icon: '⌁', systemGroup: 'mounting' },
  { id: 'mount-protection', name: 'Защитные кожухи', parentId: 'mounting', sortOrder: 139, icon: '⌁', systemGroup: 'mounting' },

  { id: 'rack-power', name: 'Стойки и питание', parentId: '', description: 'AV-стойки, PDU, UPS, вентиляция и кабельная организация.', sortOrder: 140, icon: '▤', systemGroup: 'power' },
  { id: 'rack-av', name: 'AV-стойки', parentId: 'rack-power', sortOrder: 141, icon: '▤', systemGroup: 'rack' },
  { id: 'rack-shelf', name: 'Рэковые полки', parentId: 'rack-power', sortOrder: 142, icon: '▤', systemGroup: 'rack' },
  { id: 'rack-pdu', name: 'PDU', parentId: 'rack-power', sortOrder: 143, icon: '▤', systemGroup: 'power' },
  { id: 'rack-ups', name: 'UPS', parentId: 'rack-power', sortOrder: 144, icon: '▤', systemGroup: 'power' },
  { id: 'rack-stabilizer', name: 'Стабилизаторы', parentId: 'rack-power', sortOrder: 145, icon: '▤', systemGroup: 'power' },
  { id: 'rack-ventilation', name: 'Вентиляция', parentId: 'rack-power', sortOrder: 146, icon: '▤', systemGroup: 'rack' },
  { id: 'rack-cable-management', name: 'Кабельная организация', parentId: 'rack-power', sortOrder: 147, icon: '▤', systemGroup: 'rack' },
  { id: 'rack-patch-panel', name: 'Патч-панели', parentId: 'rack-power', sortOrder: 148, icon: '▤', systemGroup: 'rack' },

  { id: 'content-software', name: 'Контент и ПО', parentId: '', description: 'CMS, лицензии, контент, UI/UX и интеграция ПО.', sortOrder: 150, icon: '✦', systemGroup: 'software' },
  { id: 'software-cms', name: 'CMS', parentId: 'content-software', sortOrder: 151, icon: '✦', systemGroup: 'software' },
  { id: 'software-license', name: 'Лицензии', parentId: 'content-software', sortOrder: 152, icon: '✦', systemGroup: 'software' },
  { id: 'software-interactive', name: 'Интерактивное ПО', parentId: 'content-software', sortOrder: 153, icon: '✦', systemGroup: 'software' },
  { id: 'software-ui-design', name: 'Дизайн интерфейса', parentId: 'content-software', sortOrder: 154, icon: '✦', systemGroup: 'software' },
  { id: 'content-video', name: 'Видеоконтент', parentId: 'content-software', sortOrder: 155, icon: '✦', systemGroup: 'content' },
  { id: 'content-3d', name: '3D-контент', parentId: 'content-software', sortOrder: 156, icon: '✦', systemGroup: 'content' },
  { id: 'software-integration', name: 'Интеграция ПО', parentId: 'content-software', sortOrder: 157, icon: '✦', systemGroup: 'software' },
  { id: 'software-scenario-setup', name: 'Настройка сценариев', parentId: 'content-software', sortOrder: 158, icon: '✦', systemGroup: 'software' },

  { id: 'works', name: 'Работы', parentId: '', description: 'Монтаж, ПНР, программирование, обучение и документация.', sortOrder: 160, icon: '✓', systemGroup: 'work' },
  { id: 'work-install', name: 'Монтаж', parentId: 'works', sortOrder: 161, icon: '✓', systemGroup: 'work' },
  { id: 'work-pnr', name: 'ПНР', parentId: 'works', sortOrder: 162, icon: '✓', systemGroup: 'work' },
  { id: 'work-programming', name: 'Программирование', parentId: 'works', sortOrder: 163, icon: '✓', systemGroup: 'work' },
  { id: 'work-dsp-setup', name: 'Настройка DSP', parentId: 'works', sortOrder: 164, icon: '✓', systemGroup: 'work' },
  { id: 'work-vcs-setup', name: 'Настройка ВКС', parentId: 'works', sortOrder: 165, icon: '✓', systemGroup: 'work' },
  { id: 'work-led-setup', name: 'Настройка LED', parentId: 'works', sortOrder: 166, icon: '✓', systemGroup: 'work' },
  { id: 'work-control-setup', name: 'Настройка управления', parentId: 'works', sortOrder: 167, icon: '✓', systemGroup: 'work' },
  { id: 'work-training', name: 'Обучение', parentId: 'works', sortOrder: 168, icon: '✓', systemGroup: 'work' },
  { id: 'work-documentation', name: 'Документация', parentId: 'works', sortOrder: 169, icon: '✓', systemGroup: 'work' },

  { id: 'logistics-service', name: 'Логистика и сервис', parentId: '', description: 'Доставка, такелаж, сервисный запас, SLA и обслуживание.', sortOrder: 170, icon: '◇', systemGroup: 'service' },
  { id: 'logistics-delivery', name: 'Доставка', parentId: 'logistics-service', sortOrder: 171, icon: '◇', systemGroup: 'service' },
  { id: 'logistics-loading', name: 'Погрузка / разгрузка', parentId: 'logistics-service', sortOrder: 172, icon: '◇', systemGroup: 'service' },
  { id: 'logistics-rigging', name: 'Такелаж', parentId: 'logistics-service', sortOrder: 173, icon: '◇', systemGroup: 'service' },
  { id: 'logistics-trip', name: 'Командировка', parentId: 'logistics-service', sortOrder: 174, icon: '◇', systemGroup: 'service' },
  { id: 'service-spare', name: 'Сервисный запас', parentId: 'logistics-service', sortOrder: 175, icon: '◇', systemGroup: 'service' },
  { id: 'service-warranty', name: 'Гарантийный пакет', parentId: 'logistics-service', sortOrder: 176, icon: '◇', systemGroup: 'service' },
  { id: 'service-sla', name: 'SLA', parentId: 'logistics-service', sortOrder: 177, icon: '◇', systemGroup: 'service' },
  { id: 'service-maintenance', name: 'Регламентное обслуживание', parentId: 'logistics-service', sortOrder: 178, icon: '◇', systemGroup: 'service' }
];

export const EQUIPMENT_CATEGORIES = EQUIPMENT_CATEGORY_TREE.filter(category => !category.parentId);
export const EQUIPMENT_SUBCATEGORIES = EQUIPMENT_CATEGORY_TREE.filter(category => category.parentId);
export const QUICK_EQUIPMENT_FILTERS = [
  { id: 'display', label: 'Отображение' },
  { id: 'led', label: 'LED' },
  { id: 'vcs', label: 'ВКС' },
  { id: 'audio', label: 'Звук' },
  { id: 'control', label: 'Управление' },
  { id: 'interactive', label: 'Интерактив' },
  { id: 'cable', label: 'Кабели' },
  { id: 'mounting', label: 'Крепления' },
  { id: 'works', label: 'Работы' }
];

const byId = new Map(EQUIPMENT_CATEGORY_TREE.map(category => [category.id, category]));

export function getEquipmentCategory(id) {
  return byId.get(id) || null;
}

export function parentCategoryId(id) {
  const category = getEquipmentCategory(id);
  if (!category) return '';
  return category.parentId || category.id;
}

export function childCategories(parentId) {
  return EQUIPMENT_CATEGORY_TREE.filter(category => category.parentId === parentId);
}

export function rootCategoryName(id) {
  const parent = getEquipmentCategory(parentCategoryId(id));
  return parent?.name || 'Оборудование';
}

export function subcategoryName(id) {
  return getEquipmentCategory(id)?.name || '';
}

export function mapLegacyCategoryToEquipment(category = '', name = '') {
  const text = `${category} ${name}`.toLowerCase();
  if (/led|светодиод|видеоконтроллер/.test(text)) return { categoryId: 'led', subcategoryId: /процесс|контроллер|novastar|processor/.test(text) ? 'led-processor' : /кабинет|cabinet/.test(text) ? 'led-cabinet' : 'led-module' };
  if (/видеостен|video.?wall/.test(text)) return { categoryId: 'display', subcategoryId: 'display-lcd-videowall' };
  if (/lcd|панел|диспле|монитор|signage/.test(text)) return { categoryId: 'display', subcategoryId: /интерактив|touch|сенсор/.test(text) ? 'display-interactive-panel' : 'display-professional-panel' };
  if (/проектор/.test(text)) return { categoryId: 'display', subcategoryId: 'display-projector' };
  if (/экран/.test(text) && /проекц/.test(text)) return { categoryId: 'display', subcategoryId: 'display-projection-screen' };
  if (/вкс|zoom|teams|byod|usb.?bridge|видеобар|conference.?bar/.test(text)) return { categoryId: 'vcs', subcategoryId: /ptz/.test(text) ? 'vcs-ptz-camera' : /камера|camera/.test(text) ? 'vcs-camera' : /byod/.test(text) ? 'vcs-byod' : 'vcs-room-kit' };
  if (/ptz|камера|camera/.test(text)) return { categoryId: 'vcs', subcategoryId: /usb/.test(text) ? 'vcs-usb-camera' : 'vcs-ptz-camera' };
  if (/микрофон|радиосистем/.test(text)) return { categoryId: 'audio', subcategoryId: /радио/.test(text) ? 'audio-wireless' : 'audio-microphone' };
  if (/dsp|усилител|микшер|аудио/.test(text)) return { categoryId: 'audio', subcategoryId: /усилител/.test(text) ? 'audio-amplifier' : /микшер/.test(text) ? 'audio-mixer' : 'audio-dsp' };
  if (/акуст|сабвуфер|speaker|subwoofer/.test(text)) return { categoryId: 'audio', subcategoryId: /потол/.test(text) ? 'audio-ceiling-speaker' : /саб/.test(text) ? 'audio-subwoofer' : 'audio-speaker' };
  if (/матриц|коммутац|splitter|extender|hdbaset|hdmi|sdi|ndi|avoip|конвертер|скейлер/.test(text)) return { categoryId: 'signal', subcategoryId: /матриц/.test(text) ? 'signal-matrix' : /extender|удлин/.test(text) ? 'signal-extender' : /split/.test(text) ? 'signal-splitter' : /конвер/.test(text) ? 'signal-converter' : /скейл/.test(text) ? 'signal-scaler' : /hdbaset/.test(text) ? 'signal-hdbaset' : /sdi/.test(text) ? 'signal-sdi' : /ndi/.test(text) ? 'signal-ndi' : 'signal-hdmi' };
  if (/контроллер|управлен|реле|rs-232|gpio|ir|лиценз/.test(text)) return { categoryId: 'control', subcategoryId: /сенсор|touch/.test(text) ? 'control-touch-panel' : /кноп/.test(text) ? 'control-button-panel' : /реле/.test(text) ? 'control-relay' : /лиценз/.test(text) ? 'control-license' : 'control-controller' };
  if (/vr|ar|киоск|интерактив|сенсорн|трек|датчик/.test(text)) return { categoryId: 'interactive', subcategoryId: /vr/.test(text) ? 'interactive-vr' : /ar/.test(text) ? 'interactive-ar' : /киоск/.test(text) ? 'interactive-kiosk' : /стол/.test(text) ? 'interactive-table' : /датчик/.test(text) ? 'interactive-sensor' : 'interactive-wall' };
  if (/медиасервер|медиаплеер|пк|компьютер|сервер|nas|gpu|workstation/.test(text)) return { categoryId: 'compute', subcategoryId: /nas/.test(text) ? 'compute-nas' : /gpu/.test(text) ? 'compute-gpu' : /сервер/.test(text) ? 'compute-server' : /плеер/.test(text) ? 'compute-media-player' : 'compute-mini-pc' };
  if (/кабель|патч|витая|оптик|коннектор|расход|маркиров/.test(text)) return { categoryId: 'cable', subcategoryId: /usb/.test(text) ? 'cable-usb' : /hdmi/.test(text) ? 'cable-hdmi' : /оптик/.test(text) ? 'cable-fiber' : /витая|utp/.test(text) ? 'cable-utp' : /пит|силов/.test(text) ? 'cable-power' : /коннектор/.test(text) ? 'cable-connector' : /патч/.test(text) ? 'cable-patchcord' : 'cable-consumable' };
  if (/креп|кроншт|стойк|ферм|металл|корпус|кожух|конструк/.test(text)) return { categoryId: 'mounting', subcategoryId: /проектор/.test(text) ? 'mount-projector' : /акуст/.test(text) ? 'mount-speaker' : /камер/.test(text) ? 'mount-camera' : /стойк/.test(text) ? 'mount-stand' : 'mount-display' };
  if (/стойк|rack|pdu|ups|ибп|питани|вентиляц|полк|патч-пан/.test(text)) return { categoryId: 'rack-power', subcategoryId: /ups|ибп/.test(text) ? 'rack-ups' : /pdu/.test(text) ? 'rack-pdu' : /полк/.test(text) ? 'rack-shelf' : /вент/.test(text) ? 'rack-ventilation' : 'rack-av' };
  if (/cms|по|software|контент|3d|интерфейс|сценар/.test(text)) return { categoryId: 'content-software', subcategoryId: /cms/.test(text) ? 'software-cms' : /лиценз/.test(text) ? 'software-license' : /3d/.test(text) ? 'content-3d' : /контент|видео/.test(text) ? 'content-video' : 'software-integration' };
  if (/монтаж|пнр|пуск|программ|обуч|документац|настрой/.test(text)) return { categoryId: 'works', subcategoryId: /пнр|пуск/.test(text) ? 'work-pnr' : /программ/.test(text) ? 'work-programming' : /обуч/.test(text) ? 'work-training' : /докум/.test(text) ? 'work-documentation' : 'work-install' };
  if (/достав|логист|такелаж|сервис|sla|гарант|командиров/.test(text)) return { categoryId: 'logistics-service', subcategoryId: /sla/.test(text) ? 'service-sla' : /гарант/.test(text) ? 'service-warranty' : /сервис/.test(text) ? 'service-maintenance' : 'logistics-delivery' };
  return { categoryId: 'display', subcategoryId: 'display-professional-panel' };
}
