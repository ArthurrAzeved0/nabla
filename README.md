<!-- **************************************************************************
     * Nabla — Guia do aluno POLI/UPE                               README.md *
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
# Nabla

**Guia do aluno da POLI/UPE**: teoria na ordem da ementa, banco de questões de
provas reais com resolução passo a passo, e o mapa da grade curricular.

No ar em <https://nabla-poli.pages.dev>

O endereço antigo (`arthurrazeved0.github.io/RespondeAi-Poli/`) redireciona
para cá, preservando âncora de questão e de seção — os links que já
circularam continuam funcionando.

> Software proprietário. O repositório é público para consulta e portfólio;
> isso **não** concede licença de uso. Ver [`LICENSE`](LICENSE).

---

## O que tem aqui

| | |
|---|---|
| **3 cadeiras** | Cálculo Vetorial, Equações Diferenciais, Fundamentos do Eletromagnetismo |
| **147 questões** | provas reais e listas (1º EE, 2º EE, Final), com gabarito e passo a passo |
| **43 seções de teoria** | na ordem da ementa oficial, com 107 fórmulas nomeadas e 49 figuras |
| **1 mapa de grade** | Engenharia Civil, matriz 2021.1: 65 disciplinas e 61 requisitos |

Ferramentas de estudo: marcar acertei/errei/revisar, cronômetro por questão,
filtro por status, progresso e modo simulado com nota. Tudo guardado no
navegador — não há conta, servidor nem rastreador.

## Rodar

```bash
npm install
npm run dev          # localhost:4321
npm run dev:rede     # também acessível na rede local (testar no celular)
```

| comando | o que faz |
|---|---|
| `npm run build` | compila para `dist/` — é o que o Cloudflare Pages roda |
| `npm run build:ghpages` | mesma coisa com caminho base em subpasta, se um dia voltar ao GitHub Pages |
| `npm test` | testa progresso, regras da matriz, roteamento das setas e a ponte de endereços |
| `npm run verificar` | confere o conteúdo do `dist/`: links de teoria, LaTeX cru, falhas do KaTeX |
| `npm run cabecalhos` | confere o cabeçalho de autoria em todo arquivo |
| `npm run check` | tipos (`astro check`) |

## Como está organizado

```
src/
  content/            o que se escreve — validado por schema no build
    cadeiras/         registro das cadeiras + mapa tema -> seção da teoria
    teoria/<id>.mdx   uma cadeira por arquivo, seções em <Topico>
    questoes/<cadeira>/<prova>/qNN.mdx
    grade/<curso>.yaml   disciplinas, pré e co-requisitos
  components/         Questao, Topico, Formula, Caixa, Figura, MapaGrade...
  ilhas/              o que interage: progresso, ferramentas, painel, grade
  pages/              rotas — geradas do conteúdo, sem manifesto à mão
  styles/             tokens.css (o sistema visual) e base.css
scripts/              conversores, gerador de cabeçalho, verificador
testes/               rodam com node, sem navegador
```

O **`content.config.ts`** é o contrato. Questão sem procedência, tema fora do
mapa da teoria, prova fora de `{1ee,2ee,final}` ou pré-requisito apontando
para disciplina inexistente **param o build** — não viram bug silencioso.

## Acrescentar conteúdo

### Uma questão

Crie `src/content/questoes/<cadeira>/<prova>/qNN.mdx`:

```mdx
---
origem: "2025.1"          # ou: Banco · 2026.1 / Revisão · Prof. X / Baseada em 2024.1
tema: Integral dupla · polares
temaId: integrais-duplas-polares   # CHAVE do mapa `teoria` da cadeira
pontos: 2,0 pts
# estiloDeProva: true     # questão prevista, sem prova de origem
---

Enunciado, com fórmula em linha $x^2+y^2$ e em destaque:

$$
\iint_D f\,dA
$$

<Gabarito>
$4\pi$
</Gabarito>

<Passos>
**Passo 1 —** ...
</Passos>
```

`cadeira`, `prova` e o número saem do **caminho do arquivo** — não se digita
de novo. Toda questão precisa de `origem` **ou** `estiloDeProva`: o leitor tem
de saber se está resolvendo prova real ou previsão.

### Uma seção de teoria

Em `src/content/teoria/<cadeira>.mdx`, um `<Topico>` por seção. O `id` tem de
bater com o valor no mapa `teoria` da cadeira — é isso que faz o "Ver material"
da questão cair no lugar certo, e `npm run verificar` confere.

Convenção didática: começar com **A ideia** em linguagem simples, usar
`<Caixa tipo="simbolos">` por fórmula, `<Caixa tipo="exemplo">` resolvido com
números e `<Caixa tipo="macete">` para atalho de prova.

### Um curso na grade

Um arquivo em `src/content/grade/<sigla>.yaml`. A rota `/grade/<sigla>` nasce
sozinha; não há código novo a escrever.

## Detalhes que têm motivo

- **Fórmulas renderizam no build** (KaTeX), não no navegador. `$$` precisa da
  cerca sozinha na linha, senão sai fórmula *em linha* — silenciosamente.
- **Fontes auto-hospedadas**, não Google Fonts: o `humans.txt` declara "sem
  rastreadores", e a folha do Google entregaria o IP de cada visitante.
- **O progresso usa a chave `ra-progresso`** e o mesmo formato do site 1.x, de
  propósito: quem estudava antes não perdeu as marcações.
- **As libs de PDF são importadas sob demanda.** Quem só olha o mapa da grade
  não baixa os 391 KB do jsPDF.
- **`public/curso.html`** traduz os endereços do site 1.x, que circularam em
  conversas. Não é lixo: é o que evita quebrar link já compartilhado.
- **Um cabeçalho de autoria em todo arquivo**, gerado por
  `scripts/cabecalho.mjs`. Os conversores o emitem, então sobrevive a uma
  reconversão.

## Publicação

O Cloudflare Pages compila a cada push na `main`:

| | |
|---|---|
| comando de build | `npm run build` |
| pasta de saída | `dist` |
| versão do Node | 22 ou superior |

`public/_headers` declara o `charset` do `humans.txt` e marca os assets de
`/_astro/` como `immutable` — eles têm hash no nome, então podem ser
guardados para sempre. Isso substitui o `?v=N` manual do site 1.x.

Os dois HTML na raiz do repositório (`index.html` e `curso.html`) **não fazem
parte do site**: são redirecionadores do endereço antigo, servidos pelo
GitHub Pages. O Astro compila de `src/` e os ignora.

## Histórico

A série **1.x** foi o site original, "Responde Aí" — HTML, CSS e JS sem build.
A **2.x** é o Nabla: reescrita sobre Astro e TypeScript. O caminho está em
[`CHANGELOG.md`](CHANGELOG.md), uma versão por fase da migração.

Dependências de terceiros e suas licenças: [`THIRD-PARTY.md`](THIRD-PARTY.md).
