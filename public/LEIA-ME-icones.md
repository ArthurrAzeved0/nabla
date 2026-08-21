<!-- **************************************************************************
     * Nabla — Guia do aluno POLI/UPE                       LEIA-ME-icones.md *
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
# Ícones

Duas fontes, e cada uma manda num conjunto de arquivos:

- **`favicon.svg`** — a guia do navegador. Fundo transparente, traço fino.
- **`icone-app.svg`** — a tela inicial do celular. Placa colorida, mesmo traço.

```bash
mkdir -p /tmp/ico
for n in 16 32; do rsvg-convert -w $n -h $n public/favicon.svg -o /tmp/ico/$n.png; done
for n in 180 192 512; do rsvg-convert -w $n -h $n public/icone-app.svg -o /tmp/ico/$n.png; done
magick /tmp/ico/16.png /tmp/ico/32.png public/favicon.ico
cp /tmp/ico/180.png public/apple-touch-icon.png
cp /tmp/ico/192.png public/icone-192.png
cp /tmp/ico/512.png public/icone-512.png
```

| arquivo | vem de | para quê |
|---|---|---|
| `favicon.svg` | — | a guia do navegador; escala em qualquer densidade de tela |
| `favicon.ico` | `favicon.svg` | reserva para navegador sem suporte a SVG (16 e 32px dentro) |
| `icone-app.svg` | — | fonte dos três abaixo; não é referenciado por nenhuma página |
| `apple-touch-icon.png` | `icone-app.svg` | quando alguém adiciona o site à tela inicial do iPhone |
| `icone-192.png`, `icone-512.png` | `icone-app.svg` | mesma coisa no Android |

## Três decisões

**O ∇ continua VAZADO.** Maciço ele deixa de ser o operador nabla e passa a
ler como uma seta para baixo — foi a primeira tentativa, e estava errada.

**A guia perdeu a placa, e o traço afinou para 2,6.** A placa colorida
resolvia o contraste sem depender do tema, mas embrulhava o glifo numa
etiqueta: na fileira de guias o que se via era um quadrado azul, não o nabla.
Sem ela o traço pode afinar, porque não precisa mais vencer um fundo próprio —
e 2,6 em 32 de viewBox é exatamente o peso do ∇ do cabeçalho (2 em 24), então
a guia e a marca do site passaram a ser o mesmo desenho.

Medido, não estimado: a 16px o traço antigo de 4,2 cobria 29,2% do quadro; o
de 2,6 cobre 18,6%, com o vazado bem aberto. Abaixo de ~2,2 a tinta cai para
perto dos 5% em que o glifo simplesmente desaparece.

Sem placa, o contraste passa a depender da barra de guias, então a cor segue
`prefers-color-scheme` — `#0f6c86` no claro, `#5cbdda` no escuro, os mesmos
tokens de destaque dos dois temas. É o tema do **sistema**, não o do site: a
guia é do navegador, não da página.

**A placa sobreviveu só no ícone de aplicativo**, porque ali ela não é recurso
de contraste: o iOS não respeita transparência em `apple-touch-icon` e
preenche de preto o que for vazado. Em `icone-app.svg` o fundo é parte do
ícone, e o ∇ fica recuado para não encostar no canto arredondado.
