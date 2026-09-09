/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                       cartao-social.mjs *
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
/* Regera o cartão de prévia dos links (public/social-card.png).

   Os três números do cartão descrevem o site, então eles NÃO devem ser
   digitados à mão: já ficaram meses errados assim ("147 questões" com 226 no
   ar). Aqui eles são CONTADOS do conteúdo, escritos no arte/social-card.html
   e a imagem é regerada.

   O `npm run verificar` confere se o cartão está atrasado; este script é como
   se põe em dia. Uso: npm run cartao

   Com `--se-preciso` ele só age quando os números divergem, e sai calado
   quando já estão certos. É esse o modo que o gancho de pre-commit usa
   (.githooks/pre-commit), para o cartão nunca mais depender de alguém
   lembrar de rodar o comando.
*/
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, rmSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ARTE = "arte/social-card.html";
const PNG = "public/social-card.png";
const SE_PRECISO = process.argv.includes("--se-preciso");

/* ------------------------------------------------------------- contagem --- */
const contarArquivos = (dir) =>
  readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith(".mdx")).length;

const questoes = contarArquivos("src/content/questoes");
const secoes = readdirSync("src/content/teoria")
  .filter((f) => f.endsWith(".mdx"))
  .reduce((t, f) => t + (readFileSync(`src/content/teoria/${f}`, "utf8").match(/<Topico id=/g) ?? []).length, 0);
const grades = readdirSync("src/content/grade").filter((f) => f.endsWith(".yaml")).length;

console.log(`  ${questoes} questões · ${secoes} seções · ${grades} mapas de grade`);

/* --------------------------------------------------------------- escrita --- */
let html = readFileSync(ARTE, "utf8");
const numero = (rotulo) => {
  const m = html.match(new RegExp(`<b>(\\d+)</b><span>${rotulo}</span>`));
  if (!m) throw new Error(`não achei o número de "${rotulo}" em ${ARTE}`);
  return Number(m[1]);
};
const ALVOS = [
  ["questões de prova", questoes],
  ["seções de teoria", secoes],
  ["mapas de grade", grades],
];

/* Uma questão nova muda a contagem, então regerar "a cada divergência" daria
   um PNG novo em quase todo commit — e PNG não faz delta no git. O gancho usa
   a MESMA folga do `npm run verificar` (5%, mínimo 3): assim o CI nunca pega o
   cartão atrasado e o repositório não engorda por um número de diferença.
   Já `npm run cartao` sem a flag deixa exato, sempre. */
const folgado = ALVOS.every(([rotulo, valor]) => {
  const folga = Math.max(3, Math.round(valor * 0.05));
  return valor - numero(rotulo) <= folga;
});
/* A folga existe para o gancho de pre-commit não redesenhar o PNG a cada
   questão nova — mas ela deixou o cartão da v2.15.0 sair dizendo 532 com o
   site em 535. Em RELEASE não há folga: `npm run cartao` sem `--se-preciso`
   regenera sempre, e é ele que a sequência de release chama. */
if (SE_PRECISO && folgado && existsSync(PNG)) {
  console.log("  cartão dentro da folga — nada a fazer");
  process.exit(0);
}

const trocar = (rotulo, valor) => {
  const re = new RegExp(`(<b>)\\d+(</b><span>${rotulo}</span>)`);
  if (!re.test(html)) throw new Error(`não achei o número de "${rotulo}" em ${ARTE}`);
  html = html.replace(re, `$1${valor}$2`);
};
for (const [rotulo, valor] of ALVOS) trocar(rotulo, valor);
writeFileSync(ARTE, html, "utf8");

/* ---------------------------------------------------------------- imagem --- */
/* O Chrome escreve a captura onde mandarmos, mas ele precisa do arquivo servido
   por caminho absoluto; uma pasta temporária evita sujar o repositório. */
const tmp = mkdtempSync(join(tmpdir(), "cartao-"));
const fonte = join(tmp, "card.html");
copyFileSync(ARTE, fonte);
const alvo = join(tmp, "card.png");
try {
  execFileSync(
    "google-chrome-stable",
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      `--screenshot=${alvo}`,
      "--window-size=1280,640",
      "--virtual-time-budget=8000",
      `file://${fonte}`,
    ],
    { stdio: "ignore" },
  );
  copyFileSync(alvo, PNG);
  console.log(`  ${PNG} regerado (1280×640)`);
} catch {
  console.error("  google-chrome-stable não rodou: o HTML foi atualizado, mas o PNG não.");
  process.exitCode = 1;
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
