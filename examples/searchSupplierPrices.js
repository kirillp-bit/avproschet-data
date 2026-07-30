// Пример работы модуля поиска: цены на LED-модуль у поставщиков.
// Запуск (Node 18+, ключ берётся из окружения):
//   SERPER_API_KEY=ваш_ключ node examples/searchSupplierPrices.js
//   SERPER_API_KEY=ваш_ключ node examples/searchSupplierPrices.js "LED модуль P3.91 наружный цена"
import { searchAndExtract } from '../src/search/index.js';

const DEFAULT_QUERY = 'LED модуль P2.5 внутренний цена поставщик';
const PREVIEW_LENGTH = 400;

async function main() {
  const query = process.argv.slice(2).join(' ') || DEFAULT_QUERY;
  console.log(`Запрос: ${query}\n`);
  const results = await searchAndExtract(query, { num: 3 });
  if (!results.length) {
    console.log('Ничего не найдено.');
    return;
  }
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   ${result.url}`);
    console.log(`   ${result.snippet || '—'}`);
    if (result.error) console.log(`   Текст не получен: ${result.error}`);
    else console.log(`   Текст (${result.content.length} символов): ${result.content.slice(0, PREVIEW_LENGTH).replace(/\s+/g, ' ')}…`);
    console.log('');
  });
}

main().catch(error => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
