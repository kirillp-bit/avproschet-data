import { readEnvValue } from './config.js';

// Serper.dev — обёртка над Google Search API (~$0.30–1 за 1000 запросов).
const SERPER_ENDPOINT = 'https://google.serper.dev/search';
const DEFAULT_NUM = 10;

function normalizeResults(payload, limit) {
  const organic = Array.isArray(payload?.organic) ? payload.organic : [];
  return organic
    .filter(row => typeof row?.link === 'string' && row.link)
    .slice(0, limit)
    .map(row => ({
      title: String(row.title || '').trim(),
      url: row.link,
      snippet: String(row.snippet || '').trim()
    }));
}

// Возвращает массив { title, url, snippet }.
export async function search(query, options = {}) {
  const text = String(query || '').trim();
  if (!text) throw new Error('Serper: пустой поисковый запрос');
  const {
    num = DEFAULT_NUM,
    gl = 'ru',
    hl = 'ru',
    apiKey = readEnvValue('SERPER_API_KEY'),
    signal,
    fetchImpl = globalThis.fetch
  } = options;
  if (!apiKey) throw new Error('Serper: не задан SERPER_API_KEY (см. .env.example)');
  const response = await fetchImpl(SERPER_ENDPOINT, {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, num, gl, hl }),
    signal
  });
  if (!response.ok) throw new Error(`Serper: запрос не выполнен (${response.status} ${response.statusText || ''})`.trim());
  return normalizeResults(await response.json(), num);
}
