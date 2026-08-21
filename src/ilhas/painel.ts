/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                               painel.ts *
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
/* ==========================================================================
   painel.ts — progresso, filtro por status e modo simulado.

   Diferença de fundo em relação ao site 1.x: lá o simulado REFAZIA a lista,
   buscando as questões sorteadas por fetch e trocando o innerHTML. Aqui as
   questões já estão na página (vieram do build), então o simulado só
   ESCONDE o que não sorteou e tranca os gabaritos. Nada de rede, nada de
   perder o que já estava renderizado — e sair do simulado não recarrega.
   ========================================================================== */
import { contar, limparCadeira, status, aoMudar, formatarTempo } from "./progresso";

type Filtro = "todas" | "nao" | "a" | "e" | "r";

interface Simulado {
  ids: Set<string>;
  fim: number;
  tique: number;
  corrigindo: boolean;
}

export function ligarPainel() {
  const painel = document.querySelector<HTMLElement>("[data-painel]");
  if (!painel) return;

  const cadeira = painel.dataset.cadeira!;
  const idsProva = (painel.dataset.ids ?? "").split(",").filter(Boolean);
  const totalCadeira = Number(painel.dataset.totalCadeira ?? idsProva.length);
  void totalCadeira;

  const questaoDe = new Map<string, HTMLElement>();
  for (const q of document.querySelectorAll<HTMLElement>(".questao")) questaoDe.set(q.id, q);

  let filtro: Filtro = "todas";
  let sim: Simulado | null = null;

  const $ = <T extends Element = HTMLElement>(sel: string) => painel.querySelector<T>(sel);
  const barraSim = document.querySelector<HTMLElement>("[data-barra-simulado]")!;
  const $sim = <T extends Element = HTMLElement>(sel: string) => barraSim.querySelector<T>(sel);

  /* ------------------------------------------------------------ progresso */
  function pintarProgresso() {
    const c = contar(idsProva);

    /* A barra mostra a proporção DESTA prova: é o universo que a página
       conhece sem ter de carregar as outras. O total da cadeira aparece
       como texto ao lado. */
    const pct = (n: number) => (c.total ? (100 * n) / c.total : 0);
    ($('[data-fatia="a"]') as HTMLElement).style.width = `${pct(c.a)}%`;
    ($('[data-fatia="e"]') as HTMLElement).style.width = `${pct(c.e)}%`;
    ($('[data-fatia="r"]') as HTMLElement).style.width = `${pct(c.r)}%`;

    for (const k of ["a", "e", "r"] as const) {
      const el = $(`[data-n="${k}"]`);
      if (el) el.textContent = String(c[k]);
    }
    const resumo = $("[data-resumo]");
    if (resumo) {
      resumo.textContent = `${c.feitas} de ${idsProva.length} nesta prova`;
    }

    /* contadores dos chips de filtro */
    const mapa: Record<Filtro, number> = {
      todas: c.total,
      nao: c.nao,
      a: c.a,
      e: c.e,
      r: c.r,
    };
    for (const [k, v] of Object.entries(mapa)) {
      const el = $(`[data-c="${k}"]`);
      if (el) el.textContent = String(v);
    }
  }

  /* --------------------------------------------------------------- filtro */
  function aplicarFiltro() {
    let visiveis = 0;
    for (const id of idsProva) {
      const q = questaoDe.get(id);
      if (!q) continue;
      /* durante o simulado, quem manda é o sorteio */
      if (sim) {
        q.hidden = !sim.ids.has(id);
        if (!q.hidden) visiveis++;
        continue;
      }
      const s = status(id);
      const mostra =
        filtro === "todas" ||
        (filtro === "nao" && !s) ||
        (filtro === "a" && s === "a") ||
        (filtro === "e" && s === "e") ||
        (filtro === "r" && s === "r");
      q.hidden = !mostra;
      if (mostra) visiveis++;
    }
    $("[data-vazio]")?.classList.toggle("oculto", visiveis > 0);
  }

  for (const b of painel.querySelectorAll<HTMLButtonElement>("[data-filtro]")) {
    b.addEventListener("click", () => {
      if (sim) return; /* no simulado o filtro não vale */
      for (const o of painel.querySelectorAll("[data-filtro]")) o.classList.remove("ativo");
      b.classList.add("ativo");
      filtro = b.dataset.filtro as Filtro;
      aplicarFiltro();
    });
  }

  $("[data-limpar]")?.addEventListener("click", () => {
    if (!window.confirm("Apagar todo o progresso desta cadeira (marcações e tempos)?")) return;
    limparCadeira(cadeira);
  });

  /* -------------------------------------------------------------- simulado
     Esconder o gabarito é feito por atributo no <article>, e o CSS global
     em base.css some com os <details>. Assim não há como "espiar" abrindo
     o elemento pelo DevTools sem desfazer o estado. */
  function embaralhar<T>(v: T[]): T[] {
    const a = [...v];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }

  function atualizarNota() {
    if (!sim) return;
    let acertos = 0;
    let marcadas = 0;
    for (const id of sim.ids) {
      const s = status(id);
      if (s === "a" || s === "e") {
        marcadas++;
        if (s === "a") acertos++;
      }
    }
    const el = $sim("[data-sim-nota]");
    if (!el) return;
    if (!sim.corrigindo || marcadas === 0) {
      el.textContent = "";
      return;
    }
    const nota = (10 * acertos) / sim.ids.size;
    el.textContent = `Nota: ${nota.toFixed(1).replace(".", ",")} (${acertos}/${sim.ids.size})`;
  }

  function iniciarSimulado(n: number, minutos: number) {
    const sorteados = embaralhar(idsProva).slice(0, Math.min(n, idsProva.length));
    if (sorteados.length === 0) return;

    sim = { ids: new Set(sorteados), fim: Date.now() + minutos * 60_000, tique: 0, corrigindo: false };
    document.body.dataset.simulado = "ativo";
    barraSim.classList.remove("oculto");
    $sim("[data-encerrar-simulado]")?.classList.remove("oculto");
    $sim("[data-sair-simulado]")?.classList.add("oculto");
    const info = $sim("[data-sim-info]");
    if (info) info.textContent = `${sorteados.length} questões sorteadas`;

    const lbl = $sim("[data-sim-tempo]")!;
    const tique = () => {
      const resta = (sim!.fim - Date.now()) / 1000;
      if (resta <= 0) {
        corrigirSimulado();
        return;
      }
      lbl.textContent = formatarTempo(resta);
      if (resta < 300) lbl.setAttribute("data-apertado", "");
    };
    tique();
    sim.tique = window.setInterval(tique, 1000);

    aplicarFiltro();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function corrigirSimulado() {
    if (!sim || sim.corrigindo) return;
    sim.corrigindo = true;
    window.clearInterval(sim.tique);
    document.body.dataset.simulado = "corrigindo";
    const lbl = $sim("[data-sim-tempo]");
    if (lbl) {
      lbl.textContent = "Tempo encerrado";
      lbl.removeAttribute("data-apertado");
    }
    const info = $sim("[data-sim-info]");
    if (info) info.textContent = "Confira os gabaritos e marque Acertei ou Errei em cada questão.";
    $sim("[data-encerrar-simulado]")?.classList.add("oculto");
    $sim("[data-sair-simulado]")?.classList.remove("oculto");
    atualizarNota();
  }

  function sairSimulado() {
    if (sim) window.clearInterval(sim.tique);
    sim = null;
    delete document.body.dataset.simulado;
    barraSim.classList.add("oculto");
    const n = $sim("[data-sim-nota]");
    if (n) n.textContent = "";
    aplicarFiltro();
  }

  $("[data-abrir-simulado]")?.addEventListener("click", () => {
    $("[data-config-simulado]")?.classList.toggle("oculto");
  });
  $("[data-cancelar-simulado]")?.addEventListener("click", () => {
    $("[data-config-simulado]")?.classList.add("oculto");
  });
  $<HTMLFormElement>("[data-config-simulado]")?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    $("[data-config-simulado]")?.classList.add("oculto");
    iniciarSimulado(
      Number($<HTMLInputElement>("[data-sim-n]")?.value ?? 4),
      Number($<HTMLInputElement>("[data-sim-min]")?.value ?? 100),
    );
  });
  $sim("[data-encerrar-simulado]")?.addEventListener("click", corrigirSimulado);
  $sim("[data-sair-simulado]")?.addEventListener("click", sairSimulado);

  /* ---------------------------------------------------------------- ligar */
  pintarProgresso();
  aplicarFiltro();
  aoMudar(() => {
    pintarProgresso();
    atualizarNota();
    /* durante o simulado a lista não se reorganiza a cada marcação: seria
       a questão desaparecendo debaixo do dedo do aluno */
    if (!sim) aplicarFiltro();
  });
}
