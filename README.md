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

> Software proprietário. O repositório é público para consulta e portfólio;
> isso **não** concede licença de uso. Ver [`LICENSE`](LICENSE).

---

## O que tem aqui

| | |
|---|---|
| **4 cadeiras** | Cálculo Vetorial, Equações Diferenciais, Fundamentos do Eletromagnetismo, Dinâmica |
| **151 questões** | provas reais e listas (1º EE, 2º EE, Final), com gabarito e passo a passo |
| **50 seções de teoria** | na ordem da ementa oficial de cada cadeira |
| **10 mapas de grade** | 5 cursos, o perfil atual e o anterior de cada: 645 disciplinas e 646 requisitos |

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
sozinha, e o índice em `/grade/` também: ele agrupa por curso, então duas
matrizes do mesmo curso caem no mesmo bloco com selo **atual**/**anterior**.
Não há código novo a escrever.

Editar o YAML à mão funciona, mas se perde na próxima geração. As grades
vindas de PPC são **transcritas em `scripts/extrair-grade-ppc.mjs`**, e é lá
que vai a correção. O script não é um extrator: num PDF a tabela de
requisitos sai com as células quebradas em várias linhas, e parser de linha
não resolve isso sem inventar. Ele faz o que máquina faz melhor que gente —
**conferir**:

```bash
node scripts/extrair-grade-ppc.mjs            # todas
node scripts/extrair-grade-ppc.mjs mecanica   # uma
```

Antes de gravar, cada grade é checada contra os números que o **próprio PPC
publica** — carga horária por núcleo ou ciclo, total das obrigatórias,
subtotal de cada período — e contra a coerência do grafo: requisito que não
existe, requisito num período posterior, co-requisito recíproco, CH zero. Se
alguma conta não fecha, ele aborta sem escrever nada. Um erro de digitação
numa CH deixa de ser um número errado no site e passa a ser um script que não
roda.

Onde o documento se contradiz ou cala, a informação vira `nota` no nó — não
palpite. E onde o PPC não publica código de disciplina (acontece: "os códigos
são gerados automaticamente pelo Siga"), a grade herda por nome das que
publicam, com três travas: só o formato atual da UPE, nada de nome com
códigos divergentes entre cursos, e componente administrativo só herda do
próprio curso.

## Detalhes que têm motivo

- **Fórmulas renderizam no build** (KaTeX), não no navegador. `$$` precisa da
  cerca sozinha na linha, senão sai fórmula *em linha* — silenciosamente.
- **Fontes auto-hospedadas**, não Google Fonts: o `humans.txt` declara "sem
  rastreadores", e a folha do Google entregaria o IP de cada visitante.
- **O progresso usa a chave `ra-progresso`** e o mesmo formato do site 1.x, de
  propósito: quem estudava antes não perdeu as marcações.
- **As libs de PDF são importadas sob demanda.** Quem só olha o mapa da grade
  não baixa os 391 KB do jsPDF.
- **`public/curso.html`** traduz os endereços do formato antigo. Não é lixo:
  é o que faz um link guardado por alguém ainda chegar na questão certa.
- **Um cabeçalho de autoria em todo arquivo**, gerado por
  `scripts/cabecalho.mjs`. Os conversores o emitem, então sobrevive a uma
  reconversão.
- **O cartão de prévia dos links** (`public/social-card.png`) é gerado de
  `arte/social-card.html` pelo Chrome headless, com as fontes embutidas em
  base64 — sai igual em qualquer máquina, sem depender do que está instalado
  nela. É a mesma imagem que serve de prévia do repositório no GitHub e de
  `og:image` do site. Para regerar, o comando está no comentário do arquivo.

## Publicação

O **GitHub Actions** compila e publica no Cloudflare Pages a cada push na
`main` e na `develop` (`.github/workflows/publicar.yml`). Antes de publicar,
o workflow roda `astro check`, `npm test`, o build, `npm run verificar` e
`npm run cabecalhos` — conteúdo com link de teoria apontando para o vazio,
fórmula que o KaTeX não lê ou arquivo sem cabeçalho de autoria não chega ao ar.

É um deploy **só de assets**: a Cloudflare serve os arquivos de `dist/` e
nada mais, sem código no servidor. O projeto Pages foi criado pela CLI, e não
pelo painel — a Cloudflare tirou a criação de projetos Pages do painel
enquanto migra tudo para Workers. Daí a publicação vir do Actions em vez de
uma integração com o Git.

Segredos necessários em *Settings → Secrets and variables → Actions*:

| segredo | o que é |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token com permissão *Cloudflare Pages: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | o Account ID que aparece no painel |

A versão do Node vem de `.node-version` e de `engines` no `package.json`, não
de variável no painel: configuração de build pertence ao repositório, onde
fica versionada junto com o que ela constrói.

Publicar à mão, se precisar: `npm run publicar`.

`public/_headers` declara o `charset` do `humans.txt` e marca os assets de
`/_astro/` como `immutable` — eles têm hash no nome, então podem ser
guardados para sempre. Isso substitui o `?v=N` manual do site 1.x.

`public/curso.html` traduz os endereços do formato antigo
(`curso.html?curso=calculo3#calculo3-1ee-01`) para a rota atual, preservando
a âncora. Serve para links do site 1.x que alguém tenha guardado.

## Histórico

A série **1.x** foi o site original, "Responde Aí" — HTML, CSS e JS sem build.
A **2.x** é o Nabla: reescrita sobre Astro e TypeScript. O caminho está em
[`CHANGELOG.md`](CHANGELOG.md): uma versão por fase da migração até a 2.0.0, e
depois uma por grade, correção ou ajuste.

Dependências de terceiros e suas licenças: [`THIRD-PARTY.md`](THIRD-PARTY.md).
