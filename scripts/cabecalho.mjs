#!/usr/bin/env node
/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                          cabecalho.mjs  *
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

/* Insere (ou atualiza) o cabeçalho de autoria no topo de cada arquivo,
   escolhendo a sintaxe de comentário pela extensão.

   Uso:
     node scripts/cabecalho.mjs <arquivo|pasta> [...]     aplica
     node scripts/cabecalho.mjs --check <...>             só verifica

   Idempotente: rodar duas vezes não duplica nem altera nada. */

import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";

const RAIZ = process.cwd();
const MARCA = "Nabla — Guia do aluno POLI/UPE";
const LARGURA = 74; /* largura da caixa de asteriscos */

const AUTORIA = [
  `Copyright © ${new Date().getFullYear()}  Arthur Epifanio De Azevedo`,
  "Todos os direitos reservados.",
  "",
  "Software proprietário — ver arquivo LICENSE.",
  "",
  "Autor:   Arthur Epifanio De Azevedo",
  "Página:  https://github.com/ArthurrAzeved0",
  "Contato: arthur_azevedo05@hotmail.com",
];

/* Sintaxe de comentário por extensão.
     abre / fecha  = delimitadores
     recuo         = indentação das linhas seguintes (alinha os asteriscos)
     posicao       = onde o cabeçalho entra no arquivo */
/* O separador do cabeçalho é uma linha de hífens, mas comentário XML NÃO
   PODE conter "--": um SVG com isso é mal formado e o navegador se recusa a
   renderizá-lo — foi o que manteve o favicon invisível. Em XML o separador
   passa a ser "=". */
const ESTILOS = {
  ".css": { abre: "/* ", fecha: " */", recuo: "   ", posicao: "topo" },
  ".mjs": { abre: "/* ", fecha: " */", recuo: "   ", posicao: "topo" },
  ".js": { abre: "/* ", fecha: " */", recuo: "   ", posicao: "topo" },
  ".ts": { abre: "/* ", fecha: " */", recuo: "   ", posicao: "topo" },
  ".astro": { abre: "/* ", fecha: " */", recuo: "   ", posicao: "frontmatter" },
  ".mdx": { abre: "{/* ", fecha: " */}", recuo: "     ", posicao: "pos-frontmatter" },
  ".md": { abre: "<!-- ", fecha: " -->", recuo: "     ", posicao: "topo" },
  ".html": { abre: "<!-- ", fecha: " -->", recuo: "     ", posicao: "pos-doctype" },
  ".svg": { abre: "<!-- ", fecha: " -->", recuo: "     ", posicao: "pos-xml", sep: "=" },
  ".yaml": { abre: "# ", fecha: "", recuo: "# ", posicao: "topo" },
  ".yml": { abre: "# ", fecha: "", recuo: "# ", posicao: "topo" },
};

const IGNORAR = new Set(["node_modules", "dist", ".astro", ".git", ".claude"]);

/* ---------------------------------------------------------------- caixa --- */

function borda() {
  return "*".repeat(LARGURA);
}
function separador(caractere = "-") {
  return "*" + caractere.repeat(LARGURA - 2) + "*";
}
function linha(txt) {
  /* [...txt].length e não txt.length: acentos e "—" contam como 1 caractere
     visual, e é o alinhamento visual que importa aqui. */
  const largura = LARGURA - 4;
  const chars = [...txt];
  const corpo = chars.length > largura ? chars.slice(0, largura).join("") : txt;
  const sobra = largura - [...corpo].length;
  return "* " + corpo + " ".repeat(sobra) + " *";
}

function titulo(nomeArquivo) {
  const largura = LARGURA - 4;
  const vao = largura - [...MARCA].length - nomeArquivo.length;
  if (vao < 2) return linha(`${MARCA} · ${nomeArquivo}`);
  return linha(MARCA + " ".repeat(vao) + nomeArquivo);
}

function montarCabecalho(nomeArquivo, estilo) {
  const corpo = [titulo(nomeArquivo), separador(estilo.sep), ...AUTORIA.map(linha)];
  const out = [estilo.abre + borda()];
  for (const l of corpo) out.push(estilo.recuo + l);
  out.push(estilo.recuo + borda() + estilo.fecha);
  return out.join("\n");
}

/* ------------------------------------------------------------- inserção --- */

/* A janela é generosa de propósito: em .mdx o cabeçalho vem DEPOIS do
   frontmatter, e o frontmatter da teoria de Dinâmica tem 29 seções listadas —
   com 2.000 caracteres, o cabeçalho caía fora da janela e o arquivo era
   reportado como "sem cabeçalho" mesmo tendo um. */
function jaTem(txt) {
  return txt.slice(0, 8000).includes(MARCA);
}

function inserir(conteudo, cabecalho, posicao) {
  const linhas = conteudo.split("\n");

  if (posicao === "frontmatter") {
    /* .astro: o "---" TEM de ser a primeira linha do arquivo, então o
       cabeçalho vai DENTRO do frontmatter (que é JS/TS). */
    if (linhas[0]?.trim() === "---") {
      return [linhas[0], cabecalho, ...linhas.slice(1)].join("\n");
    }
    return `---\n${cabecalho}\n---\n\n${conteudo}`;
  }

  if (posicao === "pos-frontmatter") {
    /* .mdx: o frontmatter YAML vem primeiro; comentário JSX depois dele. */
    if (linhas[0]?.trim() === "---") {
      const fim = linhas.indexOf("---", 1);
      if (fim > 0) {
        return [...linhas.slice(0, fim + 1), "", cabecalho, ...linhas.slice(fim + 1)].join("\n");
      }
    }
    return `${cabecalho}\n\n${conteudo}`;
  }

  if (posicao === "pos-doctype" && /^\s*<!doctype/i.test(linhas[0] ?? "")) {
    return [linhas[0], cabecalho, ...linhas.slice(1)].join("\n");
  }

  if (posicao === "pos-xml" && /^\s*<\?xml/.test(linhas[0] ?? "")) {
    return [linhas[0], cabecalho, ...linhas.slice(1)].join("\n");
  }

  return `${cabecalho}\n${conteudo}`;
}

/* ------------------------------------------------------------- varredura -- */

function alvos(caminho, acc = []) {
  const st = statSync(caminho);
  if (st.isDirectory()) {
    if (IGNORAR.has(basename(caminho))) return acc;
    for (const nome of readdirSync(caminho)) alvos(join(caminho, nome), acc);
    return acc;
  }
  if (ESTILOS[extname(caminho)]) acc.push(caminho);
  return acc;
}

/* ----------------------------------------------------------------- main --- */

const args = process.argv.slice(2);
const apenasVerificar = args.includes("--check");
const entradas = args.filter((a) => !a.startsWith("--"));

if (entradas.length === 0) {
  console.error("uso: node scripts/cabecalho.mjs [--check] <arquivo|pasta> [...]");
  process.exit(1);
}

let aplicados = 0;
let jaOk = 0;
const faltando = [];

for (const entrada of entradas) {
  for (const arq of alvos(entrada)) {
    const conteudo = readFileSync(arq, "utf8");
    if (jaTem(conteudo)) {
      jaOk++;
      continue;
    }
    const rel = relative(RAIZ, arq);
    if (apenasVerificar) {
      faltando.push(rel);
      continue;
    }
    const estilo = ESTILOS[extname(arq)];
    const cab = montarCabecalho(basename(arq), estilo);
    writeFileSync(arq, inserir(conteudo, cab, estilo.posicao), "utf8");
    console.log(`  + ${rel}`);
    aplicados++;
  }
}

if (apenasVerificar) {
  if (faltando.length) {
    console.error(`sem cabeçalho (${faltando.length}):`);
    for (const f of faltando) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`ok — ${jaOk} arquivo(s) com cabeçalho.`);
} else {
  console.log(`\n${aplicados} aplicado(s), ${jaOk} já tinha(m).`);
}
