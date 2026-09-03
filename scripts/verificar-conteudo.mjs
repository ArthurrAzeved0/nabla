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
   resolvem, se sobrou LaTeX cru, se o KaTeX falhou em alguma fórmula, e se os
   números do cartão social ainda batem com o site. Sai com código 1 se achar
   problema, para poder virar passo de CI.

   Uso: node scripts/verificar-conteudo.mjs
*/
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";

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

/* ---------------------------------------------------------------------------
   O cartão social (arte/social-card.html -> public/social-card.png) tem os
   números do site escritos à mão. Ele é a PRIMEIRA coisa que alguém vê quando
   o link é mandado no WhatsApp, e ficou meses dizendo "147 questões" enquanto
   o site já tinha 226 — porque nada o obrigava a acompanhar.

   Aqui a contagem real é comparada com a do cartão. Se divergir, é ERRO: o
   conserto é editar o arte/social-card.html e gerar o PNG de novo (o comando
   está no README).                                                          */
/* ---------------------------------------------------------------------------
   Forma de SVG que não pinta nada é invisível e ninguém percebe na revisão:
   o desenho continua "quase certo", só falta um fio. Aconteceu em três
   questões da final de Eletromagnetismo — o fio da fonte até o barramento
   saiu sem `stroke` e o circuito ficava aberto na figura.

   O traço pode vir de um <g> ancestral, então a herança tem de ser levada em
   conta, senão isto vira 300 falsos positivos.                              */
console.log("\n== formas invisíveis em SVG ==");
{
  const FORMAS = ["line", "polyline", "path", "rect", "circle", "ellipse", "polygon"];
  const tok = new RegExp(`<(/?)(g|svg|${FORMAS.join("|")})\\b([^>]*?)(/?)>`, "g");
  const arquivos = [];
  const varrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) varrer(p);
      else if (e.name.endsWith(".mdx")) arquivos.push(p);
    }
  };
  varrer("src/content");
  let invisiveis = 0;
  for (const arq of arquivos) {
    const txt = readFileSync(arq, "utf8");
    for (const bloco of txt.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
      const pilha = [];
      for (const m of bloco[0].matchAll(tok)) {
        const [, fecha, tag, attrs, auto] = m;
        if (tag === "g" || tag === "svg") {
          if (fecha) pilha.pop();
          else if (!auto) pilha.push(attrs);
          continue;
        }
        if (fecha) continue;
        const todos = pilha.join(" ") + " " + attrs;
        const st = [...todos.matchAll(/stroke="([^"]*)"/g)].pop()?.[1];
        const fl = [...todos.matchAll(/fill="([^"]*)"/g)].pop()?.[1];
        if ((!st || st === "none") && (!fl || fl === "none")) {
          erro(`${arq}: <${tag}> sem stroke nem fill — não desenha nada`);
          invisiveis++;
        }
      }
    }
  }
  if (!invisiveis) console.log(`  ${arquivos.length} arquivos varridos, nenhuma forma invisível ✓`);
}

/* ---------------------------------------------------------------------------
   var(--token) que não existe é PIOR que um erro: o navegador descarta a
   declaração e usa o valor inicial da propriedade. Num `fill` de SVG isso é
   PRETO. Foi assim que o gerador de circuitos saiu com um retângulo preto
   atrás de cada símbolo — eu usei `--card-2`, que nunca existiu, e o meu
   preview local não pegou porque eu tinha definido o token no CSS de teste.  */
/* ------------------------------------------------------- versão do KaTeX
   O HTML das fórmulas é gerado pelo katex que o `rehype-katex` resolve; o CSS
   vem do `import "katex/dist/katex.min.css"` do Base.astro. Se as duas versões
   divergirem, o markup de uma cai nas regras da outra.

   Foi exatamente o que aconteceu: o 0.16 marca a caixa do `\boxed` com
   `class="stretchy fbox"`, e o 0.18 renomeou essa classe para
   `katex-stretchy`. Com o CSS do 0.18 e o HTML do 0.16, a caixa recebia
   `width:100%; display:block; overflow:hidden` da regra `.stretchy` — a borda
   estourava e sobrava um risco vertical solto no meio da fórmula, em 417
   `\boxed` das cinco cadeiras. */
console.log("\n== versão do KaTeX ==");
{
  const req = createRequire(import.meta.url);
  const doCss = req("katex/package.json").version;
  const doHtml = createRequire(req.resolve("rehype-katex"))("katex/package.json").version;
  console.log(`  CSS (Base.astro) ${doCss}  ·  HTML (rehype-katex) ${doHtml}`);
  if (doCss !== doHtml) {
    erro(
      `katex do CSS (${doCss}) e do HTML (${doHtml}) divergem — o markup de uma versão ` +
        `cai nas regras da outra. Fixe a mesma versão no package.json.`,
    );
  }
}

console.log("\n== tokens de CSS ==");
{
  const definidos = new Set();
  const colher = (txt) => {
    for (const m of txt.matchAll(/(--[a-z0-9-]+)\s*:/g)) definidos.add(m[1]);
  };
  const arquivos = [];
  const varrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) varrer(p);
      else if (/\.(css|astro|ts|mdx)$/.test(e.name)) arquivos.push(p);
    }
  };
  varrer("src");
  const textos = arquivos.map((a) => [a, readFileSync(a, "utf8")]);
  for (const [, txt] of textos) colher(txt);
  const usados = new Map();
  for (const [arq, txt] of textos) {
    for (const m of txt.matchAll(/var\((--[a-z0-9-]+)\s*(,)?/g)) {
      if (m[2]) continue; /* tem fallback: não quebra */
      /* nome montado em template — `var(--fio-${n})` — não dá para conferir */
      if (txt.slice(m.index + m[0].length).startsWith("${")) continue;
      if (!usados.has(m[1])) usados.set(m[1], arq);
    }
  }
  const orfaos = [...usados].filter(([t]) => !definidos.has(t));
  for (const [t, arq] of orfaos) erro(`${arq}: var(${t}) não está definido em lugar nenhum`);
  if (!orfaos.length) console.log(`  ${usados.size} tokens usados, todos definidos ✓`);
}

console.log("\n== cartão social ==");
{
  const ARTE = "arte/social-card.html";
  const PNG = "public/social-card.png";
  if (!existsSync(ARTE)) {
    erro(`${ARTE} não existe`);
  } else {
    const card = readFileSync(ARTE, "utf8");
    const secoesReais = Object.values(secoesPor).reduce((t, s) => t + s.size, 0);
    const grades = existsSync("dist/grade")
      ? readdirSync("dist/grade").filter((d) => existsSync(`dist/grade/${d}/index.html`)).length
      : null;

    const declarado = (rotulo) => {
      const m = card.match(new RegExp(`<b>(\\d+)</b><span>${rotulo}</span>`));
      return m ? Number(m[1]) : null;
    };
    /* O cartão é um INSTANTÂNEO, regerado a cada release — não a cada commit.
       Cobrar igualdade exata obrigaria a regerar um PNG junto de cada seção de
       teoria nova, o que é atrito sem benefício: "226 questões" com 229 no ar
       não engana ninguém. O que engana é o que aconteceu de verdade — o cartão
       dizer 147 com 226 no site, uma defasagem de 35%.

       Então: sempre imprime os dois números, e falha quando o cartão está
       atrasado além de 5% (ou 3 unidades, para os números pequenos). */
    const conferir = (rotulo, real) => {
      const dito = declarado(rotulo);
      if (dito === null) return erro(`cartão social: não achei o número de "${rotulo}"`);
      if (real === null) return console.log(`  ${rotulo.padEnd(20)} ${dito}`);
      const folga = Math.max(3, Math.round(real * 0.05));
      const atraso = real - dito;
      if (atraso > folga) {
        erro(
          `cartão social diz ${dito} ${rotulo}, mas o site tem ${real} ` +
            `(atraso de ${atraso}, limite ${folga}) — rode 'npm run cartao' ` +
            "(ou 'npm run ganchos' para nunca mais)",
        );
      } else if (dito !== real) {
        console.log(`  ${rotulo.padEnd(20)} ${dito} (site: ${real}, dentro da folga)`);
      } else {
        console.log(`  ${rotulo.padEnd(20)} ${dito} ✓`);
      }
    };

    conferir("questões de prova", totalQ);
    conferir("seções de teoria", secoesReais);
    conferir("mapas de grade", grades);

    /* O PNG tem de ser mais novo que o HTML: senão o número está certo na
       fonte e errado na imagem, que é o que de fato circula. */
    if (!existsSync(PNG)) {
      erro(`${PNG} não existe`);
    } else if (statSync(PNG).mtimeMs < statSync(ARTE).mtimeMs - 1000) {
      erro(`${PNG} é mais antigo que ${ARTE}: regere o PNG`);
    }
  }
}

console.log(`\n  ${totalQ} questões, ${totalLinks} links de teoria verificados`);
if (problemas) {
  console.error(`\n  ${problemas} problema(s) encontrado(s).`);
  process.exit(1);
}
console.log("  tudo íntegro.");
