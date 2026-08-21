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
novos. As `2.0.0-alpha.*` são as fases da migração, uma tag por fase; a `2.0.0`
é a virada, quando o Nabla passou a ser o site no ar.

## [Não publicado]

### Corrigido

- **A cadeira de Dinâmica estava montada da ementa errada.** Eu usei a de
  *Mecânica Geral 2 (MEC02)*, do curso de Mecânica Industrial — o documento
  cujo rodapé ainda diz "MEC01". A ementa vigente é a de **DINÂMICA**:
  pré-requisito Estática, co-requisito Equações Diferenciais (que é
  exatamente o que os nós das matrizes de 2021 dizem), e bibliografia com o
  Hibbeler 14ª ed. A cadeira passa a se chamar só **Dinâmica**, com a
  descrição e a estrutura tiradas do documento certo.
- Isso também **resolveu a divergência** que eu tinha registrado entre ementa
  e prova. O conteúdo programático real tem cinco itens, e o **item 2 é
  "dinâmica de um ponto material: equações de movimento e forças de
  vínculo"**, logo depois da cinemática — leis de Newton *são* matéria do
  1º EE. Não era a prova fugindo da ementa; era eu com a ementa antiga.

### Adicionado

- **Cinco seções de teoria**, fechando os dois primeiros itens do conteúdo
  programático: componentes normal e tangencial (com raio de curvatura),
  coordenadas polares, equações do movimento e a 2ª lei, forças de vínculo e
  atrito, e movimento circular.
- **Quatro questões do 1º EE** que a teoria nova destravou: velocidade mínima
  no topo da circunferência, bloco sobre suporte móvel com atrito, ângulo de
  repouso na rampa e raio de curvatura do jato d'água. São **8 questões** de
  Dinâmica agora.
- As unidades da teoria passam a ter o nome do conteúdo programático —
  "Cinemática do ponto material" e "Dinâmica do ponto material" — em vez de
  "1ª/2ª Unidade".
- **A teoria de Dinâmica ficou completa: 29 seções**, cobrindo os cinco itens
  do conteúdo programático. As 17 novas vêm em três unidades:
  - *Trabalho e energia* — trabalho de uma força (constante, peso, mola e
    força variável), princípio do trabalho e energia cinética, energia
    potencial, conservação da energia mecânica e potência com eficiência.
  - *Impulso e momento linear* — impulso e momento, conservação num sistema de
    partículas, colisão central direta com coeficiente de restituição,
    colisão oblíqua na linha de impacto, e momento angular sob força central.
  - *Movimento plano do corpo rígido* — translação e rotação de eixo fixo,
    análise de velocidade relativa, centro instantâneo de rotação, análise de
    aceleração relativa, momento de inércia com eixos paralelos, equações do
    movimento plano e o teorema da energia com a parcela de rotação.

## [2.11.0] — 2026-08-21

### Alterado

- **A home usa a largura da página**, como os mapas e o índice das grades já
  usavam. Estava presa na coluna de leitura: quatro cadeiras apertadas no meio
  da tela, com a quarta caindo sozinha na linha de baixo, e margem vazia dos
  dois lados. Agora as quatro cabem numa fileira, e a grade de cartões vai
  enchendo à medida que entram cadeiras.
- **As cadeiras aparecem em ordem alfabética**, na home e na 404.

### Removido

- **O campo `ordem` da collection `cadeiras`.** Era um número escrito à mão que
  precisava ser renumerado a cada cadeira nova, e obrigava a uma decisão sem
  critério — "por que Cálculo 3 antes de Eletromagnetismo?". Alfabético não tem
  essa dúvida e não tem manutenção. O `getStaticPaths` da página de cadeira
  também perdeu a ordenação, que não aparecia em lugar nenhum.

## [2.10.0] — 2026-08-21

**Dinâmica entra no site.** Quarta cadeira, e a primeira que acende nós em
**oito** dos dez mapas de grade.

### Adicionado

- **Cadeira `dinamica` — Dinâmica (Mecânica Geral 2), MEC02.** Registrada com
  19 temas apontando para as seções da teoria.
- **Teoria da 1ª unidade**, sete seções na ordem da ementa oficial do MEC02:
  análise vetorial, movimento retilíneo, aceleração variável nos três casos
  (`a = f(t)`, `a = f(v)`, `a = f(s)`), movimento dependente por cabos,
  movimento relativo, movimento curvilíneo em coordenadas retangulares e
  movimento de projétil.
- **Quatro questões do 1º EE**, das provas de 2022.1 e da 2ª chamada, com
  gabarito e resolução passo a passo — as que a teoria já publicada cobre.
- **Ligação com as grades.** Dinâmica (ou Mecânica Geral 2, o nome antigo)
  existe em oito das dez matrizes mapeadas, e agora todas elas abrem a página
  da cadeira a partir do nó: Civil 2021 e 2011, Automação 2021 e 2010,
  Mecânica 2021 e 2012, Elétrica Eletrônica 2020 e Telecomunicações 2021.
- `public/curso.html` passa a conhecer a cadeira nova, e o teste da ponte
  cobre isso: cadeira no conteúdo sem entrada na ponte quebra o `npm test`.

### Em andamento

O material que ele mandou tem 25 PDFs e 11 imagens. Nove arquivos têm texto
extraível; **catorze são escaneados ou foto — cerca de 70 páginas** que só se
leem como imagem, incluindo gabaritos manuscritos e provas fotografadas.
Faltam a teoria da 2ª unidade (cinética, energia, corpos rígidos) e as
questões dos 2º EE, da final e das listas.

## [2.9.0] — 2026-08-21

### Adicionado

- **`manifest.webmanifest`.** `icone-192.png` e `icone-512.png` eram arquivo
  morto — ninguém os referenciava. É o manifesto que faz o Android oferecer
  "adicionar à tela inicial" e que diz com que cor pintar a tela enquanto o
  site abre. Declarados sem `maskable`: as pontas do ∇ ficam fora do círculo
  de 80% que uma máscara circular preserva.
- Content-Type do manifesto no `public/_headers`: sem ele, o navegador ignora
  o arquivo em silêncio.

### Alterado

- **Os ícones de tela inicial perderam a placa azul.** O traço já tinha
  afinado na 2.1.1, mas o que se via ainda era a etiqueta azul de destaque.
  Agora o fundo é o **papel escuro do site**, com o ∇ no tom claro — o ícone
  da tela inicial virou o site. Fundo continua havendo, e não é por contraste
  com o tema: ícone de lançador cai sobre papel de parede que ninguém
  controla, e o iOS ainda preenche de preto o que for vazado em
  `apple-touch-icon`. Também saiu o canto arredondado, que iOS e Android
  desenham por cima do nosso.
- **O cartão de prévia ganhou moldura.** Cartão escuro sem borda, no painel do
  GitHub em tema escuro, parece uma caixa vazia. A linha fina garante um
  limite visível em qualquer chrome.

## [2.8.0] — 2026-08-21

**Telecomunicações, as duas matrizes, e o cartão de prévia.** Dez mapas no ar,
cinco cursos — 645 disciplinas e 646 requisitos.

### Adicionado

- **Mapa da grade de Engenharia Elétrica de Telecomunicações, matriz 2021**:
  67 componentes e 72 requisitos, da revisão de 2021 do projeto pedagógico.
- **Mapa da grade de Engenharia de Telecomunicações, matriz 2010**: 65
  disciplinas e 67 requisitos. **É o PPC que mais fecha de todos os dez
  lidos**: os três ciclos resolvem sem ambiguidade nenhuma, cada área das
  tabelas casando exatamente com as disciplinas pelo nome — inclusive a área
  "Circuitos Elétricos, 240h", que em Eletrônica 2012 ficou faltando uma.
- **Consulta do SIGA como fonte de códigos.** Ele mandou uma consulta ao
  perfil `EL03-1`, com código, CH e período de cada componente. Aquela matriz
  não é nenhuma das duas mapeadas — tem 4155h — mas serve de fonte para o
  registro compartilhado, e rendeu bem mais que Telecom: **Eletrônica 2012
  saiu de 31 para 44 códigos**, Eletrônica 2020 de 31 para 39, e Telecom 2021
  nasceu com 45.
- **Cartão de prévia dos links**, `public/social-card.png`, 1280×640 gerado de
  `arte/social-card.html` pelo Chrome headless. Serve de prévia do
  repositório no GitHub e de `og:image` do site — agora todo link
  compartilhado no WhatsApp, Telegram, Discord ou Twitter abre com cartão.
  As fontes vão embutidas em base64, então o cartão sai igual em qualquer
  máquina, sem depender do que está instalado nela.
- `og:` e `twitter:card` no `Base.astro`. A URL da imagem tem de ser
  absoluta — caminho relativo é ignorado por todos —, e é para isso que
  `site` existe no `astro.config.mjs`.

### Alterado

- `npm run cabecalhos` passa a conferir `arte/` e o `README.md` também.

## [2.7.0] — 2026-08-21

**Engenharia Elétrica Eletrônica, as duas matrizes.** Oito mapas no ar, quatro
cursos — 513 disciplinas e 507 requisitos.

### Adicionado

- **Mapa da grade de Engenharia Elétrica Eletrônica, matriz 2020**: 66
  componentes e 66 requisitos. A Tabela 6 desse PPC marca cada componente com
  o **núcleo** e com a **dimensão** (ensino ou extensão), e é aí que está a
  pegadinha das contas: a CH das componentes de extensão sai do núcleo e vai
  para o balde da Extensão. Somando as EXT de volta, os três núcleos fecham
  nos números da Tabela 1.
- **Mapa da grade de Engenharia Eletrônica, matriz 2012**: 66 componentes e 69
  requisitos, de quando o curso se chamava só **Engenharia Eletrônica**. As
  duas aparecem juntas sob o nome novo, como as de Mecânica.
- A Tabela 11 do PPC de 2012 tem o formato mais legível dos oito documentos
  lidos: cada disciplina traz `Pré-req:` e `Co-req:` escritos **por nome**, em
  linhas próprias, sem coluna estreita para quebrar.

### Alterado

- **README atualizado.** Dizia "1 mapa de grade" e descrevia a publicação pelo
  painel da Cloudflare com `wrangler deploy`, que saiu na 2.0.0 — agora
  descreve o GitHub Actions, os segredos que ele usa, e ganhou uma seção sobre
  o gerador das grades: que ele confere a transcrição contra os números do
  próprio PPC e aborta sem gravar se alguma conta não fecha, e como funciona a
  herança de códigos por nome.

### Corrigido

- No PPC de 2020, Princípios de Comunicações tem como pré-requisito
  **Antenas**, que é uma *eletiva*: componente obrigatória não pode depender de
  eletiva, e a aresta apontaria para fora da matriz. Descartada, com nota no nó.
- Ainda nele: Metodologia Científica pede "Port" (truncado, é Português
  Instrumental), Engenharia de Segurança lista dois pré-requisitos sem
  separador, e Instalações Elétricas pede "Circuitos 2".

## [2.6.0] — 2026-08-21

**Cruzamento de códigos entre os cursos.** A matriz de Mecânica 2021 saiu de
nenhum código para 44.

### Adicionado

- **Registro compartilhado de códigos.** Um PPC pode não publicar código
  nenhum — o de Mecânica 2021 diz que eles "são gerados automaticamente pelo
  sistema de gestão acadêmica - Siga" e não os lista. Mas a mesma disciplina
  aparece noutro curso, e lá o código está escrito: Química é `QUIM0002` tanto
  em Automação quanto em Mecânica Industrial. Agora as grades sem código
  herdam por nome das que têm, e **44 das 59 disciplinas** de Mecânica 2021
  ganharam código de verdade.

  Três regras impedem que isso vire chute:

  1. **Só o registro atual da UPE.** `MATM0018` e `PFC00001` entram; os
     códigos curtos dos PPCs antigos (`MAT01`, `ECA10`, `INF01`) não — são
     locais de cada curso e de cada época, e `MAT01` quer dizer coisas
     diferentes em documentos diferentes.
  2. **Nome com códigos divergentes não herda nada.** Isso acontece de
     verdade: Resistência dos Materiais é `MCTR0005` em Automação e
     `RMAT0001` em Mecânica, porque cada pleno registra o seu componente. Só o
     que é unânime passa — e o código da **outra matriz do mesmo curso** tem
     prioridade sobre o de outro curso.
  3. **Estágio, PFC e atividades complementares só herdam do próprio curso.**
     São componentes administrativos, registrados por pleno. Foi essa regra
     que impediu o PFC de Mecânica de receber o código do PFC de Automação.

- Singular e plural caem na mesma chave, e as abreviações das tabelas também:
  "Máquina de Elevação" acha "Máquinas de Elevação", e "Complementos de
  Matemática" acha "Complementos da Matemática".
- O gerador **lista quem ficou sem código**, em vez de só contar. São 15 em
  Mecânica 2021 e 15 em Automação 2021 — as que nasceram no perfil novo e não
  existem em nenhum outro curso mapeado.

## [2.5.0] — 2026-08-21

**Engenharia Mecânica, as duas matrizes.** Seis mapas no ar, três cursos.

### Adicionado

- **Mapa da grade de Engenharia Mecânica, matriz 2021.1**: 64 disciplinas e
  66 requisitos. É o PPC de melhor estrutura dos cinco lidos até aqui — a
  Tabela 7 traz área, pré, correquisito, tipo, período e CH de uma vez, e a
  matriz sequencial repete tudo com uma coluna a mais, o **núcleo** de cada
  disciplina, o que dispensa reconstruir a categoria a partir de somas.
- **Mapa da grade de Engenharia Mecânica, matriz 2012**: 64 disciplinas e 53
  requisitos, de quando o curso se chamava **Engenharia Mecânica
  Industrial**. As duas aparecem juntas sob "Engenharia Mecânica": é o mesmo
  curso, renomeado.
- Nesse PPC de 2012 a Tabela 18 diz o ciclo de cada disciplina **pela cor da
  célula** — laranja é básico, verde é específico, o resto é essencial. Cor
  não sai no `pdftotext`; foi preciso ler as páginas como imagem. As três
  cores somam 1515h, 1200h e 885h, exatamente o que a Tabela 13 declara.
- Conferência da **CH que libera o PFC**: o PPC de 2021 imprime a conta feita
  (80% de 3.600h = 2.880h), então ela é checada como as outras.

### Alterado

- **`estagioFracao` virou opcional.** O PPC de Mecânica Industrial não publica
  piso de carga horária para o estágio: ele é liberado por pré-requisito. Onde
  não há regra, o mapa não mostra régua de porcentagem — pôr 0.6 "por
  analogia" com os outros cursos inventaria uma exigência que não existe.
- **O rótulo da régua de CH segue a disciplina marcada**, em vez de dizer
  sempre "Estágio". Em Engenharia Mecânica quem exige 80% do curso
  integralizado é o **Projeto Final de Curso**, e é isso que o mapa diz.
- O gerador aceita declarar um **co-requisito recíproco** esperado. Ele é
  quase sempre erro de transcrição, e a checagem continua valendo para todos
  — mas em Mecânica Industrial, Economia Empresarial e Gestão da Qualidade
  são co-requisito uma da outra de propósito, e as duas linhas do PPC dizem
  isso.

### Corrigido

- No PPC de Mecânica Industrial, Física 2 e Mecânica Geral 1 apontam para
  "FIS01", código do registro antigo da UPE que não existe naquela matriz; o
  real é FISC0011, Física 1.
- No de 2021, Cálculo Vetorial aparece como correquisito de si mesma, e
  Elementos de Máquinas 2 como pré-requisito de si mesma na sequencial (a
  Tabela 7 diz Elementos de Máquinas 1, que é o encadeamento real).

## [2.4.0] — 2026-08-21

**A página larga passou a ser larga de verdade.** O `largura="ampla"` nunca
tinha largado nada; a barra do topo virou a mesma em todas as abas.

### Corrigido

- **`largura="ampla"` não fazia efeito nenhum.** `.pagina` traz
  `margin: 0 auto` e o `<body>` é uma coluna flex — e margem automática no eixo
  transversal **desliga o `stretch` do item flex**. Sem largura explícita, o
  `<main>` deixava de ocupar a linha e passava a abraçar o próprio conteúdo:
  710px, a coluna de leitura mais o padding, sempre, em qualquer janela. Um
  `width: 100%` em `.pagina` resolve.
- Isso era também **a causa raiz do transbordo horizontal do mapa da grade**,
  aberta desde a Fase 5: como o `<main>` abraçava o conteúdo, ele esticava até
  os ~2100px do mapa e a página inteira rolava para o lado, e o
  `rolagem.clientWidth` media ~2080 em vez da janela. Medido agora numa janela
  de 1366: `main` 1351px, `rolagem.clientWidth` 1303px, documento sem
  transbordo. A blindagem que limitava a medida pela janela continua no lugar,
  agora como cinto e suspensório.
- No mapa, o parágrafo de ajuda saía **"aqui no site.No celular"** em telas de
  toque: o compilador come o espaço em branco entre o texto e a tag seguinte.

### Alterado

- **A barra do topo e o rodapé são sempre largos**, em toda página. Enquanto
  seguiam a `largura` do conteúdo, a mesma barra aparecia recuada na aba
  Cadeiras e rente à janela na aba Grade — a moldura do site mudando de lugar
  ao trocar de aba.
- O índice de `/grade/` ganhou **duas grades encaixadas**: os cursos lado a
  lado e, dentro de cada um, as suas matrizes lado a lado. Com dois cursos de
  duas matrizes dá um bloco 2×2 que enche a linha, em vez da coluna de quatro
  cartões empilhados no meio da tela.
- Texto de abertura do índice enxugado: era um parágrafo de cinco linhas
  explicando o que os selos dos cartões já dizem.
- No mapa, a nota das setas passa para a linha inteira, embaixo da legenda.
  Ela ia para a direita com `margin-left: auto`, o que funcionava enquanto a
  página era estreita; larga de verdade, ficava sozinha na outra ponta.

## [2.3.0] — 2026-08-21

**O perfil antigo de Civil**, e o índice das grades passando a usar a página
inteira.

### Adicionado

- **Mapa da grade de Engenharia Civil, matriz 2011**: 60 disciplinas e 60
  requisitos, do projeto pedagógico de 2011. São quatro mapas no ar agora —
  dois cursos, cada um com o perfil atual e o anterior.
- Conferência da **CH que libera o estágio**: este PPC imprime a conta feita
  ("60% da carga horária total do curso, ou seja, 2.322 horas"), então o
  script confere que o total e a fração transcritos dão o mesmo número.

### Alterado

- **O índice em `/grade/` usa a largura da página**, como os mapas já usavam.
  Estava preso na coluna de leitura, com os cartões apertados no meio e a
  tela vazia dos dois lados.
- **Índice agrupado por curso**, com um bloco por curso e um cartão por
  matriz. Numa lista solta o nome do curso aparecia duas vezes e a matriz —
  a única diferença entre os dois cartões — era a última coisa que se lia.
  Agora o cartão começa pelo selo **atual**/**anterior** e pelo número de
  disciplinas, que é o que se compara.
- Na página de uma matriz, o link para a **matriz irmã** aparece mesmo quando
  a grade não tem observação escrita: quem cai no perfil errado precisa da
  porta para o outro de qualquer jeito.

## [2.2.1] — 2026-08-21

### Alterado

- A cadeira **Fundamentos do Eletromagnetismo** passa a ser rotulada
  **"FÍSICA 2"**, que é como ela se chamava antes de a matriz de 2021 lhe dar
  o nome atual. Não era erro o rótulo anterior — é que "Física 2" é o nome
  pelo qual ela circula, e é o que aparece nos dois mapas de grade de
  Automação. O grafo da matriz de 2010 confirma qual é qual: o laboratório de
  Eletricidade Aplicada é co-requisito de Física 2, e Circuitos Elétricos 1 e
  Eletromagnetismo 1 a têm como pré-requisito. Física 3, nas duas matrizes, é
  ondulatória e termodinâmica.

## [2.2.0] — 2026-08-21

**A matriz de 2010 de Automação**, o perfil antigo, que ainda vale para quem
ingressou até 2020. Dois perfis do mesmo curso no ar ao mesmo tempo.

### Adicionado

- **Mapa da grade de Controle e Automação, matriz 2010.1**: 64 disciplinas e
  60 requisitos, do PPC de 2010. A fonte é um `.doc`, e sendo tabela de
  verdade — não linhas de um PDF — a **Tabela 18** dá código, nome, pré e
  co-requisito e CH por período, tudo de uma vez.
- Campo opcional `observacao` na collection `grade`: uma linha abaixo do
  título dizendo a quem a matriz se aplica. É o que faltava para duas
  matrizes do mesmo curso não se confundirem.
- Na página de uma matriz, **link para as outras matrizes do mesmo curso**.
  Quem cai na errada precisa de uma porta para a outra, não de voltar ao
  índice para descobrir que ela existe.
- No índice, selo **atual** / **anterior** quando um curso tem mais de uma
  matriz. Qual é a mais nova sai da ordenação das próprias matrizes do curso,
  sem campo novo no dado.
- **Conferência por período** no gerador: a soma de cada período contra o
  total que o PPC imprime para ele. É a checagem mais forte que existe aqui,
  porque uma CH digitada errada aparece na soma do período dela e em nenhuma
  outra. São 10 contas a mais por grade — 17 por grade, no total.

### Alterado

- `sigla` da grade passa a aceitar hífen, para `automacao-2010` poder existir
  ao lado de `automacao`.
- `scripts/extrair-grade-ppc.mjs` virou registro de várias grades:
  `node scripts/extrair-grade-ppc.mjs <sigla>` ou `--todas`. O que cada PPC
  chama de "obrigatórias" mudou de documento para documento — a Tabela 5 de
  2021 não lista Atividades Complementares e a Tabela 18 de 2010 lista — então
  cada grade declara o próprio recorte.

### Corrigido

- No PPC de 2010, Administração tem pré-requisito "ECN01", código que não
  existe na matriz; o real é ECM01, Engenharia Econômica. Mesmo tipo de erro
  do `FIS02` de Civil, e registrado do mesmo jeito: no script, com nota no nó.

## [2.1.1] — 2026-08-21

### Alterado

- **O ícone da guia perdeu a placa colorida e o traço afinou** de 4,2 para 2,6
  (em 32 de viewBox). Na fileira de guias, o que se via antes era um quadrado
  azul, não o nabla. Sem placa o traço pode afinar, porque não precisa mais
  vencer um fundo próprio — e 2,6 é exatamente o peso do ∇ do cabeçalho
  (2 em 24), então a guia e a marca do site passaram a ser o mesmo desenho.
  A 16px o traço antigo cobria 29,2% do quadro; o novo cobre 18,6%, com o
  vazado bem aberto.
- Sem placa, o contraste passa a depender da barra de guias: a cor do ícone
  agora segue `prefers-color-scheme` — o destaque do tema claro numa barra
  clara, o do escuro numa escura. É o tema do **sistema**, não o do site: a
  guia é do navegador, não da página.
- `public/icone-app.svg` passa a ser a fonte dos ícones de tela inicial, e é o
  único lugar onde a placa sobreviveu — ali ela não é recurso de contraste: o
  iOS não respeita transparência em `apple-touch-icon` e preenche de preto o
  que for vazado. O ∇ deles também afinou.

## [2.1.0] — 2026-08-21

**A grade de Automação.** A segunda grade do site — e a primeira montada a
partir de um PPC em PDF, não de um mapa que já existia.

### Adicionado

- **Mapa da grade de Engenharia de Controle e Automação**, matriz 2021.1: 64
  disciplinas e 71 requisitos, montado a partir do PPC do curso. É a segunda
  grade do site, e não exigiu código novo — só o YAML.
- `scripts/extrair-grade-ppc.mjs`, que gera a grade a partir da matriz
  transcrita do PPC e **confere a transcrição contra os totais que o próprio
  PPC publica**: CH por núcleo (1425h / 705h / 1470h), carga de extensão
  (510h), total das obrigatórias (3300h), e a coerência do grafo — requisito
  inexistente, requisito em período posterior, co-requisito recíproco. Se
  alguma conta não fecha, ele aborta sem gravar. Um erro de digitação numa
  carga horária deixa de ser um número errado no site.
- Índice dos mapas em **`/grade/`**. Com um curso só, a aba "Grade" no topo
  podia apontar direto para Civil; com dois, esse atalho passaria a esconder
  um deles.

### Alterado

- A aba "Grade" no topo agora vai para `/grade/`, não para `/grade/civil/`.
- No cabeçalho do mapa, a carga horária da matriz só é comparada à do curso
  quando as duas diferem. Em Automação a matriz cobre o curso inteiro, e
  "3600h de um curso de 3600h" só fazia reler a frase.


## [2.0.0] — 2026-08-21

**A virada.** O Nabla substituiu o site 1.x e está no ar em
<https://nabla-poli.pages.dev>. Esta é a primeira versão da série 2 que não é
pré-lançamento.

O que mudou, em uma frase: o site saiu de HTML escrito à mão, servido da raiz
de um repositório, para conteúdo tipado e validado no build, compilado e
publicado a cada push.

### Adicionado

- **Publicação no Cloudflare Pages** pelo GitHub Actions, com `astro check`,
  os testes, o build e `npm run verificar` rodando antes. Conteúdo com link de
  teoria apontando para o vazio, ou fórmula que o KaTeX não lê, não chega ao ar.
- `public/curso.html`, que traduz os endereços do formato antigo
  (`curso.html?curso=calculo3#calculo3-1ee-01`) para a rota atual, preservando
  a âncora — links guardados por alguém continuam chegando na questão certa.
- Página **404** com as cadeiras, as provas de cada uma e as grades: quem cai
  ali veio de link antigo ou digitou errado, e precisa de um caminho.
- Ícones do site: `favicon.svg`, `.ico` de reserva, `apple-touch-icon` e os
  192/512 para a tela inicial do celular.
- `npm run formulas`, que procura LaTeX que compila mas renderiza apertado.

### Alterado

- Nome, endereço e casa: **Responde Aí** → **Nabla**, de
  `arthurrazeved0.github.io/RespondeAi-Poli/` para `nabla-poli.pages.dev`,
  do GitHub Pages servindo a raiz do repositório para o Cloudflare compilando
  o `dist/`. Isso também tirou o código-fonte do ar: no modo antigo o Pages
  entregava a árvore inteira, `src/` e `package.json` inclusive.
- Os 162 arquivos do site 1.x foram aposentados. A tag `v1.0.0` guarda todos.
- `trailingSlash: "always"`, para o que o site gera ser o que o host serve — sem
  isso cada navegação gastava um redirecionamento 308.

### Corrigido

Achados testando no aparelho, depois da virada:

- **O favicon nunca funcionou.** O gerador de cabeçalho escrevia uma linha de
  hífens, e comentário XML não pode conter `--`: o SVG era mal formado e o
  navegador se recusava a renderizá-lo, desde a Fase 0.
- **As setas do mapa não apareciam**, e depois **sobrava barra de rolagem com o
  mapa já ajustado.** A segunda era `transform: scale()`, que afeta só a
  pintura — o mapa continuava ocupando os ~2100px originais no layout.
- **A página passava da largura da janela** na grade. Contido por limite duplo:
  a escala do mapa passa a considerar também `documentElement.clientWidth`, que
  não depende de ancestral nenhum.
- **Fórmulas que compilavam e saíam apertadas**: `\frac` com expoente nos dois
  termos, rótulo largo sobre `=`, e 16 fórmulas longas em linha que estouravam
  a coluna porque matemática em linha não quebra.
- O rodapé parava no meio da tela em página curta.
- A home repetia a grade, que já tem aba própria.
- Química entrou como pré-requisito de Fundamentos de Geologia: o PPC cita um
  código que não existe na matriz, e a disciplina aparecia liberada desde o
  primeiro período.

### O que fica para depois

Mais cadeiras, e as grades dos outros cursos da POLI — a collection já é
plural, então cada curso novo é um arquivo, sem código.

## [2.0.0-alpha.7] — 2026-08-21

Correções do mapa da grade, todas encontradas testando no aparelho.

### Corrigido

- **As setas não apareciam.** O mapa de cartões era montado com
  `raiz.querySelectorAll`, que pega os do quadro *e* os da lista. A lista vem
  depois no DOM e sobrescrevia as entradas; estando `display:none`, devolvia
  offset zero, e as 61 setas eram desenhadas de `(0,0)` a `(0,0)`. Sem erro no
  console, sem nada apontando a causa.
- **Setas voltaram a ter a cor da disciplina de origem**, como no fluxograma
  original. Era o que permitia seguir uma linha específica no meio de 61, e eu
  tinha reduzido tudo a uma cor só. Paleta de 12 tons com valores próprios
  para o papel e para a planta escura; um marcador de ponta por tom, porque
  marcador não herda o `stroke` de quem o referencia.
- Peso das setas em repouso baixado para 0,34 de opacidade: a informação
  principal do mapa são os cartões, e 61 arestas em peso cheio viram rabisco.
  No hover a cadeia acende e o resto quase desaparece. No PDF elas voltam ao
  peso cheio, porque no papel não há hover.
- **Moldura branca no PDF.** A página do jsPDF nasce branca e a imagem escura
  era colada com margem. Agora a página é pintada com a mesma cor da captura,
  e o tom do texto do cabeçalho vem da luminância dela.
- Cabeçalho do PDF dizia "matriz civil": passava-se a sigla no lugar do campo
  `matriz`, que faltava na interface `Grade` — por isso não aparecia como erro
  de tipo.

### Adicionado

- `testes/setas.test.mjs`: injeta o `cartao()` e verifica a geometria de
  verdade — que cada caminho sai da borda direita da origem, encosta na
  esquerda do destino, que nenhum colapsa em zero, que o co-requisito sai
  tracejado e que dois caminhos do mesmo cartão saem em alturas diferentes. É
  a checagem que teria pegado o primeiro bug sozinha.
- Aviso, só em telas de toque, de que o modo lista mostra os requisitos
  escritos: no celular ele lê melhor que o mapa, e lá o hover não existe.

## [2.0.0-alpha.6] — 2026-08-21

**Fase 4 da migração: o mapa da grade dentro do site.** Por ora só
Engenharia Civil; os outros cursos entram depois da Fase 5 e não pedem código
novo, só mais um arquivo.

### Adicionado

- Collection `grade`, com **o grafo validado no build**. Um pré-requisito
  apontando para código inexistente era, antes, uma seta que simplesmente não
  aparecia — sem erro, sem aviso. Agora para o build e diz qual disciplina
  aponta para o quê. Também pega disciplina que é requisito de si mesma.
- Rota `/grade/civil`: as 65 disciplinas em 10 colunas de período, com
  roteamento das setas em ângulo reto (cada uma na sua pista, como no mapa do
  PPC), modo lista para telas estreitas, marcar concluída, destaque da cadeia
  no hover, zoom e exportação em PDF.
- Campo `cadeira` na grade: **a ligação que o fluxograma solto não tinha.** O
  nó da disciplina abre a página dela aqui no site quando ela existe — hoje
  MAT20, MAT21 e FIS12.
- `scripts/extrair-grade.mjs`, para não transcrever 65 disciplinas e 61
  arestas à mão. Emite o cabeçalho de autoria, então sobrevive a uma
  reextração quando o PPC mudar.
- 18 casos em `npm test` cobrindo as regras da matriz (pré, co-requisito,
  regra de CH do estágio, cadeia). Errar o "pode cursar" é pior que não ter o
  mapa, porque o aluno confia na resposta.
- Navegação entre **Cadeiras** e **Grade** no topo, com a seção atual marcada.

### Alterado

- **As libs de PDF viraram import dinâmico.** No arquivo solto, html-to-image
  e jsPDF vinham embutidas: 400 dos 416 KB. Agora a página do mapa carrega
  **9,9 KB** de JavaScript, e os 391 KB do jsPDF só chegam se alguém clicar
  em exportar.
- `style.zoom` virou `transform: scale()`. O Firefox só passou a suportar
  `zoom` recentemente; transform é o caminho previsível em todo navegador.
- Os dois modos (quadro e lista) renderizam todas as disciplinas, então
  trocar de modo não recarrega nada e a marcação vale nos dois.

## [2.0.0-alpha.5] — 2026-08-21

**Fase 3 da migração: ilhas de interatividade.** As ferramentas de estudo
voltaram — e o que estava por trás delas mudou de forma importante.

### Adicionado

- `src/ilhas/progresso.ts`: a memória de estudo, com **chave e formato
  idênticos aos do site 1.x** (`ra-progresso`, `{ s, t }` por id de questão).
  Quem já estuda pelo site antigo não perde as marcações na virada. É por isso
  que esta parte veio antes de qualquer interface.
- Marcar **acertei / errei / revisar** por questão. Marcar o mesmo status de
  novo desmarca, como antes; e marcar encerra a contagem do cronômetro.
- **Cronômetro por questão**, com o tempo preservado ao sair da página.
- **Filtro por status** com contadores, e **barra de progresso** empilhada: a
  proporção de acertadas, erradas e a revisar visível de relance.
- **Modo simulado**: sorteia N questões, esconde os gabaritos, roda cronômetro
  regressivo e calcula a nota na correção.
- `npm test`: 16 casos que travam a compatibilidade do formato de progresso.
  Rodam fora do navegador com `localStorage` simulado, transpilando o TS com
  esbuild — sem dependência de teste nova.

### Alterado

- **O simulado não refaz mais a lista.** No site 1.x ele buscava as questões
  sorteadas por `fetch` e trocava o `innerHTML`. Como agora as questões já
  vêm do build, ele apenas esconde o que não sorteou: nada de rede, nada de
  perder o que estava renderizado, e sair do simulado não recarrega a página.
- Durante o simulado, gabarito e passo a passo saem do DOM visível
  (`display:none`) em vez de ficarem apenas fechados — fechado, bastava um
  clique para espiar. A regra sai do `<body>`, então uma linha de CSS governa
  a página inteira.
- Um **único listener delegado** para toda a página, em vez de um conjunto por
  questão: a final de Eletromag tem 38.
- O visual dos botões de status é pintado a partir do `aria-pressed`, não de
  uma classe paralela: um estado só, não um para os olhos e outro para o
  leitor de tela.

### Corrigido

- Marcar numa aba não atualizava outra aba aberta na mesma prova. O módulo
  ouve o evento `storage`, então as abas ficam em sincronia.
- Cronômetro rodando perdia o tempo ao sair. Agora salva em `beforeunload` e
  também em `visibilitychange`, porque no celular trocar de app muitas vezes
  não dispara o primeiro.
- `import { z } from "astro:content"` está depreciado e sai no Astro 7
  (8 avisos no `astro check`). Passou a vir de `astro/zod`.

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

[2.11.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.11.0
[2.10.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.10.0
[2.9.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.9.0
[2.8.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.8.0
[2.7.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.7.0
[2.6.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.6.0
[2.5.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.5.0
[2.4.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.4.0
[2.3.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.3.0
[2.2.1]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.2.1
[2.2.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.2.0
[2.1.1]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.1.1
[2.1.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.1.0
[2.0.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0
[2.0.0-alpha.7]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0-alpha.7
[2.0.0-alpha.6]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0-alpha.6
[2.0.0-alpha.5]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0-alpha.5
[2.0.0-alpha.4]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0-alpha.4
[2.0.0-alpha.3]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0-alpha.3
[2.0.0-alpha.2]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0-alpha.2
[2.0.0-alpha.1]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v2.0.0-alpha.1
[1.0.0]: https://github.com/ArthurrAzeved0/nabla/releases/tag/v1.0.0
