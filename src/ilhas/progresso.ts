/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                            progresso.ts *
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
   progresso.ts — a memória de estudo, guardada no navegador.

   COMPATIBILIDADE: a chave e o formato são IDÊNTICOS aos do site 1.x, de
   propósito. Quem já estudava pelo site antigo não perde nada ao migrar:

       chave    "ra-progresso"
       formato  { "<id-da-questao>": { s: "a"|"e"|"r", t: <segundos> } }

   `s` é o status (acertei/errei/revisar) e `t` o tempo cronometrado. O id é
   o mesmo de sempre: <cadeira>-<prova>-<NN>.

   Este módulo é a ÚNICA porta de acesso ao armazenamento. Nada mais toca o
   localStorage: assim há um só lugar onde o formato pode mudar, e as ilhas
   se avisam por eventos em vez de cada uma reler tudo.
   ========================================================================== */

export const CHAVE = "ra-progresso";

export type Status = "a" | "e" | "r";

export interface Registro {
  /** Status; ausente quando a questão foi só cronometrada. */
  s?: Status;
  /** Tempo acumulado, em segundos inteiros. */
  t?: number;
}

export type Dados = Record<string, Registro>;

/** Disparado no `document` sempre que algo muda. */
export const EVENTO = "nabla:progresso";

/** O que aconteceu, quando importa saber. Hoje só o "apagou tudo" precisa se
    identificar: quem guarda estado em memória (o cronômetro de cada questão)
    tem de largá-lo, e isso não se deduz olhando o armazenamento. */
export interface Mudanca {
  /** id da cadeira cujo progresso foi apagado */
  limpou?: string;
}

let cache: Dados | null = null;

function ler(): Dados {
  if (cache) return cache;
  try {
    const cru = localStorage.getItem(CHAVE);
    cache = cru ? (JSON.parse(cru) as Dados) : {};
  } catch {
    /* modo privado, cota cheia, storage desabilitado: segue sem memória */
    cache = {};
  }
  return cache;
}

function gravar(d: Dados, mudanca?: Mudanca) {
  cache = d;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(d));
  } catch {
    /* sem persistência: a sessão continua funcionando, só não sobrevive */
  }
  document.dispatchEvent(new CustomEvent<Mudanca | undefined>(EVENTO, { detail: mudanca }));
}

export function registro(id: string): Registro | undefined {
  return ler()[id];
}

export function status(id: string): Status | undefined {
  return ler()[id]?.s;
}

export function tempo(id: string): number {
  return ler()[id]?.t ?? 0;
}

/** Marca o status. Marcar o mesmo status de novo DESMARCA (como no site 1.x). */
export function marcar(id: string, s: Status): Status | undefined {
  const d = { ...ler() };
  const r: Registro = { ...d[id] };
  const novo = r.s === s ? undefined : s;
  if (novo) r.s = novo;
  else delete r.s;
  /* registro vazio não fica ocupando espaço */
  if (r.s === undefined && !r.t) delete d[id];
  else d[id] = r;
  gravar(d);
  return novo;
}

export function salvarTempo(id: string, segundos: number) {
  const d = { ...ler() };
  const r: Registro = { ...d[id], t: Math.round(segundos) };
  if (!r.t && r.s === undefined) delete d[id];
  else d[id] = r;
  gravar(d);
}

/** Apaga o progresso de uma cadeira (os ids começam com "<cadeira>-").

    Avisa QUEM foi apagado: o cronômetro de cada questão guarda o tempo em
    memória enquanto roda, e sem esse aviso ele continuaria contando de onde
    estava — o "Limpar progresso" zerava o armazenamento e o mostrador seguia
    marcando o tempo velho. */
export function limparCadeira(cadeira: string) {
  const d = { ...ler() };
  for (const k of Object.keys(d)) if (k.startsWith(`${cadeira}-`)) delete d[k];
  gravar(d, { limpou: cadeira });
}

export interface Contagem {
  total: number;
  a: number;
  e: number;
  r: number;
  nao: number;
  feitas: number;
}

/** Contagem sobre uma lista de ids — quem chama decide o universo. */
export function contar(ids: readonly string[]): Contagem {
  const d = ler();
  const c: Contagem = { total: ids.length, a: 0, e: 0, r: 0, nao: 0, feitas: 0 };
  for (const id of ids) {
    const s = d[id]?.s;
    if (s === "a") c.a++;
    else if (s === "e") c.e++;
    else if (s === "r") c.r++;
    else c.nao++;
  }
  c.feitas = c.a + c.e + c.r;
  return c;
}

/** Avisa quando o progresso muda, inclusive em OUTRA aba do navegador.

    O `fn` recebe a `Mudanca` quando ela existe. Vindo de outra aba não há
    detalhe (o evento `storage` não carrega um), e é por isso que quem depende
    disso também precisa se reconciliar com o armazenamento. */
export function aoMudar(fn: (m?: Mudanca) => void): () => void {
  const local = (ev: Event) => fn((ev as CustomEvent<Mudanca | undefined>).detail ?? undefined);
  const outraAba = (ev: StorageEvent) => {
    if (ev.key === CHAVE) {
      cache = null; /* a outra aba gravou: o cache local está velho */
      fn();
    }
  };
  document.addEventListener(EVENTO, local);
  window.addEventListener("storage", outraAba);
  return () => {
    document.removeEventListener(EVENTO, local);
    window.removeEventListener("storage", outraAba);
  };
}

export function formatarTempo(seg: number): string {
  const s = Math.max(0, Math.floor(seg));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
