# avproschet-data

## Модуль поиска: Serper + Jina Reader

`src/search/` — связка «поиск в Google + извлечение текста страницы» для сбора данных
о ценах и оборудовании: поиск через [Serper.dev](https://serper.dev), чтение найденных
страниц в Markdown через [Jina Reader](https://jina.ai/reader).

- `search(query, { num, gl, hl })` — POST на `https://google.serper.dev/search`, возвращает `[{ title, url, snippet }]`.
- `extractContent(url)` — GET на `https://r.jina.ai/<url>`, возвращает текст страницы в Markdown.
- `searchAndExtract(query, { num })` — поиск и параллельное чтение найденных страниц,
  возвращает `[{ title, url, snippet, content, error }]`. Недоступная страница не ломает батч:
  для неё `content: null`, а причина попадает в `error`.

### Настройка ключей

Скопируйте `.env.example` в `.env` и заполните `SERPER_API_KEY` (обязательный) и
`JINA_API_KEY` (необязательный, повышает лимиты Jina Reader). Ключи в коде не хранятся.

Модуль ищет значения в таком порядке:

1. `process.env` — Node-скрипты и тесты;
2. глобальная переменная браузера, например `window.SERPER_API_KEY` (по аналогии с `window.SUPPLIER_DATA_BASE` в `index.html`);
3. `localStorage` под ключом `avproschet.env.SERPER_API_KEY`.

Ключ можно передать и явным параметром: `search(query, { apiKey })`.

> В браузере запросы уходят напрямую в сторонние API — ключ будет виден пользователю,
> а запрос зависит от CORS. Для публичного развёртывания вызывайте модуль из Node или
> через собственный прокси.

### Пример вызова

```js
import { searchAndExtract } from './src/search/index.js';

const results = await searchAndExtract('LED модуль P2.5 внутренний цена поставщик', { num: 3 });
for (const item of results) {
  console.log(item.title, item.url, item.content?.length ?? item.error);
}
```

Готовый скрипт:

```bash
SERPER_API_KEY=ваш_ключ node examples/searchSupplierPrices.js "LED модуль P3.91 наружный цена"
```

### Тесты

```bash
node --test tests/
```

HTTP-вызовы в тестах замоканы через опцию `fetchImpl`, реальная сеть не используется.
