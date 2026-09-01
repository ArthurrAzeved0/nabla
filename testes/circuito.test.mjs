/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                       circuito.test.mjs *
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
/* Testa o gerador de circuitos (src/lib/circuito.ts).

   É função pura: entra uma lista de elementos, sai uma string SVG. Dá para
   testar sem navegador, e o que mais interessa proteger é o ENQUADRAMENTO —
   a primeira versão media a caixa só pelos pontos dos elementos e cortava os
   rótulos na borda, que é o mesmo defeito que já tinha aparecido nas figuras
   escritas à mão.

   Rodar: npm test */
const { desenhar } = await import("../.tmp-teste/circuito.mjs");

let falhas = 0;
const teste = (nome, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}`);
  if (!ok) { console.log(`        esperado ${JSON.stringify(esperado)}, veio ${JSON.stringify(real)}`); falhas++; }
};
const caixa = (svg) => /viewBox="(\S+) (\S+) (\S+) (\S+)"/.exec(svg).slice(1).map(Number);

/* --------------------------------------------------------- enquadramento */
const semRotulo = desenhar([{ t: "R", de: [0, 0], para: [2, 0] }], { alt: "x" });
const comRotulo = desenhar([{ t: "R", de: [0, 0], para: [2, 0], rotulo: "R₁", valor: "470 kΩ" }], { alt: "x" });
const [, ySem, , hSem] = caixa(semRotulo);
const [, yCom, , hCom] = caixa(comRotulo);
teste("rótulo faz a caixa crescer para cima", yCom < ySem, true);
teste("rótulo faz a caixa ficar mais alta", hCom > hSem, true);

const largo = desenhar([{ t: "R", de: [0, 0], para: [0, 2], rotulo: "um rótulo bem comprido" }], { alt: "x" });
const [xL, , wL] = caixa(largo);
teste("rótulo lateral longo cabe na largura", wL > 200 && xL < -100, true);

/* todo <text> tem de estar DENTRO do viewBox */
function textosDentro(svg) {
  const [x0, y0, w, h] = caixa(svg);
  for (const m of svg.matchAll(/<text x="(\S+?)" y="(\S+?)" font-size="(\S+?)"[^>]*text-anchor="(\w+)"[^>]*>([^<]*)</g)) {
    const [x, y, fs] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const larg = m[5].length * fs * 0.62;
    const e = m[4] === "middle" ? larg / 2 : m[4] === "end" ? larg : 0;
    const d = m[4] === "middle" ? larg / 2 : m[4] === "end" ? 0 : larg;
    if (x - e < x0 || x + d > x0 + w || y - fs < y0 || y + fs * 0.3 > y0 + h) return false;
  }
  return true;
}
const completo = desenhar([
  { t: "V", de: [0, 2], para: [0, 0], rotulo: "24 V" },
  { t: "R", de: [0, 0], para: [2, 0], rotulo: "R₁", valor: "4 Ω" },
  { t: "C", de: [2, 0], para: [2, 2], rotulo: "C", valor: "100 µF", abaixo: true },
  { t: "fio", pts: [[0, 2], [2, 2]] },
  { t: "no", em: [2, 0] },
  { t: "terra", em: [1, 2] },
  { t: "corrente", de: [0, 0], para: [2, 0], rotulo: "i(t)" },
  { t: "tensao", de: [2, 0], para: [2, 2], rotulo: "v" },
  { t: "texto", em: [1, 0], texto: "nó A" },
], { alt: "completo" });
teste("nenhum texto sai do viewBox", textosDentro(completo), true);
teste("nenhum texto sai, no caso do rótulo longo", textosDentro(largo), true);

/* ------------------------------------------------------------- símbolos */
teste("resistor vira um path em zigue-zague", /<path d="M -15 0 L/.test(desenhar([{ t: "R", de: [0, 0], para: [2, 0] }], { alt: "x" })), true);
teste("capacitor tem as duas placas", (desenhar([{ t: "C", de: [0, 0], para: [2, 0] }], { alt: "x" }).match(/stroke-width="2.2"/g) || []).length, 2);
teste("fonte independente é círculo", /<circle cx="0" cy="0" r="12"/.test(desenhar([{ t: "V", de: [0, 0], para: [2, 0] }], { alt: "x" })), true);
teste("fonte alternada tem a senoide", /<path d="M -7 0 q 3.5 -6 7 0/.test(desenhar([{ t: "Vac", de: [0, 0], para: [2, 0] }], { alt: "x" })), true);
teste("fonte controlada é losango", /<polygon points="0,-12 12,0 0,12 -12,0"/.test(desenhar([{ t: "Vd", de: [0, 0], para: [2, 0] }], { alt: "x" })), true);
teste("terra desenha as três barras", (desenhar([{ t: "terra", em: [0, 0] }, { t: "fio", pts: [[0, 0], [1, 0]] }], { alt: "x" }).match(/stroke-width="2"/g) || []).length, 3);

/* subscrito ao estilo LaTeX nos rótulos */
const sub1 = desenhar([{ t: "R", de: [0, 0], para: [2, 0], rotulo: "v_C" }], { alt: "x" });
teste("_C vira tspan", /<text[^>]*>v<tspan font-size="0.72em"[^>]*>C<\/tspan>/.test(sub1), true);
const sub2 = desenhar([{ t: "R", de: [0, 0], para: [2, 0], rotulo: "V_{Th}" }], { alt: "x" });
teste("_{Th} vira um tspan só", /<tspan font-size="0.72em"[^>]*>Th<\/tspan>/.test(sub2), true);
teste("rótulo com subscrito não sai do viewBox", textosDentro(sub2), true);

/* amp. op.: triângulo, os dois sinais, e os terminais na grade inteira */
const amp = desenhar([{ t: "ampop", em: [2, 2] }, { t: "fio", pts: [[1, 1], [1, 1]] }], { alt: "x" });
teste("amp. op. é um triângulo", /<polygon points="[^"]+" fill="var\(--surface-2\)"/.test(amp), true);
teste("amp. op. traz os dois sinais", /−/.test(amp) && /\+/.test(amp), true);
const ampT = desenhar([{ t: "ampop", em: [2, 2], maisEmCima: true }], { alt: "x" });
const sinalDeCima = (svg) => [...svg.matchAll(/<text[^>]*y="(\S+?)"[^>]*>(.)</g)]
  .filter((m) => m[2] === "+" || m[2] === "−").sort((a, b) => Number(a[1]) - Number(b[1]))[0][2];
teste("por padrão a inversora fica em cima", sinalDeCima(amp), "−");
teste("maisEmCima troca as entradas", sinalDeCima(ampT), "+");

/* a polaridade do marcador de tensão segue `de` -> `para`, como nas fontes */
const polUm = desenhar([{ t: "fio", pts: [[0, 0], [0, 2]] }, { t: "tensao", de: [0, 0], para: [0, 2], rotulo: "v" }], { alt: "x" });
const polOutro = desenhar([{ t: "fio", pts: [[0, 0], [0, 2]] }, { t: "tensao", de: [0, 2], para: [0, 0], rotulo: "v" }], { alt: "x" });
const yDe = (svg, sinal) => Number([...svg.matchAll(/<text[^>]*y="(\S+?)"[^>]*>(.)</g)].find((m) => m[2] === sinal)[1]);
teste("tensão de cima para baixo: − em cima, + embaixo", yDe(polUm, "−") < yDe(polUm, "+"), true);
teste("tensão de baixo para cima: + em cima, − embaixo", yDe(polOutro, "+") < yDe(polOutro, "−"), true);

/* seta de corrente nasce do lado oposto ao rótulo, para não colidir */
const colisao = desenhar([{ t: "R", de: [0, 0], para: [2, 0], rotulo: "4 Ω" }, { t: "corrente", de: [0, 0], para: [2, 0], rotulo: "i" }], { alt: "x" });
const ys = [...colisao.matchAll(/<text[^>]*y="(\S+?)"[^>]*>(?:4 Ω|i)</g)].map((m) => Number(m[1]));
teste("rótulo e seta ficam em lados opostos", ys.length === 2 && ys[0] * ys[1] < 0, true);

/* moldura tracejada e elemento variável */
const cx1 = desenhar([{ t: "R", de: [0, 0], para: [2, 0] }, { t: "caixa", de: [-0.4, -0.6], para: [2.4, 0.6], rotulo: "fonte real" }], { alt: "x" });
teste("caixa é tracejada", /stroke-dasharray="5 4"/.test(cx1), true);
teste("rótulo da caixa cabe no viewBox", textosDentro(cx1), true);
teste("elemento variável ganha a seta", /<polygon points="19,-14 9,-12 14,-5"/.test(desenhar([{ t: "R", de: [0, 0], para: [2, 0], variavel: true }], { alt: "x" })), true);

/* ---------------------------------------------------------------- erros */
const recusa = (fn, inicio) => {
  try { fn(); return "não recusou"; } catch (e) { return e.message.startsWith(inicio) ? inicio : e.message; }
};
teste("elemento na diagonal é recusado", recusa(() => desenhar([{ t: "R", de: [0, 0], para: [2, 2] }], { alt: "x" }), "elemento na diagonal"), "elemento na diagonal");
teste("trecho curto demais é recusado", recusa(() => desenhar([{ t: "R", de: [0, 0], para: [0.5, 0] }], { alt: "x" }), "trecho curto demais"), "trecho curto demais");
teste("circuito vazio é recusado", recusa(() => desenhar([], { alt: "x" }), "circuito vazio"), "circuito vazio");

/* --------------------------------------------------------- acessibilidade */
teste("o alt vira aria-label", /aria-label="malha RC"/.test(desenhar([{ t: "R", de: [0, 0], para: [2, 0] }], { alt: "malha RC" })), true);
teste("aspas no alt são escapadas", /aria-label="a &quot;b&quot;"/.test(desenhar([{ t: "R", de: [0, 0], para: [2, 0] }], { alt: 'a "b"' })), true);

console.log(falhas === 0 ? "\n  circuito: todos passaram" : `\n  circuito: ${falhas} falha(s)`);
if (falhas) process.exit(1);
