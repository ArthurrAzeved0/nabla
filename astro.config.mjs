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

/* Publicado no Cloudflare Pages, que serve na RAIZ — daí não haver `base`.
   `site` alimenta as URLs absolutas (canonical, sitemap): se estiver errado,
   o Google indexa um endereço que não existe. */
export default defineConfig({
  site: "https://nabla.pages.dev",
  trailingSlash: "ignore",

  /* Barra de ferramentas do Astro no `dev`. Nunca vai para o site
     publicado; desligada porque atrapalhava ver o rodapé.
     Para reativar só na sua máquina, sem mexer aqui:
       npx astro preferences enable devToolbar */
  devToolbar: { enabled: false },
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
