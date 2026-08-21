/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                          setas.test.mjs *
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
/* Testa o roteamento das setas sem navegador.

   Este teste existe por causa de um bug real: o mapa de cartões era montado
   com raiz.querySelectorAll, que pega quadro E lista. A lista vem depois no
   DOM e sobrescrevia as entradas; estando display:none, devolvia offset zero
   e TODAS as setas degeneravam num ponto — o mapa aparecia sem seta nenhuma
   e nada no console avisava.

   Aqui o `cartao()` é injetado, então dá para verificar a geometria de
   verdade: que os caminhos saem da origem, entram no destino e que nenhum
   colapsa em zero. */
const { desenharSetas } = await import("../.tmp-teste/fluxograma.mjs");

const d = (id, periodo, pre = [], co = []) => ({
  id, codigo: id, nome: id, periodo, teorica: 60, pratica: 0,
  categoria: "basico", pre, co, dcext: false, estagio: false,
});
const grade = {
  curso: "Teste", sigla: "teste", chTotalCurso: 1000, estagioFracao: 0.6,
  disciplinas: [d("A", 1), d("B", 1), d("C", 2, ["A"]), d("D", 2, ["A", "B"]), d("E", 2, [], ["C"])],
};

/* layout falso: coluna 1 em x=0, coluna 2 em x=212 (172 + 40 de corredor) */
const CAIXAS = {
  A: { offsetLeft: 0, offsetTop: 40, offsetWidth: 172, offsetHeight: 70 },
  B: { offsetLeft: 0, offsetTop: 124, offsetWidth: 172, offsetHeight: 70 },
  C: { offsetLeft: 212, offsetTop: 40, offsetWidth: 172, offsetHeight: 70 },
  D: { offsetLeft: 212, offsetTop: 124, offsetWidth: 172, offsetHeight: 70 },
  E: { offsetLeft: 212, offsetTop: 208, offsetWidth: 172, offsetHeight: 70 },
};

const svg = { innerHTML: "" };
desenharSetas(grade, svg, (id) => CAIXAS[id], 40);

let falhas = 0;
const teste = (nome, cond, extra = "") => {
  console.log(`  ${cond ? "ok  " : "FALHA"} ${nome}`);
  if (!cond) { if (extra) console.log("        " + extra); falhas++; }
};

const html = svg.innerHTML;
const paths = [...html.matchAll(/<path d="([^"]+)"([^>]*)>/g)].filter((m) => m[2].includes("data-de"));
teste("desenhou uma seta por aresta", paths.length === 4, `veio ${paths.length}`);
teste("tem o marcador de ponta", html.includes('<marker id="ponta"'));

const nums = (d) => [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((x) => Number(x[0]));
for (const [, d, attrs] of paths) {
  const de = /data-de="([^"]+)"/.exec(attrs)[1];
  const para = /data-para="([^"]+)"/.exec(attrs)[1];
  const v = nums(d);
  const todosZero = v.every((n) => n === 0);
  teste(`${de}→${para}: não colapsou em zero`, !todosZero, d);
  /* começa na borda direita da origem */
  const x0 = v[0];
  teste(
    `${de}→${para}: sai da borda direita de ${de}`,
    x0 === CAIXAS[de].offsetLeft + CAIXAS[de].offsetWidth,
    `x inicial ${x0}, esperado ${CAIXAS[de].offsetLeft + CAIXAS[de].offsetWidth}`,
  );
  /* termina encostando no destino */
  const xf = v[v.length - 2];
  const alvo = CAIXAS[para];
  const esperado = de === para ? null : alvo.offsetLeft - 2;
  if (esperado !== null && CAIXAS[de].offsetLeft !== alvo.offsetLeft) {
    teste(`${de}→${para}: chega na borda esquerda de ${para}`, xf === esperado, `x final ${xf}`);
  }
}

/* co-requisito sai tracejado */
const co = paths.find((m) => m[2].includes('data-de="C"') && m[2].includes('data-para="E"'));
teste("co-requisito é tracejado", !!co && co[2].includes("stroke-dasharray"));
const pre = paths.find((m) => m[2].includes('data-de="A"') && m[2].includes('data-para="C"'));
teste("pré-requisito é contínuo", !!pre && !pre[2].includes("stroke-dasharray"));

/* pistas distintas: A→C e A→D não podem sair na mesma altura */
const ac = nums(paths.find((m) => m[2].includes('data-de="A"') && m[2].includes('data-para="C"'))[1]);
const ad = nums(paths.find((m) => m[2].includes('data-de="A"') && m[2].includes('data-para="D"'))[1]);
teste("duas setas do mesmo cartão saem em alturas diferentes", ac[1] !== ad[1], `${ac[1]} vs ${ad[1]}`);

console.log(falhas ? `\n  ${falhas} falha(s)` : "\n  todos passaram");
process.exit(falhas ? 1 : 0);
