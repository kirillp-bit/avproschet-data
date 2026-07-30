import { readEnvValue } from './config.js';

// Jina Reader отдаёт очищенный Markdown страницы по префиксу https://r.jina.ai/<url>.
// Без ключа работает с базовыми лимитами, JINA_API_KEY повышает лимиты.
const JINA_ENDPOINT = 'https://r.jina.ai/';
const DEFAULT_TIMEOUT_MS = 30000;

function resolveSignal(signal, timeoutMs) {
  if (signal) return signal;
  if (!timeoutMs || typeof AbortSignal?.timeout !== 'function') return undefined;
  return AbortSignal.timeout(timeoutMs);
}

// Возвращает текст страницы в Markdown.
export async function extractContent(url, options = {}) {
  const target = String(url || '').trim();
  if (!/^https?:\/\//i.test(target)) throw new Error(`Jina Reader: ожидается http(s)-ссылка, получено: ${target || '—'}`);
  const {
    apiKey = readEnvValue('JINA_API_KEY'),
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    fetchImpl = globalThis.fetch
  } = options;
  const headers = { Accept: 'text/plain' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const response = await fetchImpl(`${JINA_ENDPOINT}${target}`, {
    headers,
    signal: resolveSignal(signal, timeoutMs)
  });
  if (!response.ok) throw new Error(`Jina Reader: страница не прочитана (${response.status} ${response.statusText || ''})`.trim());
  return (await response.text()).trim();
}
