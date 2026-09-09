/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE            rehype-tabela-rolavel.mjs *
   *------------------------------------------------------------------------*
   * Copyright © 2026  Arthur Epifanio De Azevedo                           *
   * Todos os direitos reservados.                                          *
   *                                                                        *
   * Software proprietário — ver arquivo LICENSE.                           *
   *                                                                        *
   * Autor:   Arthur Epifanio De Azevedo                                    *
   * Página:  https://github.com/ArthurrAzeved0                             *
   * Contato: arthur_azevedo05@hotmail.com                                  *
   ************************************************************************** */
/* Envolve toda <table> do conteúdo num `div.rolagem-x`.
 *
 * O PORQUÊ: `table { width: 100% }` não impede o transbordo. A largura
 * mínima de uma tabela é a soma das colunas, e célula com fórmula do KaTeX
 * não quebra — então a tabela cresce além do contêiner e é a PÁGINA que
 * passa a rolar para o lado. No telefone isso aparece como o dedo
 * arrastando o site inteiro.
 *
 * Aconteceu só em Fenômenos de Transporte, e o motivo é aritmético: é a
 * única cadeira com tabela de 5 colunas ou mais (a de q18 do 2º EE tem 8;
 * a analogia dos três transportes, na teoria, tem 6). As outras param em 4
 * e cabem. Envolver na fonte, tabela por tabela, resolveria hoje e voltaria
 * na próxima tabela larga — daí ser no pipeline.
 *
 * `.rolagem-x` (base.css) tem `overflow-x: auto`: a tabela rola dentro de
 * si mesma. Sem dependência de `unist-util-visit` — a árvore hast é só
 * objetos com `children`, e uma recursão de dez linhas basta.
 */
export default function rehypeTabelaRolavel() {
  return (arvore) => envolver(arvore);
}

function envolver(no) {
  if (!no || !Array.isArray(no.children)) return;
  for (let i = 0; i < no.children.length; i++) {
    const filho = no.children[i];
    /* desce primeiro: assim a tabela de dentro também é envolvida, e o
       `div` que acabamos de criar não é revisitado */
    envolver(filho);
    if (filho.type === "element" && filho.tagName === "table") {
      no.children[i] = {
        type: "element",
        tagName: "div",
        properties: { className: ["rolagem-x"] },
        children: [filho],
      };
    }
  }
}
