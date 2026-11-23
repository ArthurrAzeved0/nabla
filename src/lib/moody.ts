/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                                moody.ts *
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
/* Diagrama de Moody-Rouse gerado em tempo de build.

   As curvas não são desenhadas à mão: cada uma é a equação de
   Colebrook-White resolvida ponto a ponto, então o f que a figura mostra é
   o mesmo que a conta dá. A leitura da questão (Re, D_H/k e o f lido) vai
   por cima, em destaque, para o aluno ver de onde o número saiu.

   Convenções do professor: laminar até Re = 2000 (f = 64/Re), transição de
   2000 a 2400, turbulento a partir de 2400. */

export interface Leitura {
  /** número de Reynolds da questão */
  re: number;
  /** rugosidade relativa D_H/k da questão */
  dk: number;
  /** f lido; se omitido, sai de Colebrook */
  f?: number;
}

export interface OpcoesMoody {
  alt: string;
  leitura?: Leitura;
}

/* as curvas de D_H/k desenhadas (a da leitura entra se não estiver aqui) */
const CURVAS = [20, 40, 100, 200, 500, 1000, 2000, 5000, 10000, 50000];

const RE_MIN = 600;
const RE_MAX = 1e8;
const F_MIN = 0.008;
const F_MAX = 0.1;

const W = 600;
const H = 380;
const M = { esq: 56, dir: 64, cima: 18, baixo: 46 };
const LX = W - M.esq - M.dir;
const LY = H - M.cima - M.baixo;

const x = (re: number) => M.esq + ((Math.log10(re) - Math.log10(RE_MIN)) / (Math.log10(RE_MAX) - Math.log10(RE_MIN))) * LX;
const y = (f: number) => M.cima + (1 - (Math.log10(f) - Math.log10(F_MIN)) / (Math.log10(F_MAX) - Math.log10(F_MIN))) * LY;
const n = (v: number) => v.toFixed(1);

/** Colebrook-White: 1/√f = −2 log(1/(3,7·D/k) + 2,51/(Re·√f)); dk = Infinity é o tubo liso */
export function colebrook(re: number, dk: number): number {
  let s = 8; // 1/√f
  for (let i = 0; i < 60; i++) s = -2 * Math.log10((Number.isFinite(dk) ? 1 / (3.7 * dk) : 0) + (2.51 * s) / re);
  return 1 / (s * s);
}

/** f da turbulência plena (a parte horizontal da curva) */
export function fRugoso(dk: number): number {
  const s = 2 * Math.log10(3.7 * dk);
  return 1 / (s * s);
}

const virgula = (v: number, casas: number) => v.toFixed(casas).replace(".", ",");

function potencia(re: number): string {
  const e = Math.floor(Math.log10(re));
  const m = re / 10 ** e;
  const sup = String(e).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]);
  return `${virgula(m, 1)}·10${sup}`;
}

function rotuloDk(dk: number): string {
  return dk >= 1000 ? `${dk / 1000}·10³` : String(dk);
}

export function desenharMoody({ alt, leitura }: OpcoesMoody): string {
  const p: string[] = [];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  // grade: décadas de Re e valores usuais de f
  for (let e = 3; e <= 8; e++) {
    for (let k = 1; k <= 9; k++) {
      const re = k * 10 ** e;
      if (re < RE_MIN || re > RE_MAX) continue;
      p.push(`<line x1="${n(x(re))}" y1="${M.cima}" x2="${n(x(re))}" y2="${M.cima + LY}" stroke="var(--line)" stroke-width="${k === 1 ? 0.9 : 0.4}"/>`);
    }
  }
  const fs = [0.008, 0.009, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1];
  for (const f of fs) p.push(`<line x1="${M.esq}" y1="${n(y(f))}" x2="${M.esq + LX}" y2="${n(y(f))}" stroke="var(--line)" stroke-width="0.5"/>`);

  // faixa de transição (2000–2400)
  p.push(`<rect x="${n(x(2000))}" y="${M.cima}" width="${n(x(2400) - x(2000))}" height="${LY}" fill="var(--warn)" opacity="0.14"/>`);

  // laminar: f = 64/Re até 2000
  p.push(`<line x1="${n(x(RE_MIN))}" y1="${n(y(64 / RE_MIN))}" x2="${n(x(2000))}" y2="${n(y(64 / 2000))}" stroke="var(--ink-2)" stroke-width="1.6"/>`);

  // turbulento: Colebrook, uma curva por D_H/k, e o tubo liso
  const curvas = [...CURVAS];
  if (leitura && !curvas.includes(leitura.dk)) curvas.push(leitura.dk);
  curvas.sort((a, b) => a - b);
  const caminho = (dk: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
      const re = 2400 * (RE_MAX / 2400) ** (i / 160);
      const f = colebrook(re, dk);
      if (f < F_MIN || f > F_MAX) continue;
      pts.push(`${n(x(re))},${n(y(f))}`);
    }
    return pts.join(" ");
  };
  for (const dk of [...curvas, Infinity]) {
    const destaque = leitura && dk === leitura.dk;
    p.push(
      `<polyline points="${caminho(dk)}" fill="none" stroke="${destaque ? "var(--accent)" : "var(--ink-2)"}" stroke-width="${destaque ? 2.2 : 1}"${Number.isFinite(dk) ? "" : ' stroke-dasharray="6 3"'}/>`,
    );
    if (Number.isFinite(dk)) {
      const fy = colebrook(RE_MAX, dk);
      p.push(`<text x="${M.esq + LX + 5}" y="${n(y(fy) + 3.5)}" font-size="${destaque ? 10.5 : 9.5}" fill="${destaque ? "var(--accent)" : "var(--ink-3)"}"${destaque ? ' font-weight="600"' : ""}>${rotuloDk(dk)}</text>`);
    }
  }
  p.push(`<text x="${n(x(1.2e6))}" y="${n(y(colebrook(1.2e6, Infinity)) + 22)}" font-size="9.5" fill="var(--ink-3)">tubo liso</text>`);

  // fronteira da turbulência plena (Moody): Re = 200·(D/k)/√f
  const fronteira = curvas
    .map((dk) => {
      const f = fRugoso(dk);
      return { re: (200 * dk) / Math.sqrt(f), f };
    })
    .filter(({ re, f }) => re <= RE_MAX && f >= F_MIN)
    .map(({ re, f }) => `${n(x(re))},${n(y(f))}`)
    .join(" ");
  p.push(`<polyline points="${fronteira}" fill="none" stroke="var(--ink-3)" stroke-width="0.9" stroke-dasharray="2 3"/>`);
  p.push(`<text x="${n(x(3.2e5))}" y="${n(y(0.088))}" font-size="9.5" fill="var(--ink-3)">turbulência plena: f só depende de D<tspan font-size="7" dy="2">H</tspan><tspan dy="-2">/k</tspan></text>`);

  // rótulos das regiões
  p.push(`<text x="${n(x(640))}" y="${n(y(0.02))}" font-size="9.5" fill="var(--ink-3)">laminar</text>`);
  p.push(`<text x="${n(x(640))}" y="${n(y(0.02) + 13)}" font-size="9.5" fill="var(--ink-3)">f = 64/Re</text>`);
  p.push(`<text x="${n((x(2000) + x(2400)) / 2)}" y="${M.cima + LY - 6}" font-size="8.5" fill="var(--warn)" text-anchor="middle" transform="rotate(-90 ${n((x(2000) + x(2400)) / 2)} ${M.cima + LY - 6})">transição</text>`);

  // moldura e eixos
  p.push(`<rect x="${M.esq}" y="${M.cima}" width="${LX}" height="${LY}" fill="none" stroke="var(--ink-3)" stroke-width="1"/>`);
  for (let e = 3; e <= 8; e++) p.push(`<text x="${n(x(10 ** e))}" y="${M.cima + LY + 14}" font-size="10" fill="var(--ink-3)" text-anchor="middle">10${"⁰¹²³⁴⁵⁶⁷⁸⁹"[e]}</text>`);
  const rotulosF: [number, string][] = [
    [0.008, "0,008"], [0.01, "0,01"], [0.015, "0,015"], [0.02, "0,02"], [0.025, "0,025"],
    [0.03, "0,03"], [0.04, "0,04"], [0.05, "0,05"], [0.06, "0,06"], [0.08, "0,08"], [0.1, "0,1"],
  ];
  for (const [f, r] of rotulosF) p.push(`<text x="${M.esq - 5}" y="${n(y(f) + 3.5)}" font-size="9.5" fill="var(--ink-3)" text-anchor="end">${r}</text>`);
  p.push(`<text x="${M.esq + LX / 2}" y="${H - 8}" font-size="11" fill="var(--ink-2)" text-anchor="middle">número de Reynolds, Re = v·D<tspan font-size="8" dy="2">H</tspan><tspan dy="-2">/ν</tspan></text>`);
  p.push(`<text x="14" y="${M.cima + LY / 2}" font-size="11" fill="var(--ink-2)" text-anchor="middle" transform="rotate(-90 14 ${M.cima + LY / 2})">fator de atrito, f</text>`);
  p.push(`<text x="${M.esq + LX + 5}" y="${M.cima - 5}" font-size="10" fill="var(--ink-2)">D<tspan font-size="7" dy="2">H</tspan><tspan dy="-2">/k</tspan></text>`);

  // a leitura da questão
  if (leitura) {
    const f = leitura.f ?? colebrook(leitura.re, leitura.dk);
    const px = x(leitura.re);
    const py = y(f);
    p.push(`<line x1="${n(px)}" y1="${M.cima + LY}" x2="${n(px)}" y2="${n(py)}" stroke="var(--accent)" stroke-width="1.3" stroke-dasharray="5 3"/>`);
    p.push(`<line x1="${n(px)}" y1="${n(py)}" x2="${M.esq}" y2="${n(py)}" stroke="var(--accent)" stroke-width="1.3" stroke-dasharray="5 3"/>`);
    p.push(`<circle cx="${n(px)}" cy="${n(py)}" r="4" fill="var(--accent)"/>`);
    p.push(`<text x="${n(px + 5)}" y="${M.cima + LY - 6}" font-size="10.5" fill="var(--accent)" font-weight="600">Re = ${potencia(leitura.re)}</text>`);
    p.push(`<text x="${n(px - 8)}" y="${n(py - 7)}" font-size="10.5" fill="var(--accent)" font-weight="600" text-anchor="end">f ≈ ${virgula(f, 3)}</text>`);
  }

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(alt)}" xmlns="http://www.w3.org/2000/svg">${p.join("")}</svg>`;
}
