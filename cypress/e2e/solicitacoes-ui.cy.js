import { criarSolicitacao } from '../support/factories'
import { seletoresSolicitacao } from '../support/selectors'

const quantidadeDeSetasPorRole = {
  Solicitante: 1,
  Aprovador: 2,
  Administrador: 3
}

const selecionarRole = (role) => {
  const quantidade = quantidadeDeSetasPorRole[role]
  const teclas = `${'{downarrow}'.repeat(quantidade)}{enter}`

  cy.get(seletoresSolicitacao.roleUsuario)
    .should('be.visible')
    .focus()
    .type(teclas)
    .should('contain', role)
    .type('{esc}')
}

const preencherFormulario = (dados, opcoes = {}) => {
  if (!opcoes.ignorarDescricao) {
    cy.get(seletoresSolicitacao.descricao).type(dados.descricao)
  }

  cy.get(seletoresSolicitacao.centroCusto).type(dados.centroCusto)
  cy.get(seletoresSolicitacao.valor).type(dados.valor)
  cy.get(seletoresSolicitacao.nomeUsuario).type(dados.nomeUsuario)
  selecionarRole(dados.roleUsuario)
}

describe('Interface de solicitações no SAP BTP', () => {
  beforeEach(() => {
    cy.loginNoBtp()

    cy.get(seletoresSolicitacao.titulo, { timeout: 60000 })
      .should('be.visible')
      .and('contain', 'Nova solicitação')
  })

  it('apresenta o formulário e a tabela de solicitações', () => {
    cy.get(seletoresSolicitacao.descricao).should('be.visible')
    cy.get(seletoresSolicitacao.centroCusto).should('be.visible')
    cy.get(seletoresSolicitacao.valor).should('be.visible')
    cy.get(seletoresSolicitacao.nomeUsuario).should('be.visible')
    cy.get(seletoresSolicitacao.roleUsuario).should('be.visible')
    cy.get(seletoresSolicitacao.botaoCadastrar).should('be.visible')
    cy.get(seletoresSolicitacao.tabela).should('be.visible')
  })

  it('cadastra uma solicitação válida e exibe o registro na tabela', () => {
    const dados = criarSolicitacao()

    preencherFormulario(dados)
    cy.intercept('POST', '**/api/solicitacoes').as('cadastrarSolicitacao')

    cy.get(seletoresSolicitacao.botaoCadastrar)
      .should('be.enabled')
      .click()

    cy.wait('@cadastrarSolicitacao')
      .its('response.statusCode')
      .should('eq', 201)

    cy.get(seletoresSolicitacao.mensagem, { timeout: 30000 })
      .should('be.visible')
      .and('not.be.empty')

    cy.contains(`${seletoresSolicitacao.tabela} .sapMText`, dados.descricao)
      .should('exist')
  })

  it('não cadastra quando a descrição não é informada', () => {
    const dados = criarSolicitacao()

    preencherFormulario(dados, { ignorarDescricao: true })
    cy.intercept('POST', '**/api/solicitacoes').as('cadastrarSolicitacao')
    cy.get(seletoresSolicitacao.botaoCadastrar).click()

    cy.wait('@cadastrarSolicitacao')
      .its('response.statusCode')
      .should('eq', 400)

    cy.get(seletoresSolicitacao.caixaDeMensagem)
      .should('contain.text', 'A descrição é obrigatória.')
  })

  it('não permite cadastro para usuário com role Aprovador', () => {
    const dados = criarSolicitacao({ roleUsuario: 'Aprovador' })

    preencherFormulario(dados)
    cy.intercept('POST', '**/api/solicitacoes').as('cadastrarSolicitacao')
    cy.get(seletoresSolicitacao.botaoCadastrar).click()

    cy.wait('@cadastrarSolicitacao')
      .its('response.statusCode')
      .should('eq', 403)

    cy.get(seletoresSolicitacao.caixaDeMensagem)
      .should('contain.text', 'Somente usuários com a role Solicitante')
  })
})
