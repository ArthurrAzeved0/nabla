/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                             circuito.ts *
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
   circuito.ts — desenha esquemas de circuito em SVG, em tempo de build.

   É o equivalente do CircuiTikZ do LaTeX para este site, e existe pela mesma
   razão que ele: Circuitos Elétricos 1 tem ~120 figuras, e o circuito É o
   enunciado (o texto da prova traz 300 caracteres; os valores dos componentes
   vivem no desenho). Desenhar cada uma à mão em SVG seria inviável e sairia
   desigual.

   COMO O CIRCUITIKZ, e de propósito: coordenadas explícitas numa grade, e um
   elemento é sempre um trecho entre dois pontos —
       \draw (0,0) to[R=$R_1$] (2,0);
   vira
       { t: "R", de: [0, 0], para: [2, 0], rotulo: "R_1", valor: "4 Ω" }

   O que ele NÃO faz, de propósito: roteamento automático de fios e elemento
   na diagonal. Circuito de livro-texto é ortogonal, e deixar o autor mandar
   nas coordenadas é o que garante que a figura saia igual à da prova.

   Saída: SVG puro, sem JavaScript e sem dependência. As cores são tokens do
   tema, então a figura acompanha claro/escuro.
   ========================================================================== */

export type Ponto = readonly [number, number];

/** Elementos de dois terminais: percorrem o trecho `de` -> `para`. */
export type Bipolo =
  | "R" /* resistor            */
  | "C" /* capacitor           */
  | "L" /* indutor             */
  | "V" /* fonte de tensão     */
  | "I" /* fonte de corrente   */
  | "Vac" /* fonte alternada (círculo com senoide) */
  | "Vd" /* fonte de tensão CONTROLADA (losango)   */
  | "Id" /* fonte de corrente CONTROLADA (losango) */
  | "S"; /* chave */

export type Item =
  | { t: Bipolo; de: Ponto; para: Ponto; rotulo?: string; valor?: string; abaixo?: boolean; destaque?: boolean }
  | { t: "fio"; pts: readonly Ponto[] }
  | { t: "no"; em: Ponto }
  | { t: "terra"; em: Ponto }
  | { t: "texto"; em: Ponto; texto: string; ancora?: "start" | "middle" | "end"; destaque?: boolean }
  /** seta de corrente ao longo de um trecho */
  | { t: "corrente"; de: Ponto; para: Ponto; rotulo?: string; abaixo?: boolean }
  /** par +/- de tensão sobre um trecho */
  | { t: "tensao"; de: Ponto; para: Ponto; rotulo?: string; abaixo?: boolean };

export interface Opcoes {
  /** lado da grade em px (padrão 44) */
  grade?: number;
  /** margem em px ao redor do conteúdo (padrão 26) */
  margem?: number;
  /** descrição para leitor de tela — obrigatória */
  alt: string;
}

const COR_FIO = "var(--ink-2)";
const COR_CORPO = "var(--ink-2)";
const COR_ROT = "var(--ink-3)";
const COR_VAL = "var(--accent)";
const COR_DEST = "var(--accent)";
const COR_SINAL = "var(--warn)";

/* corpo do bipolo: quanto ele ocupa no meio do trecho */
const CORPO = 30;

const num = (n: number) => (Math.round(n * 100) / 100).toString();
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Símbolo desenhado ao longo de +x, centrado na origem, de -CORPO/2 a +CORPO/2. */
function simbolo(t: Bipolo, cor: string): string {
  const h = CORPO / 2;
  switch (t) {
    case "R": {
      /* zigue-zague ANSI, que é o que a apostila da cadeira usa */
      const n = 6;
      const passo = CORPO / n;
      let d = `M ${-h} 0`;
      for (let k = 0; k < n; k++) {
        d += ` L ${-h + passo * (k + 0.5)} ${k % 2 ? 7 : -7}`;
      }
      d += ` L ${h} 0`;
      return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="1.8" stroke-linejoin="round"/>`;
    }
    case "C":
      return (
        `<line x1="-3.5" y1="-11" x2="-3.5" y2="11" stroke="${cor}" stroke-width="2.2"/>` +
        `<line x1="3.5" y1="-11" x2="3.5" y2="11" stroke="${cor}" stroke-width="2.2"/>` +
        `<line x1="${-h}" y1="0" x2="-3.5" y2="0" stroke="${cor}" stroke-width="1.8"/>` +
        `<line x1="3.5" y1="0" x2="${h}" y2="0" stroke="${cor}" stroke-width="1.8"/>`
      );
    case "L": {
      /* quatro meias-voltas */
      const n = 4;
      const w = CORPO / n;
      let d = `M ${-h} 0`;
      for (let k = 0; k < n; k++) {
        const x0 = -h + k * w;
        d += ` A ${w / 2} ${w / 2} 0 0 1 ${x0 + w} 0`;
      }
      return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="1.8"/>`;
    }
    case "S":
      return (
        `<line x1="${-h}" y1="0" x2="-8" y2="0" stroke="${cor}" stroke-width="1.8"/>` +
        `<line x1="-8" y1="0" x2="7" y2="-9" stroke="${cor}" stroke-width="1.8" stroke-linecap="round"/>` +
        `<line x1="8" y1="0" x2="${h}" y2="0" stroke="${cor}" stroke-width="1.8"/>` +
        `<circle cx="-8" cy="0" r="2.2" fill="${cor}"/><circle cx="8" cy="0" r="2.2" fill="${cor}"/>`
      );
    case "Vac": {
      const r = 12;
      return (
        `<circle cx="0" cy="0" r="${r}" fill="none" stroke="${cor}" stroke-width="1.8"/>` +
        `<line x1="${-h}" y1="0" x2="${-r}" y2="0" stroke="${cor}" stroke-width="1.8"/>` +
        `<line x1="${r}" y1="0" x2="${h}" y2="0" stroke="${cor}" stroke-width="1.8"/>` +
        `<path d="M -7 0 q 3.5 -6 7 0 q 3.5 6 7 0" fill="none" stroke="${cor}" stroke-width="1.6"/>`
      );
    }
    case "V":
    case "I":
    case "Vd":
    case "Id": {
      const dep = t === "Vd" || t === "Id";
      const r = 12;
      const forma = dep
        ? `<polygon points="0,${-r} ${r},0 0,${r} ${-r},0" fill="none" stroke="${cor}" stroke-width="1.8"/>`
        : `<circle cx="0" cy="0" r="${r}" fill="none" stroke="${cor}" stroke-width="1.8"/>`;
      const pernas =
        `<line x1="${-h}" y1="0" x2="${-r}" y2="0" stroke="${cor}" stroke-width="1.8"/>` +
        `<line x1="${r}" y1="0" x2="${h}" y2="0" stroke="${cor}" stroke-width="1.8"/>`;
      /* fonte de tensão: + no lado `para` (o segundo ponto), que é a convenção
         adotada aqui e está dita na legenda de cada figura */
      const dentro =
        t === "V" || t === "Vd"
          ? `<text x="6" y="4.5" font-size="13" fill="${COR_SINAL}" text-anchor="middle">+</text>` +
            `<text x="-6" y="4.5" font-size="15" fill="${COR_SINAL}" text-anchor="middle">−</text>`
          : `<line x1="-7" y1="0" x2="5" y2="0" stroke="${cor}" stroke-width="1.6"/>` +
            `<polygon points="9,0 3,-3.4 3,3.4" fill="${cor}"/>`;
      return forma + pernas + dentro;
    }
  }
}

export function desenhar(itens: readonly Item[], op: Opcoes): string {
  const g = op.grade ?? 44;
  const m = op.margem ?? 12;
  const P = (p: Ponto): [number, number] => [p[0] * g, p[1] * g];

  /* ------------------------------------------------ caixa que contém tudo
     A caixa é acumulada a partir de TUDO que é emitido — rótulo, seta e terra
     inclusive —, não só dos pontos dos elementos. A primeira versão media só
     os pontos e cortava os rótulos na borda; é o mesmo defeito que já apareceu
     nas figuras escritas à mão, e aqui ele se resolve de uma vez, no gerador. */
  let bx0 = Infinity;
  let by0 = Infinity;
  let bx1 = -Infinity;
  let by1 = -Infinity;
  const caber = (x: number, y: number) => {
    if (x < bx0) bx0 = x;
    if (y < by0) by0 = y;
    if (x > bx1) bx1 = x;
    if (y > by1) by1 = y;
  };
  /* largura de texto: estimativa por caractere, generosa de propósito */
  const caberTexto = (x: number, y: number, txt: string, fs: number, anc: string) => {
    const larg = txt.length * fs * 0.62;
    const e = anc === "middle" ? larg / 2 : anc === "end" ? larg : 0;
    const d = anc === "middle" ? larg / 2 : anc === "end" ? 0 : larg;
    caber(x - e, y - fs);
    caber(x + d, y + fs * 0.3);
  };

  /* --------------------------------------------------------------- peças */
  const out: string[] = [];
  const T = (x: number, y: number, txt: string, fs: number, cor: string, anc = "middle") => {
    caberTexto(x, y, txt, fs, anc);
    out.push(
      `<text x="${num(x)}" y="${num(y)}" font-size="${fs}" fill="${cor}" text-anchor="${anc}">${esc(txt)}</text>`,
    );
  };
  for (const it of itens) {
    switch (it.t) {
      case "fio": {
        it.pts.forEach((p) => caber(...P(p)));
        const pts = it.pts.map((p) => P(p).map(num).join(",")).join(" ");
        out.push(`<polyline points="${pts}" fill="none" stroke="${COR_FIO}" stroke-width="1.8" stroke-linejoin="round"/>`);
        break;
      }
      case "no": {
        const [x, y] = P(it.em);
        caber(x - 4, y - 4);
        caber(x + 4, y + 4);
        out.push(`<circle cx="${num(x)}" cy="${num(y)}" r="3.4" fill="${COR_FIO}"/>`);
        break;
      }
      case "terra": {
        const [x, y] = P(it.em);
        caber(x - 12, y);
        caber(x + 12, y + 21);
        out.push(
          `<line x1="${num(x)}" y1="${num(y)}" x2="${num(x)}" y2="${num(y + 9)}" stroke="${COR_FIO}" stroke-width="1.8"/>` +
            `<line x1="${num(x - 11)}" y1="${num(y + 9)}" x2="${num(x + 11)}" y2="${num(y + 9)}" stroke="${COR_FIO}" stroke-width="2"/>` +
            `<line x1="${num(x - 7)}" y1="${num(y + 14)}" x2="${num(x + 7)}" y2="${num(y + 14)}" stroke="${COR_FIO}" stroke-width="2"/>` +
            `<line x1="${num(x - 3)}" y1="${num(y + 19)}" x2="${num(x + 3)}" y2="${num(y + 19)}" stroke="${COR_FIO}" stroke-width="2"/>`,
        );
        break;
      }
      case "texto": {
        const [x, y] = P(it.em);
        T(x, y, it.texto, 12, it.destaque ? COR_DEST : COR_ROT, it.ancora ?? "middle");
        break;
      }
      case "corrente":
      case "tensao": {
        const [ax, ay] = P(it.de);
        const [bx, by] = P(it.para);
        const horiz = ay === by;
        /* Nasce do lado OPOSTO ao do rótulo do elemento, que por padrão fica
           "acima". Sem isso a seta de corrente cai em cima do valor do
           resistor toda vez — foi o que aconteceu no primeiro desenho. */
        const s = it.abaixo === false ? -1 : 1;
        const off = horiz ? 15 * s : 0;
        const offx = horiz ? 0 : 15 * s;
        if (it.t === "corrente") {
          const mx = (ax + bx) / 2 + offx;
          const my = (ay + by) / 2 + off;
          const dx = horiz ? Math.sign(bx - ax) : 0;
          const dy = horiz ? 0 : Math.sign(by - ay);
          const p1 = `${num(mx - dx * 12)},${num(my - dy * 12)}`;
          const p2 = `${num(mx + dx * 12)},${num(my + dy * 12)}`;
          out.push(`<line x1="${p1.split(",")[0]}" y1="${p1.split(",")[1]}" x2="${p2.split(",")[0]}" y2="${p2.split(",")[1]}" stroke="${COR_VAL}" stroke-width="1.5"/>`);
          const pa = horiz
            ? `${num(mx + dx * 12)},${num(my)} ${num(mx + dx * 6)},${num(my - 3.6)} ${num(mx + dx * 6)},${num(my + 3.6)}`
            : `${num(mx)},${num(my + dy * 12)} ${num(mx - 3.6)},${num(my + dy * 6)} ${num(mx + 3.6)},${num(my + dy * 6)}`;
          out.push(`<polygon points="${pa}" fill="${COR_VAL}"/>`);
          if (it.rotulo) {
            T(mx + (horiz ? 0 : 13 * s), my + (horiz ? (s < 0 ? -7 : 15) : -6), it.rotulo, 12, COR_VAL);
          }
        } else {
          const mx = (ax + bx) / 2 + offx;
          const my = (ay + by) / 2 + off;
          const d1 = horiz ? [-16, 0] : [0, -16];
          const d2 = horiz ? [16, 0] : [0, 16];
          T(mx + d1[0], my + d1[1] + 4, "−", 14, COR_SINAL);
          T(mx + d2[0], my + d2[1] + 4, "+", 12, COR_SINAL);
          if (it.rotulo) T(mx, my + 4, it.rotulo, 12, COR_VAL);
        }
        break;
      }
      default: {
        const [ax, ay] = P(it.de);
        const [bx, by] = P(it.para);
        if (ax !== bx && ay !== by) throw new Error(`elemento na diagonal não é suportado: ${it.t}`);
        const ang = ax === bx ? (by > ay ? 90 : -90) : bx > ax ? 0 : 180;
        const cx = (ax + bx) / 2;
        const cy = (ay + by) / 2;
        const cor = it.destaque ? COR_DEST : COR_CORPO;
        caber(Math.min(ax, bx) - 14, Math.min(ay, by) - 14);
        caber(Math.max(ax, bx) + 14, Math.max(ay, by) + 14);
        /* pernas até o corpo */
        const comp = Math.hypot(bx - ax, by - ay);
        if (comp < CORPO + 8) throw new Error(`trecho curto demais para ${it.t}: use pelo menos 1 unidade de grade`);
        out.push(
          `<line x1="${num(ax)}" y1="${num(ay)}" x2="${num(bx)}" y2="${num(by)}" stroke="${COR_FIO}" stroke-width="1.8"/>`,
        );
        /* apaga o fio sob o corpo, para o símbolo não ficar riscado */
        out.push(
          `<g transform="translate(${num(cx)} ${num(cy)}) rotate(${ang})">` +
            `<rect x="${-CORPO / 2}" y="-13" width="${CORPO}" height="26" fill="var(--card-2)"/>` +
            simbolo(it.t, cor) +
            `</g>`,
        );
        /* rótulo e valor, perpendiculares ao elemento */
        const s = it.abaixo ? 1 : -1;
        const linhas = [it.rotulo, it.valor].filter(Boolean) as string[];
        const horiz = ay === by;
        linhas.forEach((txt, k) => {
          const cor2 = k === 0 && linhas.length > 1 ? COR_ROT : COR_VAL;
          const tx = horiz ? cx : cx + s * 24;
          const ty = horiz ? cy + s * 22 + k * 14 + (s < 0 ? 0 : 6) : cy + 4 + (k - (linhas.length - 1) / 2) * 14;
          T(tx, ty, txt, 12, cor2, horiz ? "middle" : s < 0 ? "end" : "start");
        });
      }
    }
  }

  if (!Number.isFinite(bx0)) throw new Error("circuito vazio");
  const x0 = bx0 - m;
  const y0 = by0 - m;
  const w = bx1 - bx0 + 2 * m;
  const h = by1 - by0 + 2 * m;
  return (
    `<svg viewBox="${num(x0)} ${num(y0)} ${num(w)} ${num(h)}" role="img" aria-label="${esc(op.alt)}">` +
    out.join("") +
    `</svg>`
  );
}
