sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "qa/solicitacoes/model/formatter"
], function (Controller, MessageBox, MessageToast, formatter) {
  "use strict";

  return Controller.extend("qa.solicitacoes.controller.Main", {
    formatter: formatter,

    onInit: function () {
      this.carregarSolicitacoes();
    },

    carregarSolicitacoes: async function () {
      const modelo = this.getOwnerComponent().getModel("solicitacoes");
      modelo.setProperty("/carregando", true);

      try {
        const resposta = await fetch("api/solicitacoes");
        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.mensagem || "Não foi possível consultar as solicitações.");
        }

        modelo.setProperty("/items", dados);
      } catch (erro) {
        MessageBox.error(erro.message);
      } finally {
        modelo.setProperty("/carregando", false);
      }
    },

    onCadastrar: async function () {
      const componente = this.getOwnerComponent();
      const modeloFormulario = componente.getModel("formulario");
      const dados = { ...modeloFormulario.getData() };
      const botao = this.byId("botaoCadastrar");

      botao.setEnabled(false);

      try {
        const resposta = await fetch("api/solicitacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if (!resposta.ok) {
          throw new Error(resultado.mensagem || "Não foi possível cadastrar a solicitação.");
        }

        MessageToast.show(resultado.mensagem);
        modeloFormulario.setData(componente.criarFormularioVazio());
        await this.carregarSolicitacoes();
      } catch (erro) {
        MessageBox.error(erro.message);
      } finally {
        botao.setEnabled(true);
      }
    }
  });
});
