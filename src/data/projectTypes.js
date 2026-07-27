import { PROJECT_TYPE_ZONE_MODEL } from './zoneTaxonomy.js';

const baseTypes = [
  { id: 'corporate', name: 'Корпоративный офис', description: 'Переговорные, ресепшен, open space, demo-зоны и корпоративная AV-инфраструктура.' },
  { id: 'museum', name: 'Музей / экспозиция', description: 'Экспозиционные пространства, интерактив, иммерсивные зоны, навигация и контент.' },
  { id: 'conference', name: 'Конференц-центр', description: 'Конференц-залы, мероприятия, сцены, трансляции и операторские.' },
  { id: 'retail', name: 'Retail / showroom', description: 'Шоурумы, витрины, digital signage, демо-зоны и интерактив.' },
  { id: 'education', name: 'Образовательный объект', description: 'Классы, аудитории, лаборатории, гибридное обучение и запись лекций.' },
  { id: 'control', name: 'Диспетчерская / ситуационный центр', description: 'Ситуационные центры, NOC / SOC, видеостены мониторинга и операторские места.' },
  { id: 'hospitality', name: 'HoReCa / отель', description: 'Отели, рестораны, лобби, банкетные и фоновые аудиозоны.' },
  { id: 'sport', name: 'Спортивный объект', description: 'Спортивные залы, фитнес, фан-зоны, судейские и комментаторские.' },
  { id: 'event', name: 'Event / сцена', description: 'Временные и постоянные event-зоны, сцены, LED, звук и backstage.' },
  { id: 'public', name: 'Общественное пространство / гос. объект', description: 'Публичная навигация, информирование, залы и сервисные AV-сценарии.' },
  { id: 'vr', name: 'VR / симуляторы / тренажёры', description: 'VR / AR, тренажёры, интерактивные классы и контентные зоны.' }
];

export const PROJECT_TYPES = baseTypes.map(type => ({
  ...type,
  ...(PROJECT_TYPE_ZONE_MODEL[type.id] || PROJECT_TYPE_ZONE_MODEL.corporate)
}));
