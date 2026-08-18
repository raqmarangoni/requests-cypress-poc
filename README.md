# Projeto de estudos — Solicitações

Aplicação local e intencionalmente simples para estudos práticos de Quality
Assurance. O sistema permite cadastrar e consultar solicitações por uma
interface web e por uma API REST.

O projeto foi preparado para atividades de análise de requisitos, elaboração de
cenários, testes manuais, testes de API, registro de defeitos, regressão e futura
automação com Cypress.

## Pré-requisitos locais

- Node.js 20, 22 ou 24
- npm

## Instalação

No terminal, acesse a pasta do projeto e instale as dependências:

```bash
cd projeto-qa-solicitacoes
npm install
```

## Execução

Para iniciar normalmente:

```bash
npm start
```

Para iniciar em modo de desenvolvimento, com reinício automático:

```bash
npm run dev
```

Abra a aplicação em:

```text
http://localhost:3000
```

Os dados ficam armazenados em memória. Por isso, as solicitações cadastradas são
apagadas sempre que o servidor é reiniciado.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor Express |
| `npm run dev` | Inicia o servidor com reinício automático |
| `npm run build:frontend` | Gera os arquivos estáticos do frontend |
| `npm run build:btp` | Gera o pacote MTA para o SAP BTP |
| `npm run deploy:btp` | Envia o pacote MTA gerado ao Cloud Foundry |
| `npm run cypress:open` | Abre a interface do Cypress |
| `npm run cypress:run` | Executa os testes Cypress em modo headless |

O Cypress está instalado e configurado em `cypress/e2e`.

## Estrutura de pastas

```text
projeto-qa-solicitacoes/
├── api/
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── cypress/
│   └── e2e/
├── public/
│   ├── app.js
│   ├── index.html
│   ├── manifest.json
│   ├── package-lock.json
│   ├── package.json
│   ├── styles.css
│   └── xs-app.json
├── scripts/
│   └── build-html5.js
├── .cfignore
├── .gitignore
├── cypress.config.js
├── mta.yaml
├── package-lock.json
├── package.json
└── README.md
```

As pastas `public/dist`, `public/dist-zip` e `mta_archives` são geradas durante
o build e não devem ser versionadas.

## API REST

Todas as respostas da API utilizam JSON.

### `GET /api/solicitacoes`

Retorna a lista de solicitações cadastradas.

### `GET /api/solicitacoes/:id`

Retorna uma solicitação específica pelo ID. Se o registro não existir, retorna
uma resposta de recurso não encontrado.

### `POST /api/solicitacoes`

Cria uma solicitação. O corpo deve ser enviado como JSON:

```json
{
  "descricao": "Compra de materiais",
  "centroCusto": "CC-100",
  "valor": 250.5,
  "nomeUsuario": "Maria",
  "roleUsuario": "Solicitante"
}
```

Quando o cadastro é aceito, a API retorna o registro criado e uma mensagem.
Dados inválidos, roles sem permissão e registros duplicados recebem respostas
de erro em JSON.

## Deployment no SAP BTP

O deployment MTA cria os seguintes componentes:

- aplicação Node.js `qa-solicitacoes-api` no Cloud Foundry;
- instância `html5-apps-repo` no plano `app-host`;
- frontend no HTML5 Application Repository;
- instância do serviço Destination no plano `lite`;
- Destination `qa-solicitacoes-api`, apontando automaticamente para a API.

### Pré-requisitos no subaccount

- ambiente Cloud Foundry habilitado;
- organização e space com quota disponível;
- entitlement para `HTML5 Application Repository Service`, plano `app-host`;
- entitlement para `Destination`, plano `lite`;
- assinatura do SAP Build Work Zone, standard edition;
- usuário com permissão `Space Developer`;
- CF CLI e plugin MultiApps instalados.

Verifique o plugin:

```bash
cf plugins
```

Se o comando `deploy` não estiver listado, instale o plugin MultiApps seguindo a
documentação do Cloud Foundry/SAP para sua versão da CF CLI.

### Login, build e deployment

```bash
cf login -a <API_ENDPOINT> -o <ORGANIZACAO> -s <SPACE>
npm install
npm run build:btp
npm run deploy:btp
```

O endpoint da API Cloud Foundry é inserido automaticamente na Destination
durante o deployment. Não é necessário editar uma URL no código-fonte.

O pacote gerado fica em:

```text
mta_archives/qa-solicitacoes_1.0.0.mtar
```

## CI/CD com GitHub Actions

O projeto possui dois workflows em `.github/workflows`:

- `ci.yml`: valida e constrói o projeto em pushes, pull requests e execução manual;
- `deploy-btp.yml`: publica no SAP BTP em pushes para `main` ou execução manual e,
  depois do deploy, executa o Cypress no Chrome.

Crie um environment chamado `btp-trial` em **GitHub → Settings → Environments**.
Cadastre nele estes secrets:

| Secret | Conteúdo |
| --- | --- |
| `CF_USERNAME` | Usuário com acesso de desenvolvedor ao space Cloud Foundry |
| `CF_PASSWORD` | Senha desse usuário no SAP Identity Service |
| `BTP_USERNAME` | Usuário usado pelo Cypress no login do Work Zone |
| `BTP_PASSWORD` | Senha usada pelo Cypress no login do Work Zone |

Os valores de API, organização e space que não são secretos estão declarados no
workflow de deploy. As senhas não devem ser adicionadas ao repositório.

O deploy automático está configurado para:

```text
API:   https://api.cf.us10-001.hana.ondemand.com
Org:   4ebc416etrial
Space: dev
```

### Disponibilização no SAP Build Work Zone

Após o deployment:

1. Confirme a aplicação em **BTP Cockpit → HTML5 Applications**.
2. Abra o **SAP Build Work Zone, standard edition**.
3. Em **Channel Manager**, abra o provider **HTML5 Apps** e escolha
   **Update Content**.
4. Em **Content Manager → Content Explorer → HTML5 Apps**, selecione
   **Solicitações** e escolha **Add**.
5. Associe a aplicação a uma role e a uma página ou espaço.
6. Atribua a role collection correspondente ao usuário e publique o site.

O `sap.app.id` e o `sap.cloud.service` definidos em `public/manifest.json`
precisam ser únicos no subaccount. Caso esses identificadores já estejam em
uso, altere-os antes do primeiro deployment.

## Observação sobre persistência

Os registros continuam armazenados em memória. Eles são perdidos quando a API
reinicia, recebe um novo deployment ou sofre restage. Utilize apenas uma
instância da API para manter o comportamento previsível neste projeto de
estudos.
