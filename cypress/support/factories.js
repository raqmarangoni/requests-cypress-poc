let sequencia = 0

export const criarSolicitacao = (alteracoes = {}) => {
  sequencia += 1
  const identificador = `${Date.now()}-${sequencia}`

  return {
    descricao: `Solicitação criada pelo Cypress - ${identificador}`,
    centroCusto: `CC-${identificador}`,
    valor: 150.5,
    nomeUsuario: 'Usuário Cypress',
    roleUsuario: 'Solicitante',
    ...alteracoes
  }
}
