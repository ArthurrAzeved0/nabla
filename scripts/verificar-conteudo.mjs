/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                  verificar-conteudo.mjs *
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
/* Verificação de integridade do conteúdo. Roda depois do build.

   Confere o que o schema não alcança: se os links entre teoria e questões
   resolvem, se sobrou LaTeX cru, se o KaTeX falhou em alguma fórmula. Sai
   com código 1 se achar problema, para poder virar passo de CI.

   Uso: node scripts/verificar-conteudo.mjs
*/
import { readFileSync, readdirSync, existsSync } from "node:fs";

const DIST = "dist/cadeiras";
if (!existsSync(DIST)) {
  console.error("dist/ não existe: rode `npm run build` antes.");
  process.exit(1);
}

const semCodigo = (h) =>
  h.replace(/<pre[\s\S]*?<\/pre>/g, "").replace(/<code[\s\S]*?<\/code>/g, "");
const contar = (h, re) => (h.match(re) ?? []).length;

let problemas = 0;
const erro = (msg) => {
  console.error(`  ERRO  ${msg}`);
  problemas++;
};

const cadeiras = readdirSync(DIST).filter((d) => existsSync(`${DIST}/${d}/index.html`));
const secoesPor = {};

console.log("== teoria ==");
for (const cad of cadeiras) {
  const h = readFileSync(`${DIST}/${cad}/index.html`, "utf8");
  const ids = new Set([...h.matchAll(/<section class="topico[^"]*" id="([^"]+)"/g)].map((m) => m[1]));
  secoesPor[cad] = ids;
  const sumario = new Set([...h.matchAll(/<nav class="sumario[\s\S]*?<\/nav>/g)]
    .flatMap((m) => [...m[0].matchAll(/href="#([^"]+)"/g)].map((x) => x[1])));
  const orfas = [...sumario].filter((s) => !ids.has(s));
  const cru = semCodigo(h).replace(/<[^>]+>/g, " ");
  const katexErr = contar(h, /katex-error/g);

  console.log(
    `  ${cad.padEnd(16)} ${ids.size} seções, ${sumario.size} no sumário, ${contar(h, /katex-display/g)} fórmulas em destaque`,
  );
  if (orfas.length) erro(`${cad}: sumário aponta para seção inexistente: ${orfas.join(", ")}`);
  if (katexErr) erro(`${cad}: ${katexErr} fórmula(s) que o KaTeX não conseguiu ler`);
  if (cru.includes("$") || cru.includes("\\(")) erro(`${cad}: sobrou LaTeX cru no texto`);
}

console.log("== questões ==");
let totalQ = 0;
let totalLinks = 0;
for (const cad of cadeiras) {
  for (const prova of ["1ee", "2ee", "final"]) {
    const arq = `${DIST}/${cad}/${prova}/index.html`;
    if (!existsSync(arq)) continue;
    const h = readFileSync(arq, "utf8");
    const q = contar(h, /class="questao/g);
    if (q === 0) continue;
    totalQ += q;

    const gab = contar(h, /class="gabarito/g);
    const pas = contar(h, /class="passos/g);
    const katexErr = contar(h, /katex-error/g);
    const cru = semCodigo(h).replace(/<[^>]+>/g, " ");

    /* "Ver material" tem de cair numa seção que existe */
    const alvos = [...h.matchAll(/class="material[^"]*" href="[^"#]*#([^"]+)"/g)].map((m) => m[1]);
    totalLinks += alvos.length;
    const quebrados = alvos.filter((a) => !secoesPor[cad]?.has(a));

    console.log(`  ${(cad + "/" + prova).padEnd(24)} ${String(q).padStart(2)} questões, ${alvos.length} links de teoria`);
    if (gab !== q) erro(`${cad}/${prova}: ${q} questões mas ${gab} gabaritos`);
    if (pas !== q) erro(`${cad}/${prova}: ${q} questões mas ${pas} passo a passo`);
    if (katexErr) erro(`${cad}/${prova}: ${katexErr} fórmula(s) que o KaTeX não conseguiu ler`);
    if (cru.includes("$") || cru.includes("\\(")) erro(`${cad}/${prova}: sobrou LaTeX cru no texto`);
    if (quebrados.length) erro(`${cad}/${prova}: "Ver material" aponta para o vazio: ${quebrados.join(", ")}`);
  }
}

console.log(`\n  ${totalQ} questões, ${totalLinks} links de teoria verificados`);
if (problemas) {
  console.error(`\n  ${problemas} problema(s) encontrado(s).`);
  process.exit(1);
}
console.log("  tudo íntegro.");
