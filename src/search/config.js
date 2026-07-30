// Ключи API читаются только из окружения и никогда не хранятся в коде репозитория.
// Порядок поиска значения:
//   1) process.env — Node-режим (скрипты, тесты, серверный прокси);
//   2) глобальная переменная (window.SERPER_API_KEY) — как window.SUPPLIER_DATA_BASE в index.html;
//   3) localStorage под ключом avproschet.env.<ИМЯ> — ручной ввод ключа в браузере.
const STORAGE_PREFIX = 'avproschet.env.';

export function readEnvValue(name) {
  const fromProcess = globalThis.process?.env?.[name];
  if (fromProcess) return String(fromProcess).trim();
  const fromGlobal = globalThis[name];
  if (typeof fromGlobal === 'string' && fromGlobal) return fromGlobal.trim();
  try {
    const fromStorage = globalThis.localStorage?.getItem(`${STORAGE_PREFIX}${name}`);
    if (fromStorage) return fromStorage.trim();
  } catch { /* приватный режим браузера — игнорируем */ }
  return '';
}
