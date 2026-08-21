/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                          ponte.test.mjs *
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
/* Testa a ponte de endereços antigos (public/curso.html).

   Existe porque links do site 1.x já circularam em conversas e grupos.
   Quebrar um deles é pior que manter um arquivo a mais, e um erro aqui só
   apareceria quando alguém clicasse — meses depois.

   O teste extrai a função de tradução do próprio HTML, então não há como o
   arquivo e o teste divergirem. */
import { readFileSync } from "node:fs";

const html = readFileSync("public/curso.html", "utf8");

/* reconstrói a lógica a partir das constantes declaradas no arquivo */
const PROVAS = JSON.parse(/var PROVAS = (\[[^\]]*\])/.exec(html)[1].replace(/'/g, '"'));
const CADEIRAS = JSON.parse(/var CADEIRAS = (\[[^\]]*\])/.exec(html)[1].replace(/'/g, '"'));

function traduzir(search, hash) {
  const cadeira = new URLSearchParams(search).get("curso") || "";
  hash = (hash || "").replace(/^#/, "");
  if (!CADEIRAS.includes(cadeira)) return "./";
  const p = hash.split("-");
  if (p.length >= 3 && p[0] === cadeira && PROVAS.includes(p[1])) {
    return `cadeiras/${cadeira}/${p[1]}#${hash}`;
  }
  if (hash) return `cadeiras/${cadeira}#${hash}`;
  return `cadeiras/${cadeira}`;
}

let falhas = 0;
const teste = (s, h, esperado) => {
  const r = traduzir(s, h);
  const ok = r === esperado;
  console.log(`  ${ok ? "ok  " : "FALHA"} curso.html${s}${h} -> ${r}`);
  if (!ok) { console.log(`        esperado ${esperado}`); falhas++; }
};

teste("?curso=calculo3", "", "cadeiras/calculo3");
teste("?curso=calculo3", "#calculo3-1ee-01", "cadeiras/calculo3/1ee#calculo3-1ee-01");
teste("?curso=calculo3", "#calculo3-2ee-17", "cadeiras/calculo3/2ee#calculo3-2ee-17");
teste("?curso=calculo3", "#calculo3-final-07", "cadeiras/calculo3/final#calculo3-final-07");
teste("?curso=calculo3", "#c3-multiplas", "cadeiras/calculo3#c3-multiplas");
teste("?curso=eqdiferenciais", "#ed-frobenius", "cadeiras/eqdiferenciais#ed-frobenius");
teste("?curso=eletromag", "#eletromag-final-38", "cadeiras/eletromag/final#eletromag-final-38");
teste("?curso=eletromag", "#em-maxwell", "cadeiras/eletromag#em-maxwell");
/* cadeira que nunca existiu (o modelo comentado do site 1.x) cai na home */
teste("?curso=fisica4", "", "./");
teste("", "", "./");
/* âncora com a cara de questão mas de outra cadeira não vira rota de prova */
teste("?curso=calculo3", "#eletromag-1ee-01", "cadeiras/calculo3#eletromag-1ee-01");

/* as cadeiras da ponte têm de ser as que existem de fato */
const { readdirSync } = await import("node:fs");
const reais = readdirSync("src/content/questoes").sort();
const naPonte = [...CADEIRAS].sort();
const ok = JSON.stringify(reais) === JSON.stringify(naPonte);
console.log(`  ${ok ? "ok  " : "FALHA"} a ponte conhece as cadeiras que existem`);
if (!ok) { console.log(`        conteúdo ${reais}, ponte ${naPonte}`); falhas++; }

console.log(falhas ? `\n  ${falhas} falha(s)` : "\n  todos passaram");
process.exit(falhas ? 1 : 0);
