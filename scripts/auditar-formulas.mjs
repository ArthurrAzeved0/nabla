/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                    auditar-formulas.mjs *
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
/* Procura padrões de LaTeX que o KaTeX renderiza APERTADO. Não é erro de
   sintaxe — isso o build já pega; é fórmula que compila e sai feia.

   O que procura, e por quê:

     fracExp   \frac cujo numerador E denominador têm expoente. Em textstyle
               (matemática em linha) os dois encostam na barra e ficam
               ilegíveis. \dfrac resolve sem sair da linha.
     matriz2d  matriz de 2+ colunas em linha. Fica apertada, mas no meio de
               uma frase ainda é a forma idiomática — por isso é AVISO, não
               erro. Vale olhar caso a caso.
     longa     fórmula em linha com mais de 120 caracteres. Matemática em
               linha NÃO QUEBRA, então ela estoura a coluna de texto. Quando
               é a linha inteira (um gabarito, por exemplo), deve ser
               destaque.
     overset   rótulo largo sobre um sinal estreito (\overset{...}{=}): o
               rótulo estoura para os lados e encosta nos vizinhos. Para
               "por substituição", \xrightarrow{} é a notação que estica.

   Uso: node scripts/auditar-formulas.mjs
*/
import { readFileSync, globSync } from "node:fs";
const arquivos = globSync("src/content/**/*.mdx");
const g = { fracExp: [], matriz2d: [], longa: [], overset: [] };

for (const arq of arquivos) {
  const txt = readFileSync(arq, "utf8");
  const sem = txt.replace(/\$\$\n[\s\S]*?\n\$\$/g, "");
  for (const m of [...sem.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/g)]) {
    const f = m[1];
    const nome = arq.replace("src/content/", "");
    /* \frac cujo numerador E denominador têm expoente: os dois encostam na
       barra em textstyle — é o caso do elipsoide */
    for (const fr of f.matchAll(/\\frac\{([^{}]*\^[^{}]*)\}\{([^{}]*\^[^{}]*)\}/g)) {
      g.fracExp.push([nome, fr[0]]);
    }
    /* matriz com 2+ COLUNAS (tem &): larga de verdade. Vetor coluna não. */
    for (const mx of f.matchAll(/\\begin\{(pmatrix|vmatrix|bmatrix|array)\}[^]*?\\end\{\1\}/g)) {
      if (mx[0].includes("&")) g.matriz2d.push([nome, mx[0].slice(0, 70)]);
    }
    if (f.length > 120) g.longa.push([nome, f.slice(0, 80)]);
  }
  for (const o of txt.matchAll(/\\(overset|underset|stackrel)\{([^{}]{7,})\}\{([^{}]*)\}/g)) {
    g.overset.push([arq.replace("src/content/", ""), o[0]]);
  }
}
for (const [k, v] of Object.entries(g)) {
  console.log(`\n${k} — ${v.length}`);
  for (const [a, t] of v) console.log(`   ${a}\n      ${t}`);
}
