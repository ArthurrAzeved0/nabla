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
- **`icone-app.svg`** — a tela inicial do celular. Fundo escuro, mesmo traço.

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
| `icone-192.png`, `icone-512.png` | `icone-app.svg` | mesma coisa no Android, via `manifest.webmanifest` |

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

**O ícone de aplicativo tem fundo, e não é por contraste com o tema.** Ícone de
lançador cai sobre um fundo que ninguém controla — papel de parede qualquer —
e o iOS ainda preenche de PRETO o que for vazado em `apple-touch-icon`. Sem
fundo próprio, o traço fino desaparece metade das vezes.

O que mudou: o fundo deixou de ser a placa azul de destaque e passou a ser o
**papel escuro do site**, com o ∇ no tom claro. O ícone da tela inicial virou
o site, em vez de uma etiqueta azul que não aparece em lugar nenhum. E saiu o
canto arredondado: iOS e Android aplicam a máscara deles, e desenhar a nossa
por baixo só produzia canto duplo.

**`icone-192` e `icone-512` eram arquivo morto** até ganharem o
`manifest.webmanifest`. É ele que faz o Android oferecer "adicionar à tela
inicial" e que diz com que cor pintar a tela enquanto o site abre. Os ícones
são declarados com `purpose` implícito (`any`), e não `maskable`: as pontas do
∇ ficam fora do círculo de 80% que uma máscara circular preserva.
