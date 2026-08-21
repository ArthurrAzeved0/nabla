/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                    converter-teoria.mjs *
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
/* Converte a teoria de uma cadeira (fragmento HTML do site 1.x) para MDX.

   Reaproveita as regras já validadas na conversão das 147 questões:
   entidades HTML na matemática, cerca de $$ sozinha na linha, chaves
   literais escapadas, comentários HTML -> JSX, tokens de cor renomeados.

   FERRAMENTA DE MIGRAÇÃO, guardada como registro. Os arquivos de entrada
   (conteudo/<cadeira>.html) foram aposentados na Fase 5, mas
   continuam no histórico: `git show v1.0.0:<caminho>` os recupera. Serve se
   for preciso reconverter algo e comparar com o resultado atual.

   Uso: node scripts/converter-teoria.mjs <cadeira>
*/
import { readFileSync, writeFileSync } from "node:fs";

const cadeira = process.argv[2];
const html = readFileSync(`conteudo/${cadeira}.html`, "utf8");
const meta = JSON.parse(readFileSync("src/content/cadeiras/cadeiras.json", "utf8")).find(
  (c) => c.id === cadeira,
);
if (!meta) throw new Error(`cadeira desconhecida: ${cadeira}`);

/* ----------------------------------------------- sumário -> frontmatter ---
   Hoje o sumário é HTML escrito à mão, que pode divergir das seções. Vira
   dado no frontmatter e a página o renderiza — uma fonte só de verdade. */
const sumario = html.match(/<nav class="sumario"[\s\S]*?<\/nav>/)?.[0] ?? "";
const unidades = [];
for (const m of sumario.matchAll(/<h2>([\s\S]*?)<\/h2>\s*<ol[^>]*>([\s\S]*?)<\/ol>/g)) {
  unidades.push({
    nome: m[1].trim(),
    secoes: [...m[2].matchAll(/<a href="#([^"]+)">([\s\S]*?)<\/a>/g)].map((s) => ({
      id: s[1],
      titulo: s[2].replace(/<[^>]+>/g, "").trim(),
    })),
  });
}

/* -------------------------------------------------------- corpo: regras --- */
function corpo(s) {
  /* entidades HTML dentro da matemática (o KaTeX não decodifica) */
  const dec = (m) =>
    m
      .replace(/&gt;/g, "\\gt ")
      .replace(/&lt;/g, "\\lt ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, "\\ ")
      /* < e > literais: o `<` em MDX começa uma tag JSX */
      .replace(/</g, "\\lt ")
      .replace(/>/g, "\\gt ");
  s = s.replace(/\\\((.*?)\\\)/gs, (_, m) => `\\(${dec(m)}\\)`);
  s = s.replace(/\$\$(.*?)\$\$/gs, (_, m) => `$$${dec(m)}$$`);

  s = s.replace(/\\text\{sen\}\\,?/g, "\\operatorname{sen} ");
  s = s.replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c}*/}`);
  s = s.replace(/var\(--card-2\)/g, "var(--surface-2)").replace(/var\(--card\)/g, "var(--surface)");
  s = s.replace(/<br\s*>/g, "<br />").replace(/<hr\s*>/g, "<hr />");

  /* --------- blocos <div class="X"> ---------
     Regex NÃO serve aqui: estes divs são ANINHADOS (.formula contém um
     .rotulo dentro), e o casamento não-guloso fecha no </div> errado — foi
     exatamente o que quebrou a primeira tentativa. Este matcher anda para
     frente contando <div> e </div> até achar o fechamento de verdade. */
  const trocarBlocos = (classe, montar) => {
    const abre = `<div class="${classe}">`;
    let i;
    while ((i = s.indexOf(abre)) !== -1) {
      let nivel = 1;
      let j = i + abre.length;
      while (nivel > 0) {
        const proxAbre = s.indexOf("<div", j);
        const proxFecha = s.indexOf("</div>", j);
        if (proxFecha === -1) throw new Error(`<div class="${classe}"> sem fechamento`);
        if (proxAbre !== -1 && proxAbre < proxFecha) {
          nivel++;
          j = proxAbre + 4;
        } else {
          nivel--;
          j = proxFecha + 6;
        }
      }
      const dentro = s.slice(i + abre.length, j - 6);
      /* O rótulo é o primeiro filho. Vem como <div> em calculo3/eletromag e
         como <span> em eqdiferenciais — aceita os dois. */
      const reRot = /<(div|span) class="rotulo">([\s\S]*?)<\/\1>/;
      const rot = dentro.match(reRot);
      const conteudo = dentro.replace(reRot, "").trim();
      s = s.slice(0, i) + montar(rot ? rot[2].trim() : null, conteudo) + s.slice(j);
    }
  };

  /* O rótulo vira ATRIBUTO, e atributo não passa pelo KaTeX: um "$n$" ali
     apareceria literal na tela. Como são rótulos curtos, o LaTeX vira o
     símbolo Unicode equivalente — lê melhor e não depende de renderizador.
     O que não estiver na tabela é reportado, para eu resolver à mão. */
  const UNI = {
    "\\Delta": "Δ", "\\lambda": "λ", "\\alpha": "α", "\\beta": "β",
    "\\gamma": "γ", "\\omega": "ω", "\\theta": "θ", "\\varphi": "φ",
    "\\pm": "±", "\\propto": "∝", "\\gt": ">", "\\lt": "<",
    "\\to": "→", "\\cdot": "·", "\\infty": "∞", "\\,": " ",
  };
  const rotuloSemLatex = (v) => {
    if (!/\$|\\\(/.test(v)) return v;
    return v.replace(/\\\(([\s\S]*?)\\\)|\$([^$]*)\$/g, (_, a, b) => {
      const m = a !== undefined ? a : b;
      let t = m;
      for (const [k, u] of Object.entries(UNI)) t = t.split(k).join(u);
      t = t.replace(/''/g, "″").replace(/'/g, "′").replace(/_\{([^}]*)\}/g, "_$1");
      const resto = t.match(/\\[a-zA-Z]+|[{}]/g);
      if (resto) console.warn(`  AVISO rótulo com LaTeX não traduzido: "${m}" (${resto.join(" ")})`);
      return t.replace(/\s+/g, " ").trim();
    });
  };

  const atrib = (v) => rotuloSemLatex(v).replace(/"/g, "&quot;");
  /* "macete dica" antes de "macete": senão o seletor genérico pega os dois */
  for (const [classe, tipo] of [
    ["macete dica", "dica"],
    ["simbolos", "simbolos"],
    ["exemplo", "exemplo"],
    ["macete", "macete"],
  ]) {
    trocarBlocos(classe, (rot, conteudo) => {
      const attrs = [`tipo="${tipo}"`];
      if (rot) attrs.push(`rotulo="${atrib(rot)}"`);
      return `\n\n<Caixa ${attrs.join(" ")}>\n${conteudo}\n</Caixa>\n\n`;
    });
  }

  /* --------- fórmula nomeada --------- */
  trocarBlocos(
    "formula",
    (rot, conteudo) =>
      `\n\n<Formula${rot ? ` rotulo="${atrib(rot)}"` : ""}>\n${conteudo}\n</Formula>\n\n`,
  );

  /* --------- figuras --------- */
  const desindenta = (bloco) => {
    const linhas = bloco.split("\n").filter((l) => l.trim() !== "");
    const menor = Math.min(...linhas.map((l) => l.match(/^[ \t]*/)[0].length));
    return linhas.map((l) => "  " + l.slice(menor)).join("\n");
  };
  s = s.replace(/[ \t]*<figure class="figura">([\s\S]*?)<\/figure>/g, (_, dentro) => {
    let d = desindenta(dentro).replace(
      /[ \t]*<figcaption>([\s\S]*?)<\/figcaption>/,
      (_m, leg) => `  <figcaption>\n\n${leg.trim()}\n\n  </figcaption>`,
    );
    return `\n\n<Figura>\n${d}\n</Figura>\n\n`;
  });
  s = s.replace(/[ \t]*<div class="fig-par">([\s\S]*?)\n\s*<\/div>/g, (_, dentro) => {
    const d = dentro
      .split("\n")
      .map((l) => (l.trim() ? "  " + l.trim() : l))
      .join("\n")
      .trim();
    return `\n\n<FigPar>\n  ${d}\n</FigPar>\n\n`;
  });

  /* --------- matemática --------- */
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m.trim()}$`);
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n\n$$\n${m.trim()}\n$$\n\n`);
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => `\n\n$$\n${m.trim()}\n$$\n\n`);

  /* --------- títulos e ênfase --------- */
  s = s.replace(/<h4>([\s\S]*?)<\/h4>/g, (_, m) => `\n\n#### ${m.trim()}\n\n`);
  s = s.replace(/<h3>([\s\S]*?)<\/h3>/g, (_, m) => `\n\n### ${m.trim()}\n\n`);
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, (_, _t, m) => `**${m.trim()}**`);
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/g, (_, _t, m) => `*${m.trim()}*`);
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, (_, m) => "`" + m.trim() + "`");

  /* --------- listas --------- */
  s = s.replace(/<ul>([\s\S]*?)<\/ul>/g, (_, d) => {
    const itens = [...d.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(
      (m) => `- ${m[1].trim().replace(/\s+/g, " ")}`,
    );
    return `\n\n${itens.join("\n")}\n\n`;
  });
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (_, d) => {
    const itens = [...d.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(
      (m, i) => `${i + 1}. ${m[1].trim().replace(/\s+/g, " ")}`,
    );
    return `\n\n${itens.join("\n")}\n\n`;
  });

  s = s.replace(/<p>([\s\S]*?)<\/p>/g, (_, m) => `\n\n${m.trim()}\n\n`);
  s = s.replace(/<\/?div[^>]*>/g, "");
  s = s.replace(/&nbsp;/g, " ");

  /* Chave literal na prosa é expressão JavaScript em MDX. Protege o que
     legitimamente usa chave e escapa o resto. */
  const cofre = [];
  const guardar = (m) => `@@COFRE${cofre.push(m) - 1}@@`;
  s = s
    .replace(/\$\$[\s\S]*?\$\$/g, guardar)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, guardar)
    .replace(/<[^>]*>/g, guardar)
    .replace(/\$[^$\n]*\$/g, guardar);
  s = s.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
  s = s.replace(/@@COFRE(\d+)@@/g, (_, i) => cofre[Number(i)]);

  return s
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ------------------------------------------------------- seções (tópicos) */
/* Duas formas de numerar a seção, herdadas de cadeiras escritas em momentos
   diferentes. Aceita as duas e PADRONIZA em dois dígitos:
     <h2><span class="num">01</span> Título</h2>   (calculo3, eletromag)
     <h2>1. Título</h2>                            (eqdiferenciais)          */
const topicos = [];
for (const m of html.matchAll(
  /<section class="topico" id="([^"]+)">\s*<h2>([\s\S]*?)<\/h2>([\s\S]*?)<\/section>/g,
)) {
  const [, id, cabecalho, resto] = m;
  let num, titulo;
  const comSpan = cabecalho.match(/<span class="num">([^<]*)<\/span>([\s\S]*)/);
  if (comSpan) {
    num = comSpan[1].trim();
    titulo = comSpan[2].trim();
  } else {
    const inline = cabecalho.trim().match(/^(\d+)\s*[.)]\s*([\s\S]*)$/);
    if (!inline) throw new Error(`seção ${id}: não achei o número no <h2>: "${cabecalho.trim()}"`);
    num = inline[1];
    titulo = inline[2].trim();
  }
  num = String(num).replace(/\D/g, "").padStart(2, "0");
  topicos.push({ id, num, titulo: titulo.replace(/<[^>]+>/g, "").trim(), corpo: corpo(resto) });
}
if (topicos.length === 0) throw new Error("nenhuma seção .topico encontrada");

/* Cabeçalho de autoria. Emitido pelo conversor, não aplicado por fora: assim
   ele sobrevive a uma reconversão em vez de ter de ser recolocado. O
   alinhamento segue o mesmo formato de scripts/cabecalho.mjs. */
function cabecalho(nomeArquivo) {
  const L = 74;
  const linha = (t) => {
    const larg = L - 4;
    const chars = [...t];
    const corpo = chars.length > larg ? chars.slice(0, larg).join("") : t;
    return "* " + corpo + " ".repeat(larg - [...corpo].length) + " *";
  };
  const borda = "*".repeat(L);
  const marca = "Nabla — Guia do aluno POLI/UPE";
  const vao = L - 4 - [...marca].length - nomeArquivo.length;
  const titulo = vao < 2 ? linha(`${marca} · ${nomeArquivo}`) : linha(marca + " ".repeat(vao) + nomeArquivo);
  const corpo = [
    titulo,
    "*" + "-".repeat(L - 2) + "*",
    linha("Copyright © 2026  Arthur Epifanio De Azevedo"),
    linha("Todos os direitos reservados."),
    linha(""),
    linha("Software proprietário — ver arquivo LICENSE."),
    linha(""),
    linha("Autor:   Arthur Epifanio De Azevedo"),
    linha("Página:  https://github.com/ArthurrAzeved0"),
    linha("Contato: arthur_azevedo05@hotmail.com"),
  ];
  return ["{/* " + borda, ...corpo.map((l) => "     " + l), "     " + borda + " */}"].join("\n");
}

const fm = [
  `cadeira: ${cadeira}`,
  `titulo: ${JSON.stringify(meta.nome)}`,
  "unidades:",
  ...unidades.flatMap((u) => [
    `  - nome: ${JSON.stringify(u.nome)}`,
    "    secoes:",
    ...u.secoes.map((s) => `      - { id: ${s.id}, titulo: ${JSON.stringify(s.titulo)} }`),
  ]),
];

const saida = `---
${fm.join("\n")}
---

${cabecalho(`${cadeira}.mdx`)}

${topicos
  .map(
    (t) =>
      `<Topico id="${t.id}" num="${t.num}" titulo=${JSON.stringify(t.titulo)}>\n\n${t.corpo}\n\n</Topico>`,
  )
  .join("\n\n")}
`;

writeFileSync(`src/content/teoria/${cadeira}.mdx`, saida);
console.log(
  `  ${cadeira}: ${topicos.length} seções, ${unidades.length} unidades, ${unidades.reduce((s, u) => s + u.secoes.length, 0)} itens de sumário`,
);
