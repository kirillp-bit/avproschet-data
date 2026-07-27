export const AV_ROLE_SCORING_RULES = [
  role('display-panel', 'LCD / display panel', {
    categories: ['LCD-панели', 'Мониторы'],
    positives: ['professional display', 'commercial display', 'digital display', 'lcd display', 'lcd panel', 'lcd-панель', 'lcd панель', 'дисплей', 'информационная панель', 'профессиональная панель', 'signage display', '4k display'],
    contextual: [['display', 'panel'], ['lcd', 'panel'], ['информационная', 'панель']],
    negatives: ['speaker', 'microphone', 'amplifier', 'усилитель', 'акустика', 'микрофон', 'projector', 'проектор', 'touch panel', 'control panel', 'панель управления', 'настенная панель', 'выносная панель', 'dante', 'rs485', 'пульт', 'крепление', 'bracket', 'mount', 'case', 'чехол'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('projector', 'Projector', {
    categories: ['Проекторы'],
    positives: ['projector', 'laser projector', 'проектор', 'лазерный проектор', 'short throw', 'ultra short throw', 'ansi lumen', 'lumens', 'люмен', '3lcd', 'dlp'],
    contextual: [['laser', 'projector'], ['короткофокусный', 'проектор']],
    negatives: ['projection screen', 'экран проекционный', 'motorized screen', 'display', 'lcd', 'speaker', 'microphone', 'mount', 'bracket', 'лампа для проектора', 'projector lamp', 'projector control', 'контроллер', 'control', 'камера', 'camera'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('projection-screen', 'Projection screen', {
    categories: ['Проекционные экраны'],
    positives: ['projection screen', 'motorized screen', 'manual screen', 'electric screen', 'экран проекционный', 'проекционный экран', 'экран моторизованный', 'моторизованный экран', 'натяжной экран', 'экран настенный', 'screen surface'],
    contextual: [['screen', 'projector'], ['экран', 'проекционный']],
    negatives: ['touch panel', 'projector ', 'проектор ', 'display', 'lcd', 'speaker', 'microphone', 'mount', 'bracket', 'акустика', 'усилитель'],
    disallowAccessories: true,
    minScore: 60
  }),
  role('led-wall', 'LED screen / LED wall', {
    categories: ['LED-экраны', 'Видеостены'],
    positives: ['led screen', 'led wall', 'led display', 'led module', 'led cabinet', 'светодиодный экран', 'led экран', 'led-экран', 'видеостена', 'видео стена', 'pixel pitch', 'пиксельный шаг', 'p1.2', 'p1.5', 'p1.8', 'p2.5', 'p3.9', 'p4.8', 'sending card', 'receiving card', 'led processor', 'видеопроцессор led'],
    contextual: [['led', 'processor'], ['led', 'cabinet'], ['led', 'module'], ['светодиодный', 'экран']],
    negatives: ['touch panel', 'wall mount', 'bracket', 'audio processor', 'microphone', 'speaker', 'case', 'чехол', 'сумка', 'lcd', 'projector', 'rack cabinet'],
    disallowAccessories: true,
    minScore: 62
  }),
  role('ptz-camera', 'PTZ camera', {
    categories: ['PTZ-камеры', 'Камеры'],
    positives: ['ptz camera', 'ptz-камера', 'ptz камера', 'pan tilt zoom', 'ndi camera', 'tracking camera', 'камера ptz', 'камера видеоконференцсвязи', 'camera for video conference'],
    contextual: [['ptz', 'camera'], ['tracking', 'camera'], ['камера', 'вкс']],
    negatives: ['webcam', 'usb camera', 'document camera', 'display', 'microphone', 'speaker', 'mount', 'bracket', 'tripod', 'case'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('webcam-usb-camera', 'Webcam / USB camera', {
    categories: ['Камеры', 'PTZ-камеры'],
    positives: ['webcam', 'usb camera', 'usb-камера', 'веб-камера', 'web camera', 'conference camera', 'video bar', 'videobar', 'видеобар', 'камера для вкс'],
    contextual: [['usb', 'camera'], ['video', 'bar'], ['камера', 'usb']],
    negatives: ['ptz', 'display', 'speaker', 'microphone only', 'mount', 'bracket', 'case'],
    disallowAccessories: true,
    minScore: 56
  }),
  role('microphone', 'Microphone', {
    categories: ['Микрофоны', 'Конференц-системы'],
    positives: ['microphone', 'mic', 'микрофон', 'радиомикрофон', 'gooseneck', 'ceiling mic', 'table mic', 'настольный микрофон', 'потолочный микрофон', 'boundary microphone', 'dante microphone', 'wireless mic', 'конференц-микрофон'],
    contextual: [['ceiling', 'mic'], ['table', 'mic'], ['микрофон', 'потолочный'], ['микрофон', 'настольный']],
    negatives: ['speaker', 'amplifier', 'display', 'camera', 'projector', 'cable only', 'кабель', 'receiver only', 'зарядное устройство'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('speaker', 'Speaker / acoustic system', {
    categories: ['Акустика'],
    positives: ['speaker', 'loudspeaker', 'акустика', 'акустическая система', 'колонка', 'громкоговоритель', 'line array', 'subwoofer', 'сабвуфер', 'ceiling speaker', 'настенная акустика'],
    contextual: [['ceiling', 'speaker'], ['акустическая', 'система'], ['line', 'array']],
    negatives: ['amplifier', 'усилитель', 'dsp', 'audio processor', 'microphone', 'display', 'camera', 'cable', 'mount', 'bracket', 'крепление', 'крепления', 'аксессуар', 'tile rail', 'rail kit'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('dsp-audio-processor', 'DSP / audio processor', {
    categories: ['DSP и усилители'],
    positives: ['dsp', 'audio processor', 'аудиопроцессор', 'цифровой процессор', 'matrix mixer', 'audio matrix', 'микшер', 'mixer', 'echo cancellation', 'aec', 'dante processor'],
    contextual: [['audio', 'processor'], ['matrix', 'mixer'], ['микшер', 'dsp']],
    negatives: ['speaker', 'microphone', 'display', 'projector', 'amplifier only', 'power amplifier', 'усилитель мощности', 'led processor'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('amplifier', 'Amplifier', {
    categories: ['DSP и усилители'],
    positives: ['amplifier', 'power amplifier', 'усилитель', 'усилитель мощности', 'audio amplifier', '4-channel amplifier', '2-channel amplifier', 'class d'],
    contextual: [['power', 'amplifier'], ['усилитель', 'мощности']],
    negatives: ['speaker', 'microphone', 'display', 'projector', 'dsp processor', 'audio processor', 'led processor'],
    disallowAccessories: true,
    minScore: 56
  }),
  role('video-switcher-matrix-scaler', 'Video switcher / matrix / scaler', {
    categories: ['Коммутация'],
    positives: ['video switcher', 'matrix switcher', 'matrix', 'scaler', 'presentation switcher', 'hdmi switcher', 'hdbaset', 'av over ip', 'avoip', 'kvm', 'коммутатор hdmi', 'видеокоммутатор', 'матричный коммутатор', 'масштабатор', 'скалер', 'распределитель hdmi'],
    contextual: [['hdmi', 'matrix'], ['video', 'switcher'], ['матричный', 'коммутатор']],
    negatives: ['network switch', 'ethernet switch', 'poe switch', 'speaker', 'microphone', 'display', 'rack', 'cable only'],
    disallowAccessories: true,
    minScore: 56
  }),
  role('control-processor', 'Control processor', {
    categories: ['Системы управления'],
    positives: ['control processor', 'automation controller', 'контроллер управления', 'процессор управления', 'control system', 'av controller', 'crestron processor', 'amx controller', 'extron control processor'],
    contextual: [['control', 'processor'], ['automation', 'controller'], ['контроллер', 'управления']],
    negatives: ['touch panel', 'display', 'speaker', 'microphone', 'network switch', 'remote control only', 'пульт ду'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('touch-panel-control-panel', 'Touch panel / control panel', {
    categories: ['Системы управления'],
    positives: ['touch panel', 'control panel', 'сенсорная панель управления', 'панель управления', 'touchscreen controller', 'wall panel', 'keypad', 'кнопочная панель'],
    contextual: [['touch', 'panel'], ['control', 'panel'], ['панель', 'управления']],
    negatives: ['interactive display', 'display 55', 'lcd display', 'processor', 'speaker', 'microphone', 'mount', 'bracket'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('network-switch', 'Network switch', {
    categories: ['Сеть'],
    positives: ['network switch', 'ethernet switch', 'poe switch', 'managed switch', 'gigabit switch', 'коммутатор ethernet', 'сетевой коммутатор', 'poe коммутатор', '10g switch', 'av over ip switch'],
    contextual: [['poe', 'switch'], ['managed', 'switch'], ['сетевой', 'коммутатор']],
    negatives: ['video switcher', 'matrix switcher', 'hdmi switch', 'speaker', 'microphone', 'display', 'patch panel', 'кросс-панель'],
    disallowAccessories: true,
    minScore: 56
  }),
  role('rack-cabinet', 'Rack / cabinet', {
    categories: ['Доп. оборудование', 'AV-стойки'],
    positives: ['rack', 'cabinet', 'server rack', 'av rack', '19 inch rack', '19"', 'шкаф', 'стойка', 'рэковый шкаф', 'телекоммуникационный шкаф', 'напольный шкаф', 'настенный шкаф'],
    contextual: [['19', 'rack'], ['рэковый', 'шкаф'], ['серверный', 'шкаф']],
    negatives: ['display', 'projector', 'microphone', 'camera', 'speaker', 'led wall', 'processor', 'коммутатор', 'усилитель'],
    disallowAccessories: false,
    minScore: 55
  }),
  role('mount-bracket', 'Mount / bracket', {
    categories: ['Крепления и конструкции'],
    positives: ['mount', 'bracket', 'wall mount', 'ceiling mount', 'крепление', 'кронштейн', 'подвес', 'стойка для дисплея', 'потолочное крепление', 'настенное крепление', 'vesa', 'адаптер крепления'],
    contextual: [['wall', 'mount'], ['ceiling', 'mount'], ['крепление', 'vesa']],
    negatives: ['display panel', 'projector 4k', 'speaker system', 'microphone', 'amplifier', 'led screen'],
    allowAccessories: true,
    minScore: 52
  }),
  role('cable-infrastructure', 'Cable infrastructure', {
    categories: ['Кабельная инфраструктура'],
    positives: ['cable', 'кабель', 'hdmi cable', 'speaker cable', 'utp', 'ftp', 'patch cord', 'патч-корд', 'патч панель', 'patch panel', 'розетка', 'коннектор', 'разъем', 'connector', 'короб', 'кабель-канал', 'маркировка', 'обжим', 'витая пара'],
    contextual: [['hdmi', 'cable'], ['patch', 'cord'], ['витая', 'пара']],
    negatives: ['display', 'projector', 'speaker system', 'microphone system', 'amplifier', 'processor', 'network switch'],
    allowAccessories: true,
    minScore: 48
  }),
  role('power-ups-pdu', 'Power / UPS / PDU', {
    categories: ['ИБП', 'Питание'],
    positives: ['ups', 'pdu', 'power distribution', 'power supply', 'ИБП', 'ибп', 'блок питания', 'распределитель питания', 'pdu', 'стабилизатор', 'сетевой фильтр', 'аккумулятор для ибп'],
    contextual: [['power', 'distribution'], ['блок', 'питания']],
    negatives: ['display', 'projector', 'speaker', 'microphone', 'camera', 'led screen', 'audio processor'],
    allowAccessories: true,
    minScore: 52
  }),
  role('media-player', 'Media player', {
    categories: ['Медиасерверы', 'ПК'],
    positives: ['media player', 'медиаплеер', 'media server', 'медиасервер', 'signage player', 'content player', 'mini pc', 'мини-пк', 'nuc', 'player 4k', 'workstation', 'рабочая станция'],
    contextual: [['signage', 'player'], ['media', 'server'], ['content', 'player']],
    negatives: ['office pc', 'ноутбук офисный', 'printer', 'server rack', 'display', 'speaker', 'microphone', 'network switch'],
    disallowAccessories: true,
    minScore: 55
  }),
  role('videoconference-codec', 'Videoconference codec', {
    categories: ['ВКС-системы'],
    positives: ['video conference', 'videoconference', 'conference terminal', 'codec', 'teams room', 'zoom room', 'вкс', 'терминал вкс', 'кодек', 'room kit', 'collaboration bar', 'video bar', 'видеобар', 'endpoint'],
    contextual: [['conference', 'terminal'], ['teams', 'room'], ['zoom', 'room'], ['терминал', 'вкс']],
    negatives: ['theatrical spotlight', 'прожектор театральный', 'lighting fixture', 'audio processor', 'speaker', 'microphone only', 'display only', 'mount', 'bracket', 'case'],
    disallowAccessories: true,
    minScore: 60
  }),
  role('interactive-display', 'Interactive display', {
    categories: ['Интерактивные панели'],
    positives: ['interactive display', 'interactive panel', 'interactive flat panel', 'touch display', 'сенсорный дисплей', 'интерактивная панель', 'интерактивный дисплей', 'интерактивная доска', 'ifp', 'touchscreen display'],
    contextual: [['interactive', 'display'], ['interactive', 'panel'], ['интерактивная', 'панель']],
    negatives: ['control panel', 'touch panel control', 'speaker', 'microphone', 'amplifier', 'mount', 'bracket', 'case'],
    disallowAccessories: true,
    minScore: 58
  }),
  role('digital-signage', 'Digital signage', {
    categories: ['LCD-панели', 'Медиасерверы'],
    positives: ['digital signage', 'signage display', 'signage player', 'информационный экран', 'рекламный дисплей', 'контент-плейаут', 'media signage'],
    contextual: [['signage', 'display'], ['signage', 'player']],
    negatives: ['speaker', 'microphone', 'amplifier', 'mount', 'case'],
    disallowAccessories: true,
    minScore: 55
  }),
  role('lighting', 'Lighting', {
    categories: ['Свет'],
    positives: ['lighting', 'stage light', 'spotlight', 'moving head', 'прожектор', 'светильник', 'сценический свет', 'театральный прожектор', 'dmx', 'wash light', 'profile spot'],
    contextual: [['stage', 'light'], ['moving', 'head'], ['театральный', 'прожектор']],
    negatives: ['projector', 'display', 'speaker', 'microphone', 'network switch', 'cable only'],
    disallowAccessories: true,
    minScore: 55
  }),
  role('vr-ar', 'VR / AR', {
    categories: ['VR / AR'],
    positives: ['vr headset', 'ar headset', 'virtual reality', 'augmented reality', 'mixed reality', 'шлем vr', 'vr шлем', 'очки vr', 'очки ar', 'виртуальная реальность', 'дополненная реальность', 'quest', 'vive', 'hololens'],
    contextual: [['vr', 'headset'], ['ar', 'glasses'], ['шлем', 'vr']],
    negatives: ['display', 'speaker', 'microphone', 'amplifier', 'mount', 'case', 'cable'],
    disallowAccessories: true,
    minScore: 56
  }),
  role('works-installation-commissioning', 'Works / installation / commissioning', {
    categories: ['Монтажные работы', 'Монтаж', 'ПНР', 'Работы'],
    positives: ['installation', 'commissioning', 'setup', 'works', 'service', 'монтаж', 'пнр', 'пусконаладка', 'настройка', 'работы', 'инсталляция', 'шефмонтаж'],
    contextual: [['пуско', 'налад'], ['installation', 'works']],
    negatives: ['display', 'speaker', 'projector', 'microphone', 'camera', 'cable only'],
    allowAccessories: true,
    minScore: 48
  })
];

export const TEMPLATE_CATEGORY_TO_ROLE = {
  'LCD-панели': 'display-panel',
  'Мониторы': 'display-panel',
  'Проекторы': 'projector',
  'Проекционные экраны': 'projection-screen',
  'LED-экраны': 'led-wall',
  'Видеостены': 'led-wall',
  'Камеры': 'ptz-camera',
  'PTZ-камеры': 'ptz-camera',
  'Микрофоны': 'microphone',
  'Конференц-системы': 'microphone',
  'Акустика': 'speaker',
  'DSP и усилители': 'dsp-audio-processor',
  'Коммутация': 'video-switcher-matrix-scaler',
  'Системы управления': 'control-processor',
  'Сеть': 'network-switch',
  'AV-стойки': 'rack-cabinet',
  'Доп. оборудование': 'rack-cabinet',
  'Крепления и конструкции': 'mount-bracket',
  'Кабельная инфраструктура': 'cable-infrastructure',
  'Питание': 'power-ups-pdu',
  'ИБП': 'power-ups-pdu',
  'Медиасерверы': 'media-player',
  'ПК': 'media-player',
  'ВКС-системы': 'videoconference-codec',
  'Интерактивные панели': 'interactive-display',
  'Digital Signage': 'digital-signage',
  'Свет': 'lighting',
  'VR / AR': 'vr-ar',
  'Монтажные работы': 'works-installation-commissioning',
  'Монтаж': 'works-installation-commissioning',
  'ПНР': 'works-installation-commissioning',
  'Работы': 'works-installation-commissioning'
};

export const ROLE_ALIASES = {
  display: 'display-panel',
  'lcd / display panel': 'display-panel',
  'display panel': 'display-panel',
  projector: 'projector',
  'projection screen': 'projection-screen',
  'led / video wall': 'led-wall',
  'led screen / led wall': 'led-wall',
  camera: 'ptz-camera',
  'ptz camera': 'ptz-camera',
  'webcam / usb camera': 'webcam-usb-camera',
  microphone: 'microphone',
  speaker: 'speaker',
  'speaker / acoustic system': 'speaker',
  dsp: 'dsp-audio-processor',
  'dsp / audio processor': 'dsp-audio-processor',
  amplifier: 'amplifier',
  'matrix / switcher': 'video-switcher-matrix-scaler',
  'video switcher / matrix / scaler': 'video-switcher-matrix-scaler',
  'control processor': 'control-processor',
  'touch panel': 'touch-panel-control-panel',
  'touch panel / control panel': 'touch-panel-control-panel',
  'network switch': 'network-switch',
  'rack / cabinet': 'rack-cabinet',
  'rack / power': 'power-ups-pdu',
  'installation accessory': 'mount-bracket',
  'mount / bracket': 'mount-bracket',
  'cable / infrastructure': 'cable-infrastructure',
  'cable infrastructure': 'cable-infrastructure',
  'power / ups / pdu': 'power-ups-pdu',
  'media player': 'media-player',
  'codec / video conference': 'videoconference-codec',
  'videoconference codec': 'videoconference-codec',
  'interactive display': 'interactive-display',
  'digital signage': 'digital-signage',
  lighting: 'lighting',
  'vr / ar': 'vr-ar',
  works: 'works-installation-commissioning',
  'works / installation / commissioning': 'works-installation-commissioning'
};

export const MAIN_DEVICE_ROLES = new Set(AV_ROLE_SCORING_RULES.filter(rule => !rule.allowAccessories).map(rule => rule.id));

function role(id, label, cfg = {}) {
  return {
    id,
    label,
    categories: cfg.categories || [],
    positives: cfg.positives || [],
    contextual: cfg.contextual || [],
    negatives: cfg.negatives || [],
    brandHints: cfg.brandHints || [],
    categoryHints: cfg.categoryHints || [],
    allowAccessories: Boolean(cfg.allowAccessories),
    disallowAccessories: cfg.disallowAccessories !== false && !cfg.allowAccessories,
    minScore: cfg.minScore || 55
  };
}
