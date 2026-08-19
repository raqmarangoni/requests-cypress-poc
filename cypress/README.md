# Testes Cypress

## Organização

- `e2e/solicitacoes-ui.cy.js`: contém os cenários da interface SAPUI5.
- `e2e/solicitacoes-api.cy.js`: valida diretamente os endpoints REST.
- `fixtures/solicitacao-valida.json`: mantém os dados usados no cadastro.
- `support/commands.js`: contém o comando reutilizável de login no SAP BTP.
- `support/factories.js`: cria massas únicas e reutilizáveis para os testes.
- `support/selectors.js`: centraliza os seletores dos elementos da tela.
- `support/ambiente.js`: mantém os endereços públicos do ambiente BTP.
- `support/e2e.js`: carrega os comandos antes da execução dos testes.

## Credenciais

As credenciais não ficam no teste. Crie localmente um arquivo `cypress.env.json`:

```json
{
  "BTP_USERNAME": "seu-usuario",
  "BTP_PASSWORD": "sua-senha"
}
```

Esse arquivo já está ignorado pelo Git e não deve ser versionado.

## Execução

Os comandos abaixo utilizam o Google Chrome por padrão:

```bash
npm run cypress:open
npm run cypress:run
```

Para executar somente uma camada:

```bash
npx cypress run --browser chrome --spec cypress/e2e/solicitacoes-ui.cy.js
npx cypress run --browser chrome --spec cypress/e2e/solicitacoes-api.cy.js
```

Caso queira usar o Electron excepcionalmente, execute diretamente:

```bash
npx cypress run --browser electron
```
