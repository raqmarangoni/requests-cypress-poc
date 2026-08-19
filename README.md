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
| `npm run validate:frontend` | Valida os arquivos obrigatórios e as configurações JSON |
| `npm run build:frontend` | Gera os arquivos estáticos do frontend |
| `npm run build:btp` | Gera o pacote MTA para o SAP BTP |
| `npm run deploy:btp` | Envia o pacote MTA gerado ao Cloud Foundry |
| `npm run cypress:open` | Abre a interface do Cypress |
| `npm run cypress:run` | Executa os testes Cypress em modo headless |

Os comandos do Cypress usam o Google Chrome por padrão.

## Como a aplicação funciona

```text
Usuário
  ↓
Interface SAPUI5/Fiori
  ↓ fetch("api/solicitacoes")
xs-app.json / Destination do BTP
  ↓
API Node.js + Express
  ↓
Array em memória
```

Localmente, o Express entrega o frontend e responde à API na porta `3000`.
No SAP BTP, as duas partes são publicadas separadamente:

- o frontend fica no HTML5 Application Repository e é aberto pelo Work Zone;
- a API roda como aplicação Node.js no Cloud Foundry;
- a Destination `qa-solicitacoes-api` encaminha as chamadas do frontend para a API.

### Fluxo de inicialização do frontend

1. `public/index.html` carrega o runtime SAPUI5 e solicita o componente
   `qa.solicitacoes`.
2. `public/Component.js` inicializa a aplicação e cria dois `JSONModel`:
   `formulario`, com os campos do cadastro, e `solicitacoes`, com a lista e o
   estado de carregamento.
3. `public/manifest.json` declara a view inicial, bibliotecas SAPUI5, modelos,
   CSS e navegação utilizada pelo Work Zone.
4. `public/view/Main.view.xml` monta a tela usando controles SAPUI5, como
   `Input`, `TextArea`, `Select`, `Button`, `Panel` e `Table`.
5. `public/controller/Main.controller.js` consulta a API, envia cadastros,
   atualiza os models e apresenta mensagens com `MessageToast` ou `MessageBox`.
6. Quando os models são atualizados, o data binding do SAPUI5 atualiza a tela
   automaticamente.

### Fluxo de cadastro

1. O usuário preenche os controles vinculados ao model `formulario`.
2. O botão chama `onCadastrar` no controller.
3. O controller envia um `POST` para `api/solicitacoes` em JSON.
4. A API valida os dados e devolve o status HTTP correspondente.
5. Em caso de sucesso, o formulário é limpo e a listagem é consultada novamente.
6. Em caso de erro, a mensagem devolvida pela API é exibida em uma caixa de diálogo.

### Fluxo de consulta

1. `onInit` chama `carregarSolicitacoes` quando a view é criada.
2. O controller faz um `GET` em `api/solicitacoes`.
3. A resposta é gravada em `solicitacoes>/items`.
4. A `Table` cria uma linha para cada item do model.
5. `public/model/formatter.js` formata valores em reais e datas no padrão brasileiro.

## Estrutura de pastas

```text
projeto-qa-solicitacoes/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-btp.yml
├── api/
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── cypress/
│   ├── e2e/
│   │   ├── solicitacoes-api.cy.js
│   │   └── solicitacoes-ui.cy.js
│   ├── fixtures/
│   └── support/
│       ├── ambiente.js
│       ├── commands.js
│       ├── e2e.js
│       ├── factories.js
│       └── selectors.js
├── public/
│   ├── controller/
│   │   └── Main.controller.js
│   ├── css/
│   │   └── style.css
│   ├── model/
│   │   └── formatter.js
│   ├── view/
│   │   └── Main.view.xml
│   ├── Component.js
│   ├── index.html
│   ├── manifest.json
│   ├── package-lock.json
│   ├── package.json
│   └── xs-app.json
├── scripts/
│   ├── build-html5.js
│   └── validate-frontend.js
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

## Responsabilidade dos arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| `api/server.js` | Configura o Express, mantém os dados em memória e implementa os endpoints REST |
| `public/index.html` | Inicializa o runtime SAPUI5 para execução standalone |
| `public/Component.js` | Inicializa o componente e os models JSON |
| `public/manifest.json` | Descreve a aplicação SAPUI5 e sua integração com o Work Zone |
| `public/view/Main.view.xml` | Declara visualmente o formulário e a tabela |
| `public/controller/Main.controller.js` | Controla consulta, cadastro, models e mensagens |
| `public/model/formatter.js` | Formata moeda e data para exibição |
| `public/xs-app.json` | Define as rotas do HTML5 Repository e o acesso à Destination da API |
| `mta.yaml` | Define módulos, serviços, Destination, build e deploy no SAP BTP |
| `scripts/build-html5.js` | Copia os arquivos publicáveis e prepara o ZIP do frontend |
| `scripts/validate-frontend.js` | Confere configurações JSON e arquivos obrigatórios |
| `cypress.config.js` | Configura specs, suporte e execução do Cypress |

## Testes Cypress

Os testes são separados por camada:

- `solicitacoes-ui.cy.js` valida a interface publicada no Work Zone;
- `solicitacoes-api.cy.js` chama diretamente os endpoints REST;
- `commands.js` contém o login reutilizável no SAP BTP;
- `selectors.js` centraliza os seletores gerados pelo SAPUI5;
- `factories.js` cria massas únicas para que os testes possam ser repetidos;
- `ambiente.js` centraliza as URLs públicas do ambiente.

As credenciais devem ficar somente em `cypress.env.json`, que está ignorado pelo
Git:

```json
{
  "BTP_USERNAME": "seu-usuario",
  "BTP_PASSWORD": "sua-senha"
}
```

Para executar toda a suíte:

```bash
npm run cypress:run
```

Mais detalhes estão em `cypress/README.md`.

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
