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
*/
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, rmSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ARTE = "arte/social-card.html";
const PNG = "public/social-card.png";

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
const trocar = (rotulo, valor) => {
  const re = new RegExp(`(<b>)\\d+(</b><span>${rotulo}</span>)`);
  if (!re.test(html)) throw new Error(`não achei o número de "${rotulo}" em ${ARTE}`);
  html = html.replace(re, `$1${valor}$2`);
};
trocar("questões de prova", questoes);
trocar("seções de teoria", secoes);
trocar("mapas de grade", grades);
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
