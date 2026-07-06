/* ==========================================================================
   theme.js — Controle do tema claro/escuro.
   Carregado no <head> (sem defer) para aplicar o tema salvo ANTES da
   primeira pintura e evitar "flash" de tema errado.
   Persistência: localStorage ("ra-tema"). Se não houver preferência salva,
   respeita a preferência do sistema operacional (prefers-color-scheme).
   ========================================================================== */
(function () {
  var CHAVE = "ra-tema";

  function temaInicial() {
    try {
      var salvo = localStorage.getItem(CHAVE);
      if (salvo === "light" || salvo === "dark") return salvo;
    } catch (e) { /* localStorage indisponível: segue preferência do sistema */ }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function aplicar(tema) {
    document.documentElement.setAttribute("data-theme", tema);
  }

  aplicar(temaInicial());

  // Liga o botão de alternância quando o DOM estiver pronto.
  document.addEventListener("DOMContentLoaded", function () {
    var botao = document.getElementById("theme-toggle");
    if (!botao) return;
    botao.addEventListener("click", function () {
      var atual = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var novo = atual === "light" ? "dark" : "light";
      aplicar(novo);
      try { localStorage.setItem(CHAVE, novo); } catch (e) { /* ignora */ }
    });
  });
})();
