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

Fase 3 — ilhas de interatividade: marcar acertei/errei/revisar, cronômetro,
filtro por status, barra de progresso e modo simulado.

## [2.0.0-alpha.4] — 2026-08-21

Primeira ferramenta de estudo de volta, antecipada da Fase 3 porque é
independente do resto: não depende de `localStorage`, progresso nem simulado.

### Adicionado

- **Copiar o link da questão** ao clicar no número, como no site 1.x, com
  confirmação visível ("Link copiado") anunciada também por `aria-live`. Um
  único listener delegado: o script é empacotado uma vez, não 38 vezes numa
  página de 38 questões.
- A questão pisca ao copiar, e quem chega por deep-link a vê destacada via
  `:target` — sem JavaScript nenhum. Ambos respeitam `prefers-reduced-motion`.

### Corrigido

- Copiar o link falhava **silenciosamente** fora de contexto seguro. O
  `navigator.clipboard` só existe em HTTPS ou localhost; testando pela rede
  local em `http://192.168.x.x` o clique não copiava e não avisava — problema
  que o site 1.x também tinha. Agora há três níveis: `navigator.clipboard`,
  `textarea` + `execCommand`, e por último deixar o link na barra de endereço,
  dizendo isso ao usuário.
- `devToolbar` do Astro desligada: só aparecia no `dev`, mas cobria o canto do
  rodapé.

## [2.0.0-alpha.3] — 2026-08-20

**Fase 2 da migração: conteúdo tipado.** As 147 questões e a teoria das 3
cadeiras saíram de HTML escrito à mão para **MDX validado por schema**. O que
antes era convenção combinada em comentário virou contrato verificado no build.

### Adicionado

- `src/content.config.ts` com três collections (`cadeiras`, `teoria`,
  `questoes`) e schemas em zod. Erros que antes passavam calados agora param o
  build: questão sem procedência, tema fora do mapa da teoria, prova fora de
  `{1ee, 2ee, final}`.
- **Uma rota por avaliação** — `/cadeiras/<id>/<prova>`. No site 1.x os chips
  eram filtro em JavaScript, sem endereço; agora dá para compartilhar e
  favoritar "as questões do 2º EE de Cálculo 3". Os contadores continuam nos
  chips.
- Página de conteúdo por cadeira, com sumário gerado do frontmatter — no site
  1.x o sumário era HTML à mão, ao lado das seções: duas listas para manter em
  sincronia.
- Componentes de teoria: `Topico`, `Formula` (fórmula nomeada, 107 no total),
  `FigPar`, e o tipo `dica` na `Caixa`.
- `scripts/converter-questao.mjs` e `scripts/converter-teoria.mjs`: conversores
  HTML → MDX. Validados comparando a saída com 16 questões convertidas à mão.
- `scripts/verificar-conteudo.mjs` (`npm run verificar`): confere o que o
  schema não alcança — se os 147 links de "Ver material" caem numa seção que
  existe, se o sumário aponta para seção existente, se sobrou LaTeX cru e se o
  KaTeX falhou em alguma fórmula. Sai com código 1, então serve de passo de CI.
- Home montada da collection, no lugar do `js/home.js` que remontava os
  cartões no navegador a cada visita.

### Alterado

- **Etiquetas padronizadas.** O rótulo da avaliação saiu dos dados: agora é
  derivado da pasta, por uma constante única — não há como digitar "1ª
  Avaliação" num arquivo e "1º EE" noutro. As 26 variantes que existiam viraram
  6 padrões de procedência (`2023.2`, `2024.1 · 2ª chamada`, `Banco`,
  `Banco · 2026.1`, `Revisão · Prof. César`, `Baseada em 2024.1`).
- Numeração das seções da teoria padronizada em dois dígitos. `calculo3` e
  `eletromag` usavam `<span class="num">01</span>`; `eqdiferenciais` usava `1.`
  embutido no título.
- `\text{sen}` virou `\operatorname{sen}` (33 ocorrências): é nome de função,
  não texto, e o `\operatorname` dá o espaçamento correto.

### Corrigido

- **67 fórmulas que não renderizavam.** O HTML do site 1.x escrevia `&gt;` e
  `&lt;` dentro da matemática, e o KaTeX não decodifica entidade HTML.
  Convertidos para `\gt` e `\lt` — de propósito, não para `>` e `<`: numa
  fonte MDX, `r<a` seria lido como abertura de tag JSX.
- Chave literal na prosa (`bloco {R_2 em série}`) era lida como expressão
  JavaScript pelo MDX e derrubava o build. Agora é escapada, protegendo o que
  legitimamente usa chave (matemática, comentário JSX, tags).
- Comentários HTML dentro dos SVGs (265 em 65 questões) convertidos para
  `{/* */}`: `<!-- -->` é inválido em JSX.
- Indentação de 4 espaços herdada do HTML virava **bloco de código** em
  Markdown. As figuras são reindentadas em 2 espaços.
- LaTeX em rótulo de fórmula e em nome de tema aparecia literal na tela, porque
  ali o texto vira atributo e não passa pelo KaTeX. Traduzido para Unicode
  (`Δ`, `λ`, `x₀`, `x⁹`, `μ`), com aviso no console para o que não estiver na
  tabela.
- Token `--warn` (e `--warn-soft`) faltava no sistema visual — **187 usos** nas
  figuras. Adicionado como cor de destaque de diagrama, separado do `--rev`,
  que é estado de questão.
- `--card` e `--card-2`, nomes do site 1.x, convertidos para `--surface` e
  `--surface-2`.
- `<b>` e `<i>` (54 ocorrências) não eram convertidos e sobravam como JSX cru.
- Barra de ferramentas falsa no cartão de questão: os botões "Gabarito" e
  "Passo a passo" duplicavam os `<details>` reais e não faziam nada. Removida —
  as ferramentas de verdade chegam na Fase 3. O número da questão voltou a ser
  link para a própria âncora, sem depender de JavaScript.

### Notas

O conversor foi validado comparando sua saída com 16 questões que eu havia
convertido à mão: as únicas divergências eram melhorias editoriais minhas, não
erros dele. Também há 6 questões cuja procedência é de uma avaliação diferente
da pasta onde moram — isso é correto, não erro: a pasta diz **que unidade a
questão treina**, a procedência diz **de onde ela veio**. A etiqueta ganhou
`title="Procedência"` para não ficar ambíguo.

## [2.0.0-alpha.2] — 2026-08-20

**Fase 1 da migração: identidade visual.** O sistema de design do Nabla, com o
conceito de **uma identidade e dois materiais** — papel milimetrado no claro,
planta de engenharia no escuro. O escuro não é o claro invertido: planta de
verdade é traço claro sobre azul, e é isso que ele imita.

### Adicionado

- `src/styles/tokens.css` — paleta, escala tipográfica, espaçamento, raios e
  sombras, nos três estados de tema (claro; escuro por preferência do sistema;
  escuro por escolha explícita). Nenhuma cor é declarada apenas dentro de
  `@media` ou `[data-theme]`, para que os três estados sempre resolvam.
- **Dois acentos com papéis fixos:** azul de prancha para identidade (marca,
  rótulo de seção, link, "tem questões") e laranja-sinal só para ação e atenção
  (botão principal, "pode cursar"). Cores de estado (acertei/errei/revisar) ficam
  **fora** da paleta de marca, de propósito.
- A grade do papel em CSS puro — quatro gradientes empilhados, sem imagem:
  escala em qualquer tela e muda de cor junto com o tema.
- Componentes: `Marca`, `Regua` (régua de cota), `Caixa` (símbolos / exemplo /
  macete), `Etiqueta`, `Questao`, `NoGrade` e `BotaoTema`.
- Alternador de tema com três estados (automático → claro → escuro), com o tema
  aplicado inline no `<head>` antes da primeira pintura, para a página não piscar.
- Vitrine do sistema em `/`, com conteúdo real das cadeiras.
- Atalho `npm run dev:rede`, que expõe o servidor de desenvolvimento na rede
  local para testar em outros aparelhos.
- `public/_headers` com `Content-Type` e política de cache. Os assets em
  `/_astro/` têm hash no nome, então podem ser `immutable` — isso substitui o
  `?v=N` manual que o site 1.x precisava.

### Alterado

- **Fontes auto-hospedadas** (`@fontsource`) em vez de Google Fonts. O
  `humans.txt` declara "sem rastreadores", e a folha do Google entregaria o IP de
  cada visitante a um terceiro. Verificado: o HTML e o CSS gerados não têm
  nenhuma URL externa. De quebra, funciona offline.
- `humans.txt`: seção de tecnologia reescrita no formato da convenção
  (padrões, linguagem, componentes, tipografia), sem linguagem subjetiva — o
  tom pessoal fica restrito à dedicatória.

### Corrigido

- **Contraste de texto.** A grade fina de 8&nbsp;px passava atrás das letras e
  comia o contraste percebido. O texto corrido subiu de 5,38:1 para 7,75:1 no
  claro e de 7,35:1 para 9,48:1 no escuro, e a grade fina foi atenuada (a forte,
  de 48&nbsp;px, ficou intacta para não perder a assinatura). Ao medir,
  apareceram **duas reprovações de WCAG AA** que passaram batido: rótulos e
  legendas a 2,75:1 no claro (agora 5,03) e 4,12:1 no escuro (agora 5,93), e o
  laranja de ação a 4,00:1 (agora 4,89). Nenhum par reprova mais.
- **Acentos do `humans.txt` quebrados no navegador.** O arquivo sempre esteve em
  UTF-8; o servidor mandava `Content-Type: text/plain` sem `charset`, e o
  navegador caía num encoding legado (`ção` virava `Ã§Ã£o`). Resolvido em duas
  camadas: BOM UTF-8 no arquivo, que funciona em qualquer host — inclusive no
  GitHub Pages, que não permite configurar cabeçalho — e a declaração explícita
  de `charset` no `_headers`, lido pelo Cloudflare Pages.
- Erro de tipo em `Caixa.astro`: indexação de objeto sem tipo declarado.

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

[2.0.0-alpha.4]: https://github.com/ArthurrAzeved0/RespondeAi-Poli/releases/tag/v2.0.0-alpha.4
[2.0.0-alpha.3]: https://github.com/ArthurrAzeved0/RespondeAi-Poli/releases/tag/v2.0.0-alpha.3
[2.0.0-alpha.2]: https://github.com/ArthurrAzeved0/RespondeAi-Poli/releases/tag/v2.0.0-alpha.2
[2.0.0-alpha.1]: https://github.com/ArthurrAzeved0/RespondeAi-Poli/releases/tag/v2.0.0-alpha.1
[1.0.0]: https://github.com/ArthurrAzeved0/RespondeAi-Poli/releases/tag/v1.0.0
