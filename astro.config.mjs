/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                        astro.config.mjs *
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
// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/* ==========================================================================
   Alvo de publicação.

   O caminho base muda conforme o host:
     - Cloudflare Pages serve na RAIZ            -> base "/"
     - GitHub Pages serve em SUBPASTA do repo    -> base "/RespondeAi-Poli"

   Padrão: cloudflare. Para gerar a versão do GitHub Pages:
       npm run build:ghpages
   ========================================================================== */
const ALVOS = {
  cloudflare: { site: "https://nabla-poli.pages.dev", base: "/" },
  ghpages: { site: "https://arthurrazeved0.github.io", base: "/RespondeAi-Poli" },
};

const alvo = ALVOS[process.env.DEPLOY_TARGET ?? "cloudflare"] ?? ALVOS.cloudflare;

export default defineConfig({
  site: alvo.site,
  base: alvo.base,
  trailingSlash: "ignore",
  integrations: [mdx()],
  markdown: {
    /* O processador padrão do Astro 7 é o Sätteri, que não tem remark/rehype.
       Como precisamos de remark-math + rehype-katex, pedimos explicitamente o
       pipeline unified.

       Fórmulas: $...$ em linha, $$...$$ em destaque (cerca sozinha na linha
       quando a fórmula tem mais de uma linha — ver src/pages/teste-formulas.mdx).

       O KaTeX roda no BUILD: o HTML já sai com a fórmula pronta, sem esperar
       script nenhum no navegador. Era o papel do MathJax no site antigo. */
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false }]],
    }),
    shikiConfig: { theme: "github-dark-dimmed", wrap: true },
  },
});
