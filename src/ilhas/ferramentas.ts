/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                          ferramentas.ts *
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
   ferramentas.ts — liga a barra de cada questão (status + cronômetro).

   UM listener delegado para a página inteira, em vez de um por questão: a
   final de Eletromag tem 38 questões, e 38 conjuntos de listeners seria
   desperdício. O estado vive no módulo `progresso`; aqui só se reflete o
   que está lá e se reage ao clique.
   ========================================================================== */
import {
  marcar,
  salvarTempo,
  status,
  tempo,
  aoMudar,
  formatarTempo,
  type Mudanca,
  type Status,
} from "./progresso";

const CLASSE_ESTADO = { a: "st-acertei", e: "st-errei", r: "st-revisar" } as const;

/* ------------------------------------------------------------- cronômetro */
interface Cron {
  base: number; /* segundos já acumulados antes de começar */
  inicio: number | null; /* timestamp de quando retomou; null = pausado */
  tique: number | undefined;
}
const crons = new Map<string, Cron>();

function decorrido(c: Cron): number {
  return c.base + (c.inicio === null ? 0 : (Date.now() - c.inicio) / 1000);
}

function pintarTempo(barra: HTMLElement, segundos: number, rodando: boolean) {
  const el = barra.querySelector<HTMLElement>("[data-tempo]");
  if (!el) return;
  el.textContent = formatarTempo(segundos);
  if (rodando) el.setAttribute("data-rodando", "");
  else el.removeAttribute("data-rodando");
}

function pausar(id: string, barra: HTMLElement) {
  const c = crons.get(id);
  if (!c || c.inicio === null) return;
  c.base = decorrido(c);
  c.inicio = null;
  window.clearInterval(c.tique);
  c.tique = undefined;
  salvarTempo(id, c.base);

  const btn = barra.querySelector<HTMLButtonElement>("[data-cron]");
  btn?.setAttribute("aria-pressed", "false");
  const rot = barra.querySelector<HTMLElement>("[data-cron-rotulo]");
  if (rot) rot.textContent = "Retomar";
  pintarTempo(barra, c.base, false);
}

function retomar(id: string, barra: HTMLElement) {
  const c = crons.get(id) ?? { base: tempo(id), inicio: null, tique: undefined };
  crons.set(id, c);
  c.inicio = Date.now();
  c.tique = window.setInterval(() => pintarTempo(barra, decorrido(c), true), 500);

  const btn = barra.querySelector<HTMLButtonElement>("[data-cron]");
  btn?.setAttribute("aria-pressed", "true");
  const rot = barra.querySelector<HTMLElement>("[data-cron-rotulo]");
  if (rot) rot.textContent = "Pausar";
  pintarTempo(barra, decorrido(c), true);
}

/** Larga o cronômetro em memória e devolve o botão ao estado inicial.
    Usado quando o progresso é APAGADO por fora: sem isto o intervalo continua
    correndo e o mostrador segue no tempo velho, mesmo com o armazenamento
    zerado — era o que fazia o "Limpar progresso" não apagar o tempo. */
function descartar(id: string, barra: HTMLElement) {
  const c = crons.get(id);
  if (c) window.clearInterval(c.tique);
  crons.delete(id);

  const btn = barra.querySelector<HTMLButtonElement>("[data-cron]");
  btn?.setAttribute("aria-pressed", "false");
  const rot = barra.querySelector<HTMLElement>("[data-cron-rotulo]");
  /* "Cronometrar", não "Retomar": não há mais nada acumulado para retomar */
  if (rot) rot.textContent = "Cronometrar";
  pintarTempo(barra, 0, false);
}

/* ------------------------------------------------------- reflete o estado */
function sincronizar(barra: HTMLElement) {
  const id = barra.dataset.ferramentas;
  if (!id) return;
  const s = status(id);

  for (const b of barra.querySelectorAll<HTMLButtonElement>("button[data-status]")) {
    b.setAttribute("aria-pressed", String(b.dataset.status === s));
  }

  /* A barra lateral colorida do cartão vem daqui — pela CLASSE, e só por ela.
     NÃO voltar a pôr `data-status` no <article>: o seletor de clique abaixo
     procura `[data-status]` subindo a árvore, então um atributo no cartão
     virava ancestral de TUDO dentro dele e engolia o clique do cronômetro,
     que nunca chegava ao seu próprio ramo. O cronômetro ficou morto assim.
     Ninguém lia esse atributo (o filtro do painel lê o módulo `progresso`,
     não o DOM), então ele era só a armadilha. */
  const questao = barra.closest<HTMLElement>(".questao");
  if (questao) {
    questao.classList.remove("st-acertei", "st-errei", "st-revisar");
    if (s) questao.classList.add(CLASSE_ESTADO[s]);
  }

  const c = crons.get(id);
  if (!c) {
    pintarTempo(barra, tempo(id), false);
  } else if (c.inicio === null) {
    /* Pausado: o ARMAZENAMENTO manda, não o que está em memória. É o que faz
       o mostrador acompanhar quando o tempo é apagado — aqui ou em outra aba,
       que não manda detalhe no evento. */
    c.base = tempo(id);
    pintarTempo(barra, c.base, false);
    if (c.base === 0) descartar(id, barra);
  }
  /* rodando: não sobrescreve — quem pinta é o tique */
}

function sincronizarTudo() {
  for (const b of document.querySelectorAll<HTMLElement>("[data-ferramentas]")) sincronizar(b);
}

/* ------------------------------------------------------------------ ligar */
export function ligarFerramentas() {
  sincronizarTudo();

  document.addEventListener("click", (ev) => {
    const alvo = ev.target as HTMLElement | null;

    /* `button[data-status]`, não `[data-status]`: amarrar o seletor à TAG é o
       que impede um contêiner de se passar por controle. */
    const btnStatus = alvo?.closest<HTMLButtonElement>("button[data-status]");
    if (btnStatus) {
      const barra = btnStatus.closest<HTMLElement>("[data-ferramentas]");
      const id = barra?.dataset.ferramentas;
      if (!barra || !id) return;
      /* marcar encerra a contagem: o tempo daquela questão acabou ali */
      pausar(id, barra);
      marcar(id, btnStatus.dataset.status as Status);
      return;
    }

    const btnCron = alvo?.closest<HTMLButtonElement>("button[data-cron]");
    if (btnCron) {
      const barra = btnCron.closest<HTMLElement>("[data-ferramentas]");
      const id = barra?.dataset.ferramentas;
      if (!barra || !id) return;
      const c = crons.get(id);
      if (c && c.inicio !== null) pausar(id, barra);
      else retomar(id, barra);
    }
  });

  /* Sair da página com o cronômetro rodando não pode perder o tempo.
     visibilitychange cobre o caso do celular, onde `beforeunload` muitas
     vezes não dispara ao trocar de app. */
  const salvarTodos = () => {
    for (const [id, c] of crons) {
      if (c.inicio !== null) salvarTempo(id, decorrido(c));
    }
  };
  window.addEventListener("beforeunload", salvarTodos);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") salvarTodos();
  });

  aoMudar((m?: Mudanca) => {
    /* Apagou o progresso da cadeira: para os cronômetros DELA antes de
       redesenhar. Um que esteja rodando não se descobre pelo armazenamento —
       ele só é gravado ao pausar —, então o aviso explícito é necessário. */
    if (m?.limpou) {
      for (const barra of document.querySelectorAll<HTMLElement>("[data-ferramentas]")) {
        const id = barra.dataset.ferramentas;
        if (id && id.startsWith(`${m.limpou}-`)) descartar(id, barra);
      }
    }
    sincronizarTudo();
  });
}
