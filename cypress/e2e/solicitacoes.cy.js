import { seletoresSolicitacao } from '../support/selectors'

describe('Aplicação de solicitações no SAP BTP', () => {
  beforeEach(() => {
    cy.loginNoBtp()
  })

  it('cadastra uma solicitação válida', () => {
    cy.fixture('solicitacao-valida').then((dados) => {
      // O horário torna a descrição única e permite repetir o teste sem gerar duplicidade.
      const descricaoUnica = `${dados.descricao} - ${Date.now()}`

      cy.get(seletoresSolicitacao.titulo, { timeout: 60000 })
        .should('be.visible')
        .and('contain', 'Nova solicitação')

      cy.get(seletoresSolicitacao.descricao)
        .should('be.visible')
        .type(descricaoUnica)
        .should('have.value', descricaoUnica)

      cy.get(seletoresSolicitacao.centroCusto)
        .type(dados.centroCusto)
        .should('have.value', dados.centroCusto)

      cy.get(seletoresSolicitacao.valor)
        .type(dados.valor)
        .should('have.value', dados.valor)

      cy.get(seletoresSolicitacao.nomeUsuario)
        .type(dados.nomeUsuario)
        .should('have.value', dados.nomeUsuario)

      cy.get(seletoresSolicitacao.roleUsuario)
        .should('be.visible')
        .focus()
        .type('{downarrow}{enter}')

      cy.get(seletoresSolicitacao.roleUsuario)
        .should('contain', dados.roleUsuario)
        .type('{esc}')

      cy.intercept('POST', '**/api/solicitacoes').as('cadastrarSolicitacao')

      cy.get(seletoresSolicitacao.botaoCadastrar)
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      cy.wait('@cadastrarSolicitacao')
        .its('response.statusCode')
        .should('eq', 201)

      cy.get(seletoresSolicitacao.mensagem, { timeout: 30000 })
        .should('be.visible')
        .invoke('text')
        .should('not.be.empty')
    })
  })
})
