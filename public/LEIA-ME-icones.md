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

**O ∇ continua VAZADO, com traço grosso.** Maciço ele deixa de ser o
operador nabla e passa a ler como uma seta para baixo — foi a primeira
tentativa, e estava errada. O que resolve o tamanho pequeno não é preencher,
é engrossar: traço de 4,2 (em 32 de viewBox) sobrevive a 16px e mantém o
vazado.

**A calibragem foi medida, não estimada.** A 16px, traço 2,4 deixa 5% de
tinta e desaparece; traço 5 fecha o vazado e vira triângulo cheio. 4,2 dá 22%
com o centro ainda aberto. A placa colorida resolve o contraste — funciona na
barra clara e na escura, sem depender do tema.
