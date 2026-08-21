/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                          grade.test.mjs *
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
/* Testa as regras da matriz fora do navegador.

   O que se protege aqui é a lógica que decide o que o aluno "pode cursar":
   errar isso é pior que não ter o mapa, porque ele confia na resposta. */
const loja = new Map();
globalThis.localStorage = {
  getItem: (k) => (loja.has(k) ? loja.get(k) : null),
  setItem: (k, v) => loja.set(k, v),
  removeItem: (k) => loja.delete(k),
};

const { criarMapa } = await import("../.tmp-teste/fluxograma.mjs");
const { readFileSync } = await import("node:fs");

/* grade mínima, escrita à mão para o teste ser legível */
const d = (id, periodo, pre = [], co = [], extra = {}) => ({
  id, codigo: id, nome: id, periodo, teorica: 60, pratica: 0,
  categoria: "basico", pre, co, dcext: false, estagio: false, ...extra,
});
const grade = {
  curso: "Teste", sigla: "teste", chTotalCurso: 1000, estagioFracao: 0.6,
  disciplinas: [
    d("A", 1), d("B", 1),
    d("C", 2, ["A"]),
    d("D", 2, ["A", "B"]),
    d("E", 3, ["C"], ["D"]),
    d("EST", 4, [], [], { estagio: true }),
  ],
};

let falhas = 0;
const teste = (nome, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  console.log(`  ${ok ? "ok  " : "FALHA"} ${nome}`);
  if (!ok) { console.log(`        esperado ${JSON.stringify(esperado)}, veio ${JSON.stringify(real)}`); falhas++; }
};
const m = criarMapa(grade);
const livre = (id) => m.liberada(grade.disciplinas.find((x) => x.id === id));

teste("sem pré-requisito começa liberada", livre("A"), true);
teste("com pré-requisito começa travada", livre("C"), false);
teste("CH concluída começa em zero", m.chFeita(), 0);

m.alternar("A");
teste("A concluída deixa de estar liberada", livre("A"), false);
teste("C libera com o pré cumprido", livre("C"), true);
teste("D NÃO libera com só um dos dois prés", livre("D"), false);
teste("CH acompanha", m.chFeita(), 60);

m.alternar("B");
teste("D libera com os dois prés", livre("D"), true);

m.alternar("C");
teste("co-requisito: E libera porque os prés de D estão ok", livre("E"), true);

/* estágio: exige 60% de 1000h = 600h */
teste("estágio travado por CH", livre("EST"), false);
for (const id of ["D", "E"]) m.alternar(id);
teste("estágio ainda travado (300h de 600h)", livre("EST"), false);

/* cadeia: tudo que leva a E e tudo que E destrava */
teste("cadeia de E", [...m.cadeia("E")].sort(), ["A", "B", "C", "D", "E"]);
/* A cadeia de A é: nada acima (A não tem pré) + tudo que A destrava.
   B NÃO entra: é pré-requisito de D, mas não é descendente de A. Mesmo
   comportamento do fluxograma original — hover em A responde "o que A
   libera", não "o que mais D precisa". */
teste("cadeia de A: só os descendentes", [...m.cadeia("A")].sort(), ["A", "C", "D", "E"]);
teste("cadeia de B não inclui C", [...m.cadeia("B")].sort(), ["B", "D", "E"]);

teste("concluídas contadas", m.feitas, 5);
m.limpar();
teste("limpar zera", m.feitas, 0);
teste("limpar zera a CH", m.chFeita(), 0);

/* a grade real do repositório: o grafo tem de fechar */
const yaml = readFileSync("src/content/grade/civil.yaml", "utf8");
const ids = new Set([...yaml.matchAll(/^\s+- id: (\S+)$/gm)].map((x) => x[1]));
const alvos = [...yaml.matchAll(/^\s+(?:pre|co): \[([^\]]*)\]$/gm)]
  .flatMap((x) => x[1].split(",").map((s) => s.trim()).filter(Boolean));
const orfaos = [...new Set(alvos.filter((a) => !ids.has(a)))];
teste("grade de Civil: nenhum requisito órfão", orfaos, []);
teste("grade de Civil: 65 disciplinas", ids.size, 65);

console.log(falhas ? `\n  ${falhas} falha(s)` : "\n  todos passaram");
process.exit(falhas ? 1 : 0);
