const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const arquivosJson = [
  path.join(raiz, 'public', 'manifest.json'),
  path.join(raiz, 'public', 'xs-app.json')
];

for (const arquivo of arquivosJson) {
  JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

const arquivosObrigatorios = [
  'public/Component.js',
  'public/controller/Main.controller.js',
  'public/view/Main.view.xml',
  'public/model/formatter.js',
  'mta.yaml'
];

for (const arquivo of arquivosObrigatorios) {
  if (!fs.existsSync(path.join(raiz, arquivo))) {
    throw new Error(`Arquivo obrigatório não encontrado: ${arquivo}`);
  }
}

console.log('Configurações e estrutura do frontend validadas.');
