// Запуск: node --test tests/
// HTTP-вызовы замоканы через опцию fetchImpl, реальная сеть не используется.
import test from 'node:test';
import assert from 'node:assert/strict';
import { search } from '../src/search/serperClient.js';
import { extractContent } from '../src/search/jinaReader.js';
import { searchAndExtract } from '../src/search/searchAndExtract.js';

const SERPER_RESPONSE = {
  organic: [
    { title: 'LED модуль P2.5', link: 'https://example.com/led-p25', snippet: 'Цена 4 900 ₽' },
    { title: 'LED модуль P3.91', link: 'https://example.com/led-p391', snippet: 'Цена 5 400 ₽' },
    { title: 'Без ссылки', snippet: 'Такой результат отбрасываем' }
  ]
};

function jsonResponse(payload) {
  return { ok: true, status: 200, statusText: 'OK', json: async () => payload };
}

function textResponse(text) {
  return { ok: true, status: 200, statusText: 'OK', text: async () => text };
}

test('search возвращает нормализованные результаты и передаёт ключ в заголовке', async () => {
  const calls = [];
  const results = await search('LED модуль цена', {
    num: 5,
    apiKey: 'test-key',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return jsonResponse(SERPER_RESPONSE);
    }
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://google.serper.dev/search');
  assert.equal(calls[0].init.headers['X-API-KEY'], 'test-key');
  assert.deepEqual(JSON.parse(calls[0].init.body), { q: 'LED модуль цена', num: 5, gl: 'ru', hl: 'ru' });
  assert.deepEqual(results, [
    { title: 'LED модуль P2.5', url: 'https://example.com/led-p25', snippet: 'Цена 4 900 ₽' },
    { title: 'LED модуль P3.91', url: 'https://example.com/led-p391', snippet: 'Цена 5 400 ₽' }
  ]);
});

test('search требует ключ и непустой запрос', async () => {
  await assert.rejects(() => search('', { apiKey: 'test-key' }), /пустой поисковый запрос/);
  await assert.rejects(() => search('LED', { apiKey: '' }), /SERPER_API_KEY/);
});

test('extractContent обращается к r.jina.ai и добавляет Authorization при наличии ключа', async () => {
  const calls = [];
  const content = await extractContent('https://example.com/led-p25', {
    apiKey: 'jina-key',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return textResponse('  # LED модуль P2.5\nЦена 4 900 ₽  ');
    }
  });
  assert.equal(calls[0].url, 'https://r.jina.ai/https://example.com/led-p25');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer jina-key');
  assert.equal(content, '# LED модуль P2.5\nЦена 4 900 ₽');
});

test('extractContent работает без ключа и отклоняет не-http ссылки', async () => {
  const calls = [];
  await extractContent('https://example.com/a', {
    apiKey: '',
    fetchImpl: async (url, init) => {
      calls.push(init);
      return textResponse('текст');
    }
  });
  assert.equal(calls[0].headers.Authorization, undefined);
  await assert.rejects(() => extractContent('ftp://example.com'), /http\(s\)-ссылка/);
});

test('searchAndExtract не ломает батч из-за одной недоступной страницы', async () => {
  const results = await searchAndExtract('LED модуль цена', {
    num: 2,
    serperApiKey: 'test-key',
    fetchImpl: async url => {
      if (url === 'https://google.serper.dev/search') return jsonResponse(SERPER_RESPONSE);
      if (url.endsWith('/led-p25')) return textResponse('Текст первой страницы');
      return { ok: false, status: 502, statusText: 'Bad Gateway' };
    }
  });
  assert.equal(results.length, 2);
  assert.deepEqual(results[0], {
    title: 'LED модуль P2.5',
    url: 'https://example.com/led-p25',
    snippet: 'Цена 4 900 ₽',
    content: 'Текст первой страницы',
    error: null
  });
  assert.equal(results[1].content, null);
  assert.match(results[1].error, /502/);
});
