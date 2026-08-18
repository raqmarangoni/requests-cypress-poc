const fs = require('fs');
const path = require('path');

const origem = path.join(__dirname, '..', 'public');
const destino = path.join(origem, 'dist');
const destinoZip = path.join(origem, 'dist-zip');
const itensIgnorados = new Set([
  'dist',
  'dist-zip',
  'node_modules',
  'package.json',
  'package-lock.json'
]);

fs.rmSync(destino, { recursive: true, force: true });
fs.rmSync(destinoZip, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });
fs.mkdirSync(destinoZip, { recursive: true });

for (const item of fs.readdirSync(origem)) {
  if (itensIgnorados.has(item)) {
    continue;
  }

  fs.cpSync(path.join(origem, item), path.join(destino, item), {
    recursive: true
  });
}

console.log(`Frontend preparado em ${destino}`);
