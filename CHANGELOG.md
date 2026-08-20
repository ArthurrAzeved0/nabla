<!-- **************************************************************************
     * Nabla — Guia do aluno POLI/UPE                            CHANGELOG.md *
     *------------------------------------------------------------------------*
     * Copyright © 2026  Arthur Epifanio De Azevedo                           *
     * Todos os direitos reservados.                                          *
     *                                                                        *
     * Software proprietário — ver arquivo LICENSE.                           *
     *                                                                        *
     * Autor:   Arthur Epifanio De Azevedo                                    *
     * Página:  https://github.com/ArthurrAzeved0                             *
     * Contato: arthur_azevedo05@hotmail.com                                  *
     ************************************************************************** -->
# Changelog

Todas as mudanças relevantes deste projeto. O formato segue
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento é
[semântico](https://semver.org/lang/pt-BR/).

A série **1.x** é o site original, "Responde Aí" — HTML/CSS/JS sem build. A série
**2.x** é o **Nabla**: reescrita sobre Astro + TypeScript, com nome e identidade
novos. Enquanto o Nabla não substituir o site no ar, a 2.0.0 fica em
pré-lançamento — uma tag por fase concluída da migração.

## [Não publicado]

Fase 1 — design system e identidade visual do Nabla.

## [2.0.0-alpha.1] — 2026-08-20

**Fase 0 da migração: fundação.** O site 1.x segue no ar e **intacto** — nenhum
arquivo dele foi alterado ou removido. O projeto Astro nasce ao lado.

### Adicionado

- Projeto **Astro 7 + TypeScript** em modo `strict`, com atalho `~/` para `src/`.
- Integração **MDX**, formato em que teoria e questões vão viver.
- **KaTeX renderizando no build** (`remark-math` + `rehype-katex`), no lugar do
  MathJax em runtime: o HTML já sai com a fórmula pronta.
- Casca mínima (`src/layouts/Base.astro`) e CSS base — provisórios, apenas para a
  fundação ser legível. A identidade visual entra na Fase 1.
- Página `/teste-formulas`: verificação do KaTeX com LaTeX real copiado das
  questões que já existem, para expor incompatibilidades antes da Fase 2.
- Alvo de publicação alternável por variável de ambiente: raiz no Cloudflare Pages
  (padrão) ou subpasta no GitHub Pages (`npm run build:ghpages`).
- `scripts/cabecalho.mjs`: gera e insere o cabeçalho de autoria no topo de cada
  arquivo, escolhendo a sintaxe de comentário pela extensão. Idempotente, com modo
  `--check` para verificação.
- **`LICENSE` proprietária** e `THIRD-PARTY.md` com os avisos de copyright das
  dependências MIT.
- `public/humans.txt` ([convenção humanstxt.org](https://humanstxt.org)), com
  autoria e uma dedicatória; alcançável por `<link rel="author">`.

### Alterado

- Nome do projeto: **Responde Aí → Nabla**. O anterior colidia com a marca de uma
  plataforma de exatas conhecida — risco evitável num projeto que será divulgado.
- Escopo declarado: **guia do aluno da POLI/UPE** (teoria, questões e mapa da
  grade), não apenas banco de questões.
- Licenciamento: o fluxograma da grade circulava sob GNU GPL v2. Como o autor é
  titular único, a obra foi relicenciada nos termos proprietários do `LICENSE`.

### Corrigido

- Uso da API depreciada `markdown.remarkPlugins` / `markdown.rehypePlugins`. No
  Astro 7 o processador padrão passou a ser o Sätteri, que não tem pipeline
  remark/rehype; agora o pipeline é pedido explicitamente via
  `markdown.processor: unified({ ... })` de `@astrojs/markdown-remark`.

### Notas de migração

Dois achados do teste de fórmulas, ambos **silenciosos** — não quebram o build — e
que o conversor da Fase 2 tem de tratar:

1. **Fórmula em linha:** o site 1.x usa `\( ... \)`, que o `remark-math` ignora.
   Precisa virar `$ ... $`.
2. **Fórmula de destaque:** `$$…$$` na mesma linha do conteúdo renderiza **em
   linha**, não em destaque — e o site 1.x escreve *todas* as fórmulas de destaque
   assim. A cerca `$$` tem de ficar sozinha na linha. Em fórmula de várias linhas o
   efeito é pior: o `$$` de abertura engole o texto seguinte e o KaTeX devolve
   `ParseError: Can't use function '$' in math mode`.

Por isso a verificação da Fase 2 deve **contar `katex-display`** no HTML gerado, e
não apenas procurar mensagens de erro.

### Pendente de decisão

- Host definitivo (Cloudflare Pages recomendado) e domínio.
- Aposentadoria dos arquivos do site 1.x — acontece na Fase 5, não antes.

## [1.0.0] — 2026-07-13

O site **Responde Aí** como esteve no ar: estático, sem build, publicado no GitHub
Pages. Tag retroativa — esta versão foi construída em 25 commits entre 6 e 13 de
julho de 2026, antes da adoção de changelog.

### Conteúdo

- **3 cadeiras**, com teoria completa na ordem da ementa oficial: Cálculo
  Diferencial e Integral Vetorial (Cálculo 3), Equações Diferenciais (Cálculo 4) e
  Fundamentos do Eletromagnetismo.
- **146 questões** de provas reais e listas (1º EE, 2º EE e Final), com gabarito e
  resolução passo a passo, mais figuras em SVG onde a geometria ajuda.
- Convenção didática em toda a teoria: "A ideia" em linguagem simples, caixa "O que
  é cada símbolo" por fórmula e "Exemplo rápido" resolvido com números.

### Funcionalidades

- Template único de cadeira (`curso.html?curso=<id>`) alimentado por dois registros
  centrais: `js/cursos.js` e `questoes/manifest.js`.
- Ferramentas de estudo: marcação Acertei/Errei/Revisar em `localStorage`, filtro
  por status, estatísticas de progresso, cronômetro por questão e **modo simulado**
  com sorteio, tempo regressivo e nota.
- Ligação **teoria ↔ questões** nos dois sentidos: "Ver material" em cada questão e
  "Praticar este assunto" em cada seção da teoria.
- Link direto por questão, contadores nos chips de prova e status, botão de voltar
  ao topo, tema claro/escuro.
- Fórmulas em MathJax (tex-svg) e cache-busting manual por `?v=N` nos assets.

[2.0.0-alpha.1]: https://github.com/ArthurrAzeved0/RespondeAi-Poli/releases/tag/v2.0.0-alpha.1
[1.0.0]: https://github.com/ArthurrAzeved0/RespondeAi-Poli/releases/tag/v1.0.0
