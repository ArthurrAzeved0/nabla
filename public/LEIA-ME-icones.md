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

Gerados a partir de `favicon.svg`, que é a única fonte a editar:

```bash
for n in 16 32 180 192 512; do rsvg-convert -w $n -h $n public/favicon.svg -o /tmp/ico/$n.png; done
cp /tmp/ico/180.png public/apple-touch-icon.png
cp /tmp/ico/192.png public/icone-192.png
cp /tmp/ico/512.png public/icone-512.png
magick /tmp/ico/16.png /tmp/ico/32.png public/favicon.ico
```

| arquivo | para quê |
|---|---|
| `favicon.svg` | a guia do navegador; escala em qualquer densidade de tela |
| `favicon.ico` | reserva para navegador sem suporte a SVG (16 e 32px dentro) |
| `apple-touch-icon.png` | quando alguém adiciona o site à tela inicial do iPhone |
| `icone-192.png`, `icone-512.png` | mesma coisa no Android |

## Duas decisões

**O ∇ é maciço aqui, e de traço no site.** Na guia o ícone é desenhado a
16px, e traço de 2px ali vira um fio que desaparece. A identidade se mantém
pela forma, não pelo acabamento.

**O glifo ocupa ~20% da placa.** Medido, não estimado: com a margem original
ele ficava em 12% e sumia no tamanho real. A placa colorida também resolve o
contraste — funciona na barra clara e na escura, sem depender do tema.
