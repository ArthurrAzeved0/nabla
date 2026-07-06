/* ==========================================================================
   home.js — Monta os cards das cadeiras na página inicial a partir do
   registro central window.CURSOS (js/cursos.js).
   ========================================================================== */
(function () {
  var lista = document.getElementById("lista-cursos");
  if (lista && window.CURSOS) {
    window.CURSOS.forEach(function (curso) {
      var a = document.createElement("a");
      a.className = "card-curso";
      a.href = "curso.html?curso=" + encodeURIComponent(curso.id);
      a.innerHTML =
        '<div class="icone">' + curso.icone + "</div>" +
        "<h3>" + curso.nome + "</h3>" +
        '<span class="codigo">' + curso.codigo + "</span>" +
        "<p>" + curso.descricao + "</p>";
      lista.appendChild(a);
    });
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
