/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                       extrair-grade.mjs *
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
/* Extrai a grade de um fluxograma solto (HTML do site 1.x) para YAML.

   Existe para não transcrever 65 disciplinas e 61 arestas à mão. Depois de
   rodar, o schema em src/content.config.ts valida o grafo: pré-requisito
   apontando para código inexistente vira erro de build.

   Uso: node scripts/extrair-grade.mjs <arquivo.html> <sigla>
*/
import { readFileSync, writeFileSync } from "node:fs";

const [arquivo, sigla] = process.argv.slice(2);
if (!arquivo || !sigla) {
  console.error("uso: node scripts/extrair-grade.mjs <arquivo.html> <sigla>");
  process.exit(1);
}

const html = readFileSync(arquivo, "utf8");
const ini = html.indexOf("const COURSES = [");
if (ini === -1) throw new Error("não achei `const COURSES = [` no arquivo");
const trecho = html.slice(ini, html.indexOf("];", ini) + 2).replace("const COURSES =", "return");
const COURSES = new Function(trecho)();

const nome = (html.match(/<title>([^<]*)<\/title>/) ?? [, ""])[1];
const curso = nome.split("—")[1]?.split("POLI")[0]?.trim() ?? sigla;
const matriz = (nome.match(/Matriz\s+([\d.]+)/i) ?? [, "?"])[1];
const chTotal = Number(
  (html.match(/CH_TOTAL_CURSO\s*=\s*(\d+)/) ?? [, "0"])[1],
);
const fracao = Number((html.match(/CH_TOTAL_CURSO\s*\*\s*([\d.]+)/) ?? [, "0.6"])[1]);

/* CORREÇÕES sobre o que o fluxograma 1.x trazia. Ficam aqui, não no YAML:
   o YAML é gerado, então uma correção feita nele se perderia na próxima
   extração.

   GEO03: o PPC cita "FIS02" como pré-requisito, código que não existe na
   matriz — por isso a disciplina aparecia sem requisito nenhum. O
   pré-requisito real é Química (QUI02). */
const CORRECOES = {
  GEO03: {
    pre: ["QUI02"],
    /* o campo no fluxograma 1.x se chama `note` */
    note: "O PPC cita FIS02, código que não existe na matriz; o pré-requisito real é Química.",
  },
};

/* Cadeiras que já existem no site: o nó vira link. Editar aqui ao migrar
   uma cadeira nova. */
const LIGACAO = {
  MAT20: "calculo3",
  MAT21: "eqdiferenciais",
  FIS12: "eletromag",
  FIS08: "dinamica",
};

const esc = (s) => (/[:#{}[\],&*?|>=!%@`"']|^\s|\s$/.test(s) ? JSON.stringify(s) : s);
/* Cabeçalho de autoria, emitido aqui para sobreviver a uma reextração em vez
   de ter de ser recolocado por fora. Mesmo formato de scripts/cabecalho.mjs. */
function cabecalho(nomeArquivo) {
  const W = 74;
  const linha = (t) => {
    const larg = W - 4;
    const chars = [...t];
    const corpo = chars.length > larg ? chars.slice(0, larg).join("") : t;
    return "* " + corpo + " ".repeat(larg - [...corpo].length) + " *";
  };
  const borda = "*".repeat(W);
  const marca = "Nabla \u2014 Guia do aluno POLI/UPE";
  const vao = W - 4 - [...marca].length - nomeArquivo.length;
  const titulo =
    vao < 2 ? linha(marca + " \u00b7 " + nomeArquivo) : linha(marca + " ".repeat(vao) + nomeArquivo);
  return [
    borda,
    titulo,
    "*" + "-".repeat(W - 2) + "*",
    linha("Copyright \u00a9 2026  Arthur Epifanio De Azevedo"),
    linha("Todos os direitos reservados."),
    linha(""),
    linha("Software propriet\u00e1rio \u2014 ver arquivo LICENSE."),
    linha(""),
    linha("Autor:   Arthur Epifanio De Azevedo"),
    linha("P\u00e1gina:  https://github.com/ArthurrAzeved0"),
    linha("Contato: arthur_azevedo05@hotmail.com"),
    borda,
  ]
    .map((l) => "# " + l)
    .join("\n");
}

const L = [];
L.push(cabecalho(sigla + ".yaml"));
L.push("# " + "*".repeat(72));
L.push(`# Grade de ${curso} — POLI/UPE, matriz ${matriz}.`);
L.push("#");
L.push("# GERADO por scripts/extrair-grade.mjs. Editar à mão é possível, mas o");
L.push("# schema valida o grafo no build: requisito apontando para código");
L.push("# inexistente é erro, não seta que simplesmente não aparece.");
L.push("#");
L.push("# `pre` = pré-requisito (seta contínua) · `co` = co-requisito (tracejada)");
L.push("# `cadeira` liga o nó à página da cadeira no site, quando ela existe.");
L.push("# " + "*".repeat(72));
L.push(`curso: ${esc(curso)}`);
L.push(`sigla: ${sigla}`);
L.push(`matriz: ${JSON.stringify(matriz)}`);
L.push(`chTotalCurso: ${chTotal}`);
L.push(`estagioFracao: ${fracao}`);
L.push("disciplinas:");
const DISCIPLINAS = COURSES.map((c) => ({ ...c, ...(CORRECOES[c.id] ?? {}) }));

for (const c of DISCIPLINAS) {
  L.push(`  - id: ${c.id}`);
  L.push(`    codigo: ${esc(c.code)}`);
  L.push(`    nome: ${esc(c.name)}`);
  L.push(`    periodo: ${c.per}`);
  L.push(`    teorica: ${c.t}`);
  L.push(`    pratica: ${c.p}`);
  L.push(`    categoria: ${c.cat}`);
  L.push(`    pre: [${c.pre.join(", ")}]`);
  L.push(`    co: [${c.co.join(", ")}]`);
  if (c.dcext) L.push("    dcext: true");
  if (c.estagio) L.push("    estagio: true");
  if (c.note) L.push(`    nota: ${esc(c.note)}`);
  if (LIGACAO[c.id]) L.push(`    cadeira: ${LIGACAO[c.id]}`);
}

const destino = `src/content/grade/${sigla}.yaml`;
writeFileSync(destino, L.join("\n") + "\n");
console.log(
  `  ${destino}: ${DISCIPLINAS.length} disciplinas, ` +
    `${DISCIPLINAS.reduce((s, c) => s + c.pre.length, 0)} pré + ` +
    `${DISCIPLINAS.reduce((s, c) => s + c.co.length, 0)} co, ` +
    `${DISCIPLINAS.reduce((s, c) => s + c.t + c.p, 0)}h na matriz` +
    (Object.keys(CORRECOES).length ? `, ${Object.keys(CORRECOES).length} corrigida(s)` : ""),
);
