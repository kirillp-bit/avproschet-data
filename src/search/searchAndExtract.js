import { search } from './serperClient.js';
import { extractContent } from './jinaReader.js';

const DEFAULT_NUM = 5;

// Ищет через Serper и параллельно вычитывает найденные страницы через Jina Reader.
// Возвращает массив { title, url, snippet, content, error }.
export async function searchAndExtract(query, options = {}) {
  const {
    num = DEFAULT_NUM,
    gl,
    hl,
    serperApiKey,
    jinaApiKey,
    timeoutMs,
    signal,
    fetchImpl
  } = options;
  const results = await search(query, { num, gl, hl, apiKey: serperApiKey, signal, fetchImpl });
  return Promise.all(results.map(async result => {
    try {
      const content = await extractContent(result.url, { apiKey: jinaApiKey, timeoutMs, signal, fetchImpl });
      return { ...result, content, error: null };
    } catch (error) {
      // Одна недоступная страница не должна ломать весь батч.
      return { ...result, content: null, error: String(error?.message || error) };
    }
  }));
}
