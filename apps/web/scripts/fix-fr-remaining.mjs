import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../lib/i18n/translations.ts');
let src = fs.readFileSync(filePath, 'utf8');
const start = src.indexOf('const fr:');
const end = src.indexOf('const en:');
let fr = src.slice(start, end);

const replacements = [
  ['⬦', '…'],
  ['⬢', '•'],
  ['d"aide', "d'aide"],
  ['d"envoyer', "d'envoyer"],
  ['n"apparaît', "n'apparaît"],
  ['l"établissement', "l'établissement"],
  ['d"annulation', "d'annulation"],
  ['l"hébergement', "l'hébergement"],
  ['d"affichage', "d'affichage"],
  ['sécœurisés', 'sécurisés'],
  ['Mon compte \uFFFD \u0019 Réservations', 'Mon compte → Réservations'],
  ['Mon compte  Réservations', 'Mon compte → Réservations'],
  ['politique d"annulation', "politique d'annulation"],
];

for (const [from, to] of replacements) {
  fr = fr.split(from).join(to);
}

src = src.slice(0, start) + fr + src.slice(end);
fs.writeFileSync(filePath, src);
console.log('done');
