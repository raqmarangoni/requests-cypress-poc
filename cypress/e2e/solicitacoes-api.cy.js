import { criarSolicitacao } from '../support/factories'
import { ambienteBtp } from '../support/ambiente'

const requisitarCadastro = (body) =>
  cy.request({
    method: 'POST',
    url: `${ambienteBtp.apiUrl}/api/solicitacoes`,
    body,
    failOnStatusCode: false
  })

describe('API de solicitações', () => {
  it('consulta a lista de solicitações', () => {
    cy.request(`${ambienteBtp.apiUrl}/api/solicitacoes`).then((resposta) => {
      expect(resposta.status).to.eq(200)
      expect(resposta.body).to.be.an('array')
    })
  })

  it('cadastra e consulta uma solicitação pelo ID', () => {
    const dados = criarSolicitacao()

    requisitarCadastro(dados).then((cadastro) => {
      expect(cadastro.status).to.eq(201)
      expect(cadastro.body).to.have.property('mensagem')
      expect(cadastro.body.solicitacao).to.include({
        descricao: dados.descricao,
        centroCusto: dados.centroCusto,
        nomeUsuario: dados.nomeUsuario,
        roleUsuario: dados.roleUsuario
      })

      const id = cadastro.body.solicitacao.id

      cy.request(`${ambienteBtp.apiUrl}/api/solicitacoes/${id}`).then((consulta) => {
        expect(consulta.status).to.eq(200)
        expect(consulta.body.id).to.eq(id)
        expect(consulta.body.descricao).to.eq(dados.descricao)
      })
    })
  })

  it('retorna 404 ao consultar uma solicitação inexistente', () => {
    cy.request({
      url: `${ambienteBtp.apiUrl}/api/solicitacoes/999999999`,
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.eq(404)
      expect(resposta.body.mensagem).to.eq('Solicitação não encontrada.')
    })
  })

  it('rejeita cadastro sem descrição', () => {
    const dados = criarSolicitacao({ descricao: '' })

    requisitarCadastro(dados).then((resposta) => {
      expect(resposta.status).to.eq(400)
      expect(resposta.body.mensagem).to.eq('A descrição é obrigatória.')
    })
  })

  it('rejeita cadastro sem centro de custo', () => {
    const dados = criarSolicitacao({ centroCusto: '' })

    requisitarCadastro(dados).then((resposta) => {
      expect(resposta.status).to.eq(400)
      expect(resposta.body.mensagem).to.eq('O centro de custo é obrigatório.')
    })
  })

  it('rejeita valor igual a zero', () => {
    const dados = criarSolicitacao({ valor: 0 })

    requisitarCadastro(dados).then((resposta) => {
      expect(resposta.status).to.eq(400)
      expect(resposta.body.mensagem).to.eq('O valor deve ser numérico e maior que zero.')
    })
  })

  it('rejeita cadastro realizado por Aprovador', () => {
    const dados = criarSolicitacao({ roleUsuario: 'Aprovador' })

    requisitarCadastro(dados).then((resposta) => {
      expect(resposta.status).to.eq(403)
      expect(resposta.body.mensagem).to.contain('Somente usuários com a role Solicitante')
    })
  })

  it('não cria duas solicitações com os mesmos dados', () => {
    const dados = criarSolicitacao()

    requisitarCadastro(dados).then((primeiroCadastro) => {
      expect(primeiroCadastro.status).to.eq(201)
    })

    requisitarCadastro(dados).then((segundoCadastro) => {
      expect(segundoCadastro.status).to.eq(409)
      expect(segundoCadastro.body.mensagem).to.eq(
        'Já existe uma solicitação com os mesmos dados.'
      )
    })
  })
})
