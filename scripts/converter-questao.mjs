/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                   converter-questao.mjs *
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
/* Converte uma questão do site 1.x (HTML) para MDX.

   NÃO é para rodar e confiar: a saída de cada arquivo é revisada. O papel
   dele é eliminar erro de TRANSCRIÇÃO (fórmula digitada errado), que é o
   risco real de converter 147 questões na mão.

   Uso: node scripts/converter-questao.mjs <arquivo.html> [--stdout]
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ROTULO_PASTA = { "1ee": "1º EE", "2ee": "2º EE", final: "Final" };

/* ------------------------------------------------------ rótulo sem LaTeX ---
   O `tema` vira texto de etiqueta, e ali o KaTeX não roda: um "\(x_0=1\)"
   apareceria literal. Como são rótulos curtos, o LaTeX vira o símbolo
   Unicode equivalente. O que não estiver na tabela é reportado. */
const UNI = {
  "\\Delta": "Δ", "\\lambda": "λ", "\\alpha": "α", "\\beta": "β",
  "\\gamma": "γ", "\\omega": "ω", "\\theta": "θ", "\\varphi": "φ",
  "\\mu": "μ", "\\rho": "ρ", "\\sigma": "σ", "\\phi": "φ", "\\pi": "π",
  "\\pm": "±", "\\propto": "∝", "\\gt": ">", "\\lt": "<",
  "\\to": "→", "\\cdot": "·", "\\infty": "∞", "\\,": " ",
};
const SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉" };
const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

function rotuloSemLatex(v) {
  if (!/\$|\\\(/.test(v)) return v;
  return v.replace(/\\\(([\s\S]*?)\\\)|\$([^$]*)\$/g, (_, a, b) => {
    let t = a !== undefined ? a : b;
    for (const [k, u] of Object.entries(UNI)) t = t.split(k).join(u);
    t = t
      .replace(/_\{?(\d)\}?/g, (_m, d) => SUB[d])
      .replace(/\^\{?(\d)\}?/g, (_m, d) => SUP[d]);
    const resto = t.match(/\\[a-zA-Z]+|[{}]/g);
    if (resto) console.warn(`  AVISO tema com LaTeX não traduzido: "${t}" (${resto.join(" ")})`);
    return t.replace(/\s+/g, " ").trim();
  });
}

/* ------------------------------------------------- procedência padronizada */
function padronizarOrigem(tag, pasta) {
  const t = tag.trim();
  const per = /(\d{4}\.\d)/;

  /* inventadas: só o nome da prova, sem período */
  if (/^(1º EE|2º EE|Final)$/.test(t)) return { origem: null, estilo: true };

  /* "1º EE · 2024.1 (2ª chamada)" e "2ª chamada 2º EE · 2024.1" */
  if (/2ª chamada/i.test(t)) {
    const m = t.match(per);
    return { origem: `${m[1]} · 2ª chamada`, estilo: false };
  }
  /* "Baseada no 1º EE · 2024.1" */
  if (/^Baseada/i.test(t)) {
    const m = t.match(per);
    return { origem: `Baseada em ${m[1]}`, estilo: false };
  }
  /* "Revisão 2º EE · Prof. César" */
  if (/^Revisão/i.test(t)) {
    const prof = t.split("·").pop().trim();
    return { origem: `Revisão · ${prof}`, estilo: false };
  }
  /* "Final · Banco" e "Final · Banco 2026.1" */
  if (/·\s*Banco/i.test(t)) {
    const m = t.match(per);
    return { origem: m ? `Banco · ${m[1]}` : "Banco", estilo: false };
  }
  /* "1º EE · 2023.2", "2ª Avaliação · 2023.2", "Final · 2022.2" */
  const m = t.match(per);
  if (m) {
    const provaTag = /^1º EE/.test(t)
      ? "1ee"
      : /^(2º EE|2ª Avaliação)/.test(t)
        ? "2ee"
        : /^Final/.test(t)
          ? "final"
          : null;
    /* mesma prova da pasta -> só o período; prova diferente -> diz qual */
    if (provaTag === pasta) return { origem: m[1], estilo: false };
    return { origem: `${ROTULO_PASTA[provaTag]} ${m[1]}`, estilo: false };
  }
  throw new Error(`etiqueta de procedência não reconhecida: "${t}"`);
}

/* ------------------------------------------------------- corpo: HTML -> MDX */
function corpo(html) {
  let s = html;

  /* comentários HTML são inválidos em JSX */
  s = s.replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c}*/}`);

  /* tokens renomeados no sistema visual novo */
  s = s.replace(/var\(--card-2\)/g, "var(--surface-2)").replace(/var\(--card\)/g, "var(--surface)");

  /* void tags fechadas para o JSX */
  s = s.replace(/<br\s*>/g, "<br />").replace(/<hr\s*>/g, "<hr />");

  /* figura -> componente, com a legenda isolada por linha em branco
     (senão o remark-math não processa o LaTeX dela) */
  s = s.replace(/[ \t]*<figure class="figura">([\s\S]*?)<\/figure>/g, (_, dentro) => {
    /* Desindenta: 4+ espaços no início de linha viram BLOCO DE CÓDIGO em
       Markdown. Reindenta tudo com 2 espaços, que é seguro. */
    const linhas = dentro.split("\n").filter((l) => l.trim() !== "");
    const menor = Math.min(...linhas.map((l) => l.match(/^[ \t]*/)[0].length));
    let d = linhas.map((l) => "  " + l.slice(menor)).join("\n");
    d = d.replace(
      /[ \t]*<figcaption>([\s\S]*?)<\/figcaption>/,
      (_m, leg) => `  <figcaption>\n\n${leg.trim()}\n\n  </figcaption>`,
    );
    return `\n\n<Figura>\n${d}\n</Figura>\n\n`;
  });

  /* Entidades HTML dentro da matemática: o KaTeX não as decodifica, então
     `&gt;` virava erro de parse. Usamos \gt e \lt em vez de > e <: assim o
     caractere `<` nunca aparece na fonte MDX, onde `<a` seria lido como tag
     JSX. O & é separador de coluna em vmatrix/aligned. */
  const decodificarMat = (m) =>
    m
      .replace(/&gt;/g, "\\gt ")
      .replace(/&lt;/g, "\\lt ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, "\\ ")
      /* < e > literais: o `<` em MDX começa uma tag JSX */
      .replace(/</g, "\\lt ")
      .replace(/>/g, "\\gt ");
  s = s.replace(/\\\((.*?)\\\)/gs, (_, m) => `\\(${decodificarMat(m)}\\)`);
  s = s.replace(/\$\$(.*?)\$\$/gs, (_, m) => `$$${decodificarMat(m)}$$`);

  /* \text{sen} é nome de FUNÇÃO, não texto: \operatorname dá o espaçamento
     correto (e dispensa o \, que vinha depois). Só "sen" no banco; as outras
     33 ocorrências de \text são unidades e ficam como estão. */
  s = s.replace(/\\text\{sen\}\\,?/g, "\\operatorname{sen} ");

  /* matemática: \( \) -> $ $ ; \[ \] -> bloco */
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m.trim()}$`);
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `\n\n$$\n${m.trim()}\n$$\n\n`);

  /* $$...$$ numa linha só renderiza EM LINHA, não em destaque.
     A cerca tem de ficar sozinha. */
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => `\n\n$$\n${m.trim()}\n$$\n\n`);

  /* ênfase */
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, (_, _t, m) => `**${m.trim()}**`);
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/g, (_, _t, m) => `*${m.trim()}*`);
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, (_, m) => `\`${m.trim()}\``);

  /* <ul>/<ol> simples viram lista markdown; <ol type="a"> fica cru, porque
     a letra do item é referenciada no passo a passo */
  s = s.replace(/<ul>([\s\S]*?)<\/ul>/g, (_, dentro) => {
    const itens = [...dentro.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(
      (m) => `- ${m[1].trim().replace(/\s+/g, " ")}`,
    );
    return `\n\n${itens.join("\n")}\n\n`;
  });
  s = s.replace(/<ol(?! type)[^>]*>([\s\S]*?)<\/ol>/g, (_, dentro) => {
    const itens = [...dentro.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(
      (m, i) => `${i + 1}. ${m[1].trim().replace(/\s+/g, " ")}`,
    );
    return `\n\n${itens.join("\n")}\n\n`;
  });
  s = s.replace(/<ol type="a">([\s\S]*?)<\/ol>/g, (_, dentro) => {
    const itens = [...dentro.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(
      (m) => `<li>\n\n${m[1].trim().replace(/\s+/g, " ")}\n\n</li>`,
    );
    return `\n\n<ol type="a">\n${itens.join("\n")}\n</ol>\n\n`;
  });

  /* parágrafos -> bloco separado por linha em branco */
  s = s.replace(/<p>([\s\S]*?)<\/p>/g, (_, m) => `\n\n${m.trim()}\n\n`);

  /* resto de marcação que não tem equivalente */
  s = s.replace(/<\/?div[^>]*>/g, "").replace(/<span class="q-resposta-final">|<\/span>/g, "");
  s = s.replace(/&nbsp;/g, " ");

  /* Chave literal na PROSA é expressão JavaScript em MDX: `{x}` faz o
     compilador tentar executar `x`. Escapa as que sobraram, protegendo o
     que legitimamente usa chave — matemática, comentário JSX e tags. */
  const cofre = [];
  const guardar = (m) => `\u0000${cofre.push(m) - 1}\u0000`;
  s = s
    .replace(/\$\$[\s\S]*?\$\$/g, guardar) /* fórmula em destaque */
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, guardar) /* comentário JSX */
    .replace(/<[^>]*>/g, guardar) /* tag (SVG, li, figcaption...) */
    .replace(/\$[^$\n]*\$/g, guardar); /* fórmula em linha */
  s = s.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => cofre[Number(i)]);

  /* normaliza linhas em branco e espaço no fim da linha */
  s = s
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return s;
}

/* ------------------------------------------------------------------- main  */
const arquivo = process.argv[2];
const paraStdout = process.argv.includes("--stdout");
const html = readFileSync(arquivo, "utf8");
const [, cadeira, pasta, nome] = arquivo.match(/questoes\/([^/]+)\/([^/]+)\/(q\d+)\.html/);

const tema = html.match(/data-tema="([^"]+)"/)[1];
const tags = [...html.matchAll(/<span class="q-tag">([\s\S]*?)<\/span>/g)].map((m) => m[1].trim());

const estiloTag = tags.some((t) => t === "Estilo de prova");
const semEstilo = tags.filter((t) => t !== "Estilo de prova");
const { origem, estilo } = padronizarOrigem(semEstilo[0], pasta);
const rotulo = semEstilo[1];
const pontos = semEstilo[2] ?? null;

const bloco = (re) => {
  const m = html.match(re);
  return m ? corpo(m[1]) : null;
};
const enunciado = bloco(/<div class="q-enunciado">([\s\S]*?)<\/div>\s*(?=<details)/);
const gabarito = bloco(/<details class="q-gabarito">[\s\S]*?<div>([\s\S]*?)<\/div>\s*<\/details>/);
const passos = bloco(/<details class="q-passos">[\s\S]*?<div>([\s\S]*?)<\/div>\s*<\/details>/);

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
  origem ? `origem: ${/^\d{4}\.\d$/.test(origem) ? `"${origem}"` : origem}` : null,
  `tema: ${JSON.stringify(rotuloSemLatex(rotulo))}`,
  `temaId: ${tema}`,
  pontos ? `pontos: ${pontos}` : null,
  estiloTag || estilo ? "estiloDeProva: true" : null,
].filter(Boolean);

const saida = `---
${fm.join("\n")}
---

${cabecalho(`${nome}.mdx`)}

${enunciado}

<Gabarito>
${gabarito}
</Gabarito>

<Passos>
${passos}
</Passos>
`;

if (paraStdout) process.stdout.write(saida);
else {
  const destino = `src/content/questoes/${cadeira}/${pasta}/${nome}.mdx`;
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, saida);
  console.log(`  ${destino}`);
}
