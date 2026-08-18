sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("qa.solicitacoes.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(new JSONModel({ items: [], carregando: false }), "solicitacoes");
      this.setModel(new JSONModel(this.criarFormularioVazio()), "formulario");
    },

    criarFormularioVazio: function () {
      return {
        descricao: "",
        centroCusto: "",
        valor: "",
        nomeUsuario: "",
        roleUsuario: ""
      };
    }
  });
});
