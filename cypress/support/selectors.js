// Centraliza os seletores da tela para facilitar manutenção e leitura dos testes.
export const seletoresSolicitacao = {
  titulo: '[id$="--painelFormulario"] .sapMPanelHdr',
  descricao: '[id$="--descricao-inner"]',
  centroCusto: '[id$="--centroCusto-inner"]',
  valor: '[id$="--valor-inner"]',
  nomeUsuario: '[id$="--nomeUsuario-inner"]',
  roleUsuario: '[id$="--roleUsuario"].sapMSlt',
  botaoCadastrar: '[id$="--botaoCadastrar"]',
  mensagem: '.sapMMessageToast'
}
