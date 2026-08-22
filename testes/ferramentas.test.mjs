/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                    ferramentas.test.mjs *
   *------------------------------------------------------------------------*
   * Copyright © 2026  Arthur Epifanio De Azevedo                           *
   * Todos os direitos reservados.                                          *
   *                                                                        *
   * Software proprietário — ver arquivo LICENSE.                           *
   *                                                                        *
   * Autor:   Arthur Epifanio De Azevedo                                    *
   * Página:  https://github.com/ArthurrAzeved0                             *
   * Contato: arthur_azevedo05@hotmail.com                                  *
   ************************************************************************** */
/* Testa o ROTEAMENTO do clique na barra de ferramentas da questão, com um DOM
   mínimo de mentira.

   O que se está protegendo: o cronômetro ficou morto porque `sincronizar()`
   punha `data-status` no <article class="questao">. O handler procurava
   `[data-status]` SUBINDO a árvore, então o cartão virava ancestral de tudo
   dentro dele, casava primeiro, e o clique do cronômetro nunca chegava ao seu
   ramo — ele caía no ramo de status, não achava a barra e voltava.

   Aqui o cartão tem `data-status` DE PROPÓSITO: é o cenário da regressão. Se
   alguém afrouxar o seletor de volta para `[data-status]`, este teste falha.

   Rodar: npm test */

/* ------------------------------------------------------- DOM de mentira --- */
class El {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attrs };
    this.filhos = [];
    this.pai = null;
    this.textContent = "";
    this._classes = new Set((attrs.class || "").split(/\s+/).filter(Boolean));
    const self = this;
    this.dataset = new Proxy(
      {},
      {
        get: (_, k) => self.attrs["data-" + camelParaTraco(k)],
        set: (_, k, v) => ((self.attrs["data-" + camelParaTraco(k)] = String(v)), true),
      },
    );
    this.classList = {
      add: (...c) => c.forEach((x) => self._classes.add(x)),
      remove: (...c) => c.forEach((x) => self._classes.delete(x)),
      contains: (c) => self._classes.has(c),
    };
  }
  add(filho) {
    filho.pai = this;
    this.filhos.push(filho);
    return filho;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  get className() { return [...this._classes].join(" "); }
  casa(sel) {
    /* aceita  tag[attr]  |  [attr]  |  .classe  */
    const m = /^([a-z]*)(?:\[([^\]]+)\])?(?:\.([\w-]+))?$/i.exec(sel);
    if (!m) throw new Error("seletor não suportado no teste: " + sel);
    const [, tag, attr, cls] = m;
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    if (attr && !(attr in this.attrs)) return false;
    if (cls && !this._classes.has(cls)) return false;
    return Boolean(tag || attr || cls);
  }
  closest(sel) {
    let n = this;
    while (n) { if (n.casa(sel)) return n; n = n.pai; }
    return null;
  }
  *desc() { for (const f of this.filhos) { yield f; yield* f.desc(); } }
  querySelector(sel) { for (const d of this.desc()) if (d.casa(sel)) return d; return null; }
  querySelectorAll(sel) { return [...this.desc()].filter((d) => d.casa(sel)); }
}
const camelParaTraco = (k) => String(k).replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

/* ------------------------------------------------------------- ambiente --- */
const loja = new Map();
globalThis.localStorage = {
  getItem: (k) => (loja.has(k) ? loja.get(k) : null),
  setItem: (k, v) => loja.set(k, v),
  removeItem: (k) => loja.delete(k),
};
globalThis.CustomEvent = class {
  constructor(t, op) { this.type = t; this.detail = op?.detail; }
};

/* Relógio controlado. Sem ele os dois cliques caem no MESMO milissegundo, o
   tempo acumulado arredonda para zero e o teste passa a medir um cenário que
   não existe usando o site. Com ele, "avancar(5)" é 5 segundos de cronômetro. */
let agora = 1_700_000_000_000;
Date.now = () => agora;
const avancar = (s) => { agora += s * 1000; };

/* monta a página: cartão COM data-status (o cenário da regressão) */
const artigo = new El("article", { class: "questao", "data-status": "" });
const barra = artigo.add(new El("div", { "data-ferramentas": "din-1ee-01" }));
const btnCron = barra.add(new El("button", { "data-cron": "", "aria-pressed": "false" }));
const rotulo = btnCron.add(new El("span", { "data-cron-rotulo": "" }));
rotulo.textContent = "Cronometrar";
const mostrador = barra.add(new El("span", { "data-tempo": "" }));
mostrador.textContent = "00:00";
const btnAcertei = barra.add(new El("button", { "data-status": "a", "aria-pressed": "false" }));

const raiz = new El("body");
raiz.add(artigo);

/* O document de mentira precisa DESPACHAR de verdade: `marcar()` emite
   `nabla:progresso`, e é esse evento que faz a barra se redesenhar. Sem isso o
   teste falharia por culpa do próprio teste. */
const ouvintes = new Map();
globalThis.document = {
  addEventListener: (t, fn) => {
    if (!ouvintes.has(t)) ouvintes.set(t, []);
    ouvintes.get(t).push(fn);
  },
  dispatchEvent: (ev) => (ouvintes.get(ev.type) ?? []).forEach((fn) => fn(ev)),
  querySelectorAll: (sel) => raiz.querySelectorAll(sel),
  visibilityState: "visible",
};
const ouvinteClique = (e) => (ouvintes.get("click") ?? []).forEach((fn) => fn(e));
/* O window também precisa despachar: é pelo evento `storage` que o progresso
   descobre que OUTRA ABA apagou tudo, e esse caminho não traz detalhe. */
const ouvintesW = new Map();
let proximoTique = 1;
const tiquesVivos = new Set();
globalThis.window = {
  addEventListener: (t, fn) => {
    if (!ouvintesW.has(t)) ouvintesW.set(t, []);
    ouvintesW.get(t).push(fn);
  },
  dispatchEvent: (ev) => (ouvintesW.get(ev.type) ?? []).forEach((fn) => fn(ev)),
  setInterval: () => { const h = proximoTique++; tiquesVivos.add(h); return h; },
  clearInterval: (h) => tiquesVivos.delete(h),
};

const M = await import("../.tmp-teste/ferramentas.mjs");
M.ligarFerramentas();

/* ---------------------------------------------------------------- testes --- */
let falhas = 0;
const teste = (nome, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}`);
  if (!ok) { console.log(`        esperado ${JSON.stringify(esperado)}, veio ${JSON.stringify(real)}`); falhas++; }
};
const clicar = (el) => ouvinteClique({ target: el });

teste("o ouvinte de clique foi registrado", (ouvintes.get("click") ?? []).length, 1);

/* 1) o cartão com data-status NÃO pode engolir o clique do cronômetro */
clicar(btnCron);
avancar(7);
teste("1 clique inicia o cronômetro", btnCron.getAttribute("aria-pressed"), "true");
teste("1 clique troca o rótulo para Pausar", rotulo.textContent, "Pausar");
teste("1 clique marca o mostrador como rodando", mostrador.hasAttribute("data-rodando"), true);

/* 2) o segundo clique pausa, e o tempo contado é o que passou no relógio */
clicar(btnCron);
teste("2 cliques pausam", btnCron.getAttribute("aria-pressed"), "false");
teste("2 cliques oferecem Retomar", rotulo.textContent, "Retomar");
teste("2 cliques param o mostrador", mostrador.hasAttribute("data-rodando"), false);
teste("contou os 7 s do relógio", mostrador.textContent, "00:07");
teste("gravou os 7 s", JSON.parse(loja.get("ra-progresso"))["din-1ee-01"].t, 7);

/* 3) clicar no ROTULO (dentro do botão) também conta: closest sobe até o botão */
clicar(rotulo);
teste("clique no rótulo retoma", btnCron.getAttribute("aria-pressed"), "true");
avancar(3);
clicar(rotulo);
teste("retomar soma, não reinicia", mostrador.textContent, "00:10");

/* 4) o botão de status continua no seu ramo, e encerra a contagem */
clicar(btnAcertei);
teste("Acertei pinta o cartão", artigo.classList.contains("st-acertei"), true);
teste("Acertei não deixa o cronômetro rodando", btnCron.getAttribute("aria-pressed"), "false");
teste("Acertei marca o próprio botão", btnAcertei.getAttribute("aria-pressed"), "true");


/* ---------------------------------------------------------------------------
   "Limpar progresso" tem de apagar o TEMPO, não só as marcações. O aviso do
   painel promete "marcações e tempos", e não cumpria: o cronômetro guarda o
   tempo em memória, e o mostrador seguia no valor velho.                     */

/* 5) cronômetro PAUSADO: o armazenamento zerou (caminho de outra aba, que não
      manda detalhe) — o mostrador tem de acompanhar */
clicar(btnCron);            /* inicia  */
avancar(12);
clicar(btnCron);            /* pausa: grava o tempo */
teste("pausado grava o tempo", JSON.parse(loja.get("ra-progresso"))["din-1ee-01"].t, 22);
loja.clear();
globalThis.window.dispatchEvent({ type: "storage", key: "ra-progresso" });
teste("apagado por fora zera o mostrador", mostrador.textContent, "00:00");
teste("apagado por fora volta o rótulo", rotulo.textContent, "Cronometrar");
teste("apagado por fora despressiona o botão", btnCron.getAttribute("aria-pressed"), "false");

/* 6) cronômetro RODANDO na hora do Limpar: não basta repintar, tem de PARAR.
      Um cronômetro em curso não está no armazenamento (só é gravado ao
      pausar), então só o aviso explícito resolve. */
clicar(btnCron);
avancar(9);
const tiqueDoRodando = [...tiquesVivos].pop();
teste("rodando tem tique vivo", tiquesVivos.has(tiqueDoRodando), true);
loja.clear();
globalThis.document.dispatchEvent({ type: "nabla:progresso", detail: { limpou: "din" } });
teste("limpar para o tique do rodando", tiquesVivos.has(tiqueDoRodando), false);
teste("limpar zera o mostrador do rodando", mostrador.textContent, "00:00");
teste("limpar volta o rótulo do rodando", rotulo.textContent, "Cronometrar");
teste("limpar despressiona o botão do rodando", btnCron.getAttribute("aria-pressed"), "false");

/* 7) limpar OUTRA cadeira não pode encostar nesta */
clicar(btnCron);
const tiqueOutra = [...tiquesVivos].pop();
globalThis.document.dispatchEvent({ type: "nabla:progresso", detail: { limpou: "eletromag" } });
teste("limpar outra cadeira não para este tique", tiquesVivos.has(tiqueOutra), true);
clicar(btnCron);

console.log(falhas === 0 ? "\n  ferramentas: todos passaram" : `\n  ferramentas: ${falhas} falha(s)`);
if (falhas) process.exit(1);
