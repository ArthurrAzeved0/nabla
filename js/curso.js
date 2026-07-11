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

  /* Versão dos assets: lida da própria tag (ex.: js/curso.js?v=1) e anexada aos
     arquivos carregados via fetch (teoria/questões), para o cache-busting valer
     também no conteúdo dinâmico. Basta incrementar o ?v=N no HTML ao publicar. */
  var VERSAO = (function () {
    var s = document.currentScript ||
      document.querySelector('script[src*="js/curso.js"]');
    var m = s && s.src.match(/[?&]v=([^&]+)/);
    return m ? m[1] : "";
  })();

  function comVersao(url) {
    if (!VERSAO) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(VERSAO);
  }

  function parametroCurso() {
    var m = window.location.search.match(/[?&]curso=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function renderizarMatematica(elemento) {
    if (window.MathJax && MathJax.typesetPromise) {
      return MathJax.typesetPromise([elemento]).catch(function () { /* silencioso */ });
    }
    return Promise.resolve();
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- botão "voltar ao topo" ---------- */
  var btnTopo = document.getElementById("voltar-topo");
  if (btnTopo) {
    var atualizarBtnTopo = function () {
      btnTopo.classList.toggle("oculto", window.pageYOffset < 400);
    };
    window.addEventListener("scroll", atualizarBtnTopo, { passive: true });
    btnTopo.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    atualizarBtnTopo();
  }

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

  function ativarAba(painelId) {
    document.querySelectorAll(".aba").forEach(function (a) {
      a.classList.toggle("ativa", a.dataset.painel === painelId);
    });
    document.querySelectorAll(".painel").forEach(function (p) {
      p.classList.toggle("ativo", p.id === painelId);
    });
  }

  document.querySelectorAll(".aba").forEach(function (aba) {
    aba.addEventListener("click", function () { ativarAba(aba.dataset.painel); });
  });

  /* Se a URL trouxer #âncora (link "Ver material" das questões), abre a aba
     Conteúdo e rola até a seção da teoria, com um destaque rápido. Precisa
     rodar só depois que a teoria foi injetada e o MathJax reajustou as alturas. */
  function irParaAncora() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var alvo;
    try { alvo = painelConteudo.querySelector(hash); } catch (e) { return; }
    if (!alvo) return;
    ativarAba("painel-conteudo");
    window.setTimeout(function () {
      alvo.scrollIntoView({ behavior: "smooth", block: "start" });
      alvo.classList.add("destaque-teoria");
      window.setTimeout(function () { alvo.classList.remove("destaque-teoria"); }, 2200);
    }, 80);
  }

  /* Deep-link para uma questão: hash no formato <curso>-<prova>-<num>
     (ex.: #calculo3-final-05). Permite compartilhar uma questão específica. */
  var PROVAS = ["1ee", "2ee", "final"];
  var questaoPendente = null; // id de questão a focar após carregar a prova
  var temaPendente = null;    // temas a focar (link "Praticar este assunto")

  function questaoDoHash() {
    var h = (window.location.hash || "").slice(1);
    if (!h) return null;
    var partes = h.split("-");
    if (partes.length < 3 || partes[0] !== curso.id || PROVAS.indexOf(partes[1]) < 0) return null;
    return { prova: partes[1], id: h };
  }

  function focarQuestao(id) {
    var alvo = listaQuestoes.querySelector('.questao[data-id="' + id + '"]');
    if (!alvo) return;
    ativarAba("painel-questoes");
    window.setTimeout(function () {
      alvo.scrollIntoView({ behavior: "smooth", block: "start" });
      alvo.classList.add("destaque-questao");
      window.setTimeout(function () { alvo.classList.remove("destaque-questao"); }, 2200);
    }, 80);
  }

  /* Foca a 1ª questão da prova atual cujo data-tema esteja na lista `temas`.
     Se nenhuma questão dessa prova casar, guarda os temas em temaPendente para
     tentar de novo quando o usuário trocar de prova. */
  function focarTema(temas) {
    ativarAba("painel-questoes");
    var alvo = null;
    var qs = listaQuestoes.querySelectorAll(".questao");
    for (var i = 0; i < qs.length; i++) {
      if (temas.indexOf(qs[i].dataset.tema) >= 0) { alvo = qs[i]; break; }
    }
    if (!alvo) { temaPendente = temas; return; }
    temaPendente = null;
    window.setTimeout(function () {
      alvo.scrollIntoView({ behavior: "smooth", block: "start" });
      alvo.classList.add("destaque-questao");
      window.setTimeout(function () { alvo.classList.remove("destaque-questao"); }, 2200);
    }, 80);
  }

  /* Insere um botão "Praticar este assunto" no fim de cada seção da teoria que
     tenha questões associadas (aparece como valor no mapa curso.teoria). */
  function inserirBotoesPraticar() {
    var mapa = curso.teoria;
    if (!mapa) return;
    var temasPorSecao = {};
    Object.keys(mapa).forEach(function (tema) {
      var sec = mapa[tema];
      (temasPorSecao[sec] = temasPorSecao[sec] || []).push(tema);
    });
    Object.keys(temasPorSecao).forEach(function (secId) {
      var secEl = document.getElementById(secId);
      if (!secEl || secEl.querySelector(".praticar-assunto")) return;
      var temas = temasPorSecao[secId];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "praticar-assunto";
      btn.title = "Ir para as questões deste assunto";
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
          '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<span>Praticar este assunto</span>';
      btn.addEventListener("click", function () { focarTema(temas); });
      secEl.appendChild(btn);
    });
  }

  /* ---------- carrega a teoria ---------- */

  fetch(comVersao("conteudo/" + curso.id + ".html"))
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    })
    .then(function (html) {
      painelConteudo.innerHTML = html;
      inserirBotoesPraticar();
      renderizarMatematica(painelConteudo).then(irParaAncora);
    })
    .catch(function () {
      painelConteudo.innerHTML =
        '<p class="aviso-vazio">Não foi possível carregar o conteúdo. ' +
        "Se você abriu o site direto pelo arquivo (file://), rode um servidor local " +
        "(<code>python -m http.server</code>) — veja o README.</p>";
    });

  /* ---------- carrega as questões ---------- */

  var PROVAS_ROTULO = { "1ee": "1º EE", "2ee": "2º EE", "final": "Prova Final" };
  var provaCorrente = "1ee";

  /* API mínima para o js/estudo.js (ex.: sair do modo simulado) */
  window.RA = {
    recarregarQuestoes: function () { carregarQuestoes(provaCorrente); }
  };

  function carregarQuestoes(prova) {
    provaCorrente = prova;
    var manifesto = window.QUESTOES_MANIFEST || {};
    var arquivos = (manifesto[curso.id] && manifesto[curso.id][prova]) || [];

    listaQuestoes.innerHTML = "";

    if (arquivos.length === 0) {
      listaQuestoes.innerHTML =
        '<p class="aviso-vazio">Ainda não há questões cadastradas para ' +
        (PROVAS_ROTULO[prova] || prova) + " nesta cadeira.</p>";
      if (window.ESTUDO) ESTUDO.aoRenderizar(curso.id, prova, listaQuestoes);
      return;
    }

    listaQuestoes.innerHTML = '<p class="aviso-carregando">Carregando questões…</p>';

    // Busca todos os blocos em paralelo, mas insere na ordem do manifesto.
    Promise.all(
      arquivos.map(function (arquivo) {
        return fetch(comVersao("questoes/" + curso.id + "/" + prova + "/" + arquivo))
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
      /* ativa marcações, cronômetro, estatísticas e filtros (js/estudo.js) */
      if (window.ESTUDO) ESTUDO.aoRenderizar(curso.id, prova, listaQuestoes);
      if (questaoPendente) { var q = questaoPendente; questaoPendente = null; focarQuestao(q); }
      else if (temaPendente) { var t = temaPendente; temaPendente = null; focarTema(t); }
    });
  }


  document.querySelectorAll(".chip[data-prova]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip[data-prova]").forEach(function (c) { c.classList.remove("ativo"); });
      chip.classList.add("ativo");
      carregarQuestoes(chip.dataset.prova);
    });
  });

  /* Se a URL apontar para uma questão, começa na prova certa (e na aba Questões). */
  var alvoInicial = questaoDoHash();
  var provaInicial = (alvoInicial && alvoInicial.prova) || "1ee";
  if (alvoInicial) {
    questaoPendente = alvoInicial.id;
    ativarAba("painel-questoes");
    document.querySelectorAll(".chip[data-prova]").forEach(function (c) {
      c.classList.toggle("ativo", c.dataset.prova === provaInicial);
    });
  }
  carregarQuestoes(provaInicial);
})();
