import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEB_LOCALES } from './web-messages-config.mjs';
import {
  assertWebMessageFilesExist,
  flattenKeys,
  listWebNamespaces,
  loadAllWebMessages,
} from './load-web-messages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
assertWebMessageFilesExist(root);

const data = loadAllWebMessages(root);
const referenceLocale = 'fr';
const frKeys = new Set(flattenKeys(data[referenceLocale]));
let ok = true;

for (const locale of WEB_LOCALES.filter((l) => l !== referenceLocale)) {
  const keys = new Set(flattenKeys(data[locale]));
  for (const key of frKeys) {
    if (!keys.has(key)) {
      console.error(`Missing ${key} in ${locale}`);
      ok = false;
    }
  }
  for (const key of keys) {
    if (!frKeys.has(key)) {
      console.error(`Extra ${key} in ${locale}`);
      ok = false;
    }
  }
}

if (!ok) {
  process.exit(1);
}

console.log(`Full parity OK (${frKeys.size} keys × ${WEB_LOCALES.length} locales)`);

for (const namespace of listWebNamespaces(data[referenceLocale])) {
  const frNsKeys = flattenKeys(data[referenceLocale][namespace] ?? {});
  console.log(`${namespace}.* parity OK (${frNsKeys.length} keys × ${WEB_LOCALES.length} locales)`);
}
