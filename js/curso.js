/* ==========================================================================
   curso.js — Lógica da página de cadeira (curso.html).

   Fluxo:
     1. Lê o parâmetro ?curso=<id> da URL e busca a cadeira em window.CURSOS;
     2. Carrega a teoria de conteudo/<id>.html (fragmento HTML);
     3. Carrega as questões listadas em window.QUESTOES_MANIFEST (arquivo
        questoes/manifest.js), buscando cada bloco HTML individualmente;
     4. Re-renderiza as fórmulas com MathJax após cada injeção de HTML.

   IMPORTANTE (desenvolvimento local): esta página usa fetch(), que não
   funciona abrindo o arquivo direto no navegador (file://). Rode um
   servidor local na pasta do projeto, por exemplo:
       python -m http.server 8000
   e acesse http://localhost:8000 . No GitHub Pages funciona normalmente.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- utilidades ---------- */

  function parametroCurso() {
    var m = window.location.search.match(/[?&]curso=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function renderizarMatematica(elemento) {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([elemento]).catch(function () { /* silencioso */ });
    }
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- identifica a cadeira ---------- */

  var id = parametroCurso();
  var curso = (window.CURSOS || []).find(function (c) { return c.id === id; });

  var painelConteudo = document.getElementById("painel-conteudo");
  var listaQuestoes = document.getElementById("lista-questoes");

  if (!curso) {
    document.getElementById("curso-nome").textContent = "Cadeira não encontrada";
    painelConteudo.innerHTML =
      '<p class="aviso-vazio">Verifique o endereço ou volte para a <a href="index.html">página inicial</a>.</p>';
    return;
  }

  document.title = curso.nome + " — Responde Aí · Poli UPE";
  document.getElementById("curso-nome").textContent = curso.nome;
  document.getElementById("curso-codigo").textContent = curso.codigo;
  document.getElementById("curso-descricao").textContent = curso.descricao;

  /* ---------- abas Conteúdo / Questões ---------- */

  document.querySelectorAll(".aba").forEach(function (aba) {
    aba.addEventListener("click", function () {
      document.querySelectorAll(".aba").forEach(function (a) { a.classList.remove("ativa"); });
      document.querySelectorAll(".painel").forEach(function (p) { p.classList.remove("ativo"); });
      aba.classList.add("ativa");
      document.getElementById(aba.dataset.painel).classList.add("ativo");
    });
  });

  /* ---------- carrega a teoria ---------- */

  fetch("conteudo/" + curso.id + ".html")
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    })
    .then(function (html) {
      painelConteudo.innerHTML = html;
      renderizarMatematica(painelConteudo);
    })
    .catch(function () {
      painelConteudo.innerHTML =
        '<p class="aviso-vazio">Não foi possível carregar o conteúdo. ' +
        "Se você abriu o site direto pelo arquivo (file://), rode um servidor local " +
        "(<code>python -m http.server</code>) — veja o README.</p>";
    });

  /* ---------- carrega as questões ---------- */

  var PROVAS_ROTULO = { "1ee": "1º EE", "2ee": "2º EE", "final": "Prova Final" };

  function carregarQuestoes(prova) {
    var manifesto = window.QUESTOES_MANIFEST || {};
    var arquivos = (manifesto[curso.id] && manifesto[curso.id][prova]) || [];

    listaQuestoes.innerHTML = "";

    if (arquivos.length === 0) {
      listaQuestoes.innerHTML =
        '<p class="aviso-vazio">Ainda não há questões cadastradas para ' +
        (PROVAS_ROTULO[prova] || prova) + " nesta cadeira.</p>";
      return;
    }

    listaQuestoes.innerHTML = '<p class="aviso-carregando">Carregando questões…</p>';

    // Busca todos os blocos em paralelo, mas insere na ordem do manifesto.
    Promise.all(
      arquivos.map(function (arquivo) {
        return fetch("questoes/" + curso.id + "/" + prova + "/" + arquivo)
          .then(function (r) {
            if (!r.ok) throw new Error(arquivo);
            return r.text();
          })
          .catch(function () {
            return '<article class="questao"><p class="aviso-vazio">Falha ao carregar ' +
              arquivo + "</p></article>";
          });
      })
    ).then(function (blocos) {
      listaQuestoes.innerHTML = blocos.join("\n");
      renderizarMatematica(listaQuestoes);
    });
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("ativo"); });
      chip.classList.add("ativo");
      carregarQuestoes(chip.dataset.prova);
    });
  });

  carregarQuestoes("1ee");
})();
