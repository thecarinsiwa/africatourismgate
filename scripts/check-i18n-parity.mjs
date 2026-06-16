import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADMIN_LOCALES,
  ADMIN_MODULE_NAMES,
  ADMIN_SHELL_NAMESPACES,
} from './admin-messages-config.mjs';
import { flattenKeys, loadAllAdminMessages } from './load-admin-messages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = loadAllAdminMessages(root);
const referenceLocale = 'fr';
const frKeys = new Set(flattenKeys(data[referenceLocale]));
let ok = true;

for (const locale of ADMIN_LOCALES.filter((l) => l !== referenceLocale)) {
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

if (ok) {
  console.log(`Full parity OK (${frKeys.size} keys × ${ADMIN_LOCALES.length} locales)`);
}

for (const namespace of [...ADMIN_SHELL_NAMESPACES, 'pages']) {
  const frNsKeys = new Set(flattenKeys(data[referenceLocale][namespace] ?? {}));
  let nsOk = true;

  for (const locale of ADMIN_LOCALES.filter((l) => l !== referenceLocale)) {
    const keys = new Set(flattenKeys(data[locale][namespace] ?? {}));
    for (const key of frNsKeys) {
      if (!keys.has(key)) {
        console.error(`Missing ${namespace}.${key} in ${locale}`);
        nsOk = false;
        ok = false;
      }
    }
    for (const key of keys) {
      if (!frNsKeys.has(key)) {
        console.error(`Extra ${namespace}.${key} in ${locale}`);
        nsOk = false;
        ok = false;
      }
    }
  }

  if (nsOk) {
    console.log(`${namespace}.* parity OK (${frNsKeys.size} keys × ${ADMIN_LOCALES.length} locales)`);
  }
}

const modulesFrKeys = new Set(flattenKeys(data[referenceLocale].modules ?? {}));
let modulesOk = true;

for (const locale of ADMIN_LOCALES.filter((l) => l !== referenceLocale)) {
  const keys = new Set(flattenKeys(data[locale].modules ?? {}));
  for (const key of modulesFrKeys) {
    if (!keys.has(key)) {
      console.error(`Missing modules.${key} in ${locale}`);
      modulesOk = false;
      ok = false;
    }
  }
  for (const key of keys) {
    if (!modulesFrKeys.has(key)) {
      console.error(`Extra modules.${key} in ${locale}`);
      modulesOk = false;
      ok = false;
    }
  }
}

if (modulesOk) {
  console.log(`modules.* parity OK (${modulesFrKeys.size} keys × ${ADMIN_LOCALES.length} locales)`);
}

for (const moduleName of ADMIN_MODULE_NAMES) {
  const frModKeys = new Set(flattenKeys(data[referenceLocale].modules?.[moduleName] ?? {}));
  let modOk = true;

  for (const locale of ADMIN_LOCALES.filter((l) => l !== referenceLocale)) {
    const keys = new Set(flattenKeys(data[locale].modules?.[moduleName] ?? {}));
    for (const key of frModKeys) {
      if (!keys.has(key)) {
        console.error(`Missing modules.${moduleName}.${key} in ${locale}`);
        modOk = false;
        ok = false;
      }
    }
    for (const key of keys) {
      if (!frModKeys.has(key)) {
        console.error(`Extra modules.${moduleName}.${key} in ${locale}`);
        modOk = false;
        ok = false;
      }
    }
  }

  if (modOk) {
    console.log(`modules.${moduleName}.* parity OK (${frModKeys.size} keys)`);
  }
}

if (!ok) {
  process.exit(1);
}
