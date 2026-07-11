/* ==========================================================================
   estudo.js — Ferramentas de estudo da aba Questões.

   Funcionalidades:
     1. Marcação por questão: Acertei / Errei / Revisar (salvo no navegador
        via localStorage, chave "ra-progresso");
     2. Filtro por status (todas, acertei, errei, revisar, não feitas);
     3. Estatísticas de progresso do curso (contagens + barra);
     4. Cronômetro por questão (iniciar/pausar; o tempo fica salvo);
     5. Modo simulado: sorteia N questões da prova atual, esconde os
        gabaritos, roda um cronômetro regressivo e ao final libera a
        correção e calcula a nota.

   Integração: curso.js chama ESTUDO.aoRenderizar(cursoId, prova, listaEl)
   sempre que uma leva de questões é inserida na página.

   Formato salvo: { "<data-id>": { s: "a"|"e"|"r", t: <segundos> } }
   ========================================================================== */
(function () {
  "use strict";

  var CHAVE = "ra-progresso";

  function carregarDados() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; }
    catch (e) { return {}; }
  }
  function salvarDados() {
    try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) { /* sem storage */ }
  }

  var dados = carregarDados();

  var cursoAtual = null;
  var provaAtual = null;
  var lista = null;
  var filtroStatus = "todas";

  /* estado do simulado */
  var simulado = null; // { ids:[], fim:<ms>, intervalo, corrigindo }

  function fmt(seg) {
    seg = Math.max(0, Math.floor(seg));
    var m = Math.floor(seg / 60), s = seg % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function renderizarMatematica(el) {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([el]).catch(function () {});
    }
  }

  /* ======================================================================
     1. Barra de ferramentas em cada questão (status + cronômetro)
     ====================================================================== */

  /* Link "Ver material": aponta para a seção da teoria correspondente ao
     data-tema da questão (mapa em window.CURSOS[].teoria). Abre em nova guia. */
  function inserirLinkTeoria(q) {
    var tema = q.dataset.tema;
    if (!tema) return;
    var curso = (window.CURSOS || []).find(function (c) { return c.id === cursoAtual; });
    var secao = curso && curso.teoria && curso.teoria[tema];
    if (!secao) return;
    var topo = q.querySelector(".q-topo");
    if (!topo || topo.querySelector(".q-link-teoria")) return;
    var a = document.createElement("a");
    a.className = "q-link-teoria";
    a.href = "curso.html?curso=" + encodeURIComponent(cursoAtual) + "#" + secao;
    a.target = "_blank";
    a.rel = "noopener";
    a.title = "Abrir a teoria deste assunto em uma nova guia";
    a.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">' +
        '<path d="M5 4h9l4 4v12H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M13 4v5h5M8 13h7M8 16.5h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>' +
      '<span>Ver material</span>';
    topo.appendChild(a);
  }

  function equiparQuestoes() {
    if (!lista) return;
    lista.querySelectorAll(".questao").forEach(function (q) {
      inserirLinkTeoria(q);
      if (q.querySelector(".q-ferramentas") || !q.dataset.id) return;
      var id = q.dataset.id;

      var bar = document.createElement("div");
      bar.className = "q-ferramentas";
      bar.innerHTML =
        '<div class="q-cronometro">' +
          '<button type="button" class="q-btn q-btn-timer">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>' +
            '<span class="rotulo-timer">Cronometrar</span>' +
          '</button>' +
          '<span class="q-tempo">00:00</span>' +
        '</div>' +
        '<div class="q-marcacao">' +
          '<button type="button" class="q-btn q-btn-st st-a" data-st="a">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Acertei</button>' +
          '<button type="button" class="q-btn q-btn-st st-e" data-st="e">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>Errei</button>' +
          '<button type="button" class="q-btn q-btn-st st-r" data-st="r">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M20 8a8 8 0 1 0 2 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 3v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Revisar</button>' +
        '</div>';
      q.appendChild(bar);

      /* ----- cronômetro individual ----- */
      var reg = dados[id];
      var rodando = false, inicio = 0, acumulado = (reg && reg.t) || 0, tic = null;
      var lblTempo = bar.querySelector(".q-tempo");
      var btnTimer = bar.querySelector(".q-btn-timer");
      var rotTimer = bar.querySelector(".rotulo-timer");
      lblTempo.textContent = fmt(acumulado);

      function pausar() {
        if (!rodando) return;
        acumulado += (Date.now() - inicio) / 1000;
        rodando = false;
        clearInterval(tic);
        btnTimer.classList.remove("ativo");
        rotTimer.textContent = "Retomar";
        lblTempo.textContent = fmt(acumulado);
        var r = dados[id] || {};
        r.t = Math.round(acumulado);
        dados[id] = r;
        salvarDados();
      }

      btnTimer.addEventListener("click", function () {
        if (rodando) { pausar(); return; }
        rodando = true;
        inicio = Date.now();
        btnTimer.classList.add("ativo");
        rotTimer.textContent = "Pausar";
        tic = setInterval(function () {
          lblTempo.textContent = fmt(acumulado + (Date.now() - inicio) / 1000);
        }, 500);
      });

      /* ----- botões de status ----- */
      bar.querySelectorAll(".q-btn-st").forEach(function (b) {
        b.addEventListener("click", function () {
          pausar();
          var st = b.dataset.st;
          var r = dados[id] || {};
          r.s = (r.s === st) ? undefined : st;   // clicar de novo desmarca
          if (!r.s) delete r.s;
          r.t = Math.round(acumulado);
          if (!r.s && !r.t) delete dados[id]; else dados[id] = r;
          salvarDados();
          aplicarVisual(q);
          atualizarEstatisticas();
          if (!simulado) aplicarFiltroStatus();
          if (simulado && simulado.corrigindo) atualizarNota();
        });
      });

      aplicarVisual(q);
    });
  }

  function aplicarVisual(q) {
    var reg = dados[q.dataset.id];
    var s = reg && reg.s;
    q.classList.remove("q-acertou", "q-errou", "q-revisar");
    q.querySelectorAll(".q-btn-st").forEach(function (b) { b.classList.remove("ativo"); });
    if (!s) return;
    q.classList.add(s === "a" ? "q-acertou" : s === "e" ? "q-errou" : "q-revisar");
    var b = q.querySelector('.q-btn-st[data-st="' + s + '"]');
    if (b) b.classList.add("ativo");
  }

  /* ======================================================================
     2. Filtro por status
     ====================================================================== */

  function aplicarFiltroStatus() {
    if (!lista) return;
    var visiveis = 0;
    lista.querySelectorAll(".questao").forEach(function (q) {
      var reg = dados[q.dataset.id];
      var s = reg && reg.s;
      var mostra =
        filtroStatus === "todas" ||
        (filtroStatus === "nao" && !s) ||
        (filtroStatus === "a" && s === "a") ||
        (filtroStatus === "e" && s === "e") ||
        (filtroStatus === "r" && s === "r");
      q.classList.toggle("q-oculta", !mostra);
      if (mostra) visiveis++;
    });
    var aviso = document.getElementById("aviso-filtro-vazio");
    if (aviso) aviso.classList.toggle("oculto", visiveis > 0);
  }

  function ligarFiltroStatus() {
    document.querySelectorAll(".chip-status").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll(".chip-status").forEach(function (c) { c.classList.remove("ativo"); });
        chip.classList.add("ativo");
        filtroStatus = chip.dataset.status;
        aplicarFiltroStatus();
      });
    });
  }

  /* ======================================================================
     3. Estatísticas de progresso
     ====================================================================== */

  function contagem() {
    var man = (window.QUESTOES_MANIFEST || {})[cursoAtual] || {};
    var total = 0;
    Object.keys(man).forEach(function (p) { total += man[p].length; });
    var c = { total: total, a: 0, e: 0, r: 0 };
    Object.keys(dados).forEach(function (k) {
      if (k.indexOf(cursoAtual + "-") !== 0) return;
      var s = dados[k] && dados[k].s;
      if (s === "a") c.a++; else if (s === "e") c.e++; else if (s === "r") c.r++;
    });
    c.feitas = c.a + c.e + c.r;
    return c;
  }

  function atualizarEstatisticas() {
    var el = document.getElementById("estatisticas");
    if (!el || !cursoAtual) return;
    var c = contagem();
    var pct = c.total ? Math.round((100 * c.feitas) / c.total) : 0;
    el.innerHTML =
      '<div class="est-topo">' +
        '<span class="est-titulo">Seu progresso</span>' +
        '<span class="est-resumo">' + c.feitas + " de " + c.total + " questões (" + pct + "%)</span>" +
        '<button type="button" id="btn-limpar-progresso" class="q-btn">Limpar progresso</button>' +
      "</div>" +
      '<div class="est-barra"><div class="est-preenchido" style="width:' + pct + '%"></div></div>' +
      '<div class="est-numeros">' +
        '<span class="est-num na">' + c.a + " acertadas</span>" +
        '<span class="est-num ne">' + c.e + " erradas</span>" +
        '<span class="est-num nr">' + c.r + " para revisar</span>" +
      "</div>";
    var btn = document.getElementById("btn-limpar-progresso");
    if (btn) btn.addEventListener("click", function () {
      if (!window.confirm("Apagar todo o progresso desta cadeira (marcações e tempos)?")) return;
      Object.keys(dados).forEach(function (k) {
        if (k.indexOf(cursoAtual + "-") === 0) delete dados[k];
      });
      salvarDados();
      atualizarEstatisticas();
      if (lista) lista.querySelectorAll(".questao").forEach(aplicarVisual);
      aplicarFiltroStatus();
    });
  }

  /* ======================================================================
     4. Modo simulado
     ====================================================================== */

  var PROVAS_ROTULO = { "1ee": "1º EE", "2ee": "2º EE", "final": "Prova Final" };

  function embaralhar(v) {
    for (var i = v.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = v[i]; v[i] = v[j]; v[j] = t;
    }
    return v;
  }

  function ligarSimulado() {
    var btnAbrir = document.getElementById("btn-simulado");
    var config = document.getElementById("simulado-config");
    var btnIniciar = document.getElementById("simulado-iniciar");
    var btnCancelar = document.getElementById("simulado-cancelar");
    var btnEncerrar = document.getElementById("simulado-encerrar");
    var btnSair = document.getElementById("simulado-sair");
    if (!btnAbrir) return;

    btnAbrir.addEventListener("click", function () {
      config.classList.toggle("oculto");
    });
    btnCancelar.addEventListener("click", function () {
      config.classList.add("oculto");
    });
    btnIniciar.addEventListener("click", function () {
      var n = parseInt(document.getElementById("simulado-n").value, 10) || 4;
      var min = parseInt(document.getElementById("simulado-min").value, 10) || 100;
      config.classList.add("oculto");
      iniciarSimulado(n, min);
    });
    btnEncerrar.addEventListener("click", corrigirSimulado);
    btnSair.addEventListener("click", sairSimulado);
  }

  function iniciarSimulado(n, minutos) {
    var man = (window.QUESTOES_MANIFEST || {})[cursoAtual] || {};
    var arquivos = (man[provaAtual] || []).slice();
    if (arquivos.length === 0) return;
    n = Math.min(n, arquivos.length);
    var sorteados = embaralhar(arquivos).slice(0, n);

    Promise.all(
      sorteados.map(function (arq) {
        return fetch("questoes/" + cursoAtual + "/" + provaAtual + "/" + arq)
          .then(function (r) { if (!r.ok) throw new Error(arq); return r.text(); })
          .catch(function () { return ""; });
      })
    ).then(function (blocos) {
      lista.innerHTML = blocos.join("\n");
      renderizarMatematica(lista);
      equiparQuestoes();

      simulado = { corrigindo: false, ids: [] };
      lista.querySelectorAll(".questao").forEach(function (q) {
        if (q.dataset.id) simulado.ids.push(q.dataset.id);
      });

      document.body.classList.add("simulado-ativo");
      document.getElementById("simulado-barra").classList.remove("oculto");
      document.getElementById("simulado-encerrar").classList.remove("oculto");
      document.getElementById("simulado-sair").classList.add("oculto");
      document.getElementById("simulado-nota").textContent = "";
      document.getElementById("simulado-info").textContent =
        PROVAS_ROTULO[provaAtual] + " · " + simulado.ids.length + " questões";

      var fim = Date.now() + minutos * 60000;
      var lbl = document.getElementById("simulado-tempo");
      lbl.classList.remove("apertado");
      function tique() {
        var resta = (fim - Date.now()) / 1000;
        if (resta <= 0) { corrigirSimulado(); return; }
        lbl.textContent = fmt(resta);
        if (resta < 300) lbl.classList.add("apertado");
      }
      tique();
      simulado.intervalo = setInterval(tique, 1000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function corrigirSimulado() {
    if (!simulado || simulado.corrigindo) return;
    simulado.corrigindo = true;
    clearInterval(simulado.intervalo);
    document.body.classList.remove("simulado-ativo");
    document.body.classList.add("simulado-corrigindo");
    document.getElementById("simulado-tempo").textContent = "Tempo encerrado";
    document.getElementById("simulado-encerrar").classList.add("oculto");
    document.getElementById("simulado-sair").classList.remove("oculto");
    document.getElementById("simulado-info").textContent =
      "Correção: confira os gabaritos e marque Acertei ou Errei em cada questão.";
    atualizarNota();
  }

  function atualizarNota() {
    if (!simulado) return;
    var acertos = 0, marcadas = 0;
    simulado.ids.forEach(function (id) {
      var s = dados[id] && dados[id].s;
      if (s === "a" || s === "e") {
        marcadas++;
        if (s === "a") acertos++;
      }
    });
    var nota = simulado.ids.length ? (10 * acertos) / simulado.ids.length : 0;
    document.getElementById("simulado-nota").textContent =
      marcadas === 0
        ? ""
        : "Nota: " + nota.toFixed(1).replace(".", ",") + " (" + acertos + "/" + simulado.ids.length + ")";
  }

  function sairSimulado() {
    if (simulado) clearInterval(simulado.intervalo);
    simulado = null;
    document.body.classList.remove("simulado-ativo", "simulado-corrigindo");
    document.getElementById("simulado-barra").classList.add("oculto");
    if (window.RA && window.RA.recarregarQuestoes) window.RA.recarregarQuestoes();
  }

  /* ======================================================================
     API pública — chamada pelo curso.js
     ====================================================================== */

  var inicializado = false;

  window.ESTUDO = {
    /* chamada sempre que curso.js termina de inserir questões na lista */
    aoRenderizar: function (cursoId, prova, listaEl) {
      cursoAtual = cursoId;
      provaAtual = prova;
      lista = listaEl;
      if (!inicializado) {
        inicializado = true;
        ligarFiltroStatus();
        ligarSimulado();
      }
      /* trocar de prova manualmente encerra um simulado em andamento */
      if (simulado) {
        clearInterval(simulado.intervalo);
        simulado = null;
        document.body.classList.remove("simulado-ativo", "simulado-corrigindo");
        document.getElementById("simulado-barra").classList.add("oculto");
      }
      equiparQuestoes();
      atualizarEstatisticas();
      aplicarFiltroStatus();
    }
  };
})();
