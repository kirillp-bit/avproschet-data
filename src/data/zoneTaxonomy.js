const CAT = {
  meeting: 'meeting-vcs',
  events: 'events-conference',
  museum: 'museum-exposition',
  retail: 'retail-showroom',
  screens: 'led-large-screens',
  education: 'education',
  control: 'control-centers',
  hospitality: 'horeca-hospitality',
  sport: 'sport-fitness',
  corporate: 'corporate-spaces',
  interactive: 'content-interactive',
  infra: 'infrastructure'
};

export const ZONE_CATEGORIES = [
  { id: CAT.meeting, name: 'Переговорные и ВКС', icon: '▣', sortOrder: 10, description: 'Комнаты встреч, BYOD, Teams / Zoom Rooms и executive-зоны.' },
  { id: CAT.events, name: 'Конференции и мероприятия', icon: '◉', sortOrder: 20, description: 'Залы, сцены, регистрации, трансляции и операторские.' },
  { id: CAT.museum, name: 'Музеи и экспозиции', icon: '◆', sortOrder: 30, description: 'Экспозиции, витрины, иммерсивные и интерактивные зоны.' },
  { id: CAT.retail, name: 'Retail / showroom', icon: '◧', sortOrder: 40, description: 'Шоурумы, витрины, демо-зоны, signage и welcome-сценарии.' },
  { id: CAT.screens, name: 'LED и большие экраны', icon: '▦', sortOrder: 50, description: 'LED, LCD-видеостены, большие презентационные и сценические экраны.' },
  { id: CAT.education, name: 'Образование', icon: '◌', sortOrder: 60, description: 'Классы, аудитории, лаборатории, гибридное обучение и запись лекций.' },
  { id: CAT.control, name: 'Диспетчерские и ситуационные центры', icon: '◈', sortOrder: 70, description: 'Command center, monitoring room, NOC / SOC и рабочие места операторов.' },
  { id: CAT.hospitality, name: 'HoReCa / hospitality', icon: '◇', sortOrder: 80, description: 'Отели, рестораны, бары, лобби, банкетные и фоновые зоны.' },
  { id: CAT.sport, name: 'Спорт и фитнес', icon: '●', sortOrder: 90, description: 'Спортивные залы, бассейны, фан-зоны и комментаторские.' },
  { id: CAT.corporate, name: 'Корпоративные пространства', icon: '▤', sortOrder: 100, description: 'Ресепшен, open space, кабинет руководителя, студии и demo-зоны.' },
  { id: CAT.interactive, name: 'Контент и интерактив', icon: '✦', sortOrder: 110, description: 'Киоски, сенсорные столы, VR / AR, контентные и gamification-зоны.' },
  { id: CAT.infra, name: 'Инфраструктура', icon: '⌁', sortOrder: 120, description: 'AV-стойки, аппаратные, коммутация, питание, сервис и технические помещения.' }
];

const PROJECT_CATEGORY_MAP = {
  corporate: [CAT.meeting, CAT.corporate, CAT.screens, CAT.interactive, CAT.infra],
  museum: [CAT.museum, CAT.interactive, CAT.screens, CAT.infra, CAT.hospitality],
  conference: [CAT.events, CAT.meeting, CAT.screens, CAT.infra, CAT.interactive],
  retail: [CAT.retail, CAT.screens, CAT.interactive, CAT.corporate, CAT.infra],
  education: [CAT.education, CAT.events, CAT.meeting, CAT.interactive, CAT.infra],
  control: [CAT.control, CAT.screens, CAT.infra, CAT.meeting, CAT.corporate],
  hospitality: [CAT.hospitality, CAT.events, CAT.meeting, CAT.screens, CAT.infra],
  sport: [CAT.sport, CAT.screens, CAT.events, CAT.infra, CAT.hospitality],
  event: [CAT.events, CAT.screens, CAT.interactive, CAT.infra],
  public: [CAT.events, CAT.screens, CAT.interactive, CAT.infra, CAT.corporate],
  vr: [CAT.interactive, CAT.education, CAT.museum, CAT.infra, CAT.screens]
};


const GROUP_CATEGORY_ALIASES = {
  'Камеры': 'PTZ-камеры',
  'Мониторы': 'LCD-панели',
  'AV-стойки': 'Доп. оборудование',
  'Питание': 'ИБП',
  'Видеостены': 'LED-экраны',
  'Проекционные экраны': 'Проекционные экраны'
};

const GROUP_ITEM_LABELS = {
  'ВКС-системы': 'Комплект ВКС / endpoint',
  'Конференц-системы': 'Конференц-система',
  'LCD-панели': 'Профессиональная LCD-панель',
  'LED-экраны': 'LED-экран / LED-процессор',
  'Проекторы': 'Проектор',
  'Проекционные экраны': 'Проекционный экран',
  'Интерактивные панели': 'Интерактивная панель / touch display',
  'Микрофоны': 'Микрофоны / радиосистема',
  'Акустика': 'Акустические системы',
  'DSP и усилители': 'DSP / усилитель',
  'Коммутация': 'AV-коммутация',
  'Сеть': 'Сетевое оборудование',
  'Кабельная инфраструктура': 'Кабели и расходные материалы',
  'Крепления и конструкции': 'Крепления / конструкции',
  'Медиасерверы': 'Медиаплеер / медиасервер',
  'ПК': 'ПК / workstation',
  'PTZ-камеры': 'PTZ-камера',
  'Свет': 'Световое оборудование',
  'VR / AR': 'VR / AR комплект',
  'Системы управления': 'Система управления',
  'ИБП': 'ИБП / питание',
  'Доп. оборудование': 'AV-стойка / аксессуары'
};

export function canonicalSystemGroup(group) {
  return GROUP_CATEGORY_ALIASES[group] || group;
}

export function canonicalSystemGroups(groups = []) {
  return [...new Set((groups || []).map(canonicalSystemGroup))];
}

function qtyForGroup(group, defaultArea = 25, zoneType = '') {
  if (group === 'Микрофоны') return defaultArea >= 100 || /hall|stage|event/.test(zoneType) ? 4 : defaultArea >= 35 ? 2 : 1;
  if (group === 'Акустика') return defaultArea >= 150 ? 6 : defaultArea >= 60 ? 4 : 2;
  if (group === 'LCD-панели') return defaultArea >= 100 ? 2 : 1;
  if (group === 'LED-экраны') return 1;
  if (group === 'Кабельная инфраструктура') return 1;
  if (group === 'Крепления и конструкции') return 1;
  if (group === 'Сеть') return 1;
  return 1;
}

function recommendedItemsFor(groups = [], defaultArea = 25, zoneType = '') {
  return canonicalSystemGroups(groups).map((group, index) => ({
    group,
    category: group,
    name: GROUP_ITEM_LABELS[group] || group,
    qty: qtyForGroup(group, defaultArea, zoneType),
    priority: index + 1
  }));
}

const DEFAULT_TEMPLATES = {
  corporate: ['small-meeting-room','medium-meeting-room','reception-corporate','open-space','server-av-rack'],
  museum: ['museum-welcome-zone','exposition-hall','interactive-exposition','projection-zone','server-av-rack'],
  conference: ['conference-hall','stage','broadcast-zone','director-control-room','server-av-rack'],
  retail: ['showroom','digital-signage-zone','product-demo-zone','interactive-kiosk','server-av-rack'],
  education: ['classroom','lecture-hall-education','hybrid-classroom','lecture-recording-zone','server-av-rack'],
  control: ['dispatch-room','situation-center','monitoring-video-wall','operator-workplace','server-av-rack'],
  hospitality: ['hotel-lobby','hotel-conference-hall','background-audio','digital-menu-board','server-av-rack'],
  sport: ['sports-hall','media-screen-sport','fan-zone','commentary-booth','server-av-rack'],
  event: ['conference-hall','stage','led-backdrop','broadcast-zone','backstage'],
  public: ['information-screen','presentation-screen-large','navigation-zone','event-zone','server-av-rack'],
  vr: ['vr-zone','ar-zone','media-classroom','content-studio','server-av-rack']
};

const data = [
  [CAT.meeting, 'small-meeting-room', 'малая переговорная', 'conference', 18, 'Быстрая ВКС на 4–6 человек', ['ВКС-системы','LCD-панели','Микрофоны','Акустика','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.meeting, 'medium-meeting-room', 'средняя переговорная', 'conference', 32, 'ВКС и презентации на 8–12 человек', ['ВКС-системы','LCD-панели','DSP и усилители','Микрофоны','Акустика','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.meeting, 'large-meeting-room', 'большая переговорная', 'conference', 55, 'Совещания, ВКС, презентации', ['ВКС-системы','Конференц-системы','LCD-панели','DSP и усилители','Микрофоны','Акустика','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery','metal']],
  [CAT.meeting, 'boardroom', 'boardroom', 'conference', 70, 'Представительская переговорная', ['ВКС-системы','Конференц-системы','LCD-панели','DSP и усилители','Микрофоны','Акустика','Коммутация'], ['install','pnr','delivery','service']],
  [CAT.meeting, 'huddle-room', 'huddle room', 'conference', 12, 'Короткие гибридные встречи', ['ВКС-системы','LCD-панели','Акустика','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.meeting, 'hybrid-meeting-room', 'гибридная переговорная', 'conference', 35, 'Встречи с удалёнными участниками', ['ВКС-системы','Микрофоны','Камеры','DSP и усилители','LCD-панели','Коммутация'], ['install','pnr','delivery']],
  [CAT.meeting, 'byod-meeting-room', 'переговорная с BYOD', 'conference', 25, 'Подключение ноутбуков гостей', ['ВКС-системы','Коммутация','LCD-панели','Кабельная инфраструктура','Акустика'], ['install','pnr','delivery']],
  [CAT.meeting, 'teams-zoom-room', 'переговорная с Teams / Zoom Room', 'conference', 30, 'Сертифицированная ВКС-комната', ['ВКС-системы','Микрофоны','Камеры','LCD-панели','Коммутация'], ['install','pnr','delivery']],
  [CAT.meeting, 'video-call-room', 'комната для видеозвонков', 'conference', 8, 'Индивидуальные видеозвонки', ['ВКС-системы','LCD-панели','Акустика'], ['install','pnr']],
  [CAT.meeting, 'executive-meeting-room', 'executive meeting room', 'conference', 45, 'Премиальная переговорная руководителя', ['ВКС-системы','Конференц-системы','LCD-панели','DSP и усилители','Акустика','Коммутация'], ['install','pnr','delivery','service']],

  [CAT.events, 'conference-hall', 'конференц-зал', 'hall', 120, 'Конференции и презентации', ['Проекторы','LED-экраны','Конференц-системы','Микрофоны','Акустика','DSP и усилители','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery','metal']],
  [CAT.events, 'auditorium', 'актовый зал', 'hall', 250, 'Массовые мероприятия', ['Проекторы','LED-экраны','Акустика','Микрофоны','Свет','DSP и усилители','Коммутация'], ['install','pnr','delivery','metal']],
  [CAT.events, 'lecture-hall-event', 'лекционный зал', 'hall', 160, 'Лекции и выступления', ['Проекторы','LCD-панели','Микрофоны','Акустика','DSP и усилители','Коммутация'], ['install','pnr','delivery']],
  [CAT.events, 'press-room', 'пресс-зал', 'hall', 90, 'Пресс-мероприятия и записи', ['Конференц-системы','Микрофоны','Камеры','LCD-панели','Акустика','Коммутация'], ['install','pnr','delivery']],
  [CAT.events, 'presentation-hall', 'зал презентаций', 'hall', 100, 'Презентации продуктов и проектов', ['LED-экраны','LCD-панели','Акустика','Микрофоны','Коммутация'], ['install','pnr','delivery']],
  [CAT.events, 'event-zone', 'event-зона', 'event', 140, 'Гибкие мероприятия', ['Акустика','Микрофоны','LED-экраны','Свет','Коммутация'], ['install','pnr','delivery','metal']],
  [CAT.events, 'stage', 'сцена', 'stage', 80, 'Выступления и шоу', ['LED-экраны','Акустика','Микрофоны','Свет','Крепления и конструкции','Коммутация'], ['install','pnr','delivery','metal']],
  [CAT.events, 'backstage', 'backstage', 'event', 35, 'Техническая зона сцены', ['Коммутация','Сеть','Кабельная инфраструктура','Мониторы'], ['install','pnr','delivery']],
  [CAT.events, 'registration-zone', 'зона регистрации', 'event', 30, 'Регистрация гостей', ['LCD-панели','Медиасерверы','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.events, 'broadcast-zone', 'зона трансляции', 'event', 40, 'Стриминг и запись события', ['Камеры','Медиасерверы','Коммутация','Сеть','Микрофоны'], ['install','pnr','delivery','content']],
  [CAT.events, 'director-control-room', 'режиссёрская / операторская', 'control', 35, 'Управление мероприятием', ['Коммутация','Медиасерверы','Мониторы','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],

  [CAT.museum, 'exposition-hall', 'экспозиционный зал', 'museum', 160, 'Постоянная экспозиция', ['LCD-панели','Проекторы','Медиасерверы','Акустика','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.museum, 'interactive-exposition', 'интерактивная экспозиция', 'museum', 90, 'Интерактивные экспонаты', ['Интерактивные панели','Медиасерверы','ПК','LCD-панели','Сеть'], ['install','pnr','delivery','content']],
  [CAT.museum, 'multimedia-showcase', 'мультимедийная витрина', 'museum', 25, 'Витрина с медиа-контентом', ['LCD-панели','Медиасерверы','Акустика','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.museum, 'immersive-room', 'иммерсивная комната', 'museum', 70, 'Проекционное погружение', ['Проекторы','Медиасерверы','Акустика','DSP и усилители','Коммутация'], ['install','pnr','delivery','content','metal']],
  [CAT.museum, 'projection-zone', 'проекционная зона', 'museum', 60, 'Видеомэппинг / проекция', ['Проекторы','Медиасерверы','Крепления и конструкции','Коммутация'], ['install','pnr','delivery','content','metal']],
  [CAT.museum, 'audio-guide-zone', 'аудиогид-зона', 'museum', 40, 'Аудиосопровождение', ['Акустика','Сеть','Медиасерверы','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.museum, 'navigation-zone', 'зона навигации', 'museum', 45, 'Цифровая навигация', ['LCD-панели','Медиасерверы','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.museum, 'temporary-exhibition-zone', 'зона временной выставки', 'museum', 80, 'Сменная экспозиция', ['LCD-панели','Проекторы','Медиасерверы','Акустика'], ['install','pnr','delivery','content']],
  [CAT.museum, 'kids-interactive-zone', 'детская интерактивная зона', 'museum', 55, 'Образовательный интерактив', ['Интерактивные панели','ПК','Акустика','Сеть'], ['install','pnr','delivery','content']],
  [CAT.museum, 'museum-welcome-zone', 'welcome-зона музея', 'museum', 50, 'Первое впечатление и навигация', ['LED-экраны','LCD-панели','Медиасерверы','Акустика'], ['install','pnr','delivery','content']],

  [CAT.retail, 'showroom', 'шоурум', 'retail', 120, 'Демонстрация продуктов', ['LCD-панели','LED-экраны','Медиасерверы','Акустика','Коммутация'], ['install','pnr','delivery','content']],
  [CAT.retail, 'retail-welcome-zone', 'welcome-зона', 'retail', 35, 'Входная бренд-зона', ['LCD-панели','LED-экраны','Медиасерверы','Акустика'], ['install','pnr','delivery','content']],
  [CAT.retail, 'digital-signage-zone', 'digital signage зона', 'retail', 40, 'Цифровые вывески', ['LCD-панели','Медиасерверы','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.retail, 'interactive-stand', 'интерактивная стойка', 'retail', 12, 'Самостоятельная навигация', ['Интерактивные панели','ПК','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.retail, 'product-demo-zone', 'продуктовая демо-зона', 'retail', 45, 'Демо-сценарий продукта', ['LCD-панели','Медиасерверы','Акустика','Коммутация'], ['install','pnr','delivery','content']],
  [CAT.retail, 'cashier-zone', 'кассовая зона', 'retail', 20, 'Информационные экраны у кассы', ['LCD-панели','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.retail, 'shop-window', 'витрина', 'retail', 25, 'Медиа-витрина', ['LCD-панели','LED-экраны','Медиасерверы','Крепления и конструкции'], ['install','pnr','delivery','content','metal']],
  [CAT.retail, 'waiting-area', 'зона ожидания', 'retail', 30, 'Фоновый контент и звук', ['LCD-панели','Акустика','Медиасерверы'], ['install','pnr','delivery','content']],
  [CAT.retail, 'promo-zone', 'промо-зона', 'retail', 35, 'Промо-активации', ['LED-экраны','LCD-панели','Акустика','Медиасерверы'], ['install','pnr','delivery','content']],
  [CAT.retail, 'self-presentation-zone', 'зона самопрезентации продукта', 'retail', 30, 'Автономная презентация', ['Интерактивные панели','Медиасерверы','ПК','Акустика'], ['install','pnr','delivery','content']],

  [CAT.screens, 'led-wall-indoor', 'LED wall indoor', 'screen', 35, 'Внутренний LED-экран', ['LED-экраны','Медиасерверы','Крепления и конструкции','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery','metal']],
  [CAT.screens, 'led-wall-outdoor', 'LED wall outdoor', 'screen', 45, 'Уличный LED-экран', ['LED-экраны','Крепления и конструкции','Сеть','Кабельная инфраструктура','Питание'], ['install','pnr','delivery','metal']],
  [CAT.screens, 'led-backdrop', 'LED backdrop', 'screen', 50, 'Сценический LED-задник', ['LED-экраны','Медиасерверы','Крепления и конструкции','Коммутация'], ['install','pnr','delivery','metal']],
  [CAT.screens, 'media-facade', 'медиафасад', 'screen', 120, 'Фасадная медиа-поверхность', ['LED-экраны','Крепления и конструкции','Сеть','Питание','Кабельная инфраструктура'], ['install','pnr','delivery','metal']],
  [CAT.screens, 'lcd-video-wall', 'видеостена LCD', 'screen', 30, 'LCD-видеостена', ['LCD-панели','Видеостены','Крепления и конструкции','Коммутация'], ['install','pnr','delivery','metal']],
  [CAT.screens, 'display-wall', 'дисплейная стена', 'screen', 25, 'Стена из дисплеев', ['LCD-панели','Коммутация','Крепления и конструкции'], ['install','pnr','delivery','metal']],
  [CAT.screens, 'information-screen', 'информационный экран', 'screen', 8, 'Инфоэкран', ['LCD-панели','Медиасерверы','Сеть'], ['install','pnr','delivery']],
  [CAT.screens, 'presentation-screen-large', 'большой презентационный экран', 'screen', 20, 'Большой экран для презентаций', ['LCD-панели','Проекторы','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.screens, 'stage-screen', 'сценический экран', 'screen', 40, 'Экран сцены', ['LED-экраны','Проекторы','Крепления и конструкции','Коммутация'], ['install','pnr','delivery','metal']],
  [CAT.screens, 'welcome-led', 'welcome LED', 'screen', 18, 'Welcome-экран', ['LED-экраны','Медиасерверы','Крепления и конструкции'], ['install','pnr','delivery','content']],

  [CAT.education, 'classroom', 'учебный класс', 'education', 55, 'Обучение в классе', ['Интерактивные панели','Проекторы','Акустика','Микрофоны','Коммутация'], ['install','pnr','delivery']],
  [CAT.education, 'audience-room', 'аудитория', 'education', 90, 'Аудиторные занятия', ['Проекторы','LCD-панели','Микрофоны','Акустика','Коммутация'], ['install','pnr','delivery']],
  [CAT.education, 'lecture-hall-education', 'лекционный зал', 'education', 140, 'Поточные лекции', ['Проекторы','Микрофоны','Акустика','DSP и усилители','Коммутация'], ['install','pnr','delivery']],
  [CAT.education, 'laboratory', 'лаборатория', 'education', 75, 'Практические занятия', ['LCD-панели','Интерактивные панели','Сеть','ПК','Коммутация'], ['install','pnr','delivery']],
  [CAT.education, 'hybrid-classroom', 'гибридный класс', 'education', 65, 'Очное + удалённое обучение', ['ВКС-системы','Камеры','Микрофоны','Интерактивные панели','Акустика'], ['install','pnr','delivery']],
  [CAT.education, 'computer-classroom', 'компьютерный класс', 'education', 70, 'ПК-класс', ['ПК','LCD-панели','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.education, 'vr-classroom', 'VR-класс', 'education', 80, 'VR-обучение', ['VR / AR','ПК','Сеть','LCD-панели','Акустика'], ['install','pnr','delivery','content']],
  [CAT.education, 'media-classroom', 'медиакласс', 'education', 75, 'Медиаобразование', ['Камеры','Микрофоны','Медиасерверы','ПК','Акустика'], ['install','pnr','delivery','content']],
  [CAT.education, 'teacher-zone', 'преподавательская зона', 'education', 20, 'Рабочее место преподавателя', ['LCD-панели','Микрофоны','Коммутация','ПК'], ['install','pnr','delivery']],
  [CAT.education, 'lecture-recording-zone', 'зона записи лекций', 'education', 35, 'Запись образовательного контента', ['Камеры','Микрофоны','Медиасерверы','Свет','Коммутация'], ['install','pnr','delivery','content']],

  [CAT.control, 'dispatch-room', 'диспетчерская', 'control', 90, 'Диспетчеризация объекта', ['Видеостены','LCD-панели','Коммутация','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.control, 'situation-center', 'ситуационный центр', 'control', 140, 'Аналитика и управление', ['Видеостены','LCD-панели','Конференц-системы','Коммутация','Сеть','DSP и усилители'], ['install','pnr','delivery','service']],
  [CAT.control, 'operator-room', 'операторская', 'control', 55, 'Рабочая операторская', ['Мониторы','Коммутация','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.control, 'command-center', 'command center', 'control', 160, 'Командный центр', ['Видеостены','LCD-панели','ВКС-системы','Коммутация','Сеть'], ['install','pnr','delivery','service']],
  [CAT.control, 'monitoring-room', 'monitoring room', 'control', 110, 'Мониторинг систем', ['Видеостены','Мониторы','Коммутация','Сеть'], ['install','pnr','delivery']],
  [CAT.control, 'crisis-room', 'crisis room', 'control', 85, 'Кризисная комната', ['ВКС-системы','LCD-панели','Конференц-системы','Коммутация'], ['install','pnr','delivery','service']],
  [CAT.control, 'noc-soc', 'NOC / SOC', 'control', 130, 'Сетевой / security operations center', ['Видеостены','Мониторы','Сеть','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery','service']],
  [CAT.control, 'analytics-zone', 'аналитическая зона', 'control', 70, 'Совместная аналитика', ['LCD-панели','Видеостены','Коммутация','Сеть'], ['install','pnr','delivery']],
  [CAT.control, 'monitoring-video-wall', 'видеостена мониторинга', 'control', 45, 'Мониторинговая видеостена', ['Видеостены','LCD-панели','Крепления и конструкции','Коммутация'], ['install','pnr','delivery','metal']],
  [CAT.control, 'operator-workplace', 'рабочее место оператора', 'control', 12, 'Операторское место', ['Мониторы','ПК','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],

  [CAT.hospitality, 'restaurant-hall', 'ресторанный зал', 'hospitality', 120, 'Звук и экраны в ресторане', ['Акустика','DSP и усилители','LCD-панели','Коммутация'], ['install','pnr','delivery']],
  [CAT.hospitality, 'bar-zone', 'барная зона', 'hospitality', 45, 'Барный контент и звук', ['Акустика','LCD-панели','Медиасерверы','DSP и усилители'], ['install','pnr','delivery','content']],
  [CAT.hospitality, 'banquet-hall', 'банкетный зал', 'hospitality', 180, 'Банкеты и события', ['Акустика','Микрофоны','Проекторы','LED-экраны','DSP и усилители'], ['install','pnr','delivery']],
  [CAT.hospitality, 'hotel-lobby', 'лобби', 'hospitality', 80, 'Welcome и навигация', ['LCD-панели','LED-экраны','Акустика','Медиасерверы'], ['install','pnr','delivery','content']],
  [CAT.hospitality, 'hotel-meeting-room', 'переговорная отеля', 'hospitality', 35, 'Встречи гостей отеля', ['ВКС-системы','LCD-панели','Микрофоны','Акустика'], ['install','pnr','delivery']],
  [CAT.hospitality, 'hotel-conference-hall', 'конференц-зал отеля', 'hospitality', 140, 'Конференции в отеле', ['Проекторы','LED-экраны','Микрофоны','Акустика','Коммутация'], ['install','pnr','delivery']],
  [CAT.hospitality, 'background-audio', 'фоновый звук', 'hospitality', 100, 'Фоновая аудиосистема', ['Акустика','DSP и усилители','Коммутация','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.hospitality, 'karaoke-zone', 'караоке-зона', 'hospitality', 35, 'Караоке', ['Акустика','Микрофоны','DSP и усилители','LCD-панели'], ['install','pnr','delivery']],
  [CAT.hospitality, 'digital-menu-board', 'digital menu board', 'hospitality', 15, 'Цифровое меню', ['LCD-панели','Медиасерверы','Сеть'], ['install','pnr','delivery','content']],
  [CAT.hospitality, 'hospitality-welcome-zone', 'welcome-зона', 'hospitality', 35, 'Welcome-сценарий', ['LCD-панели','LED-экраны','Медиасерверы','Акустика'], ['install','pnr','delivery','content']],

  [CAT.sport, 'sports-hall', 'спортивный зал', 'sport', 300, 'AV для спортзала', ['Акустика','DSP и усилители','LED-экраны','Микрофоны'], ['install','pnr','delivery','metal']],
  [CAT.sport, 'fitness-room', 'фитнес-зал', 'sport', 180, 'Музыка и экраны фитнес-зала', ['Акустика','DSP и усилители','LCD-панели','Коммутация'], ['install','pnr','delivery']],
  [CAT.sport, 'pool-zone', 'бассейн', 'sport', 220, 'Звук и оповещение в бассейне', ['Акустика','DSP и усилители','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.sport, 'locker-room', 'раздевалка', 'sport', 70, 'Фоновый звук / инфо', ['Акустика','LCD-панели','Коммутация'], ['install','pnr','delivery']],
  [CAT.sport, 'group-class-zone', 'зона групповых занятий', 'sport', 90, 'Групповые тренировки', ['Акустика','Микрофоны','DSP и усилители','LCD-панели'], ['install','pnr','delivery']],
  [CAT.sport, 'media-screen-sport', 'медиаэкран', 'sport', 35, 'Спортивный медиаэкран', ['LED-экраны','LCD-панели','Медиасерверы','Крепления и конструкции'], ['install','pnr','delivery','metal']],
  [CAT.sport, 'commentary-booth', 'комментаторская', 'sport', 20, 'Место комментатора', ['Микрофоны','Мониторы','Коммутация','Сеть'], ['install','pnr','delivery']],
  [CAT.sport, 'judges-zone', 'судейская зона', 'sport', 25, 'Информационная зона судей', ['Мониторы','LCD-панели','Коммутация','Сеть'], ['install','pnr','delivery']],
  [CAT.sport, 'fan-zone', 'фан-зона', 'sport', 120, 'Фан-зона', ['LED-экраны','Акустика','Микрофоны','Медиасерверы'], ['install','pnr','delivery','content']],
  [CAT.sport, 'training-zone', 'тренировочная зона', 'sport', 120, 'Тренировочный контент', ['LCD-панели','Акустика','Медиасерверы'], ['install','pnr','delivery','content']],

  [CAT.corporate, 'reception-corporate', 'ресепшен', 'corporate', 35, 'Входная зона офиса', ['LCD-панели','LED-экраны','Медиасерверы','Акустика'], ['install','pnr','delivery','content']],
  [CAT.corporate, 'open-space', 'open space', 'corporate', 250, 'Инфоэкраны и фоновый звук', ['LCD-панели','Акустика','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.corporate, 'ceo-office', 'кабинет руководителя', 'corporate', 35, 'Кабинет руководителя с ВКС', ['ВКС-системы','LCD-панели','Акустика','Коммутация'], ['install','pnr','delivery']],
  [CAT.corporate, 'corporate-meeting-room', 'переговорная', 'corporate', 30, 'Базовая офисная переговорная', ['ВКС-системы','LCD-панели','Микрофоны','Акустика'], ['install','pnr','delivery']],
  [CAT.corporate, 'lounge', 'lounge', 'corporate', 60, 'Лаунж с медиа', ['LCD-панели','Акустика','Медиасерверы'], ['install','pnr','delivery','content']],
  [CAT.corporate, 'corporate-museum', 'корпоративный музей', 'corporate', 100, 'История компании', ['LCD-панели','Интерактивные панели','Медиасерверы','Акустика'], ['install','pnr','delivery','content']],
  [CAT.corporate, 'corporate-demo-zone', 'демо-зона', 'corporate', 70, 'Демонстрация решений', ['LCD-панели','LED-экраны','Медиасерверы','Коммутация'], ['install','pnr','delivery','content']],
  [CAT.corporate, 'staff-training-zone', 'обучение персонала', 'corporate', 60, 'Обучающая зона офиса', ['Интерактивные панели','Проекторы','Микрофоны','Акустика'], ['install','pnr','delivery']],
  [CAT.corporate, 'internal-studio', 'внутренняя студия', 'corporate', 45, 'Корпоративная видеостудия', ['Камеры','Микрофоны','Свет','Медиасерверы','Коммутация'], ['install','pnr','delivery','content']],
  [CAT.corporate, 'broadcast-room', 'broadcast room', 'corporate', 55, 'Трансляционная комната', ['Камеры','Микрофоны','Медиасерверы','Коммутация','Сеть'], ['install','pnr','delivery','content']],

  [CAT.interactive, 'interactive-kiosk', 'интерактивный киоск', 'interactive', 8, 'Интерактивная стойка', ['Интерактивные панели','ПК','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'touch-table', 'сенсорный стол', 'interactive', 12, 'Сенсорный стол', ['Интерактивные панели','ПК','Медиасерверы','Сеть'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'interactive-wall', 'интерактивная стена', 'interactive', 30, 'Интерактивная поверхность', ['Интерактивные панели','Проекторы','Медиасерверы','ПК','Коммутация'], ['install','pnr','delivery','content','metal']],
  [CAT.interactive, 'vr-zone', 'VR-зона', 'interactive', 45, 'VR-сценарий', ['VR / AR','ПК','Сеть','LCD-панели','Акустика'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'ar-zone', 'AR-зона', 'interactive', 35, 'AR-сценарий', ['VR / AR','ПК','LCD-панели','Сеть'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'mediaplayer-zone', 'медиаплеерная зона', 'interactive', 18, 'Контент-плейаут', ['Медиасерверы','LCD-панели','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'generative-content-zone', 'зона генеративного контента', 'interactive', 30, 'AI / генеративная визуализация', ['Медиасерверы','ПК','LED-экраны','Сеть'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'photo-zone', 'фотозона', 'interactive', 25, 'Фото / видео-активация', ['Камеры','Свет','Медиасерверы','LCD-панели'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'gamification-zone', 'gamification-зона', 'interactive', 40, 'Игровой интерактив', ['Интерактивные панели','ПК','Медиасерверы','Акустика'], ['install','pnr','delivery','content']],
  [CAT.interactive, 'content-studio', 'контентная студия', 'interactive', 50, 'Создание контента', ['Камеры','Микрофоны','Свет','Медиасерверы','ПК'], ['install','pnr','delivery','content']],

  [CAT.infra, 'server-av-rack', 'серверная / AV-стойка', 'infra', 12, 'Центральная стойка AV', ['AV-стойки','Коммутация','Сеть','Питание','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.infra, 'equipment-room', 'аппаратная', 'infra', 20, 'Аппаратная AV', ['AV-стойки','Коммутация','Сеть','Питание','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.infra, 'cable-zone', 'кабельная зона', 'infra', 10, 'Кабельные трассы', ['Кабельная инфраструктура','Крепления и конструкции'], ['install','delivery']],
  [CAT.infra, 'switching-zone', 'зона коммутации', 'infra', 10, 'Коммутация сигналов', ['Коммутация','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.infra, 'equipment-storage', 'склад оборудования', 'infra', 25, 'Хранение ЗИП и оборудования', ['AV-стойки','Кабельная инфраструктура'], ['delivery','service']],
  [CAT.infra, 'technical-room', 'техническое помещение', 'infra', 18, 'Техническая зона', ['AV-стойки','Питание','Сеть','Кабельная инфраструктура'], ['install','pnr','delivery']],
  [CAT.infra, 'power-zone', 'зона питания', 'infra', 8, 'Электропитание AV', ['Питание','Кабельная инфраструктура'], ['install','pnr']],
  [CAT.infra, 'operator-place', 'операторское место', 'infra', 12, 'Место оператора AV', ['Мониторы','ПК','Коммутация','Сеть'], ['install','pnr','delivery']],
  [CAT.infra, 'installation-zone', 'монтажная зона', 'infra', 15, 'Монтажные работы и конструкции', ['Крепления и конструкции','Кабельная инфраструктура'], ['install','delivery','metal']],
  [CAT.infra, 'service-zone', 'сервисная зона', 'infra', 15, 'Обслуживание системы', ['AV-стойки','Сеть','Кабельная инфраструктура'], ['service','delivery']]
];

export const ZONE_TEMPLATES = data.map((row, index) => {
  const [categoryId, id, name, zoneType, defaultArea, defaultScenario, rawRequiredSystemGroups, typicalWorks] = row;
  const requiredSystemGroups = canonicalSystemGroups(rawRequiredSystemGroups);
  const recommendedForProjectTypes = Object.entries(PROJECT_CATEGORY_MAP).filter(([,cats]) => cats.includes(categoryId)).map(([id]) => id);
  return {
    id, categoryId, name, zoneType, defaultArea, defaultScenario,
    description: defaultScenario,
    recommendedForProjectTypes,
    requiredSystemGroups,
    recommendedItems: recommendedItemsFor(requiredSystemGroups, defaultArea, zoneType),
    requiredDependencies: dependenciesFor(requiredSystemGroups, typicalWorks),
    typicalWorks,
    requiresEngineerReview: requiredSystemGroups.some(g => /LED|Видеостены|Проекторы|Крепления|Питание|VR/.test(g)) || defaultArea >= 100,
    tags: [name, zoneType, categoryId, defaultScenario, ...requiredSystemGroups].join(' ').toLowerCase(),
    sortOrder: index + 1
  };
});

export const PROJECT_TYPE_ZONE_MODEL = Object.fromEntries(Object.entries(PROJECT_CATEGORY_MAP).map(([projectTypeId, allowedZoneCategoryIds]) => [projectTypeId, {
  allowedZoneCategoryIds,
  recommendedZoneTemplateIds: ZONE_TEMPLATES.filter(t => allowedZoneCategoryIds.includes(t.categoryId)).slice(0, 18).map(t => t.id),
  defaultZoneTemplateIds: DEFAULT_TEMPLATES[projectTypeId] || [],
  hiddenZoneCategoryIds: ZONE_CATEGORIES.filter(c => !allowedZoneCategoryIds.includes(c.id)).map(c => c.id),
  typicalScenario: typicalScenarioFor(projectTypeId),
  requiresEngineerReview: ['museum','conference','control','sport','event','vr'].includes(projectTypeId)
}]));

export function getProjectZoneModel(projectTypeId = 'corporate') {
  return PROJECT_TYPE_ZONE_MODEL[projectTypeId] || PROJECT_TYPE_ZONE_MODEL.corporate;
}

export function getZoneCategory(categoryId) {
  return ZONE_CATEGORIES.find(c => c.id === categoryId) || null;
}

export function getZoneTemplate(templateId) {
  return ZONE_TEMPLATES.find(t => t.id === templateId) || null;
}

export function getTemplatesForProject(projectTypeId, { showAll = false, search = '', categoryId = 'all' } = {}) {
  const model = getProjectZoneModel(projectTypeId);
  const q = String(search || '').toLowerCase().trim();
  return ZONE_TEMPLATES.filter(t => {
    const inProject = model.allowedZoneCategoryIds.includes(t.categoryId);
    if (!showAll && !inProject) return false;
    if (categoryId !== 'all' && t.categoryId !== categoryId) return false;
    const category = getZoneCategory(t.categoryId);
    const text = `${t.name} ${t.description} ${t.zoneType} ${t.tags} ${category?.name || ''}`.toLowerCase();
    return !q || text.includes(q);
  }).sort((a,b) => {
    const ar = model.defaultZoneTemplateIds.includes(a.id) ? -1 : 0;
    const br = model.defaultZoneTemplateIds.includes(b.id) ? -1 : 0;
    return ar - br || (getZoneCategory(a.categoryId)?.sortOrder || 999) - (getZoneCategory(b.categoryId)?.sortOrder || 999) || a.sortOrder - b.sortOrder;
  });
}

export function getCategoriesForProject(projectTypeId, showAll = false) {
  const model = getProjectZoneModel(projectTypeId);
  return ZONE_CATEGORIES.filter(c => showAll || model.allowedZoneCategoryIds.includes(c.id))
    .map(c => ({ ...c, appliesToProjectTypes: Object.entries(PROJECT_CATEGORY_MAP).filter(([,ids]) => ids.includes(c.id)).map(([id]) => id), isRecommended: model.allowedZoneCategoryIds.includes(c.id) }))
    .sort((a,b) => a.sortOrder - b.sortOrder);
}

export function createZoneSeedFromTemplate(template, projectTypeId = 'corporate') {
  const category = getZoneCategory(template.categoryId);
  const isTypical = getProjectZoneModel(projectTypeId).allowedZoneCategoryIds.includes(template.categoryId);
  return {
    name: template.name,
    type: template.zoneType,
    categoryId: template.categoryId,
    categoryName: category?.name || '',
    templateId: template.id,
    area: template.defaultArea,
    task: template.defaultScenario,
    scenario: template.defaultScenario,
    requiredSystemGroups: template.requiredSystemGroups,
    recommendedItems: template.recommendedItems,
    requiredDependencies: template.requiredDependencies,
    typicalWorks: template.typicalWorks,
    requiresEngineerReview: template.requiresEngineerReview,
    nonTypicalForProject: !isTypical,
    recommendationReason: isTypical
      ? `Рекомендовано для выбранного типа проекта: ${category?.name || 'категория зоны'}.`
      : 'Эта зона не типовая для выбранного типа проекта, но её можно добавить вручную.',
    flags: worksToFlags(template.typicalWorks)
  };
}

function worksToFlags(works = []) {
  return {
    install: works.includes('install'),
    pnr: works.includes('pnr'),
    content: works.includes('content'),
    delivery: works.includes('delivery'),
    metal: works.includes('metal'),
    service: works.includes('service')
  };
}

function dependenciesFor(groups = [], works = []) {
  const deps = ['Кабели и расходные материалы'];
  if (groups.some(g => /LED|LCD|Проекторы|Видеостены|Крепления/.test(g)) || works.includes('metal')) deps.push('Крепления / конструкции');
  if (groups.some(g => /Коммутация|Сеть|ВКС|Камеры|Медиасерверы|ПК/.test(g))) deps.push('Сеть / коммутация');
  if (groups.some(g => /LED|Видеостены|Питание|DSP|усилители/.test(g))) deps.push('Питание и резерв мощности');
  if (works.includes('content')) deps.push('Контент / ПО / лицензии');
  if (works.includes('delivery')) deps.push('Логистика');
  return deps;
}

function typicalScenarioFor(projectTypeId) {
  return ({
    corporate: 'Офисные переговорные, ресепшен, demo и AV-инфраструктура.',
    museum: 'Экспозиции, интерактив, медиаконтент и техническая инфраструктура.',
    conference: 'Залы, сцена, трансляция и операторская инфраструктура.',
    retail: 'Showroom, digital signage, интерактив и брендовые welcome-зоны.',
    education: 'Классы, аудитории, гибридное обучение и запись лекций.',
    control: 'Диспетчеризация, мониторинг, видеостены и операторские места.',
    hospitality: 'Лобби, рестораны, конференции отеля и фоновый звук.',
    sport: 'Спортивные залы, медиаэкраны, фан-зоны и служебные зоны.',
    event: 'Сцена, LED, звук, трансляция и временная инфраструктура.',
    public: 'Публичные пространства, навигация, информирование и мероприятия.',
    vr: 'VR / AR, интерактив, контент и вычислительная инфраструктура.'
  }[projectTypeId] || 'Типовой AV-сценарий объекта.');
}
