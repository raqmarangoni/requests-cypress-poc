sap.ui.define([], function () {
  "use strict";

  return {
    valor: function (valor) {
      if (valor === null || valor === undefined || valor === "") {
        return "";
      }

      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(valor);
    },

    dataHora: function (data) {
      if (!data) {
        return "";
      }

      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
      }).format(new Date(data));
    }
  };
});
