export const RELEVANCE = {
  AV_CORE: 'av_core',
  AV_INFRASTRUCTURE: 'av_infrastructure',
  IT_RELATED: 'it_related',
  CONSUMABLES: 'consumables',
  QUESTIONABLE: 'questionable',
  HIDDEN: 'hidden',
  SERVICE: 'service'
};

export const RELEVANCE_ORDER = [
  RELEVANCE.AV_CORE,
  RELEVANCE.AV_INFRASTRUCTURE,
  RELEVANCE.IT_RELATED,
  RELEVANCE.CONSUMABLES,
  RELEVANCE.QUESTIONABLE,
  RELEVANCE.HIDDEN
];

export const DEFAULT_VISIBLE_RELEVANCE = [RELEVANCE.AV_CORE, RELEVANCE.AV_INFRASTRUCTURE, RELEVANCE.SERVICE];

const avCore = [
  'professional display', 'pro display', 'signage', 'digital signage', 'display panel', 'led screen', 'led wall', 'led processor', 'led controller', 'video wall', 'videowall', 'projector', 'projection', 'screen', 'ptz', 'camera', 'webcam', 'videobar', 'video bar', 'conference', 'conferencing', 'microphone', 'mic', 'speaker', 'loudspeaker', 'amplifier', 'dsp', 'audio processor', 'mixer', 'matrix', 'scaler', 'extender', 'hdbaset', 'hdmi matrix', 'hdmi switch', 'av switch', 'switcher', 'avoip', 'av-over-ip', 'ndi', 'dante', 'control processor', 'touch panel', 'media player', 'signage player', 'interactive panel', 'kiosk',
  'профессиональный дисплей', 'дисплей', 'панель', 'проектор', 'проекционный', 'экран', 'видеостена', 'светодиодный экран', 'led экран', 'led-процессор', 'видеоконференц', 'вкс', 'ptz', 'камера', 'веб-камера', 'видеобар', 'микрофон', 'акустика', 'громкоговоритель', 'усилитель', 'dsp', 'аудиопроцессор', 'процессор звука', 'микшер', 'матрица', 'масштабатор', 'удлинитель hdmi', 'hdbaset', 'av over ip', 'коммутатор av', 'медиаплеер', 'интерактивная панель', 'сенсорный киоск', 'сенсорная панель', 'система управления'
];

const avInfrastructure = [
  'cable', 'connector', 'adapter cable', 'bracket', 'mount', 'rack', 'pdu', 'ups', 'patch panel', 'keystone', 'cat6', 'cat7', 'fiber', 'optical', 'power distribution', 'power strip', 'distribution unit', 'flight case',
  'кабель', 'коннектор', 'разъем', 'разъём', 'крепление', 'кронштейн', 'стойка', 'рэк', 'рэковый шкаф', 'шкаф', 'ибп', 'ups', 'pdu', 'патч-панель', 'витая пара', 'оптика', 'оптический', 'кабельный канал', 'лоток', 'монтажный материал', 'силовое распределение', 'удлинитель питания'
];

const itRelated = [
  'mini pc', 'pc', 'computer', 'workstation', 'server', 'nas', 'network switch', 'ethernet switch', 'router', 'access point', 'wi-fi', 'wifi', 'gpu', 'graphics card', 'ssd', 'hdd', 'ram', 'memory module', 'cpu', 'processor intel', 'motherboard', 'notebook', 'laptop', 'computer monitor', 'kvm', 'keyboard', 'mouse',
  'компьютер', 'мини-пк', 'мини пк', 'рабочая станция', 'сервер', 'nas', 'сетевой коммутатор', 'коммутатор сетевой', 'маршрутизатор', 'роутер', 'точка доступа', 'видеокарта', 'накопитель', 'ssd', 'hdd', 'процессор intel', 'процессор amd', 'оперативная память', 'память ddr', 'материнская плата', 'ноутбук', 'монитор компьютерный', 'kvm', 'клавиатура', 'мышь'
];

const consumables = [
  'battery', 'adapter', 'charger', 'cleaning', 'cleaner', 'tape', 'screw', 'fastener', 'zip tie', 'cable tie', 'label', 'sticker', 'bag', 'packaging',
  'батарейка', 'аккумулятор', 'адаптер', 'зарядное', 'зарядка', 'чистящее', 'чистящий', 'крепеж', 'крепёж', 'винт', 'саморез', 'стяжка', 'изолента', 'расходник', 'упаковка', 'наклейка'
];

const hidden = [
  'office chair', 'kettle', 'vacuum cleaner', 'refrigerator', 'microwave', 'tableware', 'clothes', 'toy', 'paper a4', 'printer cartridge', 'random office goods',
  'бытовая техника', 'чайник', 'пылесос', 'холодильник', 'микроволновка', 'посуда', 'мебель', 'одежда', 'игрушка', 'канцтовары', 'бумага', 'бумага a4', 'картридж', 'офисное кресло', 'бытовой аксессуар', 'принтер', 'сканер'
];

const service = ['монтаж', 'услуга', 'работа', 'работы', 'пусконаладка', 'пнр', 'доставка', 'логистика', 'шеф-монтаж', 'installation service'];

export const CATALOG_RELEVANCE_RULES = {
  keywords: { av_core: avCore, av_infrastructure: avInfrastructure, it_related: itRelated, consumables, hidden, service },
  strongAv: ['led wall', 'led screen', 'video wall', 'professional display', 'projector', 'projection', 'ptz', 'camera', 'microphone', 'speaker', 'amplifier', 'signage player', 'media player', 'ptz', 'dsp', 'hdbaset', 'dante', 'видеостена', 'светодиодный экран', 'вкс', 'медиаплеер'],
  strongInfrastructure: ['pdu', 'ups', 'rack', 'patch panel', 'cat6', 'cat7', 'cable', 'connector', 'bracket', 'mount', 'кабель', 'кронштейн', 'ибп', 'патч-панель'],
  strongIt: ['cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'hdd', 'processor intel', 'процессор intel', 'материнская плата', 'видеокарта', 'память ddr'],
  avSwitchTerms: ['hdmi switch', 'av switch', 'matrix', 'switcher', 'коммутатор av', 'матрица'],
  networkSwitchTerms: ['network switch', 'ethernet switch', 'сетевой коммутатор', 'коммутатор сетевой'],
  mediaServerContext: ['media server', 'media player', 'signage player', 'медиасервер', 'медиаплеер', 'signage'],
  labels: {
    av_core: 'AV-оборудование',
    av_infrastructure: 'Инфраструктура',
    it_related: 'IT / компьютеры',
    consumables: 'Расходники',
    questionable: 'Требует проверки',
    hidden: 'Скрытое',
    service: 'Работы/услуги'
  }
};
