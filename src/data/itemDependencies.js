export const ITEM_DEPENDENCIES = [
  dep('dep-display-mount', 'display', 'required', 'mounting', 'Крепление для дисплея', 'Дисплей должен быть закреплён на стене, стойке или конструкции.', 'warning'),
  dep('dep-display-signal', 'display', 'required', 'signal', 'Сигнальный тракт HDMI / HDBaseT / AVoIP', 'Нужна коммутация и доставка сигнала до дисплея.', 'warning'),
  dep('dep-display-cable', 'display', 'required', 'cable', 'Кабели дисплея', 'Нужны сигнальные и силовые кабели.', 'warning'),
  dep('dep-display-install', 'display', 'recommended', 'works', 'Монтаж и ПНР дисплея', 'Нужны монтаж и базовая проверка изображения.', 'recommendation'),

  dep('dep-projector-mount', 'display-projector', 'required', 'mounting', 'Потолочное крепление проектора', 'Проектору требуется крепление и трасса до источника.', 'warning'),
  dep('dep-projector-screen', 'display-projector', 'recommended', 'display-projection-screen', 'Проекционный экран', 'Для переговорных и залов нужен экран или подготовленная поверхность.', 'recommendation'),
  dep('dep-projector-signal', 'display-projector', 'required', 'signal', 'Сигнальная линия проектора', 'Нужен HDMI/HDBaseT/AVoIP тракт.', 'warning'),
  dep('dep-projector-pnr', 'display-projector', 'recommended', 'works', 'Юстировка и ПНР проектора', 'Нужна настройка геометрии, яркости и сценариев.', 'recommendation'),

  dep('dep-led-processor', 'led', 'required', 'led-processor', 'LED-процессор', 'LED-экран не работает без процессинга.', 'error'),
  dep('dep-led-structure', 'led', 'required', 'led-structure', 'Конструкция LED', 'Нужна несущая конструкция или подвес.', 'error'),
  dep('dep-led-power', 'led', 'required', 'rack-power', 'Питание LED / PDU', 'Нужно распределение питания и защита.', 'warning'),
  dep('dep-led-spare', 'led', 'recommended', 'led-spare-module', 'Запасные LED-модули', 'Для эксплуатации нужен сервисный запас.', 'recommendation'),
  dep('dep-led-pnr', 'led', 'required', 'works', 'Монтаж и настройка LED', 'Нужна сборка, калибровка и проверка контента.', 'warning'),
  dep('dep-led-logistics', 'led', 'recommended', 'logistics-service', 'Логистика LED', 'LED требует доставки, упаковки и иногда такелажа.', 'recommendation'),

  dep('dep-vcs-display', 'vcs', 'required', 'display', 'Дисплей для ВКС', 'ВКС-комплекту нужен экран для удалённых участников.', 'warning'),
  dep('dep-vcs-audio', 'vcs', 'recommended', 'audio', 'Микрофоны и акустика', 'Качество ВКС зависит от аудиотракта.', 'recommendation'),
  dep('dep-vcs-signal', 'vcs', 'required', 'signal', 'USB / HDMI / BYOD подключение', 'Нужно подключение пользователя и/или room PC.', 'warning'),
  dep('dep-vcs-pnr', 'vcs', 'recommended', 'works', 'ПНР тестовых звонков', 'Нужно проверить Teams/Zoom, камеру и звук.', 'recommendation'),

  dep('dep-mic-dsp', 'audio-microphone', 'required', 'audio-dsp', 'DSP или микшер', 'Микрофонам нужен аудиопроцессинг, микшер или интерфейс.', 'warning'),
  dep('dep-mic-cable', 'audio-microphone', 'required', 'cable', 'Микрофонный кабель / сеть', 'Нужно предусмотреть кабели или Dante/USB тракт.', 'warning'),
  dep('dep-speaker-amp', 'audio-speaker', 'required', 'audio-amplifier', 'Усилитель', 'Пассивной акустике нужен усилитель.', 'warning'),
  dep('dep-speaker-dsp', 'audio-speaker', 'recommended', 'audio-dsp', 'DSP / микшер', 'Для выравнивания и маршрутизации нужен процессор.', 'recommendation'),
  dep('dep-speaker-cable', 'audio-speaker', 'required', 'cable', 'Акустический кабель', 'Нужен кабель от усилителя к акустике.', 'warning'),

  dep('dep-rack-pdu', 'rack-av', 'required', 'rack-pdu', 'PDU', 'В стойке нужен управляемый или базовый блок питания.', 'warning'),
  dep('dep-rack-shelves', 'rack-av', 'recommended', 'rack-shelf', 'Рэковые полки', 'Часть оборудования требует полок.', 'recommendation'),
  dep('dep-rack-cable', 'rack-av', 'recommended', 'rack-cable-management', 'Кабельная организация', 'Нужны органайзеры, маркировка и патч-панели.', 'recommendation'),
  dep('dep-rack-vent', 'rack-av', 'recommended', 'rack-ventilation', 'Вентиляция стойки', 'Нужен тепловой резерв для активного оборудования.', 'recommendation')
];

function dep(id, sourceCategoryId, dependencyType, targetCategoryId, fallbackName, reason, severity) {
  return { id, sourceItemId: '', sourceCategoryId, dependencyType, required: dependencyType === 'required', targetItemId: '', targetCategoryId, targetSystemGroup: '', fallbackName, suggestedQtyFormula: '1', reason, severity };
}
