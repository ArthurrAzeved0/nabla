/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                           fluxograma.ts *
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
   fluxograma.ts — o mapa da grade: estado, roteamento das setas, cadeia.

   Portado do fluxograma solto (416 KB num HTML só). O que mudou:

   - a grade virou DADO validado no build, não um array cravado no HTML
   - as libs de PDF saíram de "coladas no arquivo" para import dinâmico:
     quem só olha o mapa não baixa o gerador de PDF
   - `style.zoom` (suporte recente no Firefox) virou transform: scale()
   - a marcação de concluída usa a MESMA chave do progresso de questões,
     num namespace próprio, então tudo vive num só lugar

   As setas são roteadas em ângulo reto, cada uma na sua "pista", como no
   mapa do PPC. Isso depende de medir o layout DEPOIS da renderização, por
   isso o desenho roda em requestAnimationFrame e a cada resize.
   ========================================================================== */

export interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  periodo: number;
  teorica: number;
  pratica: number;
  categoria: string;
  pre: string[];
  co: string[];
  dcext: boolean;
  estagio: boolean;
  nota?: string;
  cadeira?: string;
}

export interface Grade {
  curso: string;
  sigla: string;
  /** Ano.semestre da matriz curricular, como "2021.1". */
  matriz: string;
  chTotalCurso: number;
  estagioFracao?: number;
  disciplinas: Disciplina[];
}

const CHAVE = "nabla-grade";

/* ------------------------------------------------------------------ estado */
function lerConcluidas(sigla: string): Set<string> {
  try {
    const cru = localStorage.getItem(CHAVE);
    const tudo = cru ? (JSON.parse(cru) as Record<string, string[]>) : {};
    return new Set(tudo[sigla] ?? []);
  } catch {
    return new Set();
  }
}

function gravarConcluidas(sigla: string, feitas: Set<string>) {
  try {
    const cru = localStorage.getItem(CHAVE);
    const tudo = cru ? (JSON.parse(cru) as Record<string, string[]>) : {};
    tudo[sigla] = [...feitas];
    localStorage.setItem(CHAVE, JSON.stringify(tudo));
  } catch {
    /* sem persistência: a sessão continua funcionando */
  }
}

/* ------------------------------------------------------ regras da matriz */
export function criarMapa(g: Grade) {
  const por = new Map(g.disciplinas.map((d) => [d.id, d]));
  const ch = (d: Disciplina) => d.teorica + d.pratica;
  const chMatriz = g.disciplinas.reduce((s, d) => s + ch(d), 0);
  /* undefined quando o PPC não publica a regra: aí o estágio depende só dos
     pré-requisitos, como qualquer outra disciplina. */
  const chEstagio =
    g.estagioFracao === undefined ? undefined : Math.round(g.chTotalCurso * g.estagioFracao);

  let feitas = lerConcluidas(g.sigla);

  const chFeita = () => [...feitas].reduce((s, id) => s + (por.has(id) ? ch(por.get(id)!) : 0), 0);

  /* co-requisito: basta estar sendo cursada junto, ou seja, os PRÉ dela
     já cumpridos — não a própria disciplina concluída. */
  const coOk = (id: string) => {
    const d = por.get(id);
    if (!d) return true;
    return feitas.has(id) || d.pre.every((p) => feitas.has(p));
  };

  const liberada = (d: Disciplina) => {
    if (feitas.has(d.id)) return false;
    if (!d.pre.every((p) => feitas.has(p))) return false;
    if (!d.co.every(coOk)) return false;
    if (d.estagio && chEstagio !== undefined && chFeita() < chEstagio) return false;
    return true;
  };

  /* cadeia completa: tudo que leva até a disciplina e tudo que ela destrava */
  const cadeia = (id: string) => {
    const set = new Set([id]);
    const acima = (x: string) => {
      const d = por.get(x);
      if (!d) return;
      for (const p of [...d.pre, ...d.co]) if (por.has(p) && !set.has(p)) (set.add(p), acima(p));
    };
    const abaixo = (x: string) => {
      for (const d of g.disciplinas) {
        if ((d.pre.includes(x) || d.co.includes(x)) && !set.has(d.id)) (set.add(d.id), abaixo(d.id));
      }
    };
    acima(id);
    abaixo(id);
    return set;
  };

  return {
    por,
    ch,
    chMatriz,
    chEstagio,
    /* Nome da disciplina que carrega a regra de CH, para o rótulo não dizer
       "Estágio" onde a regra é de outra coisa: em Engenharia Mecânica quem
       exige 80% do curso integralizado é o Projeto Final. */
    nomeRegraCh: g.disciplinas.find((d) => d.estagio)?.nome,
    chFeita,
    liberada,
    cadeia,
    concluida: (id: string) => feitas.has(id),
    alternar(id: string) {
      if (feitas.has(id)) feitas.delete(id);
      else feitas.add(id);
      gravarConcluidas(g.sigla, feitas);
    },
    limpar() {
      feitas = new Set();
      gravarConcluidas(g.sigla, feitas);
    },
    get total() {
      return g.disciplinas.length;
    },
    get feitas() {
      return feitas.size;
    },
  };
}

/* ------------------------------------------------- roteamento das setas ---
   Sai pela borda direita da origem, percorre o corredor vertical logo antes
   da coluna de destino (cada seta numa pista própria) e entra pela esquerda.
   Mesma lógica do mapa do PPC. */
interface Caixa {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Aresta {
  de: string;
  para: string;
  tipo: "pre" | "co";
  pista: number;
  pistas: number;
  mesmaColuna: boolean;
}

function caminhoArredondado(pts: { x: number; y: number }[], r = 7): string {
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: Math.sign(b.x - a.x),
    y: Math.sign(b.y - a.y),
    len: Math.abs(b.x - a.x) + Math.abs(b.y - a.y),
  });
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const s1 = seg(pts[i - 1]!, p);
    const s2 = seg(p, pts[i + 1]!);
    const r1 = Math.min(r, s1.len / 2);
    const r2 = Math.min(r, s2.len / 2);
    d += ` L ${p.x - s1.x * r1} ${p.y - s1.y * r1} Q ${p.x} ${p.y} ${p.x + s2.x * r2} ${p.y + s2.y * r2}`;
  }
  const L = pts[pts.length - 1]!;
  return `${d} L ${L.x} ${L.y}`;
}

/* Quantos tons a paleta tem (--fio-1 .. --fio-N em tokens.css). */
const TONS = 12;

/* Uma cor por disciplina de ORIGEM, como no fluxograma original: é o que
   permite seguir uma linha específica no meio de dezenas. Duas origens
   distantes podem repetir o tom, mas vizinhas na leitura não. */
function tomPorOrigem(g: Grade): Map<string, number> {
  const tom = new Map<string, number>();
  let i = 0;
  for (const d of g.disciplinas) {
    for (const alvo of [...d.pre, ...d.co]) {
      if (!tom.has(alvo)) tom.set(alvo, (i++ % TONS) + 1);
    }
  }
  return tom;
}

export function desenharSetas(
  g: Grade,
  svg: SVGSVGElement,
  cartao: (id: string) => HTMLElement | undefined,
  corredor: number,
) {
  const tom = tomPorOrigem(g);
  const geo = (id: string): Caixa | null => {
    const el = cartao(id);
    if (!el) return null;
    /* offset* em vez de getBoundingClientRect: são coordenadas de LAYOUT,
       imunes ao transform de zoom aplicado no contêiner */
    return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  };

  const arestas: Aresta[] = [];
  for (const d of g.disciplinas) {
    for (const p of d.pre) if (cartao(p)) arestas.push(criar(p, d.id, "pre"));
    for (const p of d.co) if (cartao(p)) arestas.push(criar(p, d.id, "co"));
  }
  function criar(de: string, para: string, tipo: "pre" | "co"): Aresta {
    const mesma = g.disciplinas.find((x) => x.id === de)!.periodo ===
      g.disciplinas.find((x) => x.id === para)!.periodo;
    return { de, para, tipo, pista: 0, pistas: 1, mesmaColuna: mesma };
  }

  /* agrupa por corredor e ordena por altura da origem: pistas não cruzam */
  const grupos = new Map<string, Aresta[]>();
  for (const a of arestas) {
    const perDestino = g.disciplinas.find((x) => x.id === a.para)!.periodo;
    const chave = (a.mesmaColuna ? "R" : "L") + perDestino;
    const lista = grupos.get(chave) ?? [];
    lista.push(a);
    grupos.set(chave, lista);
  }
  for (const lista of grupos.values()) {
    lista.sort((a, b) => (geo(a.de)?.y ?? 0) - (geo(b.de)?.y ?? 0));
    lista.forEach((a, i) => {
      a.pista = i;
      a.pistas = lista.length;
    });
  }

  /* deslocamento de saída/entrada para várias setas não se sobreporem no
     mesmo cartão */
  const saidas = new Map<string, number>();
  const entradas = new Map<string, number>();
  for (const a of arestas) {
    saidas.set(a.de, (saidas.get(a.de) ?? 0) + 1);
    entradas.set(a.para, (entradas.get(a.para) ?? 0) + 1);
  }
  const iSaida = new Map<string, number>();
  const iEntrada = new Map<string, number>();

  const partes: string[] = [];
  const tonsUsados = new Set<number>();

  for (const a of arestas) {
    const A = geo(a.de);
    const B = geo(a.para);
    if (!A || !B) continue;

    const nS = saidas.get(a.de) ?? 1;
    const iS = iSaida.get(a.de) ?? 0;
    iSaida.set(a.de, iS + 1);
    const oy = A.y + A.h / 2 + (iS - (nS - 1) / 2) * Math.min(9, (A.h - 14) / Math.max(1, nS));

    const nE = entradas.get(a.para) ?? 1;
    const iE = iEntrada.get(a.para) ?? 0;
    iEntrada.set(a.para, iE + 1);
    const ey = B.y + B.h / 2 + (iE - (nE - 1) / 2) * Math.min(9, (B.h - 14) / Math.max(1, nE));

    let pts: { x: number; y: number }[];
    if (a.mesmaColuna) {
      const pad = 7;
      const pistaX = A.x + A.w + pad + (a.pista % 4) * ((corredor - 2 * pad) / 4);
      pts = [
        { x: A.x + A.w, y: oy },
        { x: pistaX, y: oy },
        { x: pistaX, y: ey },
        { x: B.x + B.w + 2, y: ey },
      ];
    } else {
      const pad = 6;
      const inicio = B.x - corredor;
      const passo = a.pistas > 1 ? (corredor - 2 * pad) / (a.pistas - 1) : 0;
      const pistaX = a.pistas > 1 ? inicio + pad + a.pista * passo : inicio + corredor / 2;
      pts = [
        { x: A.x + A.w, y: oy },
        { x: pistaX, y: oy },
        { x: pistaX, y: ey },
        { x: B.x - 2, y: ey },
      ];
    }
    if (Math.abs(pts[1]!.y - pts[2]!.y) < 1) pts = [pts[0]!, pts[3]!];

    const t = tom.get(a.de) ?? 1;
    tonsUsados.add(t);
    /* a cor vai no atributo `style`: presentation attribute não aceita var()
       de forma confiável em todos os navegadores, style aceita */
    partes.push(
      `<path d="${caminhoArredondado(pts)}" class="fio${a.tipo === "co" ? " fio-co" : ""}" ` +
        `data-de="${a.de}" data-para="${a.para}" fill="none" ` +
        `style="stroke:var(--fio-${t})" stroke-width="1.5"` +
        `${a.tipo === "co" ? ' stroke-dasharray="5 4"' : ""} ` +
        `marker-end="url(#ponta-${t})" />`,
    );
  }

  /* Um marcador por tom usado: a ponta da seta tem de ter a cor da linha, e
     marcador não herda o stroke de quem o referencia. */
  const defs = [...tonsUsados]
    .map(
      (t) =>
        `<marker id="ponta-${t}" markerWidth="6.5" markerHeight="6.5" refX="5.8" refY="3.25" ` +
        `orient="auto"><path d="M0,0 L6.5,3.25 L0,6.5 Z" style="fill:var(--fio-${t})"/></marker>`,
    )
    .join("");
  svg.innerHTML = `<defs>${defs}</defs>${partes.join("")}`;
}
