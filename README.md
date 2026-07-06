# Responde Aí — Poli

Site de estudos com conteúdo teórico e banco de questões resolvidas, feito para as cadeiras da POLI/UPE.

Feito por **Arthur Azevedo**, aluno de Eng. de Controle e Automação.

## Estrutura do projeto

```
Responde Ai - Poli/
├── index.html              # Página inicial (lista de cursos)
├── curso.html              # Template único de curso (usa ?curso=<id>)
├── css/
│   └── style.css           # Estilos + temas claro/escuro (variáveis CSS)
├── js/
│   ├── theme.js            # Alternância de tema (salvo em localStorage)
│   ├── cursos.js            # REGISTRO CENTRAL de cursos (window.CURSOS)
│   ├── home.js             # Monta os cards da página inicial
│   └── curso.js            # Lógica da página de curso (abas, fetch de conteúdo e questões)
├── conteudo/
│   ├── calculo3.html       # Teoria completa de Cálculo 3 (fragmento HTML)
│   └── eletromag.html      # Teoria completa de Eletromag (fragmento HTML)
└── questoes/
    ├── manifest.js         # REGISTRO CENTRAL de questões (window.QUESTOES_MANIFEST)
    ├── _modelo-questao.html # Modelo comentado para criar novas questões
    ├── calculo3/
    │   ├── 1ee/q01.html … q04.html
    │   ├── 2ee/q01.html … q03.html
    │   └── final/q01.html … q05.html
    └── eletromag/
        ├── 1ee/q01.html … q04.html
        ├── 2ee/q01.html … q04.html
        └── final/q01.html … q04.html
```

## Rodando localmente

O site usa `fetch()` para carregar conteúdo e questões, o que **não funciona abrindo o arquivo direto** (`file://`). Rode um servidor local na pasta do projeto:

```bash
cd "Responde Ai - Poli"
python -m http.server 8000
```

E abra `http://localhost:8000` no navegador.

## Publicando no GitHub Pages

1. Crie um repositório no GitHub e envie o conteúdo desta pasta (a pasta em si deve ser a raiz do repositório).
2. No repositório: **Settings → Pages → Source: Deploy from a branch → branch `main`, pasta `/ (root)`**.
3. O site ficará disponível em `https://<seu-usuario>.github.io/<nome-do-repo>/`.

Nada precisa ser compilado — é um site 100% estático.

## Como adicionar uma NOVA QUESTÃO

1. **Copie o modelo** `questoes/_modelo-questao.html` para a pasta certa, seguindo o padrão de nomes:

   ```
   questoes/<idDoCurso>/<prova>/qNN.html
   ```

   onde `<prova>` é `1ee`, `2ee` ou `final`, e `NN` é o próximo número (ex.: `q05.html`).

2. **Preencha o bloco** — a estrutura obrigatória é:

   ```html
   <article class="questao" data-id="<curso>-<prova>-<NN>" data-tema="<tema-em-kebab-case>">
     <div class="q-topo">
       <span class="q-id">Questão NN</span>
       <span class="q-tag">1º EE · 2025.2</span>   <!-- origem da questão -->
       <span class="q-tag">Tema da questão</span>
       <span class="q-tag">2,5 pts</span>
     </div>
     <div class="q-enunciado">
       <p>Enunciado com LaTeX inline \(x^2\) e em destaque $$x^2$$ ...</p>
     </div>
     <details class="q-gabarito">
       <summary>Gabarito</summary>
       <div><p><span class="q-resposta-final">Resposta final.</span></p></div>
     </details>
     <details class="q-passos">
       <summary>Passo a passo</summary>
       <div>
         <p><strong>Passo 1 —</strong> ...</p>
         $$formula$$
       </div>
     </details>
   </article>
   ```

3. **Registre no manifest** (`questoes/manifest.js`): adicione o nome do arquivo na lista da prova correspondente:

   ```js
   calculo3: {
     "1ee":   ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html"], // <- novo
     ...
   }
   ```

   A ordem da lista é a ordem de exibição no site. Pronto — nenhum outro arquivo precisa ser alterado.

### Dicas de LaTeX

- Matemática inline: `\( ... \)` — ex.: `\(\vec F = q\vec E\)`
- Matemática em destaque (linha própria): `$$ ... $$`
- Resposta em caixa: `$$\boxed{...}$$`

## Como adicionar um NOVO CURSO

Exemplo: adicionar "Física 4" com id `fisica4`.

1. **Registre o curso** em `js/cursos.js`, adicionando um objeto ao array `window.CURSOS` (há um modelo comentado no próprio arquivo):

   ```js
   {
     id: "fisica4",                    // usado na URL: curso.html?curso=fisica4
     nome: "Física 4",
     codigo: "Código da disciplina",
     descricao: "Descrição curta exibida no card da home.",
     icone: "<svg ...>...</svg>"       // ícone SVG desenhado à mão (sem emojis)
   }
   ```

2. **Crie o conteúdo teórico** em `conteudo/fisica4.html`. É um *fragmento* HTML (sem `<html>`/`<head>`), com a estrutura:

   ```html
   <nav class="sumario"> ... links para as seções ... </nav>
   <section class="topico" id="f4-tema1">
     <h2>1. Nome do tema</h2>
     <p>Explicação...</p>
     <div class="formula"><span class="rotulo">Nome da fórmula</span> $$ ... $$</div>
     <div class="macete"><p>Truque que sempre cai...</p></div>
     <div class="macete dica"><p>Referência a questão de prova...</p></div>
   </section>
   ```

3. **Crie as pastas de questões**: `questoes/fisica4/1ee/`, `questoes/fisica4/2ee/`, `questoes/fisica4/final/` e adicione os arquivos `qNN.html` (ver seção anterior).

4. **Registre no manifest** (`questoes/manifest.js`):

   ```js
   fisica4: {
     "1ee":   ["q01.html"],
     "2ee":   [],
     "final": []
   }
   ```

Pronto: o card aparece na home e a página do curso funciona automaticamente — o template `curso.html` serve todos os cursos.

## Classes CSS úteis (conteúdo teórico)

| Classe | Uso |
|---|---|
| `.sumario` | Índice de navegação no topo do conteúdo |
| `.topico` | Cada seção da ementa |
| `.formula` | Bloco de fórmula com borda de destaque; use `<span class="rotulo">` para o nome |
| `.macete` | Callout "Macete" (rótulo automático via CSS) |
| `.macete.dica` | Callout "Dica de prova" |

## Tema claro/escuro

O tema padrão segue a preferência do sistema (`prefers-color-scheme`) e pode ser alternado pelo botão na barra superior. A escolha fica salva no `localStorage` (chave `ra-tema`). As cores são variáveis CSS em `css/style.css` (`:root` = escuro, `[data-theme="light"]` = claro) — para ajustar a paleta, basta editar as variáveis.
