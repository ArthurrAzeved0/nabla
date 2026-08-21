/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                      progresso.test.mjs *
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
/* Testa o módulo de progresso fora do navegador, com localStorage simulado.

   O que se está protegendo aqui é a COMPATIBILIDADE com o site 1.x: quem já
   estuda pelo site antigo não pode perder as marcações na virada. Se a chave
   ou o formato mudarem sem intenção, estes testes falham.

   Rodar: npm test  (transpila o TS com esbuild e executa) */
const loja = new Map();
globalThis.localStorage = {
  getItem: (k) => (loja.has(k) ? loja.get(k) : null),
  setItem: (k, v) => loja.set(k, v),
  removeItem: (k) => loja.delete(k),
};
globalThis.document = { dispatchEvent: () => {}, addEventListener: () => {} };
globalThis.window = { addEventListener: () => {} };
globalThis.CustomEvent = class {};

const M = await import("../.tmp-teste/progresso.mjs");

let falhas = 0;
const teste = (nome, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}`);
  if (!ok) { console.log(`        esperado ${JSON.stringify(esperado)}, veio ${JSON.stringify(real)}`); falhas++; }
};

// 1) LÊ o formato do site 1.x sem conversão
loja.set("ra-progresso", JSON.stringify({
  "calculo3-1ee-01": { s: "a", t: 252 },
  "calculo3-1ee-02": { s: "e" },
  "eletromag-final-07": { t: 90 },
}));
teste("lê status do site 1.x", M.status("calculo3-1ee-01"), "a");
teste("lê tempo do site 1.x", M.tempo("calculo3-1ee-01"), 252);
teste("questão só cronometrada", M.status("eletromag-final-07"), undefined);
teste("questão inexistente", M.tempo("nao-existe-99"), 0);

// 2) marcar e desmarcar
teste("marcar novo status", M.marcar("calculo3-1ee-02", "r"), "r");
teste("marcar o MESMO desmarca", M.marcar("calculo3-1ee-02", "r"), undefined);
teste("desmarcado preserva tempo", M.registro("calculo3-1ee-01"), { s: "a", t: 252 });

// 3) registro vazio é removido, nao fica lixo
M.marcar("calculo3-1ee-03", "a");
M.marcar("calculo3-1ee-03", "a");
teste("registro vazio é apagado", M.registro("calculo3-1ee-03"), undefined);

// 4) contagem
const ids = ["calculo3-1ee-01","calculo3-1ee-02","calculo3-1ee-03","calculo3-1ee-04"];
teste("contagem", M.contar(ids), { total: 4, a: 1, e: 0, r: 0, nao: 3, feitas: 1 });

// 5) tempo
M.salvarTempo("calculo3-1ee-04", 61.7);
teste("tempo arredondado", M.tempo("calculo3-1ee-04"), 62);

// 6) limpar so a cadeira pedida
M.limparCadeira("calculo3");
teste("limpou a cadeira", M.contar(ids).feitas, 0);
teste("NÃO tocou outra cadeira", M.tempo("eletromag-final-07"), 90);

// 7) o formato gravado continua identico ao do site 1.x
const gravado = JSON.parse(loja.get("ra-progresso"));
teste("formato gravado", gravado, { "eletromag-final-07": { t: 90 } });

// 8) formatacao de tempo
teste("formatarTempo 0", M.formatarTempo(0), "00:00");
teste("formatarTempo 65", M.formatarTempo(65), "01:05");
teste("formatarTempo 3599", M.formatarTempo(3599), "59:59");

console.log(falhas ? `\n  ${falhas} falha(s)` : "\n  todos passaram");
process.exit(falhas ? 1 : 0);
