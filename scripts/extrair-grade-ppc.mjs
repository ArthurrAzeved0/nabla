/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                   extrair-grade-ppc.mjs *
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
/* Gera src/content/grade/<sigla>.yaml a partir de uma matriz transcrita de PPC.

   Por que existe, sendo que já há scripts/extrair-grade.mjs? Aquele lê o
   `const COURSES = [...]` do fluxograma do site 1.x — só serve para Civil,
   que já tinha um mapa pronto. Os outros cursos não têm: a fonte é o PPC, e
   nele a tabela de pré-requisitos sai com as células quebradas em várias
   linhas, com o nome da disciplina intercalado com o do requisito na mesma
   faixa vertical. Parser de linha não resolve isso sem inventar.

   Então a matriz é TRANSCRITA aqui, à mão, e o script faz o que máquina faz
   melhor que gente: CONFERIR. Antes de escrever o YAML ele checa a
   transcrição contra os totais que o próprio PPC publica — carga horária por
   ciclo, carga de extensão, total das obrigatórias — e checa a coerência do
   grafo (requisito que não existe, requisito num período posterior, ciclo).
   Se qualquer conta não fechar, ele aborta sem gravar nada. Um erro de
   digitação numa CH deixa de ser um número errado no site e passa a ser um
   script que não roda.

   Uso: node scripts/extrair-grade-ppc.mjs <sigla>
        node scripts/extrair-grade-ppc.mjs --todas
*/
import { writeFileSync } from "node:fs";

/* ==========================================================================
   Cabeçalho de autoria, no mesmo formato de scripts/cabecalho.mjs. Emitido
   daqui, e não colado por fora, para sobreviver a uma regeração.
   ========================================================================== */
function cabecalho(nomeArquivo) {
  const W = 74;
  const linha = (t) => {
    const larg = W - 4;
    const chars = [...t];
    const corpo = chars.length > larg ? chars.slice(0, larg).join("") : t;
    return "* " + corpo + " ".repeat(larg - [...corpo].length) + " *";
  };
  const borda = "*".repeat(W);
  const marca = "Nabla — Guia do aluno POLI/UPE";
  const vao = W - 4 - [...marca].length - nomeArquivo.length;
  const titulo =
    vao < 2 ? linha(marca + " · " + nomeArquivo) : linha(marca + " ".repeat(vao) + nomeArquivo);
  return [
    borda,
    titulo,
    "*" + "-".repeat(W - 2) + "*",
    linha("Copyright © 2026  Arthur Epifanio De Azevedo"),
    linha("Todos os direitos reservados."),
    linha(""),
    linha("Software proprietário — ver arquivo LICENSE."),
    linha(""),
    linha("Autor:   Arthur Epifanio De Azevedo"),
    linha("Página:  https://github.com/ArthurrAzeved0"),
    linha("Contato: arthur_azevedo05@hotmail.com"),
    borda,
  ]
    .map((l) => "# " + l)
    .join("\n");
}

/* A matriz sequencial de 2021 marca a CH das eletivas com "-*" e explica em
   nota de rodapé: quem define a divisão é a eletiva escolhida. O total é 60h. */
const NOTA_ELETIVA =
  "A divisão entre CH teórica e prática varia conforme a eletiva escolhida; o total é 60h.";

/* ==========================================================================
   ENGENHARIA DE CONTROLE E AUTOMAÇÃO — matriz 2021.1 (perfil novo)

   Fonte: "PPC 2021 - Novo perfil - Engenharia de Controle e Automacao.pdf",
   POLI/UPE, 276 páginas. Três trechos dele:

     Tabela 4 (p. 17)  ..... CH por núcleo: NCB 1425h, NCP 705h, NCE 1470h
     Tabela 5 (p. 18-21) ... as 59 obrigatórias com pré e co-requisito
     § 1.6.4 (p. 29-32) .... matriz sequencial por período, com a CH

   ARMADILHA DO DOCUMENTO, que custou a maior parte do trabalho: o PPC traz
   DUAS matrizes sequenciais. A "EM EXECUÇÃO" é o perfil vigente desde
   2013.1 — tem código em toda disciplina, mas com os nomes antigos (Cálculo
   1, Física 2, Mecânica 1) e NÃO traz requisito nenhum. A "A EXECUTAR" é o
   perfil que entrou em 2021.1 — é a que a Tabela 5 descreve, e a única com
   o grafo de requisitos, mas o PPC não publica código para ela. Ou seja: o
   grafo só existe para a matriz sem código.

   Daí as duas decisões desta tabela:

   1. O `id` é mnemônico (CALC1, SISCTRL2), não código. Ele é interno — o
      que o mapa mostra é o `codigo`.

   2. O `codigo` é o do perfil VIGENTE quando a disciplina é a mesma, ainda
      que renomeada; `—` quando ela nasceu em 2021 e não tem código
      publicado. Que os dois perfis compartilham o registro de códigos se vê
      pela grade de Civil, que usa a forma curta do MESMO número: MAT18 lá é
      MATM0018 aqui, FIS11 é FISC0011, PRB05 é PRBE0005. Onde o nome mudou,
      a `nota` diz o nome antigo — é o que aparece no histórico do SIGA.

   3. A CH teórica/prática vem da matriz sequencial, não da Tabela 5. As duas
      concordam no TOTAL de todas as 59 disciplinas, mas divergem na divisão
      em quatro delas (Química, Eletrônica Digital, Expressão Gráfica 1 e
      Engenharia Econômica). Onde divergem, a `nota` registra a divergência.
      É por isso que a soma da CH teórica dá 2660h e a Tabela 5 anuncia
      2675h: a diferença de 15h é exatamente a dessas quatro linhas.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const AUTOMACAO_2021 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "CALC1", codigo: "MATM0018", nome: "Cálc. Dif. e Integral em uma Variável",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico",
    nota: "No perfil vigente: Cálculo Diferencial e Integral 1." },
  { id: "GEOAN", codigo: "MATM0007", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "QUIM", codigo: "QUIM0002", nome: "Química",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico",
    nota: "No perfil vigente: Química Geral. A Tabela 5 divide 45h+15h; a matriz sequencial, 30h+30h." },
  { id: "PROG1", codigo: "—", nome: "Programação 1",
    periodo: 1, teorica: 45, pratica: 15, categoria: "basico" },
  { id: "SOCIO", codigo: "SOCL0002", nome: "Sociologia, Meio Amb. e Contexto Social",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico", dcext: true,
    nota: "No perfil vigente: Sociologia e Meio Ambiente." },
  { id: "INTRO", codigo: "—", nome: "Introdução ao Controle e Automação",
    periodo: 1, teorica: 15, pratica: 15, categoria: "prof", dcext: true },
  { id: "PORT", codigo: "LETR0001", nome: "Português Instrumental",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico",
    nota: "No perfil vigente: Expressão em Língua Portuguesa." },

  /* ------------------------------------------------------------ 2º período */
  { id: "CALC2", codigo: "MATM0019", nome: "Cálc. Dif. e Integral em Várias Variáveis",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"],
    nota: "No perfil vigente: Cálculo Diferencial e Integral 2." },
  { id: "MECANICA", codigo: "FISC0011", nome: "Fundamentos da Mecânica",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"],
    nota: "No perfil vigente: Física 1." },
  { id: "ALGLIN", codigo: "MATM0001", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN"] },
  { id: "ECON", codigo: "ECON0001", nome: "Engenharia Econômica",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico", pre: ["SOCIO"],
    nota: "A Tabela 5 lança as 30h como práticas; a matriz sequencial, como teóricas." },
  { id: "EXPGR1", codigo: "ARTE0001", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 30, pratica: 45, categoria: "basico",
    nota: "A Tabela 5 divide 45h+30h; a matriz sequencial, 30h+45h." },
  { id: "PROBEST", codigo: "PRBE0005", nome: "Probabilidade e Estatística",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"], co: ["CALC2"] },
  { id: "PROG2", codigo: "—", nome: "Programação 2",
    periodo: 2, teorica: 45, pratica: 15, categoria: "basico", dcext: true, pre: ["PROG1"] },

  /* ------------------------------------------------------------ 3º período */
  { id: "CALCVET", codigo: "MATM0020", nome: "Cálc. Dif. e Integral Vetorial",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"],
    cadeira: "calculo3", nota: "No perfil vigente: Cálculo Diferencial e Integral 3." },
  { id: "FUNDEM", codigo: "FISC0012", nome: "Fundamentos do Eletromagnetismo",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MECANICA"], co: ["CALCVET"],
    cadeira: "eletromag", nota: "No perfil vigente: Física 2." },
  { id: "CALCNUM", codigo: "CCMP0096", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["PROG1"], co: ["CALCVET"] },
  { id: "MATEL", codigo: "ELET0053", nome: "Materiais Elétricos",
    periodo: 3, teorica: 30, pratica: 0, categoria: "prof", pre: ["QUIM"] },
  { id: "FERRC", codigo: "—", nome: "Ferramentas Comp. p/ Controle e Automação",
    periodo: 3, teorica: 45, pratica: 15, categoria: "prof", dcext: true, pre: ["PROG2"] },
  { id: "ESTATICA", codigo: "FISC0007", nome: "Estática",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN", "MECANICA"],
    nota: "No perfil vigente: Mecânica 1." },
  { id: "DUA", codigo: "—", nome: "Desenho Universal e Acessibilidade",
    periodo: 3, teorica: 30, pratica: 0, categoria: "prof", dcext: true, pre: ["EXPGR1"] },

  /* ------------------------------------------------------------ 4º período */
  { id: "EQDIF", codigo: "MATM0021", nome: "Equações Diferenciais",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"],
    cadeira: "eqdiferenciais", nota: "No perfil vigente: Cálculo Diferencial e Integral 4." },
  { id: "COMPMAT", codigo: "MATM0006", nome: "Complementos da Matemática",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"], co: ["EQDIF"] },
  { id: "LABFIS", codigo: "—", nome: "Laboratório de Física Básica",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", co: ["ONDTERM"] },
  { id: "ONDTERM", codigo: "FISC0013", nome: "Fund. da Ondulatória e Termodinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FUNDEM"],
    nota: "No perfil vigente: Física 3." },
  { id: "CIRC1", codigo: "ELET0013", nome: "Circuitos Elétricos 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FUNDEM"], co: ["EQDIF"] },
  { id: "DINAM", codigo: "FISC0008", nome: "Dinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["ESTATICA"], co: ["EQDIF"],
    nota: "No perfil vigente: Mecânica 2.", cadeira: "dinamica" },
  { id: "FENTR", codigo: "—", nome: "Fenômenos do Transporte",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", co: ["ONDTERM", "EQDIF"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "MODEL", codigo: "ELET0119", nome: "Modelagem e Análise de Sistemas",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["FERRC", "EQDIF"] },
  { id: "ELMAG1", codigo: "ELET0030", nome: "Eletromagnetismo 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["COMPMAT", "FUNDEM"] },
  { id: "ELETDIG", codigo: "ELET0037", nome: "Eletrônica Digital",
    periodo: 5, teorica: 45, pratica: 15, categoria: "prof", pre: ["CIRC1"],
    nota: "A Tabela 5 lança as 60h como teóricas; a matriz sequencial divide 45h+15h." },
  { id: "ELET1", codigo: "ELET0033", nome: "Eletrônica 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1", "MATEL"] },
  { id: "LABELET1", codigo: "ELET0047", nome: "Laboratório de Eletrônica 1",
    periodo: 5, teorica: 0, pratica: 30, categoria: "prof", co: ["ELET1"] },
  { id: "CIRC2", codigo: "ELET0014", nome: "Circuitos Elétricos 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "RESMAT", codigo: "MCTR0005", nome: "Resistência dos Materiais 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "basico", pre: ["DINAM"] },

  /* ------------------------------------------------------------ 6º período */
  { id: "SISCTRL1", codigo: "ELET0075", nome: "Sistemas de Controle 1",
    periodo: 6, teorica: 60, pratica: 0, categoria: "espec", pre: ["MODEL"] },
  { id: "ENGSEG", codigo: "ENGE0001", nome: "Engenharia de Segurança",
    periodo: 6, teorica: 45, pratica: 0, categoria: "prof", pre: ["CIRC2"] },
  { id: "MECANISM", codigo: "—", nome: "Mecanismos",
    periodo: 6, teorica: 45, pratica: 15, categoria: "espec", dcext: true, pre: ["RESMAT"] },
  { id: "ELETANA", codigo: "ELET0035", nome: "Eletrônica Analógica",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELET1", "CIRC2"] },
  { id: "AUTMAQ", codigo: "—", nome: "Automação de Máquinas",
    periodo: 6, teorica: 30, pratica: 30, categoria: "espec", pre: ["ELETDIG"] },
  { id: "CONVEL", codigo: "ELET0025", nome: "Conversão Eletromecânica de Energia",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELMAG1", "CIRC2"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "SISCTRL2", codigo: "ELET0076", nome: "Sistemas de Controle 2",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["SISCTRL1"] },
  { id: "ROBO", codigo: "—", nome: "Robótica",
    periodo: 7, teorica: 45, pratica: 15, categoria: "espec", pre: ["MODEL", "MECANISM"] },
  { id: "INSTR", codigo: "MECN0027", nome: "Instrumentação e Controle",
    periodo: 7, teorica: 45, pratica: 15, categoria: "espec", pre: ["SISCTRL1", "AUTMAQ"] },
  { id: "LABANADIG", codigo: "MCTR0004", nome: "Lab. de Eletrônica Analógica e Digital",
    periodo: 7, teorica: 0, pratica: 30, categoria: "espec", co: ["EMBARC"] },
  { id: "INSTELE", codigo: "ELET0045", nome: "Instalações Elétricas Industriais",
    periodo: 7, teorica: 45, pratica: 15, categoria: "espec", dcext: true, pre: ["ENGSEG"] },
  { id: "EMBARC", codigo: "—", nome: "Sistemas Embarcados e Prototipação",
    periodo: 7, teorica: 30, pratica: 30, categoria: "espec", pre: ["ELETANA", "AUTMAQ"] },

  /* ------------------------------------------------------------ 8º período */
  { id: "SISCTRL3", codigo: "ELET0120", nome: "Sistemas de Controle 3",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["SISCTRL2", "INSTR"] },
  { id: "IA", codigo: "CCMP0015", nome: "Inteligência Artificial",
    periodo: 8, teorica: 45, pratica: 15, categoria: "espec", pre: ["FERRC", "MODEL"],
    nota: "No perfil vigente é eletiva; em 2021 passou a obrigatória." },
  { id: "HIDPNEU", codigo: "MECN0056", nome: "Sistemas Hidráulicos e Pneumáticos",
    periodo: 8, teorica: 45, pratica: 15, categoria: "espec", dcext: true, pre: ["MODEL", "FENTR"] },
  { id: "ELPOT1", codigo: "ELET0036", nome: "Eletrônica de Potência 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ELETANA"],
    nota: "No perfil vigente: Eletrônica de Potência." },
  { id: "INTEG", codigo: "—", nome: "Integração de Sistemas de Automação",
    periodo: 8, teorica: 30, pratica: 30, categoria: "espec", dcext: true, pre: ["AUTMAQ", "INSTELE"] },
  { id: "METCIENT", codigo: "LETR0009", nome: "Metodologia Científica",
    periodo: 8, teorica: 30, pratica: 0, categoria: "basico" },

  /* ------------------------------------------------------------ 9º período */
  { id: "GESTORG", codigo: "—", nome: "Gestão Organizacional para Engenheiros",
    periodo: 9, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECON"] },
  { id: "EFIC", codigo: "—", nome: "Eficiência Energética",
    periodo: 9, teorica: 45, pratica: 15, categoria: "espec", dcext: true, pre: ["ELPOT1"] },
  { id: "DIREITO", codigo: "DIRT0001", nome: "Direito para Engenheiros",
    periodo: 9, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECON"] },
  { id: "MANUF", codigo: "—", nome: "Sistemas de Manufatura",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["INTEG"] },
  { id: "EL1", codigo: "—", nome: "Eletiva 1", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA },
  { id: "EL2", codigo: "—", nome: "Eletiva 2", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA },

  /* ----------------------------------------------------------- 10º período */
  { id: "PFC", codigo: "MECN0052", nome: "Projeto Final de Curso",
    periodo: 10, teorica: 15, pratica: 45, categoria: "compl", pre: ["METCIENT", "INTEG"] },
  { id: "ESTAGIO", codigo: "MECN0019", nome: "Estágio Supervisionado",
    periodo: 10, teorica: 20, pratica: 160, categoria: "compl", pre: ["ENGSEG"], estagio: true,
    nota: "A ementa do PPC chama o pré-requisito de \"Engenharia de Segurança do Trabalho\", e exige ainda 60% da CH total do curso integralizada." },
  { id: "EL3", codigo: "—", nome: "Eletiva 3", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA },
  { id: "EL4", codigo: "—", nome: "Eletiva 4", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA },
  { id: "ATCOMP", codigo: "LETR0010", nome: "Atividades Complementares",
    periodo: 10, teorica: 0, pratica: 60, categoria: "compl",
    nota: "O PPC não divide a CH em teórica e prática: são 60h de atividades." },
];

/* ==========================================================================
   ENGENHARIA DE CONTROLE E AUTOMAÇÃO — matriz 2010.1 (perfil antigo)

   Fonte: "2010 Projeto Pedagógico Engenharia de Controle e Automação.doc",
   POLI/UPE, 29 páginas. Convertido com
   `soffice --headless --convert-to txt` — sendo tabela de verdade num .doc, e
   não linhas de um PDF, as células saem separadas por TAB e a transcrição é
   direta. A **Tabela 18** (§7.4) é a matriz completa: código, nome, tipo,
   pré-requisito, co-requisito e CH, por período. Os ciclos vêm da Tabela 13 e
   das Tabelas 14 a 17.

   Ainda vale para quem ingressou até 2020 — daí ela estar no site ao lado da
   de 2021.

   ATENÇÃO, e isto não dá para resolver a partir dos documentos: o PPC de 2021
   descreve um perfil "EM EXECUÇÃO desde 2013.1" que tem as MESMAS disciplinas
   desta matriz, porém com os códigos no formato novo da UPE (MAT02 virou
   MATM0018, ELE01 virou ELET0013) e com duas delas em período diferente —
   Português Instrumental sai do 1º para o 2º, e Cálculo Numérico do 2º para o
   3º. Ou seja, entre 2010 e 2021 houve uma recodificação intermediária. O que
   está mapeado aqui é o que o PPC de 2010 imprime.

   O QUE O DOCUMENTO DEIXA EM ABERTO, tudo registrado em `nota` na disciplina:

   1. ADM01 tem pré-requisito "ECN01", código que não existe na matriz. O que
      existe é ECM01, Engenharia Econômica — que é o pré-requisito real (é
      também o de Direito para Engenheiros e de Engenharia de Segurança).
   2. ECA08 lista MEC01 como pré-requisito E como co-requisito. Ficou só como
      pré: as duas coisas ao mesmo tempo não querem dizer nada.
   3. ECA09 aparece sem a divisão teórica/prática, só com o total de 60h.
      Usadas 30h+30h, que é como o PPC de 2021 lista a mesma disciplina.
   4. ECA17 aparece sem tipo, sem pré e sem co-requisito. Ficou sem requisito,
      como está escrito — e não com um palpite.
   5. As três linhas do 10º período não têm código na Tabela 18.
   6. Eletivas: o 9º período traz uma linha só, com a CH embaralhada (180h de
      teórica e 60h de total). O texto que fecha a Tabela 18 diz o que vale:
      "todos os alunos devem cumprir 180 horas do curso com disciplinas
      eletivas". Modeladas como três de 60h.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const NOTA_CICLO_ABERTO =
  "O PPC não diz a que ciclo esta disciplina pertence, e as Tabelas 14 e 15 somam mais do que os ciclos da Tabela 13.";

const NOTA_ELETIVA_2010 =
  "O 9º período traz uma linha só de eletivas, com a CH embaralhada; o texto da Tabela 18 diz que são 180h no total, aqui modeladas como três de 60h.";

const AUTOMACAO_2010 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "MAT02", codigo: "MAT02", nome: "Cálculo Diferencial e Integral 1",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "MAT01", codigo: "MAT01", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "ECA01", codigo: "ECA01", nome: "Informática para Controle e Automação",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "ECA02", codigo: "ECA02", nome: "Lógica Matemática",
    periodo: 1, teorica: 60, pratica: 0, categoria: "espec", nota: NOTA_CICLO_ABERTO },
  { id: "POR01", codigo: "POR01", nome: "Português Instrumental",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico",
    nota: "No perfil recodificado de 2013 esta disciplina passa para o 2º período." },
  { id: "QUI01", codigo: "QUI01", nome: "Química Geral",
    periodo: 1, teorica: 45, pratica: 30, categoria: "basico" },
  { id: "SMA01", codigo: "SMA01", nome: "Sociologia e Meio Ambiente",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },

  /* ------------------------------------------------------------ 2º período */
  { id: "MAT06", codigo: "MAT06", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT01"] },
  { id: "MAT03", codigo: "MAT03", nome: "Cálculo Diferencial e Integral 2",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT02"] },
  { id: "ECA04", codigo: "ECA04", nome: "Cálculo Numérico para Controle e Automação",
    periodo: 2, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA01", "MAT02"],
    nota: "No perfil recodificado de 2013 esta disciplina passa para o 3º período. " + NOTA_CICLO_ABERTO },
  { id: "ECM01", codigo: "ECM01", nome: "Engenharia Econômica",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico", pre: ["SMA01"] },
  { id: "EXP01", codigo: "EXP01", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 30, pratica: 45, categoria: "basico" },
  { id: "FIS01", codigo: "FIS01", nome: "Física 1",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT02"] },
  { id: "ECA03", codigo: "ECA03", nome: "Matemática Discreta para Automação",
    periodo: 2, teorica: 60, pratica: 0, categoria: "prof", pre: ["ECA02"] },

  /* ------------------------------------------------------------ 3º período */
  { id: "MAT04", codigo: "MAT04", nome: "Cálculo Diferencial e Integral 3",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT03"],
    cadeira: "calculo3" },
  { id: "DIR01", codigo: "DIR01", nome: "Direito para Engenheiros",
    periodo: 3, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECM01"] },
  { id: "FIS03", codigo: "FIS03", nome: "Física Experimental: Eletricidade Aplicada",
    periodo: 3, teorica: 0, pratica: 60, categoria: "basico", co: ["FIS02"] },
  { id: "FIS02", codigo: "FIS02", nome: "Física 2",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS01"],
    cadeira: "eletromag",
    nota: "É a física do eletromagnetismo: o laboratório de Eletricidade Aplicada é co-requisito dela, e Circuitos Elétricos 1 e Eletromagnetismo 1 a têm como pré." },
  { id: "MEC01", codigo: "MEC01", nome: "Mecânica Geral 1",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS01", "MAT01"] },
  { id: "MAT08", codigo: "MAT08", nome: "Probabilidade e Estatística",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT02"] },
  { id: "ECA05", codigo: "ECA05", nome: "Processo de Fabricação",
    periodo: 3, teorica: 60, pratica: 0, categoria: "prof", pre: ["QUI01"] },

  /* ------------------------------------------------------------ 4º período */
  { id: "MAT05", codigo: "MAT05", nome: "Cálculo Diferencial e Integral 4",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT04"],
    cadeira: "eqdiferenciais" },
  { id: "ELE01", codigo: "ELE01", nome: "Circuitos Elétricos 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FIS02"], co: ["MAT05"] },
  { id: "MAT09", codigo: "MAT09", nome: "Complementos de Matemática",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT04"] },
  { id: "ECA06", codigo: "ECA06", nome: "Desenho de Máquinas",
    periodo: 4, teorica: 30, pratica: 45, categoria: "espec", pre: ["EXP01"],
    nota: NOTA_CICLO_ABERTO },
  { id: "FIS04", codigo: "FIS04", nome: "Física 3",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS02"] },
  { id: "MEC02", codigo: "MEC02", nome: "Mecânica Geral 2",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MEC01"], cadeira: "dinamica" },

  /* ------------------------------------------------------------ 5º período */
  { id: "ELE02", codigo: "ELE02", nome: "Circuitos Elétricos 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELE01"] },
  { id: "EMG01", codigo: "EMG01", nome: "Eletromagnetismo 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["MAT05", "FIS02"] },
  { id: "ELN01", codigo: "ELN01", nome: "Eletrônica 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELE01"] },
  { id: "ELN02", codigo: "ELN02", nome: "Laboratório de Eletrônica 1",
    periodo: 5, teorica: 0, pratica: 30, categoria: "prof", co: ["ELN01"] },
  { id: "ECA09", codigo: "ECA09", nome: "Materiais Elétricos",
    periodo: 5, teorica: 30, pratica: 30, categoria: "prof", pre: ["QUI01"],
    nota: "A Tabela 18 traz só o total de 60h, sem dividir teórica e prática; usadas 30h+30h, como o PPC de 2021 lista a mesma disciplina." },
  { id: "ECA07", codigo: "ECA07", nome: "Modelagem e Análise de Sistemas",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["MAT09", "FIS04"] },
  { id: "ECA08", codigo: "ECA08", nome: "Metrologia e Projeto Mecânico Aux. por Computador",
    periodo: 5, teorica: 15, pratica: 45, categoria: "espec", pre: ["MEC01", "ECA06"],
    nota: "A Tabela 18 lista MEC01 como pré-requisito E como co-requisito; ficou só como pré. " + NOTA_CICLO_ABERTO },

  /* ------------------------------------------------------------ 6º período */
  { id: "ELE04", codigo: "ELE04", nome: "Conversão Eletromecânica de Energia",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["EMG01", "ELN01"] },
  { id: "ECA11", codigo: "ECA11", nome: "Dinâmica das Máquinas",
    periodo: 6, teorica: 60, pratica: 30, categoria: "espec", pre: ["MAT09"], co: ["ECA10"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ELN04", codigo: "ELN04", nome: "Eletrônica Analógica",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELN01"] },
  { id: "DIG01", codigo: "DIG01", nome: "Eletrônica Digital",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELN01"] },
  { id: "ECA12", codigo: "ECA12", nome: "Lab. de Eletrônica Analógica e Digital",
    periodo: 6, teorica: 0, pratica: 30, categoria: "espec", pre: ["ELN01"], co: ["ELN04"],
    nota: NOTA_CICLO_ABERTO },
  { id: "SEG01", codigo: "SEG01", nome: "Engenharia de Segurança do Trabalho",
    periodo: 6, teorica: 45, pratica: 0, categoria: "prof", pre: ["ECM01"] },
  { id: "ECA10", codigo: "ECA10", nome: "Resistência dos Materiais",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["MEC02"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "ECA13", codigo: "ECA13", nome: "Controladores Lógicos Programáveis",
    periodo: 7, teorica: 15, pratica: 45, categoria: "espec", pre: ["ECA07"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ECA14", codigo: "ECA14", nome: "Elementos de Máquinas",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA10"],
    nota: NOTA_CICLO_ABERTO },
  { id: "POT01", codigo: "POT01", nome: "Eletrônica de Potência",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELN04", "DIG01"] },
  { id: "ECA15", codigo: "ECA15", nome: "Sistemas de Controle 1",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA07"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ECA16", codigo: "ECA16", nome: "Sistemas Digitais",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["MAT04", "DIG01"] },
  { id: "ECA17", codigo: "ECA17", nome: "Termofluídos",
    periodo: 7, teorica: 60, pratica: 30, categoria: "prof",
    nota: "A Tabela 18 deixa em branco o tipo, o pré e o co-requisito desta disciplina." },

  /* ------------------------------------------------------------ 8º período */
  { id: "ECA18", codigo: "ECA18", nome: "Elementos de Robótica",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA11"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ECA19", codigo: "ECA19", nome: "Instrumentação e Controle",
    periodo: 8, teorica: 45, pratica: 15, categoria: "espec", pre: ["ECA13"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ECA20", codigo: "ECA20", nome: "Informática Industrial",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA13"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ECA21", codigo: "ECA21", nome: "Microcontroladores",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA16"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ECA22", codigo: "ECA22", nome: "Sistemas de Controle 2",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA15"],
    nota: NOTA_CICLO_ABERTO },
  { id: "ECA23", codigo: "ECA23", nome: "Sistemas Hidráulicos e Pneumáticos",
    periodo: 8, teorica: 60, pratica: 30, categoria: "espec", pre: ["ECA17"],
    nota: NOTA_CICLO_ABERTO },

  /* ------------------------------------------------------------ 9º período */
  { id: "ADM01", codigo: "ADM01", nome: "Administração",
    periodo: 9, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECM01"],
    nota: "A Tabela 18 cita \"ECN01\" como pré-requisito, código que não existe na matriz; o real é ECM01, Engenharia Econômica." },
  { id: "ECA24", codigo: "ECA24", nome: "Instalações Elétricas Industriais",
    periodo: 9, teorica: 60, pratica: 0, categoria: "prof", pre: ["POT01"] },
  { id: "MET01", codigo: "MET01", nome: "Metodologia Científica",
    periodo: 9, teorica: 30, pratica: 0, categoria: "basico", pre: ["POR01"] },
  { id: "ECA25", codigo: "ECA25", nome: "Qualidade de Energia",
    periodo: 9, teorica: 30, pratica: 0, categoria: "prof", pre: ["POT01"] },
  { id: "ECA26", codigo: "ECA26", nome: "Sistemas de Controle 3",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["ECA22"],
    nota: NOTA_CICLO_ABERTO },
  { id: "EL1", codigo: "—", nome: "Eletiva 1", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_2010 },
  { id: "EL2", codigo: "—", nome: "Eletiva 2", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_2010 },
  { id: "EL3", codigo: "—", nome: "Eletiva 3", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_2010 },

  /* ----------------------------------------------------------- 10º período */
  { id: "ESTAGIO", codigo: "—", nome: "Estágio Supervisionado",
    periodo: 10, teorica: 0, pratica: 160, categoria: "compl", estagio: true,
    nota: "A Tabela 18 não dá código nem requisito ao estágio, e este PPC não publica a regra de CH mínima." },
  { id: "PFC", codigo: "—", nome: "Projeto de Final de Curso",
    periodo: 10, teorica: 30, pratica: 30, categoria: "compl",
    nota: "A Tabela 18 não dá código nem requisito." },
  { id: "ATCOMP", codigo: "—", nome: "Atividades Complementares",
    periodo: 10, teorica: 0, pratica: 60, categoria: "compl",
    nota: "A Tabela 18 traz só o total de 60h, sem dividir teórica e prática." },
];

/* ==========================================================================
   ENGENHARIA CIVIL — matriz 2011 (perfil antigo)

   Fonte: "01 - PROJETO PEDAGÓGICO DE CIVIL - VERSÃO 12092011.pdf",
   POLI/UPE, 36 páginas. A **Tabela 18** (§7.5) é a matriz completa: código,
   nome, tipo, pré-requisito, co-requisito e CH por período. Os núcleos vêm
   das Tabelas 14 (básicos), 15 (profissionalizantes) e 16 (específicos), que
   marcam com asterisco a disciplina contada em mais de um inciso — então dá
   para somar sem contar duas vezes.

   As três somam 1470h + 1470h + 480h = 3420h, que é exatamente a CH das
   obrigatórias declarada em §7.4. Com estágio (180h), PFC (30h) e atividades
   complementares (240h) fecha as 3870h do currículo pleno. Nenhuma conta
   deste PPC briga com outra — o de Automação de 2010 não teve essa sorte.

   O ESTÁGIO tem a regra escrita, e com a conta feita: "somente poderá ser
   feito após o aluno ter concluído pelo menos 60% da carga horária total do
   curso, ou seja, 2.322 horas". 60% de 3870 é 2322 — é o `estagioFracao`
   confirmado pelo próprio documento, e o script confere isso.

   ATENÇÃO à leitura da Tabela 18: as células de requisito com mais de um
   código quebram em linhas que caem ACIMA e ABAIXO da linha da disciplina,
   porque o PDF centraliza a célula na vertical. No 3º período, o que está
   escrito como três linhas soltas entre Expressão Gráfica 2 e Cálculo
   Numérico é uma célula de 3 linhas (FIS01, MAT01, EXP01) pertencente a
   Mecânica Geral 1, e uma de 2 (MAT03, INF01) pertencente a Cálculo
   Numérico — que é a leitura em que os dois requisitos fazem sentido.

   O QUE O DOCUMENTO DEIXA EM ABERTO, registrado em `nota` na disciplina:

   1. LEG01 tem co-requisito "CC02", que não é código desta matriz. Os
      candidatos são CCI02 (Construção Civil 2) e GCC02 (Gestão da Construção
      Civil 2, um G a menos). Com dois candidatos plausíveis, a aresta ficou
      de fora: seta faltando é lacuna, seta errada é mentira.
   2. MAT08 aparece como "MAT8". Os outros códigos da matriz têm dois dígitos.
   3. As atividades complementares aparecem em TODOS os períodos com CH
      "var". São 240h no total (§7.4), aqui num nó só.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const CIVIL_2011 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "MAT01", codigo: "MAT01", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "MAT02", codigo: "MAT02", nome: "Cálculo Diferencial e Integral 1",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "INF01", codigo: "INF01", nome: "Introdução à Programação",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "SMA01", codigo: "SMA01", nome: "Sociologia e Meio Ambiente",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "IEC01", codigo: "IEC01", nome: "Introdução à Engenharia Civil",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "QUI01", codigo: "QUI01", nome: "Química Geral",
    periodo: 1, teorica: 45, pratica: 30, categoria: "basico" },

  /* ------------------------------------------------------------ 2º período */
  { id: "MAT06", codigo: "MAT06", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT01"] },
  { id: "MAT03", codigo: "MAT03", nome: "Cálculo Diferencial e Integral 2",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT02"] },
  { id: "FIS01", codigo: "FIS01", nome: "Física 1",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT02"] },
  { id: "EXP01", codigo: "EXP01", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 30, pratica: 45, categoria: "basico" },
  { id: "POR01", codigo: "POR01", nome: "Português Instrumental",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico" },

  /* ------------------------------------------------------------ 3º período */
  { id: "MAT04", codigo: "MAT04", nome: "Cálculo Diferencial e Integral 3",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT03"],
    cadeira: "calculo3" },
  { id: "FIS02", codigo: "FIS02", nome: "Física 2",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS01"], co: ["MAT04"],
    cadeira: "eletromag",
    nota: "É a física do eletromagnetismo — o mesmo lugar que a matriz de 2021 chama de Fundamentos do Eletromagnetismo." },
  { id: "EXP02", codigo: "EXP02", nome: "Expressão Gráfica 2",
    periodo: 3, teorica: 0, pratica: 45, categoria: "basico", pre: ["EXP01"] },
  { id: "MEC01", codigo: "MEC01", nome: "Mecânica Geral 1",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS01", "MAT01", "EXP01"] },
  { id: "MAT07", codigo: "MAT07", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT03", "INF01"] },

  /* ------------------------------------------------------------ 4º período */
  { id: "MAT05", codigo: "MAT05", nome: "Cálculo Diferencial e Integral 4",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT04"],
    cadeira: "eqdiferenciais" },
  { id: "FEN02", codigo: "FEN02", nome: "Fenômenos de Transporte 2",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT03"], co: ["FIS04"] },
  { id: "FIS04", codigo: "FIS04", nome: "Física 3",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS02"] },
  { id: "FIS05", codigo: "FIS05", nome: "Física Experimental",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", co: ["FIS04"] },
  { id: "MEC02", codigo: "MEC02", nome: "Mecânica Geral 2",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MEC01"], cadeira: "dinamica" },
  { id: "MAT08", codigo: "MAT08", nome: "Probabilidade e Estatística",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT04", "MAT06"],
    nota: "A Tabela 18 imprime o código como \"MAT8\"; os demais códigos da matriz têm dois dígitos." },
  { id: "EXP03", codigo: "EXP03", nome: "Desenho Técnico",
    periodo: 4, teorica: 30, pratica: 30, categoria: "prof", pre: ["EXP02"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "MCC01", codigo: "MCC01", nome: "Materiais de Construção 1",
    periodo: 5, teorica: 45, pratica: 30, categoria: "basico", co: ["GEO01", "RMA01"] },
  { id: "TOP01", codigo: "TOP01", nome: "Topografia 1",
    periodo: 5, teorica: 30, pratica: 30, categoria: "prof", pre: ["EXP03"] },
  { id: "GEO01", codigo: "GEO01", nome: "Fundamentos de Geologia",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["QUI01"],
    nota: "Aqui o pré-requisito está escrito: Química Geral. No PPC de 2021 esta mesma disciplina aparece com \"FIS02\", código que não existe naquela matriz." },
  { id: "RMA01", codigo: "RMA01", nome: "Resistência dos Materiais 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["MEC02"] },
  { id: "HID01", codigo: "HID01", nome: "Hidráulica",
    periodo: 5, teorica: 60, pratica: 30, categoria: "prof", pre: ["FEN02"] },

  /* ------------------------------------------------------------ 6º período */
  { id: "TOP02", codigo: "TOP02", nome: "Topografia 2",
    periodo: 6, teorica: 60, pratica: 30, categoria: "prof", pre: ["TOP01"] },
  { id: "MCC02", codigo: "MCC02", nome: "Materiais de Construção 2",
    periodo: 6, teorica: 30, pratica: 30, categoria: "prof", pre: ["MCC01"] },
  { id: "RMA02", codigo: "RMA02", nome: "Resistência dos Materiais 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["RMA01"] },
  { id: "HID02", codigo: "HID02", nome: "Hidrologia Aplicada",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["HID01"] },
  { id: "SOL01", codigo: "SOL01", nome: "Mecânica dos Solos 1",
    periodo: 6, teorica: 60, pratica: 30, categoria: "prof", pre: ["GEO01"], co: ["RMA01"] },
  { id: "ARQ01", codigo: "ARQ01", nome: "Arquitetura",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["TOP01"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "CON01", codigo: "CON01", nome: "Concreto 1",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["RMA02"] },
  { id: "EST01", codigo: "EST01", nome: "Estradas 1",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["TOP02"] },
  { id: "SAN01", codigo: "SAN01", nome: "Saneamento 1",
    periodo: 7, teorica: 60, pratica: 30, categoria: "prof", pre: ["HID01"] },
  { id: "SOL02", codigo: "SOL02", nome: "Mecânica dos Solos 2",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["SOL01"] },
  { id: "SHT01", codigo: "SHT01", nome: "Engenharia de Segurança do Trabalho",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["MCC02"], co: ["SMA01"] },
  { id: "TES01", codigo: "TES01", nome: "Teoria das Estruturas 1",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["RMA02"] },

  /* ------------------------------------------------------------ 8º período */
  { id: "CON02", codigo: "CON02", nome: "Concreto 2",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["CON01"] },
  { id: "TES02", codigo: "TES02", nome: "Teoria das Estruturas 2",
    periodo: 8, teorica: 60, pratica: 0, categoria: "prof", pre: ["TES01"] },
  { id: "CCI01", codigo: "CCI01", nome: "Construção Civil 1",
    periodo: 8, teorica: 60, pratica: 30, categoria: "prof", pre: ["MCC02"] },
  { id: "EST02", codigo: "EST02", nome: "Estradas 2",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["EST01", "SOL01"] },
  { id: "FUN01", codigo: "FUN01", nome: "Fundações 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["SOL02"] },
  { id: "SAN02", codigo: "SAN02", nome: "Saneamento 2",
    periodo: 8, teorica: 60, pratica: 0, categoria: "prof", pre: ["SAN01"] },
  { id: "ESS01", codigo: "ESS01", nome: "Estágio Supervisionado",
    periodo: 8, teorica: 45, pratica: 135, categoria: "compl", estagio: true,
    nota: "A Tabela 18 põe \"60%CH\" no lugar do pré-requisito: são 2.322h das 3.870h do curso." },

  /* ------------------------------------------------------------ 9º período */
  { id: "CCI02", codigo: "CCI02", nome: "Construção Civil 2",
    periodo: 9, teorica: 60, pratica: 0, categoria: "prof", pre: ["CCI01"] },
  { id: "GCA01", codigo: "GCA01", nome: "Gestão e Controle Ambiental",
    periodo: 9, teorica: 60, pratica: 0, categoria: "prof", pre: ["SAN01"] },
  { id: "TRA01", codigo: "TRA01", nome: "Técnica e Economia dos Transportes",
    periodo: 9, teorica: 60, pratica: 0, categoria: "prof", pre: ["EST02"] },
  { id: "GCC01", codigo: "GCC01", nome: "Gestão da Construção Civil 1",
    periodo: 9, teorica: 60, pratica: 0, categoria: "basico", pre: ["CCI01"] },
  { id: "PON01", codigo: "PON01", nome: "Pontes 1",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["CON02"] },
  { id: "MET01", codigo: "MET01", nome: "Metodologia da Pesquisa",
    periodo: 9, teorica: 30, pratica: 0, categoria: "basico", co: ["ESS01"] },

  /* ----------------------------------------------------------- 10º período */
  { id: "CAM01", codigo: "CAM01", nome: "Construção de Aço e Madeira",
    periodo: 10, teorica: 60, pratica: 0, categoria: "espec", pre: ["TES02"] },
  { id: "GCC02", codigo: "GCC02", nome: "Gestão da Construção Civil 2",
    periodo: 10, teorica: 60, pratica: 0, categoria: "prof", pre: ["GCC01"] },
  { id: "INS01", codigo: "INS01", nome: "Instalações Prediais",
    periodo: 10, teorica: 60, pratica: 0, categoria: "basico", pre: ["CCI01"] },
  { id: "PTO01", codigo: "PTO01", nome: "Portos 1",
    periodo: 10, teorica: 60, pratica: 0, categoria: "espec", pre: ["HID01", "RMA02"] },
  { id: "LEG01", codigo: "LEG01", nome: "Legislação e Exercício Profissional",
    periodo: 10, teorica: 30, pratica: 0, categoria: "basico",
    nota: "A Tabela 18 dá a esta disciplina o co-requisito \"CC02\", que não é código desta matriz; os candidatos são CCI02 e GCC02, e com dois plausíveis a seta ficou de fora." },
  { id: "PFC01", codigo: "PFC01", nome: "Projeto Final de Curso",
    periodo: 10, teorica: 0, pratica: 30, categoria: "compl", pre: ["MET01"] },
  { id: "ATCOMP", codigo: "—", nome: "Atividades Complementares",
    periodo: 10, teorica: 0, pratica: 240, categoria: "compl",
    nota: "Aparecem em todos os dez períodos com CH \"var\"; são 240h no total, e o PPC não as divide em teórica e prática." },
];

/* ==========================================================================
   ENGENHARIA MECÂNICA INDUSTRIAL — matriz 2012

   Fonte: "01A Projeto pedagógico vs. 09.2011.pdf", POLI/UPE, 39 páginas,
   datado de agosto de 2012. A **Tabela 18** (§7.4, p. 24-28) é a matriz
   completa. Ciclos na Tabela 13 e nas Tabelas 14 a 17.

   O QUE ESTE PPC TEM DE DIFERENTE: a Tabela 18 diz o ciclo de cada
   disciplina **pela cor da célula** — "as disciplinas destacadas em laranja
   pertencem ao ciclo básico, as destacadas em verde são do ciclo profissional
   específico e as demais do ciclo profissional essencial". Cor não sai no
   `pdftotext`; foi preciso ler as páginas como imagem. Valeu a pena, porque
   as três cores somam exatamente o que a Tabela 13 declara:

     laranja  1515h = Ciclo Básico
     branco   1200h = Ciclo Profissional Essencial
     verde     885h = Ciclo Profissional Específico
                      (525h obrigatórias + 120h eletivas + PFC 60h + estágio 180h)
     + 60h de Atividade Complementar (Ciclo Complementar) = 3660h

   ESTÁGIO SEM PISO DE CARGA HORÁRIA. Este PPC não publica regra de %: o
   estágio está no 7º período e é liberado por pré-requisito (Engenharia de
   Segurança), como qualquer outra disciplina. Daí `estagioFracao` ficar
   ausente aqui — e não 0.6 por analogia com os outros cursos. Emprestar os
   60% inventaria uma exigência que este curso não faz, e ainda por cima
   impossível: 60% de 3660h são 2196h, e até o fim do 6º período o aluno
   acumulou 2190h.

   O QUE O DOCUMENTO DEIXA EM ABERTO, registrado em `nota` na disciplina:

   1. Física 2 e Mecânica Geral 1 têm pré-requisito "FIS01", código do
      registro ANTIGO da UPE, que não existe nesta matriz. O que existe é
      FISC0011, Física 1 — e é o pré-requisito real das duas.
   2. Mecânica Geral 2 aparece com pré-requisito Física 2 (FISC0012), e não
      Mecânica Geral 1. Ficou como está escrito: é código válido desta matriz,
      então não há erro a corrigir, só uma escolha estranha a registrar.
   3. Mecanismos vem com o código "ECA10", que é do registro do PPC de
      Automação de 2010 — sobra de recorta-e-cola. O código real desta
      disciplina não está publicado.
   4. "EMAQ0001" aparece duas vezes, em Elementos de Máquinas 1 e 2.
   5. Economia Empresarial e Gestão da Qualidade são co-requisito UMA DA
      OUTRA. As duas linhas estão escritas assim, então é de propósito: têm
      de ser cursadas juntas.
   6. A Atividade Complementar (60h) não aparece na Tabela 18, só na 13 e na
      17. Entra aqui num nó só, fora da conferência por período.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const NOTA_FIS01 =
  "A Tabela 18 cita \"FIS01\" como pré-requisito, código do registro antigo da UPE que não existe nesta matriz; o real é FISC0011, Física 1.";

const MECANICA_2012 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "MATM0018", codigo: "MATM0018", nome: "Cálculo Diferencial e Integral 1",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "MATM0007", codigo: "MATM0007", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "QUIM0002", codigo: "QUIM0002", nome: "Química Geral",
    periodo: 1, teorica: 45, pratica: 30, categoria: "basico" },
  { id: "SOCL0002", codigo: "SOCL0002", nome: "Sociologia e Meio Ambiente",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "CCMP0094", codigo: "CCMP0094", nome: "Introdução à Programação",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "ENGE0002", codigo: "ENGE0002", nome: "Introdução à Engenharia Mecânica",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },

  /* ------------------------------------------------------------ 2º período */
  { id: "MATM0001", codigo: "MATM0001", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MATM0007"] },
  { id: "MATM0019", codigo: "MATM0019", nome: "Cálculo Diferencial e Integral 2",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MATM0018"] },
  { id: "LETR0001", codigo: "LETR0001", nome: "Expressão em Língua Portuguesa",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "ARTE0001", codigo: "ARTE0001", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 30, pratica: 45, categoria: "basico" },
  { id: "FISC0011", codigo: "FISC0011", nome: "Física 1",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MATM0018"] },

  /* ------------------------------------------------------------ 3º período */
  { id: "MATM0020", codigo: "MATM0020", nome: "Cálculo Diferencial e Integral 3",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MATM0019"],
    cadeira: "calculo3" },
  { id: "CCMP0096", codigo: "CCMP0096", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CCMP0094"] },
  { id: "FISC0016", codigo: "FISC0016", nome: "Eletricidade Aplicada",
    periodo: 3, teorica: 0, pratica: 30, categoria: "basico", co: ["FISC0012"] },
  { id: "FISC0012", codigo: "FISC0012", nome: "Física 2",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FISC0011"],
    cadeira: "eletromag",
    nota: NOTA_FIS01 + " É a física do eletromagnetismo." },
  { id: "FISC0007", codigo: "FISC0007", nome: "Mecânica Geral 1",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FISC0011"],
    nota: NOTA_FIS01 },
  { id: "FISC0009", codigo: "FISC0009", nome: "Eletricidade Básica",
    periodo: 3, teorica: 45, pratica: 0, categoria: "basico", co: ["FISC0016"] },
  { id: "MECN0004", codigo: "MECN0004", nome: "Ciências dos Materiais",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico" },

  /* ------------------------------------------------------------ 4º período */
  { id: "MATM0021", codigo: "MATM0021", nome: "Cálculo Diferencial e Integral 4",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MATM0020"],
    cadeira: "eqdiferenciais" },
  { id: "FISC0013", codigo: "FISC0013", nome: "Física 3",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FISC0012"] },
  { id: "FISC0018", codigo: "FISC0018", nome: "Física Experimental",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", pre: ["FISC0012"] },
  { id: "MECN0039", codigo: "MECN0039", nome: "Materiais de Construção Mecânica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MECN0004"] },
  { id: "FISC0008", codigo: "FISC0008", nome: "Mecânica Geral 2",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FISC0012"],
    nota: "A Tabela 18 dá como pré-requisito Física 2, e não Mecânica Geral 1, que seria o encadeamento esperado. Fica como está escrito: é código válido desta matriz.", cadeira: "dinamica" },
  { id: "FISC0017", codigo: "FISC0017", nome: "Mecânica dos Fluidos",
    periodo: 4, teorica: 45, pratica: 15, categoria: "basico", pre: ["MATM0020"] },
  { id: "PRBE0002", codigo: "PRBE0002", nome: "Probabilidade e Estatística",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MATM0020"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "DSTC0001", codigo: "DSTC0001", nome: "Desenho Técnico Fundamental",
    periodo: 5, teorica: 15, pratica: 45, categoria: "prof", pre: ["ARTE0001"] },
  { id: "MAQH0001", codigo: "MAQH0001", nome: "Máquinas Hidráulicas",
    periodo: 5, teorica: 45, pratica: 15, categoria: "prof", pre: ["FISC0017"] },
  { id: "RMAT0001", codigo: "RMAT0001", nome: "Resistência dos Materiais 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["FISC0008"] },
  { id: "METR0001", codigo: "METR0001", nome: "Metrologia",
    periodo: 5, teorica: 15, pratica: 45, categoria: "prof" },
  { id: "MECA0001", codigo: "MECA0001", nome: "Mecânica Aplicada",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["FISC0008"] },
  { id: "TERM0001", codigo: "TERM0001", nome: "Termodinâmica 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["FISC0013"] },
  { id: "ENGS0001", codigo: "ENGS0001", nome: "Engenharia de Segurança",
    periodo: 5, teorica: 45, pratica: 0, categoria: "prof" },

  /* ------------------------------------------------------------ 6º período */
  { id: "DSTC0002", codigo: "DSTC0002", nome: "Desenho Técnico Mecânico",
    periodo: 6, teorica: 15, pratica: 75, categoria: "prof", pre: ["DSTC0001"] },
  { id: "IEIN0001", codigo: "IEIN0001", nome: "Instalações Elétricas Industriais",
    periodo: 6, teorica: 45, pratica: 0, categoria: "espec", pre: ["FISC0009"] },
  { id: "RMAT0002", codigo: "RMAT0002", nome: "Resistência dos Materiais 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["RMAT0001"] },
  { id: "TERM0002", codigo: "TERM0002", nome: "Termodinâmica 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["TERM0001"] },
  { id: "TCAL0001", codigo: "TCAL0001", nome: "Transmissão de Calor",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["TERM0001"], co: ["TERM0002"] },
  { id: "ENSM0001", codigo: "ENSM0001", nome: "Ensaios Mecânicos",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["METR0001", "MECN0039"] },
  { id: "ECA10", codigo: "ECA10", nome: "Mecanismos",
    periodo: 6, teorica: 45, pratica: 0, categoria: "prof", pre: ["MECA0001"],
    nota: "O código \"ECA10\" é do registro do PPC de Automação de 2010, não do formato desta matriz — sobra de recorta-e-cola. O código real desta disciplina não está publicado." },

  /* ------------------------------------------------------------ 7º período */
  { id: "DSTC0003", codigo: "DSTC0003", nome: "Desenho Técnico Mecânico em Computador",
    periodo: 7, teorica: 0, pratica: 45, categoria: "prof", pre: ["DSTC0002"] },
  { id: "EMAQ0001", codigo: "EMAQ0001", nome: "Elementos de Máquinas 1",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["RMAT0002"] },
  { id: "INID0001", codigo: "INID0001", nome: "Instrumentação Industrial",
    periodo: 7, teorica: 15, pratica: 15, categoria: "espec" },
  { id: "SHPN0001", codigo: "SHPN0001", nome: "Sistemas Hidráulicos e Pneumáticos",
    periodo: 7, teorica: 60, pratica: 30, categoria: "espec", pre: ["FISC0017"] },
  { id: "SOLD0001", codigo: "SOLD0001", nome: "Soldagem",
    periodo: 7, teorica: 30, pratica: 30, categoria: "espec", pre: ["FISC0016"] },
  { id: "ESTG0001", codigo: "ESTG0001", nome: "Estágio Supervisionado",
    periodo: 7, teorica: 0, pratica: 180, categoria: "compl", pre: ["ENGS0001"], estagio: true,
    nota: "Liberado por pré-requisito, e não por carga horária: este PPC não publica piso de CH para o estágio." },
  { id: "VIBM0001", codigo: "VIBM0001", nome: "Vibrações Mecânicas",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["MATM0020", "MECA0001"] },

  /* ------------------------------------------------------------ 8º período */
  { id: "EMAQ0002", codigo: "—", nome: "Elementos de Máquinas 2",
    periodo: 8, teorica: 60, pratica: 0, categoria: "prof", pre: ["RMAT0002"],
    nota: "A Tabela 18 repete o código EMAQ0001, já usado por Elementos de Máquinas 1; o código desta não está publicado." },
  { id: "PRFB0001", codigo: "PRFB0001", nome: "Processos de Usinagem",
    periodo: 8, teorica: 45, pratica: 15, categoria: "espec", pre: ["MECN0039"] },
  { id: "INID0002", codigo: "INID0002", nome: "Instalações Industriais",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["RMAT0002"] },
  { id: "PRFB0002", codigo: "PRFB0002", nome: "Processos de Conformação",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["MECN0039"] },
  { id: "MAQT0001", codigo: "MAQT0001", nome: "Máquinas Térmicas 1",
    periodo: 8, teorica: 45, pratica: 15, categoria: "prof", pre: ["TERM0002"] },
  { id: "PRFB0003", codigo: "PRFB0003", nome: "Prática de Oficina",
    periodo: 8, teorica: 15, pratica: 45, categoria: "prof", pre: ["ENGS0001", "SOLD0001"] },

  /* ------------------------------------------------------------ 9º período */
  { id: "ECON0001", codigo: "ECON0001", nome: "Economia Empresarial",
    periodo: 9, teorica: 60, pratica: 0, categoria: "basico", co: ["QUAL0001"] },
  { id: "DIRE0001", codigo: "DIRE0001", nome: "Direito para Engenheiros",
    periodo: 9, teorica: 30, pratica: 0, categoria: "basico", pre: ["LETR0001"] },
  { id: "MAQT0002", codigo: "MAQT0002", nome: "Máquinas Térmicas 2",
    periodo: 9, teorica: 30, pratica: 0, categoria: "prof", pre: ["TERM0002"] },
  { id: "QUAL0001", codigo: "QUAL0001", nome: "Gestão da Qualidade",
    periodo: 9, teorica: 45, pratica: 0, categoria: "prof", co: ["ECON0001"],
    nota: "Economia Empresarial e Gestão da Qualidade são co-requisito uma da outra na Tabela 18: têm de ser cursadas juntas." },
  { id: "REFR0001", codigo: "REFR0001", nome: "Refrigeração",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["TCAL0001", "TERM0002"] },
  { id: "EL1", codigo: "—", nome: "Eletiva 1",
    periodo: 9, teorica: 30, pratica: 0, categoria: "eletiva",
    nota: "São 120h de eletivas no total: duas de 30h no 9º período e uma de 60h no 10º." },
  { id: "EL2", codigo: "—", nome: "Eletiva 2",
    periodo: 9, teorica: 30, pratica: 0, categoria: "eletiva",
    nota: "São 120h de eletivas no total: duas de 30h no 9º período e uma de 60h no 10º." },

  /* ----------------------------------------------------------- 10º período */
  { id: "ADMI0001", codigo: "ADMI0001", nome: "Administração Industrial",
    periodo: 10, teorica: 60, pratica: 0, categoria: "basico", pre: ["ECON0001"] },
  { id: "MELT0001", codigo: "MELT0001", nome: "Máquinas de Elevação e Transporte",
    periodo: 10, teorica: 60, pratica: 0, categoria: "espec", pre: ["INID0002"] },
  { id: "EL3", codigo: "—", nome: "Eletiva 3",
    periodo: 10, teorica: 60, pratica: 0, categoria: "eletiva",
    nota: "São 120h de eletivas no total: duas de 30h no 9º período e uma de 60h no 10º." },
  { id: "PFC00001", codigo: "PFC00001", nome: "Projeto Final de Curso",
    periodo: 10, teorica: 0, pratica: 60, categoria: "compl", pre: ["QUAL0001"] },
  { id: "ATCOMP", codigo: "—", nome: "Atividade Complementar",
    periodo: 10, teorica: 0, pratica: 60, categoria: "compl",
    nota: "Não aparece na Tabela 18, só nas Tabelas 13 e 17: são 60h, o Ciclo Complementar inteiro." },
];

/* ==========================================================================
   ENGENHARIA MECÂNICA — matriz 2021.1

   Fonte: "Engenharia-Mecânica_PPC_Revisão_2021_FINAL_12_01_2022.pdf",
   POLI/UPE, 284 páginas. É o PPC de melhor estrutura dos cinco lidos até
   aqui: a **Tabela 7** (§3.6.3) traz área, disciplina, pré, correquisito,
   tipo, período e CH de uma vez, e a **matriz sequencial** (§3.6.4) repete
   tudo com uma coluna a mais, o **Núcleo** de cada disciplina — o que
   dispensa reconstruir a categoria a partir de somas.

   Note o nome: em 2012 o curso chamava-se Engenharia Mecânica INDUSTRIAL.
   As duas grades aparecem juntas no site sob "Engenharia Mecânica" porque
   são o mesmo curso, renomeado.

   O QUE ESTE CURSO FAZ DIFERENTE DOS OUTROS: a regra de carga horária não é
   do estágio, é do **PFC** — "ter integralizado 80% da carga horária do
   curso". O estágio aqui é liberado por pré-requisito (Engenharia de
   segurança do trabalho), como qualquer disciplina. Por isso `estagio: true`
   está no PFC, e o rótulo do mapa segue o nome da disciplina marcada.

   SEM CÓDIGOS. O próprio PPC explica: "os códigos das disciplinas são
   gerados automaticamente pelo sistema de gestão acadêmica - Siga". Não
   emprestei os da matriz de 2012 porque seria cruzar dois documentos de
   cursos com nomes diferentes, e onde a disciplina foi renomeada (Processos
   de Usinagem virou Processos de fabricação 1?) o palpite não se sustenta.

   O QUE O DOCUMENTO DEIXA EM ABERTO, registrado em `nota` na disciplina:

   1. Cálculo diferencial e integral vetorial aparece na Tabela 7 como
      correquisito DE SI MESMA.
   2. Na matriz sequencial, Elementos de máquinas 2 aparece com
      pré-requisito Elementos de máquinas 2. A Tabela 7 diz Elementos de
      máquinas 1, que é o encadeamento óbvio, e é o que ficou.
   3. Gestão financeira e de custos tem um pré-requisito na sequencial
      (Gestão da qualidade) e três na Tabela 7. Ficou o da sequencial, que é
      a matriz em execução.
   4. O estágio tem CH 180 nas duas tabelas, mas a sequencial divide 20+180 —
      que soma 200. A divisão de 30+150 da Tabela 7 é a que fecha.
   5. Metrologia tem pré-requisito "Probabilidade e estática", sem o "ti".
   6. As atividades complementares não têm período na Tabela 7, e não têm
      linha na sequencial — mas as 60h estão no subtotal do 10º período.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const NOTA_ELETIVA_MEC =
  "A matriz sequencial não divide CH teórica e prática das eletivas; o total é 60h.";
const NOTA_EXTENSAO =
  "Eletiva de extensão: a CH conta nas 360h de extensão do curso. O PPC não divide teórica e prática.";

const MECANICA_2021 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "QUIM", codigo: "—", nome: "Química",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "PORT", codigo: "—", nome: "Português Instrumental",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "CALC1", codigo: "—", nome: "Cálc. Dif. e Integral em uma Variável",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "GEOAN", codigo: "—", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "PROG", codigo: "—", nome: "Introdução à Programação",
    periodo: 1, teorica: 45, pratica: 15, categoria: "basico" },
  { id: "SOCIO", codigo: "—", nome: "Sociologia, Meio Amb. e Contexto Social",
    periodo: 1, teorica: 15, pratica: 15, categoria: "basico", dcext: true },
  { id: "INTROMEC", codigo: "—", nome: "Introdução à Engenharia Mecânica",
    periodo: 1, teorica: 30, pratica: 0, categoria: "prof" },

  /* ------------------------------------------------------------ 2º período */
  { id: "ALGLIN", codigo: "—", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN"] },
  { id: "CALC2", codigo: "—", nome: "Cálc. Dif. e Integral em Várias Variáveis",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "FUNDMEC", codigo: "—", nome: "Fundamentos da Mecânica",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "PROBEST", codigo: "—", nome: "Probabilidade e Estatística",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "EXPGR1", codigo: "—", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 45, pratica: 30, categoria: "basico" },

  /* ------------------------------------------------------------ 3º período */
  { id: "CALCVET", codigo: "—", nome: "Cálc. Dif. e Integral Vetorial",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"],
    cadeira: "calculo3",
    nota: "A Tabela 7 põe esta disciplina como correquisito de si mesma; o correquisito foi descartado." },
  { id: "CALCNUM", codigo: "—", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"] },
  { id: "ESTATICA", codigo: "—", nome: "Estática",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN", "FUNDMEC"] },
  { id: "FUNDEM", codigo: "—", nome: "Fundamentos do Eletromagnetismo",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FUNDMEC"], co: ["CALCVET"],
    cadeira: "eletromag" },
  { id: "DUA", codigo: "—", nome: "Desenho Universal e Acessibilidade",
    periodo: 3, teorica: 15, pratica: 15, categoria: "basico", dcext: true, pre: ["EXPGR1"] },
  { id: "CIENCMAT", codigo: "—", nome: "Ciências dos Materiais",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["QUIM"] },
  { id: "METROL", codigo: "—", nome: "Metrologia",
    periodo: 3, teorica: 30, pratica: 30, categoria: "prof", pre: ["PROBEST"],
    nota: "O PPC escreve o pré-requisito como \"Probabilidade e estática\", sem o \"ti\"." },

  /* ------------------------------------------------------------ 4º período */
  { id: "ONDTERM", codigo: "—", nome: "Fund. da Ondulatória e Termodinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FUNDEM"] },
  { id: "LABFIS", codigo: "—", nome: "Laboratório de Física Básica",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", pre: ["FUNDMEC"], co: ["ONDTERM"] },
  { id: "DINAM", codigo: "—", nome: "Dinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["ESTATICA"], co: ["EQDIF"], cadeira: "dinamica" },
  { id: "EQDIF", codigo: "—", nome: "Equações Diferenciais",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"],
    cadeira: "eqdiferenciais" },
  { id: "COMPMAT", codigo: "—", nome: "Complementos de Matemática",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"], co: ["EQDIF"] },
  { id: "MECFLU", codigo: "—", nome: "Mecânica dos Fluidos",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"], co: ["ONDTERM"] },
  { id: "MATCONSTR", codigo: "—", nome: "Materiais de Construção Mecânica",
    periodo: 4, teorica: 30, pratica: 0, categoria: "prof", pre: ["CIENCMAT"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "INSTELE", codigo: "—", nome: "Instalações Elétricas Industriais",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["FUNDEM"] },
  { id: "MAQHID", codigo: "—", nome: "Máquinas Hidráulicas",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["MECFLU"] },
  { id: "GESTPROJ", codigo: "—", nome: "Gestão de Projetos",
    periodo: 5, teorica: 30, pratica: 0, categoria: "prof", pre: ["EQDIF"] },
  { id: "DESTEC1", codigo: "—", nome: "Desenho Técnico Mecânico 1",
    periodo: 5, teorica: 15, pratica: 45, categoria: "prof", pre: ["EXPGR1", "METROL"] },
  { id: "PROCFAB1", codigo: "—", nome: "Processos de Fabricação 1",
    periodo: 5, teorica: 45, pratica: 15, categoria: "prof", pre: ["METROL", "MATCONSTR"] },
  { id: "MECANISM", codigo: "—", nome: "Mecanismos",
    periodo: 5, teorica: 30, pratica: 30, categoria: "prof", dcext: true, pre: ["DINAM", "CALCNUM"] },
  { id: "RESMAT1", codigo: "—", nome: "Resistência dos Materiais 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ESTATICA"] },

  /* ------------------------------------------------------------ 6º período */
  { id: "TRANSCAL", codigo: "—", nome: "Transmissão de Calor",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ONDTERM"] },
  { id: "TERMO1", codigo: "—", nome: "Termodinâmica 1",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", co: ["TRANSCAL"] },
  { id: "QUALID", codigo: "—", nome: "Gestão da Qualidade",
    periodo: 6, teorica: 30, pratica: 0, categoria: "prof", pre: ["PROBEST"] },
  { id: "MANUT", codigo: "—", nome: "Gestão da Manutenção",
    periodo: 6, teorica: 30, pratica: 0, categoria: "prof", pre: ["PROBEST", "GESTPROJ"] },
  { id: "ENGSEG", codigo: "—", nome: "Engenharia de Segurança do Trabalho",
    periodo: 6, teorica: 45, pratica: 0, categoria: "prof", co: ["QUALID"] },
  { id: "PROCFAB2", codigo: "—", nome: "Processos de Fabricação 2",
    periodo: 6, teorica: 45, pratica: 15, categoria: "prof", pre: ["PROCFAB1"] },
  { id: "RESMAT2", codigo: "—", nome: "Resistência dos Materiais 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["RESMAT1"] },
  { id: "DESTEC2", codigo: "—", nome: "Desenho Técnico Mecânico 2",
    periodo: 6, teorica: 15, pratica: 45, categoria: "prof", pre: ["DESTEC1"], co: ["PROCFAB2"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "INSTRCTRL", codigo: "—", nome: "Instrumentação e Controle",
    periodo: 7, teorica: 45, pratica: 15, categoria: "prof", pre: ["INSTELE"] },
  { id: "TERMO2", codigo: "—", nome: "Termodinâmica 2",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["TERMO1"] },
  { id: "DIREITO", codigo: "—", nome: "Direito para Engenheiros",
    periodo: 7, teorica: 30, pratica: 0, categoria: "basico", co: ["GESTFIN"] },
  { id: "GESTFIN", codigo: "—", nome: "Gestão Financeira e de Custos",
    periodo: 7, teorica: 60, pratica: 0, categoria: "basico", pre: ["QUALID"],
    nota: "A matriz sequencial dá um pré-requisito (Gestão da qualidade); a Tabela 7 dá três, somando Resistência dos Materiais 2 e Desenho Técnico Mecânico 2. Ficou o da sequencial, que é a matriz em execução." },
  { id: "SOLDA", codigo: "—", nome: "Soldagem",
    periodo: 7, teorica: 45, pratica: 15, categoria: "prof", pre: ["MATCONSTR"], co: ["ENSAIOS"] },
  { id: "ENSAIOS", codigo: "—", nome: "Ensaios Mecânicos",
    periodo: 7, teorica: 45, pratica: 15, categoria: "prof", pre: ["RESMAT2", "PROCFAB2"] },
  { id: "VIBRA", codigo: "—", nome: "Vibrações Mecânicas",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["MECANISM"] },
  { id: "ELEMAQ1", codigo: "—", nome: "Elementos de Máquinas 1",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["MECANISM", "RESMAT2"] },
  { id: "ESTAGIO", codigo: "—", nome: "Estágio Supervisionado",
    periodo: 7, teorica: 30, pratica: 150, categoria: "compl", pre: ["ENGSEG"],
    nota: "Liberado por pré-requisito: neste curso a regra de carga horária é do PFC, não do estágio. A matriz sequencial divide a CH em 20+180, que soma 200; a divisão de 30+150 da Tabela 7 é a que fecha as 180h." },

  /* ------------------------------------------------------------ 8º período */
  { id: "MAQTERM1", codigo: "—", nome: "Máquinas Térmicas 1",
    periodo: 8, teorica: 30, pratica: 0, categoria: "prof", pre: ["TERMO2"] },
  { id: "HIDPNEU", codigo: "—", nome: "Sistemas Hidráulicos e Pneumáticos",
    periodo: 8, teorica: 30, pratica: 30, categoria: "prof", dcext: true, pre: ["MAQHID"] },
  { id: "GESTEMP", codigo: "—", nome: "Gestão e Planejamento Empresarial",
    periodo: 8, teorica: 60, pratica: 0, categoria: "basico", pre: ["GESTFIN"] },
  { id: "PRATOF", codigo: "—", nome: "Prática de Oficina",
    periodo: 8, teorica: 15, pratica: 45, categoria: "prof", pre: ["DESTEC2", "ENSAIOS"] },
  { id: "PROJINT", codigo: "—", nome: "Projeto Integrado",
    periodo: 8, teorica: 0, pratica: 30, categoria: "basico", pre: ["GESTPROJ"],
    co: ["PRATOF", "ELEMAQ2"] },
  { id: "MAQELEV", codigo: "—", nome: "Máquina de Elevação e Transporte",
    periodo: 8, teorica: 60, pratica: 0, categoria: "prof", co: ["ELEMAQ2"] },
  { id: "ELEMAQ2", codigo: "—", nome: "Elementos de Máquinas 2",
    periodo: 8, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELEMAQ1"],
    nota: "A matriz sequencial dá a esta disciplina o pré-requisito \"Elementos de máquinas 2\" — ela mesma; a Tabela 7 diz Elementos de máquinas 1, que é o encadeamento real." },

  /* ------------------------------------------------------------ 9º período */
  { id: "EL1", codigo: "—", nome: "Eletiva 1", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_MEC },
  { id: "EL2", codigo: "—", nome: "Eletiva 2", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_MEC },
  { id: "ELEXT1", codigo: "—", nome: "Eletiva de Extensão 1", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", dcext: true, nota: NOTA_EXTENSAO },
  { id: "ELEXT2", codigo: "—", nome: "Eletiva de Extensão 2", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", dcext: true, nota: NOTA_EXTENSAO },

  /* ----------------------------------------------------------- 10º período */
  { id: "ELEXT3", codigo: "—", nome: "Eletiva de Extensão 3", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", dcext: true, nota: NOTA_EXTENSAO },
  { id: "PFC", codigo: "—", nome: "Projeto Final de Curso",
    periodo: 10, teorica: 0, pratica: 60, categoria: "compl", estagio: true,
    nota: "O pré-requisito não é disciplina: é ter integralizado 80% da carga horária do curso, 2.880h das 3.600h." },
  { id: "ATCOMP", codigo: "—", nome: "Atividades Complementares",
    periodo: 10, teorica: 0, pratica: 60, categoria: "compl",
    nota: "Sem período na Tabela 7 e sem linha na matriz sequencial, mas as 60h entram no subtotal do 10º período." },
];


/* ==========================================================================
   ENGENHARIA ELETRÔNICA — matriz 2012

   Fonte: "01 - Projeto Pedagogico Eletronica POLI UPE 02_09_2012.pdf",
   POLI/UPE, 40 páginas. A **Tabela 11** (§2.6) é a matriz por período, e é o
   formato mais legível dos seis PPCs lidos: cada disciplina traz "Pré-req:" e
   "Co-req:" escritos POR NOME em linhas próprias, sem coluna estreita para
   quebrar. Não há coluna de código. Ciclos na Tabela 6 e nas 7 a 10.

   CH: 3705h — Básico 1260, Essencial 1065, Específico 1140 (780 obrigatórias
   + 360 eletivas), Complementar 240 (estágio 180 + PFC 60).

   O QUE NÃO DEU PARA FECHAR, e por isso não é conferido: as áreas da Tabela 8
   somam 1065h para o Essencial, mas uma delas — "Circuitos Elétricos, 240h" —
   pede quatro disciplinas de 60h e só três se encaixam pelo nome (Circuitos
   Elétricos 1 e 2 e Instalações Elétricas). Falta uma, e o documento não diz
   qual: sobram Eletrônica de Potência, Eletrônica Industrial e Sinais e
   Sistemas, todas defensáveis. Como isso muda só a cor de um nó, o script
   confere a SOMA de Essencial + Específico (1065 + 780 = 1845h), que não
   depende da escolha, em vez de eu decidir por um lado.

   O 9º período imprime "TOTAL 0 0" — as quatro linhas dele somam 360h.

   Sem código: a Tabela 11 não tem coluna de código. Os que aparecem no mapa
   foram herdados por nome das outras grades, pela regra do registro
   compartilhado.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const NOTA_ELETIVA_ELE =
  "São 360h de eletivas, escolhidas na lista do 10º período da Tabela 11.";

const ELETRONICA_2012 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "CALC1", codigo: "—", nome: "Cálculo Diferencial e Integral 1",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "PROG", codigo: "—", nome: "Introdução à Programação",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "QUIM", codigo: "—", nome: "Química Geral",
    periodo: 1, teorica: 45, pratica: 30, categoria: "basico" },
  { id: "GEOAN", codigo: "—", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "SOCIO", codigo: "—", nome: "Sociologia e Meio Ambiente",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "INTROENG", codigo: "—", nome: "Introdução à Engenharia",
    periodo: 1, teorica: 30, pratica: 0, categoria: "prof" },

  /* ------------------------------------------------------------ 2º período */
  { id: "CALC2", codigo: "—", nome: "Cálculo Diferencial e Integral 2",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "FIS1", codigo: "—", nome: "Física 1",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "EXPGR1", codigo: "—", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 30, pratica: 45, categoria: "basico" },
  { id: "ALGLIN", codigo: "—", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN"] },
  { id: "PORT", codigo: "—", nome: "Português Instrumental",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "ECON", codigo: "—", nome: "Engenharia Econômica",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico" },

  /* ------------------------------------------------------------ 3º período */
  { id: "CALC3", codigo: "—", nome: "Cálculo Diferencial e Integral 3",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"],
    cadeira: "calculo3" },
  { id: "FIS2", codigo: "—", nome: "Física 2",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS1"], co: ["CALC3"],
    cadeira: "eletromag",
    nota: "É a física do eletromagnetismo: Circuitos Elétricos 1 e Eletromagnetismo 1 a têm como pré-requisito." },
  { id: "ELETRAP", codigo: "—", nome: "Eletricidade Aplicada",
    periodo: 3, teorica: 0, pratica: 30, categoria: "basico", co: ["FIS2"] },
  { id: "MECGER1", codigo: "—", nome: "Mecânica Geral 1",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS1", "GEOAN", "EXPGR1"] },
  { id: "CALCNUM", codigo: "—", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2", "PROG"] },
  { id: "PROBEST", codigo: "—", nome: "Probabilidade e Estatística",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"] },

  /* ------------------------------------------------------------ 4º período */
  { id: "CALC4", codigo: "—", nome: "Cálculo Diferencial e Integral 4",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC3"],
    cadeira: "eqdiferenciais" },
  { id: "FIS3", codigo: "—", nome: "Física 3",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS2"] },
  { id: "CIRC1", codigo: "—", nome: "Circuitos Elétricos 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FIS2"], co: ["CALC4"] },
  { id: "FISEXP", codigo: "—", nome: "Física Experimental",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", co: ["FIS3"] },
  { id: "SEMICOND", codigo: "—", nome: "Teoria dos Dispositivos Semicondutores",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FIS2"], co: ["CALC4"] },
  { id: "COMPMAT", codigo: "—", nome: "Complementos de Matemática",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC3"] },
  { id: "FENTR", codigo: "—", nome: "Fenômeno de Transporte",
    periodo: 4, teorica: 30, pratica: 0, categoria: "basico", pre: ["CALC2"], co: ["FIS3"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "ELMAG1", codigo: "—", nome: "Eletromagnetismo 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CALC4", "FIS2"] },
  { id: "ELET1", codigo: "—", nome: "Eletrônica 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1", "SEMICOND"] },
  { id: "CIRC2", codigo: "—", nome: "Circuitos Elétricos 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "LABELET1", codigo: "—", nome: "Laboratório de Eletrônica 1",
    periodo: 5, teorica: 0, pratica: 30, categoria: "prof", co: ["ELET1"] },
  { id: "ELETDIG", codigo: "—", nome: "Eletrônica Digital",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["SEMICOND"], co: ["ELET1"] },
  { id: "INSTELE", codigo: "—", nome: "Instalações Elétricas",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", co: ["CIRC2"] },
  { id: "ENGSEG", codigo: "—", nome: "Engenharia de Segurança do Trabalho",
    periodo: 5, teorica: 45, pratica: 0, categoria: "prof", co: ["INSTELE"] },
  { id: "DIREITO", codigo: "—", nome: "Direito para Engenheiros",
    periodo: 5, teorica: 30, pratica: 0, categoria: "basico" },

  /* ------------------------------------------------------------ 6º período */
  { id: "ELMAG2", codigo: "—", nome: "Eletromagnetismo 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELMAG1", "COMPMAT"] },
  { id: "ELET2", codigo: "—", nome: "Eletrônica 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELET1"] },
  { id: "ELETANA", codigo: "—", nome: "Eletrônica Analógica",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELET1"] },
  { id: "LABELET2", codigo: "—", nome: "Laboratório de Eletrônica 2",
    periodo: 6, teorica: 0, pratica: 30, categoria: "prof", co: ["ELET2"] },
  { id: "SISTDIG", codigo: "—", nome: "Sistemas Digitais",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELETDIG"] },
  { id: "SINSIS", codigo: "—", nome: "Sinais e Sistemas",
    periodo: 6, teorica: 60, pratica: 0, categoria: "espec", pre: ["CALC4", "COMPMAT"] },
  { id: "SISCTRL1", codigo: "—", nome: "Sistemas de Controle 1",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["CALC4", "COMPMAT"] },
  { id: "LABSISTDIG", codigo: "—", nome: "Laboratório de Sistemas Digitais",
    periodo: 6, teorica: 0, pratica: 30, categoria: "prof", co: ["SISTDIG"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "CONVEL", codigo: "—", nome: "Conversão Eletromecânica de Energia",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELMAG2", "CIRC1"] },
  { id: "PROCESTOC", codigo: "—", nome: "Processos Estocásticos",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["PROBEST", "CALC4"] },
  { id: "ELETIND", codigo: "—", nome: "Eletrônica Industrial",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["ELETANA", "ELETDIG"] },
  { id: "MICROCTRL", codigo: "—", nome: "Microcontroladores",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["SISTDIG"] },
  { id: "MICROPROC", codigo: "—", nome: "Microprocessadores",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["SISTDIG", "PROG"] },
  { id: "PRINCCOM", codigo: "—", nome: "Princípios de Comunicações",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["SINSIS"] },
  { id: "SISCTRL2", codigo: "—", nome: "Sistemas de Controle 2",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["SISCTRL1"] },

  /* ------------------------------------------------------------ 8º período */
  { id: "ADMIN", codigo: "—", nome: "Administração",
    periodo: 8, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "PROTOTIP", codigo: "—", nome: "Prototipação de Circuitos Digitais",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["SISTDIG", "PROG"] },
  { id: "INSTRUM", codigo: "—", nome: "Instrumentação",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ELETANA", "SISTDIG", "ELET2"] },
  { id: "REDES1", codigo: "—", nome: "Redes de Computadores 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["PRINCCOM"] },
  { id: "ORGARQ", codigo: "—", nome: "Organização e Arquitetura de Computadores",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["MICROPROC"] },
  { id: "PDS", codigo: "—", nome: "Processamento Digital de Sinais",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["PRINCCOM"] },
  { id: "ELETPOT", codigo: "—", nome: "Eletrônica de Potência",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ELETIND"] },
  { id: "METCIENT", codigo: "—", nome: "Metodologia Científica",
    periodo: 8, teorica: 30, pratica: 0, categoria: "basico", pre: ["PORT"] },

  /* ------------------------------------------------------------ 9º período */
  { id: "ADMMANUT", codigo: "—", nome: "Administração da Manutenção",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["PROBEST"] },
  { id: "CTRLPROC", codigo: "—", nome: "Controle de Processos",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["INSTRUM"] },
  { id: "ESTAGIO", codigo: "—", nome: "Estágio Curricular Supervisionado",
    periodo: 9, teorica: 45, pratica: 135, categoria: "compl", pre: ["ENGSEG"], estagio: true,
    nota: "Liberado por pré-requisito: este PPC não publica piso de CH para o estágio." },
  { id: "PFC", codigo: "—", nome: "Projeto Final de Curso",
    periodo: 9, teorica: 60, pratica: 0, categoria: "compl", pre: ["METCIENT"] },

  /* ---------------------------------------------------------- 10º período */
  { id: "EL1", codigo: "—", nome: "Eletiva 1", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_ELE },
  { id: "EL2", codigo: "—", nome: "Eletiva 2", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_ELE },
  { id: "EL3", codigo: "—", nome: "Eletiva 3", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_ELE },
  { id: "EL4", codigo: "—", nome: "Eletiva 4", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_ELE },
  { id: "EL5", codigo: "—", nome: "Eletiva 5", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_ELE },
  { id: "EL6", codigo: "—", nome: "Eletiva 6", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_ELE },
];


/* ==========================================================================
   ENGENHARIA ELÉTRICA ELETRÔNICA — matriz 2020

   Fonte: "PPC Eletrônica UPE POLI 2020 V2.pdf", POLI/UPE, 307 páginas. A
   **Tabela 6** é a matriz por período, no mesmo formato legível do PPC de
   2012 (pré e co escritos por nome em linhas próprias) e com três colunas a
   mais: **Núcleo** (NCB/NCP/NCE/NFC), **dimensão** (ENS de ensino ou EXT de
   extensão) e tipo. Sem coluna de código.

   Note o nome: em 2012 o curso era "Engenharia Eletrônica"; aqui é
   "Engenharia Elétrica Eletrônica". As duas grades aparecem juntas no site
   sob o nome novo, como as de Mecânica.

   AS CONTAS DA TABELA 1, e como elas fecham. Ela dá NCB 1215, NCP 1035, NCE
   660, Extensão 390, Estágio 180, NFC 180 e Atividades Complementares 60 —
   3720h. O truque é que a CH das componentes marcadas EXT sai do núcleo e vai
   para o balde da Extensão:

     NCB 1215 + as duas EXT do NCB (60h)                    = 1275
     NCP 1035, sem nenhuma EXT                              = 1035
     NCE  660 + as quatro EXT do NCE (210h) + estágio (180) = 1050
     Extensão 390 = 60 (NCB) + 210 (NCE) + 120 (2 eletivas de extensão)
     NFC 180 = as três eletivas de ensino

   Somando: 1275 + 1035 + 1050 + 300 de eletivas + 60 de atividades
   complementares = 3720h. Todas essas contas são conferidas.

   O QUE O DOCUMENTO DEIXA EM ABERTO, registrado em `nota` na disciplina:

   1. Princípios de Comunicações tem pré-requisito "Antenas", que é uma
      ELETIVA — componente obrigatória não pode depender de eletiva, e a
      aresta ficaria apontando para fora da matriz. Descartada.
   2. Metodologia Científica tem pré-requisito "Port", truncado; é Português
      Instrumental. Ela também dobrou de 30h para 60h em relação a 2012.
   3. Engenharia de Segurança no Trabalho lista "Circuitos Elétricos 2
      Eletrônica 1" sem separador — são dois pré-requisitos.
   4. Instalações Elétricas pede "Circuitos 2"; o nome na matriz é Circuitos
      Elétricos 2.
   5. O PFC pede "Metodologia Ciêntífica".
   6. Estágio, Automação de Máquinas e Instrumentação estão sem requisito.
   7. As atividades complementares não têm linha na Tabela 6; as 60h estão só
      na Tabela 1.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const ELETRONICA_2020 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "CALC1", codigo: "—", nome: "Cálc. Dif. e Integral em uma Variável",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "PROG", codigo: "—", nome: "Introdução à Programação",
    periodo: 1, teorica: 45, pratica: 15, categoria: "basico" },
  { id: "QUIM", codigo: "—", nome: "Química",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "GEOAN", codigo: "—", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "PORT", codigo: "—", nome: "Português Instrumental",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "SOCIO", codigo: "—", nome: "Sociologia, Meio Amb. e Contexto Social",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico", dcext: true },
  { id: "FUNDELE", codigo: "—", nome: "Fundamentos de Engenharia Eletrônica",
    periodo: 1, teorica: 20, pratica: 10, categoria: "espec", dcext: true },

  /* ------------------------------------------------------------ 2º período */
  { id: "CALC2", codigo: "—", nome: "Cálc. Dif. e Integral em Várias Variáveis",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "FUNDMEC", codigo: "—", nome: "Fundamentos da Mecânica",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "ECON", codigo: "—", nome: "Engenharia Econômica",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico", pre: ["SOCIO"] },
  { id: "ALGLIN", codigo: "—", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN"] },
  { id: "EXPGR1", codigo: "—", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 45, pratica: 30, categoria: "basico" },
  { id: "PROBEST", codigo: "—", nome: "Probabilidade e Estatística",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "ESTRDADOS", codigo: "—", nome: "Programação e Estrutura de Dados",
    periodo: 2, teorica: 45, pratica: 15, categoria: "prof", pre: ["PROG"] },

  /* ------------------------------------------------------------ 3º período */
  { id: "CALCVET", codigo: "—", nome: "Cálc. Dif. e Integral Vetorial",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"],
    cadeira: "calculo3" },
  { id: "FUNDEM", codigo: "—", nome: "Fundamentos do Eletromagnetismo",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FUNDMEC"],
    cadeira: "eletromag" },
  { id: "CALCNUM", codigo: "—", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["PROG", "CALC2"],
    co: ["CALCVET"] },
  { id: "ESTATICA", codigo: "—", nome: "Estática",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN", "FUNDMEC"] },
  { id: "DUA", codigo: "—", nome: "Desenho Universal e Acessibilidade",
    periodo: 3, teorica: 30, pratica: 0, categoria: "basico", dcext: true, pre: ["EXPGR1"] },
  { id: "CIENCMAT", codigo: "—", nome: "Ciência dos Materiais",
    periodo: 3, teorica: 30, pratica: 0, categoria: "basico", pre: ["QUIM"] },
  { id: "FERRTELE", codigo: "—", nome: "Ferramentas Comp. para Telecomunicações",
    periodo: 3, teorica: 30, pratica: 30, categoria: "espec", dcext: true, pre: ["ESTRDADOS"] },

  /* ------------------------------------------------------------ 4º período */
  { id: "EQDIF", codigo: "—", nome: "Equações Diferenciais",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"],
    cadeira: "eqdiferenciais" },
  { id: "ONDTERM", codigo: "—", nome: "Fund. de Ondulatória e Termodinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FUNDEM"] },
  { id: "COMPMAT", codigo: "—", nome: "Complementos de Matemática",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"], co: ["EQDIF"] },
  { id: "DINAM", codigo: "—", nome: "Dinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["ESTATICA"], co: ["EQDIF"], cadeira: "dinamica" },
  { id: "LABFIS", codigo: "—", nome: "Laboratório de Física Básica",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", pre: ["FUNDEM"], co: ["ONDTERM"] },
  { id: "FENTR", codigo: "—", nome: "Introdução aos Fenômenos de Transporte",
    periodo: 4, teorica: 30, pratica: 0, categoria: "basico", pre: ["FUNDMEC", "CALCVET"],
    co: ["EQDIF", "ONDTERM"] },
  { id: "ELMAG1", codigo: "—", nome: "Eletromagnetismo 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FUNDEM"], co: ["EQDIF"] },
  { id: "CIRC1", codigo: "—", nome: "Circuitos Elétricos 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FUNDEM"], co: ["EQDIF"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "ELMAG2", codigo: "—", nome: "Eletromagnetismo 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELMAG1", "COMPMAT"] },
  { id: "ELET1", codigo: "—", nome: "Eletrônica 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "CIRC2", codigo: "—", nome: "Circuitos Elétricos 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "ELETDIG", codigo: "—", nome: "Eletrônica Digital",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "SISCTRL1", codigo: "—", nome: "Sistemas de Controle 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["EQDIF", "COMPMAT"] },
  { id: "METCIENT", codigo: "—", nome: "Metodologia Científica",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["PORT"],
    nota: "A Tabela 6 escreve o pré-requisito como \"Port\", truncado — é Português Instrumental. A CH dobrou de 30h para 60h em relação à matriz de 2012." },
  { id: "LABELET1", codigo: "—", nome: "Laboratório de Eletrônica 1",
    periodo: 5, teorica: 0, pratica: 30, categoria: "prof", co: ["ELET1"] },

  /* ------------------------------------------------------------ 6º período */
  { id: "ENGSEG", codigo: "—", nome: "Engenharia de Segurança no Trabalho",
    periodo: 6, teorica: 45, pratica: 0, categoria: "prof", pre: ["CIRC2", "ELET1"],
    nota: "A Tabela 6 lista \"Circuitos Elétricos 2 Eletrônica 1\" sem separador: são dois pré-requisitos." },
  { id: "ELETANA", codigo: "—", nome: "Eletrônica Analógica",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELET1"] },
  { id: "CONVEL", codigo: "—", nome: "Conversão Eletromecânica de Energia",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC2", "ELMAG2"] },
  { id: "ELET2", codigo: "—", nome: "Eletrônica 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELET1"] },
  { id: "SISCTRL2", codigo: "—", nome: "Sistemas de Controle 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["SISCTRL1"] },
  { id: "SISTDIG", codigo: "—", nome: "Sistemas Digitais",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELETDIG"] },
  { id: "LABANA", codigo: "—", nome: "Laboratório de Eletrônica Analógica",
    periodo: 6, teorica: 0, pratica: 30, categoria: "prof", pre: ["ELET1"],
    co: ["ELET2", "ELETANA"] },
  { id: "LABSISTDIG", codigo: "—", nome: "Laboratório de Sistemas Digitais",
    periodo: 6, teorica: 0, pratica: 30, categoria: "prof", pre: ["ELETDIG"], co: ["SISTDIG"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "SINSIS", codigo: "—", nome: "Sinais e Sistemas",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["COMPMAT"] },
  { id: "PROCESTOC", codigo: "—", nome: "Processos Estocásticos",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["PROBEST"] },
  { id: "INSTELE", codigo: "—", nome: "Instalações Elétricas",
    periodo: 7, teorica: 30, pratica: 30, categoria: "espec", dcext: true, pre: ["CIRC2"],
    nota: "A Tabela 6 pede \"Circuitos 2\"; o nome na matriz é Circuitos Elétricos 2." },
  { id: "ELETIND", codigo: "—", nome: "Eletrônica Industrial",
    periodo: 7, teorica: 30, pratica: 30, categoria: "espec", pre: ["ELMAG2"] },
  { id: "ADMMANUT", codigo: "—", nome: "Administração da Manutenção",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["CIRC2"], co: ["SISCTRL1"] },
  { id: "DIREITO", codigo: "—", nome: "Direito para Engenheiros",
    periodo: 7, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECON"] },

  /* ------------------------------------------------------------ 8º período */
  { id: "GESTORG", codigo: "—", nome: "Gestão Organizacional para Engenheiros",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", dcext: true },
  { id: "PRINCCOM", codigo: "—", nome: "Princípios de Comunicações",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec",
    nota: "A Tabela 6 dá a esta componente o pré-requisito \"Antenas\", que é uma ELETIVA: obrigatória não pode depender de eletiva, e a aresta apontaria para fora da matriz. Descartada." },
  { id: "REDES1", codigo: "—", nome: "Redes de Computadores 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["SINSIS"] },
  { id: "MICROCTRL", codigo: "—", nome: "Microcontroladores",
    periodo: 8, teorica: 30, pratica: 30, categoria: "espec", pre: ["SISTDIG"] },
  { id: "ELETPOT", codigo: "—", nome: "Eletrônica de Potência",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["ELETIND"] },
  { id: "ESTAGIO", codigo: "—", nome: "Estágio Curricular Obrigatório",
    periodo: 8, teorica: 20, pratica: 160, categoria: "compl", estagio: true,
    nota: "A Tabela 6 não dá requisito ao estágio, e este PPC não publica piso de carga horária para ele." },

  /* ------------------------------------------------------------ 9º período */
  { id: "PFC", codigo: "—", nome: "Projeto Final de Curso",
    periodo: 9, teorica: 60, pratica: 0, categoria: "compl", pre: ["METCIENT"] },
  { id: "AUTREDES", codigo: "—", nome: "Automação de Redes Industriais",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["REDES1"] },
  { id: "AUTMAQ", codigo: "—", nome: "Automação de Máquinas",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec",
    nota: "A Tabela 6 não dá requisito a esta componente." },
  { id: "INSTRUM", codigo: "—", nome: "Instrumentação",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec",
    nota: "A Tabela 6 não dá requisito a esta componente." },

  /* ---------------------------------------------------------- 10º período */
  { id: "ELEXT1", codigo: "—", nome: "Eletiva de Extensão 1", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", dcext: true,
    nota: "São duas eletivas exclusivamente de extensão, 120h, mais três de ensino, 180h." },
  { id: "ELEXT2", codigo: "—", nome: "Eletiva de Extensão 2", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", dcext: true,
    nota: "São duas eletivas exclusivamente de extensão, 120h, mais três de ensino, 180h." },
  { id: "EL3", codigo: "—", nome: "Eletiva 3", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva",
    nota: "Eletiva da dimensão ensino: são três, 180h, do Núcleo de Formação Complementar." },
  { id: "EL4", codigo: "—", nome: "Eletiva 4", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva",
    nota: "Eletiva da dimensão ensino: são três, 180h, do Núcleo de Formação Complementar." },
  { id: "EL5", codigo: "—", nome: "Eletiva 5", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva",
    nota: "Eletiva da dimensão ensino: são três, 180h, do Núcleo de Formação Complementar." },
  { id: "ATCOMP", codigo: "—", nome: "Atividades Complementares", periodo: 10,
    teorica: 0, pratica: 60, categoria: "compl",
    nota: "Sem linha na Tabela 6: as 60h estão só na Tabela 1, e podem ser feitas em qualquer período." },
];


/* ==========================================================================
   ENGENHARIA DE TELECOMUNICAÇÕES — matriz 2010

   Fonte: "TL011_PPC Telecomunicações_com_Ementas.pdf", POLI/UPE, 276 páginas
   (o PPC antigo do curso; os dados dele param em 2009). A **Tabela 15** é a
   matriz por período, com código, tipo, pré e co-requisito e CH. Ciclos na
   Tabela 10 e nas 11 a 14.

   É O PPC QUE MAIS FECHA de todos os lidos até aqui: os três ciclos resolvem
   sem ambiguidade nenhuma, cada área das Tabelas 11 e 12 casando exatamente
   com as disciplinas pelo nome.

     Básico     1320 = 1140 (científica) + 180 (humanística)
     Essencial  1005 — e aqui a área "Circuitos Elétricos, 240h" fecha com
                quatro disciplinas: Circuitos 1 e 2, Instalações Elétricas e
                Medidas Elétricas. Em Eletrônica 2012, a mesma área ficou
                faltando uma; aqui não.
     Específico  720 obrigatórias + 360 eletivas
     Complementar 240 = estágio 180 + PFC 60
     Total      3645h

   Códigos no formato curto da época (MAT01, ELE01), como o PPC os imprime —
   os mesmos do registro de Civil 2011 e Automação 2010. Não são herdados nem
   herdam: código curto é local de cada curso e de cada época.

   NOTA SOBRE O PERFIL DO SIGA: ele também mandou uma consulta do SIGA ao
   perfil "EL03-1 — Engenharia Elétrica de Telecomunicações" (emitida em
   11/05/2020), com 4155h. É OUTRA matriz, não esta: tem disciplinas que aqui
   não existem (Desenho, Métodos Computacionais 1 e 2, Filtros e Circuitos de
   Acoplamento, Eletromagnetismo Computacional) e uma CH bem maior. Serve
   como fonte de CÓDIGOS no formato atual, e é para isso que está usada.

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const NOTA_ELETIVA_TL =
  "São 360h de eletivas, escolhidas nas listas do 9º e do 10º período da Tabela 15.";

const TELECOM_2010 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "MAT01", codigo: "MAT01", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "MAT02", codigo: "MAT02", nome: "Cálculo Diferencial e Integral 1",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "INF01", codigo: "INF01", nome: "Introdução à Programação",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "SMA01", codigo: "SMA01", nome: "Sociologia e Meio Ambiente",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "IEE01", codigo: "IEE01", nome: "Introdução à Engenharia",
    periodo: 1, teorica: 30, pratica: 0, categoria: "prof" },
  { id: "QUI01", codigo: "QUI01", nome: "Química Geral",
    periodo: 1, teorica: 45, pratica: 30, categoria: "basico" },

  /* ------------------------------------------------------------ 2º período */
  { id: "MAT06", codigo: "MAT06", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT01"] },
  { id: "MAT03", codigo: "MAT03", nome: "Cálculo Diferencial e Integral 2",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT02"] },
  { id: "FIS01", codigo: "FIS01", nome: "Física 1",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT02"] },
  { id: "EXP01", codigo: "EXP01", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 30, pratica: 45, categoria: "basico" },
  { id: "POR01", codigo: "POR01", nome: "Português Instrumental",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "ECN01", codigo: "ECN01", nome: "Engenharia Econômica",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico", pre: ["SMA01"] },

  /* ------------------------------------------------------------ 3º período */
  { id: "MAT04", codigo: "MAT04", nome: "Cálculo Diferencial e Integral 3",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT03"],
    cadeira: "calculo3" },
  { id: "FIS02", codigo: "FIS02", nome: "Física 2",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS01"], co: ["MAT04"],
    cadeira: "eletromag",
    nota: "É a física do eletromagnetismo: Eletricidade Aplicada é co-requisito dela, e Circuitos Elétricos 1 e Eletromagnetismo 1 a têm como pré." },
  { id: "FIS03", codigo: "FIS03", nome: "Eletricidade Aplicada",
    periodo: 3, teorica: 0, pratica: 30, categoria: "basico", co: ["FIS02"] },
  { id: "MEC01", codigo: "MEC01", nome: "Mecânica Geral 1",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS01", "MAT01", "EXP01"] },
  { id: "MAT07", codigo: "MAT07", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT03", "INF01"] },
  { id: "TEC01", codigo: "TEC01", nome: "Tecnologia dos Materiais",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["QUI01"] },

  /* ------------------------------------------------------------ 4º período */
  { id: "MAT05", codigo: "MAT05", nome: "Cálculo Diferencial e Integral 4",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT04"],
    cadeira: "eqdiferenciais" },
  { id: "FEN01", codigo: "FEN01", nome: "Fenômenos de Transporte",
    periodo: 4, teorica: 30, pratica: 0, categoria: "basico", pre: ["MAT03"], co: ["FIS04"] },
  { id: "FIS04", codigo: "FIS04", nome: "Física 3",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FIS02"] },
  { id: "FIS05", codigo: "FIS05", nome: "Física Experimental",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", co: ["FIS04"] },
  { id: "MAT08", codigo: "MAT08", nome: "Probabilidade e Estatística",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT03"] },
  { id: "MAT09", codigo: "MAT09", nome: "Complementos de Matemática",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MAT04"] },
  { id: "ELE01", codigo: "ELE01", nome: "Circuitos Elétricos 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FIS02"], co: ["MAT05"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "EMG01", codigo: "EMG01", nome: "Eletromagnetismo 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["MAT05", "FIS02"] },
  { id: "ELN01", codigo: "ELN01", nome: "Eletrônica 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELE01"] },
  { id: "ELN02", codigo: "ELN02", nome: "Laboratório de Eletrônica 1",
    periodo: 5, teorica: 0, pratica: 30, categoria: "prof", co: ["ELN01"] },
  { id: "ELE03", codigo: "ELE03", nome: "Instalações Elétricas",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELE01"] },
  { id: "ADM01", codigo: "ADM01", nome: "Administração",
    periodo: 5, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECN01"] },
  { id: "DIR01", codigo: "DIR01", nome: "Direito para Engenheiros",
    periodo: 5, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECN01"] },
  { id: "ELE02", codigo: "ELE02", nome: "Circuitos Elétricos 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELE01"] },

  /* ------------------------------------------------------------ 6º período */
  { id: "EMG02", codigo: "EMG02", nome: "Eletromagnetismo 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["EMG01", "MAT09"] },
  { id: "ELE04", codigo: "ELE04", nome: "Conversão Eletromecânica de Energia",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["EMG01", "ELE01"] },
  { id: "DIG01", codigo: "DIG01", nome: "Eletrônica Digital",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELN01"] },
  { id: "ELN03", codigo: "ELN03", nome: "Eletrônica 2",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELN01"] },
  { id: "SSI01", codigo: "SSI01", nome: "Sinais e Sistemas",
    periodo: 6, teorica: 60, pratica: 0, categoria: "espec", pre: ["MAT09", "MAT05"] },
  { id: "ELN04", codigo: "ELN04", nome: "Eletrônica Analógica",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELN01"] },
  { id: "ELN05", codigo: "ELN05", nome: "Laboratório de Eletrônica 2",
    periodo: 6, teorica: 0, pratica: 30, categoria: "prof", pre: ["ELN02"],
    co: ["ELN03", "ELN04"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "ELE05", codigo: "ELE05", nome: "Medidas Elétricas",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELE02"] },
  { id: "EMG03", codigo: "EMG03", nome: "Antenas",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["EMG02"] },
  { id: "EST01", codigo: "EST01", nome: "Processos Estocásticos",
    periodo: 7, teorica: 60, pratica: 0, categoria: "espec", pre: ["MAT08"] },
  { id: "COM01", codigo: "COM01", nome: "Princípios de Comunicações",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["SSI01"] },
  { id: "DIG02", codigo: "DIG02", nome: "Sistemas Digitais",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["DIG01"] },
  { id: "DIG03", codigo: "DIG03", nome: "Laboratório de Sistemas Digitais",
    periodo: 7, teorica: 0, pratica: 30, categoria: "prof", co: ["DIG02"] },
  { id: "SEG01", codigo: "SEG01", nome: "Engenharia de Segurança do Trabalho",
    periodo: 7, teorica: 45, pratica: 0, categoria: "prof", pre: ["DIR01", "ADM01"] },

  /* ------------------------------------------------------------ 8º período */
  { id: "EMG04", codigo: "EMG04", nome: "Propagação Eletromagnética",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["EMG03"] },
  { id: "RED01", codigo: "RED01", nome: "Redes de Computadores 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["COM01"] },
  { id: "TEL01", codigo: "TEL01", nome: "Sistemas Telefônicos",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["COM01"] },
  { id: "COM02", codigo: "COM02", nome: "Comunicação Digital",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["COM01", "EST01"] },
  { id: "COM03", codigo: "COM03", nome: "Processamento Digital de Sinais",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["COM01"] },
  { id: "MET01", codigo: "MET01", nome: "Metodologia Científica",
    periodo: 8, teorica: 30, pratica: 0, categoria: "basico", pre: ["POR01"] },
  { id: "CON01", codigo: "CON01", nome: "Sistemas de Controle 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "prof", pre: ["SSI01"] },

  /* ------------------------------------------------------------ 9º período */
  { id: "ESU01", codigo: "ESU01", nome: "Estágio Curricular Supervisionado",
    periodo: 9, teorica: 45, pratica: 135, categoria: "compl", co: ["SEG01"], estagio: true,
    nota: "A Tabela 15 põe \"60% curso\" no lugar do pré-requisito, e Engenharia de Segurança do Trabalho como co-requisito." },
  { id: "PFC01", codigo: "PFC01", nome: "Projeto Final de Curso",
    periodo: 9, teorica: 60, pratica: 0, categoria: "compl", pre: ["MET01"] },
  { id: "RED02", codigo: "RED02", nome: "Redes de Computadores 2",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["RED01"] },
  { id: "COM04", codigo: "COM04", nome: "Comunicações Ópticas",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["COM02", "EMG02"] },
  { id: "COM05", codigo: "COM05", nome: "Comunicações Móveis e sem Fio",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["COM02"] },
  { id: "RED03", codigo: "RED03", nome: "Redes de Faixa Larga",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["COM02", "TEL01"] },
  { id: "EL1", codigo: "—", nome: "Eletiva 1", periodo: 9,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_TL },

  /* ---------------------------------------------------------- 10º período */
  { id: "EL2", codigo: "—", nome: "Eletiva 2", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_TL },
  { id: "EL3", codigo: "—", nome: "Eletiva 3", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_TL },
  { id: "EL4", codigo: "—", nome: "Eletiva 4", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_TL },
  { id: "EL5", codigo: "—", nome: "Eletiva 5", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_TL },
  { id: "EL6", codigo: "—", nome: "Eletiva 6", periodo: 10,
    teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_ELETIVA_TL },
];


/* ==========================================================================
   ENGENHARIA ELÉTRICA DE TELECOMUNICAÇÕES — matriz 2021

   Fonte: "TL21_PPC_Telecomunicações_com_Ementas.pdf", POLI/UPE, 304 páginas.
   A **Tabela 7** (§7.2, "Matriz Curricular a executar") é a matriz nova, no
   mesmo formato do PPC de Eletrônica 2020: pré e co por nome em linhas
   próprias, com as colunas de **Núcleo** e de **dimensão** (ENS/EXT).

   O curso mudou de nome: o PPC antigo é de "Engenharia de Telecomunicações",
   este é de "Engenharia Elétrica de Telecomunicações". As duas grades usam o
   nome novo para o índice agrupá-las.

   AS CONTAS DA TABELA 1: NCB 1335, NCP 825, NCE 960, NFC 240, componentes de
   extensão 390 — 3750h. Quatro delas fecham exato com a soma das componentes
   marcadas na coluna Núcleo:

     NCB   1335  ✓
     NCE    960  ✓ (só as obrigatórias; o PFC está dentro)
     Ext    390  ✓ (as 4 DCEXT obrigatórias + as 3 DCEXT eletivas)
     NFC    240  ✓ (as 4 "Atividade Complementar / Eletiva de Ensino")

   **A quinta não fecha:** somando as componentes marcadas NCP dá 855h, e a
   Tabela 1 imprime 825h. São 30h que o documento não conta duas vezes em
   lugar nenhum — o candidato natural é Gestão Organizacional para
   Engenheiros, a única NCP de 30h e a única de gestão no meio de eletrônica,
   mas nada no PPC diz isso. Ficou como está marcado, e a divergência está
   registrada aqui em vez de resolvida por palpite.

   SEM CÓDIGOS na Tabela 7 — mas ele mandou, para ajudar, uma consulta do SIGA
   ao perfil **EL03-1** do mesmo curso (emitida em 11/05/2020), com código,
   CH e período de cada componente. Aquele perfil é uma matriz diferente desta
   (4155h contra 3750h), então não serve como grade; serve como **fonte de
   códigos**, e é dali que vêm os códigos que aparecem neste mapa.

   O QUE O DOCUMENTO DEIXA EM ABERTO:

   1. Sistemas de Controle 1 (7º) tem Circuitos Elétricos 2 (5º) como
      CO-requisito, e não como pré. Ficou como está escrito.
   2. Metodologia Científica (9º) tem como co-requisito Redes de
      Telecomunicações 2, do mesmo período.
   3. O estágio não tem núcleo na tabela, e não há piso de CH para ele: sai
      por pré-requisito (Engenharia de Segurança do Trabalho).

   Colunas: id, codigo, nome, período, teórica, prática, categoria, pre, co
   ========================================================================== */
const NOTA_EL_EXT_TL =
  "Eletiva de extensão: a CH conta nas 390h de extensão do curso.";
const NOTA_EL_NFC =
  "Eletiva de ensino ou atividade complementar, do Núcleo de Formação Complementar: são quatro, 240h.";

const TELECOM_2021 = [
  /* ------------------------------------------------------------ 1º período */
  { id: "CALC1", codigo: "—", nome: "Cálc. Dif. e Integral em uma Variável",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "PROG", codigo: "—", nome: "Introdução à Programação",
    periodo: 1, teorica: 45, pratica: 15, categoria: "basico" },
  { id: "QUIM", codigo: "—", nome: "Química",
    periodo: 1, teorica: 30, pratica: 30, categoria: "basico" },
  { id: "GEOAN", codigo: "—", nome: "Geometria Analítica",
    periodo: 1, teorica: 60, pratica: 0, categoria: "basico" },
  { id: "PORT", codigo: "—", nome: "Português Instrumental",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico" },
  { id: "SOCIO", codigo: "—", nome: "Sociologia, Meio Amb. e Contexto Social",
    periodo: 1, teorica: 30, pratica: 0, categoria: "basico", dcext: true },
  { id: "FUNDTEL", codigo: "—", nome: "Fundamentos de Telecomunicações",
    periodo: 1, teorica: 20, pratica: 10, categoria: "espec", dcext: true },

  /* ------------------------------------------------------------ 2º período */
  { id: "CALC2", codigo: "—", nome: "Cálc. Dif. e Integral em Várias Variáveis",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "FUNDMEC", codigo: "—", nome: "Fundamentos da Mecânica",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "ECON", codigo: "—", nome: "Engenharia Econômica",
    periodo: 2, teorica: 30, pratica: 0, categoria: "basico", pre: ["SOCIO"] },
  { id: "ALGLIN", codigo: "—", nome: "Álgebra Linear",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN"] },
  { id: "EXPGR1", codigo: "—", nome: "Expressão Gráfica 1",
    periodo: 2, teorica: 45, pratica: 30, categoria: "basico" },
  { id: "PROBEST", codigo: "—", nome: "Probabilidade e Estatística",
    periodo: 2, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC1"] },
  { id: "ESTRDADOS", codigo: "—", nome: "Programação e Estrutura de Dados",
    periodo: 2, teorica: 45, pratica: 15, categoria: "basico", pre: ["PROG"] },

  /* ------------------------------------------------------------ 3º período */
  { id: "CALCVET", codigo: "—", nome: "Cálc. Dif. e Integral Vetorial",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALC2"],
    cadeira: "calculo3" },
  { id: "FUNDEM", codigo: "—", nome: "Fundamentos do Eletromagnetismo",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["FUNDMEC"],
    cadeira: "eletromag" },
  { id: "CALCNUM", codigo: "—", nome: "Cálculo Numérico",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["PROG", "CALC2"],
    co: ["CALCVET"] },
  { id: "ESTATICA", codigo: "—", nome: "Estática",
    periodo: 3, teorica: 60, pratica: 0, categoria: "basico", pre: ["GEOAN", "FUNDMEC"] },
  { id: "DUA", codigo: "—", nome: "Desenho Universal e Acessibilidade",
    periodo: 3, teorica: 30, pratica: 0, categoria: "basico", dcext: true, pre: ["EXPGR1"] },
  { id: "MATEL", codigo: "—", nome: "Materiais Elétricos",
    periodo: 3, teorica: 30, pratica: 0, categoria: "basico", pre: ["QUIM"] },
  { id: "FERRENG", codigo: "—", nome: "Ferramentas Comp. para Engenharia",
    periodo: 3, teorica: 30, pratica: 30, categoria: "espec", dcext: true, pre: ["ESTRDADOS"] },

  /* ------------------------------------------------------------ 4º período */
  { id: "EQDIF", codigo: "—", nome: "Equações Diferenciais",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"],
    cadeira: "eqdiferenciais" },
  { id: "ONDTERM", codigo: "—", nome: "Fund. de Ondulatória e Termodinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["FUNDEM"] },
  { id: "COMPMAT", codigo: "—", nome: "Complementos de Matemática",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["CALCVET"], co: ["EQDIF"] },
  { id: "DINAM", codigo: "—", nome: "Dinâmica",
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["ESTATICA"], co: ["EQDIF"], cadeira: "dinamica" },
  { id: "LABFIS", codigo: "—", nome: "Laboratório de Física Básica",
    periodo: 4, teorica: 0, pratica: 30, categoria: "basico", pre: ["FUNDEM"], co: ["ONDTERM"] },
  { id: "FENTR", codigo: "—", nome: "Introdução aos Fenômenos de Transporte",
    periodo: 4, teorica: 30, pratica: 0, categoria: "basico", pre: ["FUNDMEC", "CALCVET"],
    co: ["EQDIF", "ONDTERM"] },
  { id: "ELMAG1", codigo: "—", nome: "Eletromagnetismo 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FUNDEM"], co: ["EQDIF"] },
  { id: "CIRC1", codigo: "—", nome: "Circuitos Elétricos 1",
    periodo: 4, teorica: 60, pratica: 0, categoria: "prof", pre: ["FUNDEM"], co: ["EQDIF"] },

  /* ------------------------------------------------------------ 5º período */
  { id: "ELMAG2", codigo: "—", nome: "Eletromagnetismo 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELMAG1", "COMPMAT"] },
  { id: "ELET1", codigo: "—", nome: "Eletrônica 1",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "CIRC2", codigo: "—", nome: "Circuitos Elétricos 2",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "ELETDIG", codigo: "—", nome: "Eletrônica Digital",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC1"] },
  { id: "PROCESTOC", codigo: "—", nome: "Processos Estocásticos",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["PROBEST"] },
  { id: "SINSIS", codigo: "—", nome: "Sinais e Sistemas",
    periodo: 5, teorica: 60, pratica: 0, categoria: "prof", pre: ["COMPMAT"] },

  /* ------------------------------------------------------------ 6º período */
  { id: "ELETANA", codigo: "—", nome: "Eletrônica Analógica",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELET1"] },
  { id: "LABELET1", codigo: "—", nome: "Laboratório de Eletrônica 1",
    periodo: 6, teorica: 0, pratica: 30, categoria: "prof", pre: ["ELET1"] },
  { id: "SISTDIG", codigo: "—", nome: "Sistemas Digitais",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["ELETDIG"] },
  { id: "CONVEL", codigo: "—", nome: "Conversão Eletromecânica de Energia",
    periodo: 6, teorica: 60, pratica: 0, categoria: "prof", pre: ["CIRC2", "ELMAG2"] },
  { id: "PRINCCOM", codigo: "—", nome: "Princípios de Comunicações",
    periodo: 6, teorica: 50, pratica: 10, categoria: "espec", pre: ["SINSIS"] },
  { id: "REDES1", codigo: "—", nome: "Redes de Computadores 1",
    periodo: 6, teorica: 50, pratica: 10, categoria: "espec", pre: ["SINSIS"] },
  { id: "ENGSEG", codigo: "—", nome: "Engenharia de Segurança do Trabalho",
    periodo: 6, teorica: 45, pratica: 0, categoria: "prof", pre: ["CIRC2"] },

  /* ------------------------------------------------------------ 7º período */
  { id: "LABANADIG", codigo: "—", nome: "Lab. de Eletrônica Analógica e Digital",
    periodo: 7, teorica: 0, pratica: 30, categoria: "prof", pre: ["ELETDIG", "ELETANA"] },
  { id: "SISCTRL1", codigo: "—", nome: "Sistemas de Controle 1",
    periodo: 7, teorica: 60, pratica: 0, categoria: "prof", pre: ["EQDIF", "COMPMAT"],
    co: ["CIRC2"],
    nota: "A Tabela 7 põe Circuitos Elétricos 2, do 5º período, como CO-requisito desta — e não como pré." },
  { id: "COMDIG", codigo: "—", nome: "Comunicação Digital",
    periodo: 7, teorica: 50, pratica: 10, categoria: "espec", pre: ["PRINCCOM", "PROCESTOC"] },
  { id: "ANTENAS", codigo: "—", nome: "Antenas",
    periodo: 7, teorica: 50, pratica: 10, categoria: "espec", pre: ["ELMAG2"] },
  { id: "INFRATEL", codigo: "—", nome: "Infraestrutura de Telecomunicações",
    periodo: 7, teorica: 40, pratica: 20, categoria: "espec", dcext: true, pre: ["CIRC2"] },
  { id: "DIREITO", codigo: "—", nome: "Direito para Engenheiros",
    periodo: 7, teorica: 30, pratica: 0, categoria: "basico", pre: ["ECON"] },
  { id: "REDES2", codigo: "—", nome: "Redes de Computadores 2",
    periodo: 7, teorica: 50, pratica: 10, categoria: "espec", pre: ["REDES1"] },

  /* ------------------------------------------------------------ 8º período */
  { id: "TEORINFO", codigo: "—", nome: "Teoria da Informação",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["PROBEST", "PRINCCOM"] },
  { id: "PROPAGEM", codigo: "—", nome: "Propagação Eletromagnética",
    periodo: 8, teorica: 50, pratica: 10, categoria: "espec", pre: ["ANTENAS"] },
  { id: "PDS", codigo: "—", nome: "Processamento Digital de Sinais",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["PRINCCOM"] },
  { id: "REDTEL1", codigo: "—", nome: "Redes de Telecomunicações 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["PRINCCOM"] },
  { id: "COMMOV", codigo: "—", nome: "Comunicações Móveis e sem Fio",
    periodo: 8, teorica: 60, pratica: 0, categoria: "espec", pre: ["COMDIG"] },
  { id: "GESTORG", codigo: "—", nome: "Gestão Organizacional para Engenheiros",
    periodo: 8, teorica: 30, pratica: 0, categoria: "prof", pre: ["SOCIO"],
    nota: "A soma das componentes marcadas NCP dá 855h e a Tabela 1 imprime 825h. Esta é a única NCP de 30h, o candidato natural para a diferença — mas nada no PPC diz isso, então ficou como está marcado." },
  { id: "ELEXT1", codigo: "—", nome: "Eletiva de Extensão 1",
    periodo: 8, teorica: 60, pratica: 0, categoria: "eletiva", dcext: true, nota: NOTA_EL_EXT_TL },

  /* ------------------------------------------------------------ 9º período */
  { id: "COMOPT", codigo: "—", nome: "Comunicações Ópticas",
    periodo: 9, teorica: 55, pratica: 5, categoria: "espec", pre: ["COMDIG", "ELMAG2"] },
  { id: "REDTEL2", codigo: "—", nome: "Redes de Telecomunicações 2",
    periodo: 9, teorica: 60, pratica: 0, categoria: "espec", pre: ["REDTEL1"] },
  { id: "METCIENT", codigo: "—", nome: "Metodologia Científica",
    periodo: 9, teorica: 30, pratica: 0, categoria: "espec", pre: ["PORT"], co: ["REDTEL2"] },
  { id: "ESTAGIO", codigo: "—", nome: "Estágio Curricular Obrigatório",
    periodo: 9, teorica: 20, pratica: 160, categoria: "compl", pre: ["ENGSEG"], estagio: true,
    nota: "A Tabela 7 não dá núcleo ao estágio, e não há piso de carga horária: ele sai por pré-requisito." },
  { id: "ELNFC1", codigo: "—", nome: "Eletiva de Ensino 1",
    periodo: 9, teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_EL_NFC },

  /* ---------------------------------------------------------- 10º período */
  { id: "PFC", codigo: "—", nome: "Projeto Final de Curso em Telecomunicações",
    periodo: 10, teorica: 60, pratica: 0, categoria: "compl", pre: ["METCIENT"] },
  { id: "ELEXT2", codigo: "—", nome: "Eletiva de Extensão 2",
    periodo: 10, teorica: 60, pratica: 0, categoria: "eletiva", dcext: true, nota: NOTA_EL_EXT_TL },
  { id: "ELEXT3", codigo: "—", nome: "Eletiva de Extensão 3",
    periodo: 10, teorica: 60, pratica: 0, categoria: "eletiva", dcext: true, nota: NOTA_EL_EXT_TL },
  { id: "ELNFC2", codigo: "—", nome: "Eletiva de Ensino 2",
    periodo: 10, teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_EL_NFC },
  { id: "ELNFC3", codigo: "—", nome: "Eletiva de Ensino 3",
    periodo: 10, teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_EL_NFC },
  { id: "ELNFC4", codigo: "—", nome: "Eletiva de Ensino 4",
    periodo: 10, teorica: 60, pratica: 0, categoria: "eletiva", nota: NOTA_EL_NFC },
];

/* ==========================================================================
   CÓDIGOS DO SIGA — perfil EL03-1, Engenharia Elétrica de Telecomunicações

   Ele mandou uma consulta do SIGA a este perfil (emitida em 11/05/2020) "para
   auxiliar". Aquela matriz não é nenhuma das duas mapeadas aqui — tem 4155h,
   e disciplinas que não existem em nenhuma delas (Desenho, Métodos
   Computacionais 1 e 2, Filtros e Circuitos de Acoplamento, Eletromagnetismo
   Computacional via Elementos Finitos) — então não vira grade. Vira FONTE DE
   CÓDIGOS: entra no registro compartilhado e alimenta a herança por nome,
   com prioridade para as grades deste mesmo curso.

   Só os componentes cujo nome é reconhecível estão aqui; os do perfil que não
   têm correspondente em nenhuma grade mapeada foram deixados de fora.
   ========================================================================== */
const CODIGOS_SIGA_TELECOM = {
  curso: "Engenharia Elétrica de Telecomunicações",
  disciplinas: [
    { codigo: "MATM0007", nome: "Geometria Analítica" },
    { codigo: "LETR0001", nome: "Português Instrumental" },
    { codigo: "MATM0001", nome: "Álgebra Linear" },
    { codigo: "MATM0006", nome: "Complementos de Matemática" },
    { codigo: "ENGE0002", nome: "Introdução à Engenharia" },
    { codigo: "QUIM0001", nome: "Química Geral" },
    { codigo: "SOCL0001", nome: "Sociologia" },
    { codigo: "ELET0013", nome: "Circuitos Elétricos 1" },
    { codigo: "ELET0014", nome: "Circuitos Elétricos 2" },
    { codigo: "ELET0030", nome: "Eletromagnetismo 1" },
    { codigo: "ELET0031", nome: "Eletromagnetismo 2" },
    { codigo: "ELET0033", nome: "Eletrônica 1" },
    { codigo: "ELET0034", nome: "Eletrônica 2" },
    { codigo: "ELET0035", nome: "Eletrônica Analógica" },
    { codigo: "ELET0037", nome: "Eletrônica Digital" },
    { codigo: "ELET0047", nome: "Laboratório de Eletrônica 1" },
    { codigo: "ELET0048", nome: "Laboratório de Eletrônica 2" },
    { codigo: "ELET0049", nome: "Laboratório de Eletrônica Digital" },
    { codigo: "ELET0053", nome: "Materiais Elétricos" },
    { codigo: "ELET0074", nome: "Resistência dos Materiais" },
    { codigo: "ELET0025", nome: "Conversão Eletromecânica de Energia" },
    { codigo: "ELET0036", nome: "Eletrônica de Potência" },
    { codigo: "ELET0045", nome: "Instalações Elétricas Industriais" },
    { codigo: "ELET0054", nome: "Medidas Elétricas" },
    { codigo: "ELET0075", nome: "Sistemas de Controle 1" },
    { codigo: "ELET0076", nome: "Sistemas de Controle 2" },
    { codigo: "ELET0078", nome: "Sistemas Digitais" },
    { codigo: "DIRT0001", nome: "Direito para Engenheiros" },
    { codigo: "ELET0046", nome: "Instrumentação" },
    { codigo: "ELET0058", nome: "Microprocessadores" },
    { codigo: "ELET0061", nome: "Princípios de Telecomunicações" },
    { codigo: "ELET0104", nome: "Processos Estocásticos" },
    { codigo: "ADMT0001", nome: "Administração" },
    { codigo: "ELET0024", nome: "Controle de Processos" },
    { codigo: "ENGE0001", nome: "Engenharia de Segurança" },
    { codigo: "ECON0001", nome: "Engenharia Econômica" },
    { codigo: "ELET0041", nome: "Estágio Curricular Obrigatório" },
    { codigo: "ELET0050", nome: "Linhas de Transmissão" },
    { codigo: "ELET0066", nome: "Propagação Eletromagnética" },
    { codigo: "ELET0018", nome: "Comunicação Digital" },
    { codigo: "ELET0021", nome: "Comunicações Móveis e sem Fio" },
    { codigo: "ELET0022", nome: "Comunicações Ópticas" },
    { codigo: "ELET0063", nome: "Projeto Final de Curso" },
    { codigo: "ELET0070", nome: "Redes de Computadores 1" },
    { codigo: "ELET0071", nome: "Redes de Computadores 2" },
    { codigo: "ELET0002", nome: "Administração da Manutenção" },
    { codigo: "ELET0102", nome: "Processamento Digital de Sinais" },
    { codigo: "ELET0006", nome: "Antenas" },
    { codigo: "ELET0105", nome: "Teoria da Informação" },
    { codigo: "ELET0082", nome: "Telefonia 1" },
    { codigo: "ECOL0001", nome: "Engenharia Ambiental" },
  ],
};

/* ==========================================================================
   As grades e as contas que cada PPC publica — é contra elas que a
   transcrição é conferida. `esperado` sai do documento; `real` sai da tabela.
   ========================================================================== */
const GRADES = [
  {
    sigla: "automacao",
    curso: "Engenharia de Controle e Automação",
    matriz: "2021.1",
    observacao:
      "Perfil que entrou em vigência em 2021.1. Quem ingressou até 2020 segue o perfil antigo, que também está aqui no site.",
    chTotalCurso: 3600,
    /* Ementa do Estágio Curricular Obrigatório: "mínimo de 60% da carga
       horária total do curso integralizado". */
    estagioFracao: 0.6,
    disciplinas: AUTOMACAO_2021,
    /* Também herda: o PPC de 2021 não dá código às disciplinas que nasceram
       nele, e algumas existem noutro curso. */
    herdarCodigos: true,
    /* Totais do PPC: por período (matriz sequencial "A EXECUTAR") */
    porPeriodo: [330, 405, 360, 390, 390, 345, 330, 330, 300, 420],
    contas: (c) => [
      ["NCB, núcleo básico (Tabela 4)", 1425, c.chDaCategoria("basico")],
      ["NCP, profissionalizante (Tabela 4)", 705, c.chDaCategoria("prof")],
      /* O NCE do PPC junta o núcleo específico com eletivas e complementares. */
      ["NCE, específico + eletivas (Tabela 4)", 1470, c.chDaCategoria("espec", "eletiva", "compl")],
      ["extensão, as disciplinas DCExt", 510, c.ch(c.ds.filter((d) => d.dcext))],
      /* A Tabela 5 não lista Atividades Complementares, por isso a exclusão. */
      ["obrigatórias (Tabela 5)", 3300, c.ch(c.semEletivas.filter((d) => d.id !== "ATCOMP"))],
      ["quantas obrigatórias (Tabela 5)", 59, c.semEletivas.length - 1],
      ["matriz inteira", 3600, c.ch(c.ds)],
    ],
    notas: [
      'O PPC traz DUAS matrizes. Esta é a "A EXECUTAR", o perfil que entrou',
      "em 2021.1 — a única que a Tabela 5 descreve com pré e co-requisito. O",
      "perfil de 2010, que ainda vale para quem entrou até 2020, está em",
      "automacao-2010.yaml.",
      "",
      "`codigo` é o do perfil vigente onde a disciplina é a mesma, mesmo",
      "renomeada; `—` onde ela nasceu em 2021 e ainda não tem código.",
    ],
  },
  {
    sigla: "automacao-2010",
    curso: "Engenharia de Controle e Automação",
    matriz: "2010.1",
    observacao:
      "Perfil antigo, ainda válido para quem ingressou até 2020. Quem ingressou de 2021 em diante segue a matriz nova.",
    chTotalCurso: 3790,
    /* Este PPC NÃO publica a regra de CH mínima para o estágio. Usados os 60%
       da norma da UPE, que é o que o PPC de 2021 exige da mesma disciplina no
       mesmo curso — mas é empréstimo, não citação. */
    estagioFracao: 0.6,
    disciplinas: AUTOMACAO_2010,
    /* Totais por período, da própria Tabela 18. O do 9º é 210h de
       obrigatórias + 180h de eletivas; o documento imprime 360, que não
       fecha com nenhuma leitura das suas próprias linhas. */
    porPeriodo: [375, 405, 390, 375, 390, 405, 390, 390, 390, 280],
    contas: (c) => [
      ["Ciclo Básico (Tabela 13)", 1230, c.chDaCategoria("basico")],
      /* A Tabela 13 dá 1.065 ao Essencial e 1.035 às obrigatórias do
         Específico; a Tabela 15, somando as próprias áreas, dá 1.095 ao
         Essencial. Os dois números estão impressos no mesmo documento, e
         nada nele diz quais 30h pendem para que lado. O que dá para conferir
         sem escolher lado é a SOMA dos dois ciclos, que as duas leituras
         concordam ser 2.100h. */
      ["Essencial + Específico (Tabela 13)", 2100, c.chDaCategoria("prof", "espec")],
      ["Ciclo Complementar (Tabelas 13 e 17)", 280, c.chDaCategoria("compl")],
      ["eletivas (Tabelas 13 e 16)", 180, c.chDaCategoria("eletiva")],
      /* Aqui a Tabela 18 lista Atividades Complementares, então ela entra. */
      ["obrigatórias (Tabela 18)", 3610, c.ch(c.semEletivas)],
      ["quantas obrigatórias (Tabela 18)", 61, c.semEletivas.length],
      ["currículo pleno (§7.4)", 3790, c.ch(c.ds)],
    ],
    notas: [
      "Perfil ANTIGO, do PPC de 2010, ainda válido para quem ingressou até",
      "2020. A matriz de 2021 está em automacao.yaml.",
      "",
      "Entre os dois houve uma recodificação intermediária: o PPC de 2021",
      'descreve um perfil "EM EXECUÇÃO desde 2013.1" com as mesmas',
      "disciplinas desta matriz, porém com os códigos no formato novo da UPE",
      "(MAT02 virou MATM0018) e com duas delas em período diferente. Os",
      "códigos aqui são os que o PPC de 2010 imprime.",
      "",
      "Este PPC não publica a regra de CH mínima para o estágio; os 60% vêm",
      "da norma da UPE, que é o que o PPC de 2021 exige no mesmo curso.",
    ],
  },
  {
    sigla: "civil-2011",
    curso: "Engenharia Civil",
    matriz: "2011",
    observacao:
      "Perfil antigo, do projeto pedagógico de 2011. A matriz atual do curso é a 2021.1.",
    chTotalCurso: 3870,
    /* §7.5, com a conta feita no próprio texto: o estágio "somente poderá ser
       feito após o aluno ter concluído pelo menos 60% da carga horária total
       do curso, ou seja, 2.322 horas". */
    estagioFracao: 0.6,
    disciplinas: CIVIL_2011,
    porPeriodo: [315, 285, 285, 390, 345, 420, 390, 570, 330, 300],
    /* As atividades complementares não pertencem a um período: aparecem em
       todos os dez com CH "var", e por isso não entram em nenhum dos totais
       impressos. Ficam num nó só, no 10º, e fora desta conferência. */
    foraDoPeriodo: ["ATCOMP"],
    contas: (c) => [
      ["Núcleo de Conteúdos Básicos (Tabela 14)", 1470, c.chDaCategoria("basico")],
      ["Núcleo Profissionalizante (Tabela 15)", 1470, c.chDaCategoria("prof")],
      ["Núcleo Prof. Específico (Tabela 16)", 480, c.chDaCategoria("espec")],
      /* §7.4: "3.420 horas das disciplinas obrigatórias, 180 horas para o
         estágio, 30 horas para o PFC e 240 horas para as atividades
         complementares". As obrigatórias são só os três núcleos. */
      ["obrigatórias (§7.4)", 3420, c.chDaCategoria("basico", "prof", "espec")],
      ["estágio + PFC + complementares (§7.4)", 450, c.chDaCategoria("compl")],
      ["currículo pleno (§7.4)", 3870, c.ch(c.ds)],
      /* A CH que libera o estágio está impressa: confere se o total e a
         fração que eu registrei dão o mesmo número que o PPC calculou. */
      ["CH que libera o estágio (§7.5)", 2322, Math.round(3870 * 0.6)],
    ],
    notas: [
      "Perfil ANTIGO, do projeto pedagógico de 2011. A matriz atual do curso",
      "é a 2021.1, em civil.yaml — que veio do fluxograma do site 1.x, por",
      "scripts/extrair-grade.mjs, e não deste PPC.",
      "",
      "Cuidado ao reler a Tabela 18: célula de requisito com mais de um código",
      "quebra em linhas que caem ACIMA e ABAIXO da linha da disciplina, porque",
      "o PDF centraliza a célula na vertical.",
    ],
  },
  {
    sigla: "mecanica",
    curso: "Engenharia Mecânica",
    matriz: "2021.1",
    observacao:
      "Matriz em execução desde 2021.1. Quem entrou antes segue a matriz de 2012, de quando o curso se chamava Engenharia Mecânica Industrial.",
    chTotalCurso: 3600,
    /* 80%, e a regra é do PFC, não do estágio: "ter integralizado 80% da
       carga horária do curso". O estágio aqui sai por pré-requisito. */
    estagioFracao: 0.8,
    disciplinas: MECANICA_2021,
    /* O PPC não publica código; herda por nome de quem publica. */
    herdarCodigos: true,
    /* Subtotais da matriz sequencial (§3.6.4). O do 10º inclui as 60h de
       atividades complementares, que não têm linha própria lá. */
    porPeriodo: [330, 315, 390, 360, 390, 405, 630, 360, 240, 180],
    contas: (c) => [
      ["NCB, núcleo básico (Tabela 2)", 1455, c.chDaCategoria("basico")],
      /* A Tabela 2 dá 1.365h ao NCP, e a soma das disciplinas marcadas NCP na
         sequencial dá 1.545h. A diferença de 180h são as quatro DCExt
         obrigatórias, que o quadro de EIXOS FORMATIVOS conta no balde
         "Extensão" em vez de no núcleo. 1365 + 180 é o que se confere. */
      ["NCP + as DCExt obrigatórias (Tabela 2 + eixos)", 1545, c.chDaCategoria("prof")],
      ["eletivas, com as de extensão (eixos)", 300, c.chDaCategoria("eletiva")],
      ["estágio + PFC + complementares", 300, c.chDaCategoria("compl")],
      ["extensão: 4 DCExt + 3 eletivas de extensão (eixos)", 360, c.ch(c.ds.filter((d) => d.dcext))],
      ["carga horária total do curso (Tabela 2)", 3600, c.ch(c.ds)],
      /* O PPC faz a conta dos 80% do PFC: 2.880h. */
      ["CH que libera o PFC (Tabela 7)", 2880, Math.round(3600 * 0.8)],
    ],
    notas: [
      "Matriz em execução desde 2021.1. A anterior, de 2012, está em",
      "mecanica-2012.yaml — e naquela época o curso chamava-se Engenharia",
      "Mecânica INDUSTRIAL. São o mesmo curso, renomeado.",
      "",
      "Sem código: o PPC diz que \"os códigos das disciplinas são gerados",
      "automaticamente pelo sistema de gestão acadêmica - Siga\".",
      "",
      "A regra de carga horária deste curso é do PFC (80% integralizados), e",
      "não do estágio — por isso `estagio: true` está no Projeto Final.",
    ],
  },
  {
    sigla: "mecanica-2012",
    curso: "Engenharia Mecânica",
    matriz: "2012",
    observacao:
      "Perfil antigo, de quando o curso se chamava Engenharia Mecânica Industrial. A matriz em execução é a 2021.1.",
    chTotalCurso: 3660,
    /* Sem `estagioFracao`: este PPC não publica piso de CH para o estágio. */
    disciplinas: MECANICA_2012,
    porPeriodo: [315, 285, 375, 390, 405, 420, 525, 360, 285, 240],
    /* A Atividade Complementar não está na Tabela 18, só nas 13 e 17. */
    foraDoPeriodo: ["ATCOMP"],
    /* Economia Empresarial e Gestão da Qualidade são co-requisito uma da
       outra, e as duas linhas estão escritas assim: é de propósito. */
    coReciproco: [["ECON0001", "QUAL0001"]],
    contas: (c) => [
      /* As três cores da Tabela 18. Laranja: */
      ["Ciclo Básico, o laranja (Tabela 13)", 1515, c.chDaCategoria("basico")],
      /* Branco: */
      ["Ciclo Profissional Essencial, o branco (Tabela 13)", 1200, c.chDaCategoria("prof")],
      /* Verde, que a Tabela 13 abre em quatro linhas: */
      ["Específico, obrigatórias do verde (Tabela 13)", 525, c.chDaCategoria("espec")],
      ["eletivas do verde (Tabela 13)", 120, c.chDaCategoria("eletiva")],
      ["estágio + PFC + complementar", 300, c.chDaCategoria("compl")],
      ["currículo pleno (§7.4)", 3660, c.ch(c.ds)],
    ],
    notas: [
      "Perfil ANTIGO, do PPC de 2012, de quando o curso se chamava Engenharia",
      "Mecânica INDUSTRIAL. A matriz em execução é a 2021.1, em",
      "mecanica.yaml — é o mesmo curso, renomeado.",
      "",
      "A Tabela 18 deste PPC diz o ciclo de cada disciplina PELA COR da",
      "célula: laranja é básico, verde é específico, o resto é essencial. Cor",
      "não sai no pdftotext; foi preciso ler as páginas como imagem.",
      "",
      "Este PPC não publica piso de CH para o estágio: ele é liberado por",
      "pré-requisito, e por isso o mapa não mostra régua de porcentagem.",
    ],
  },
  {
    sigla: "eletronica-2012",
    /* O curso foi renomeado: em 2012 era só "Engenharia Eletrônica". As duas
       grades declaram o nome novo para o índice agrupá-las, como em Mecânica. */
    curso: "Engenharia Elétrica Eletrônica",
    matriz: "2012",
    observacao:
      "Perfil de 2012, de quando o curso se chamava apenas Engenharia Eletrônica. A matriz mais recente é a de 2020.",
    chTotalCurso: 3705,
    /* Sem `estagioFracao`: este PPC não publica piso de CH para o estágio. */
    disciplinas: ELETRONICA_2012,
    herdarCodigos: true,
    /* Subtotais da Tabela 11. O do 9º está impresso como "0"; as quatro
       linhas dele somam 360h. O 10º é a lista de eletivas: 360h. */
    porPeriodo: [315, 315, 330, 360, 405, 420, 420, 420, 360, 360],
    contas: (c) => [
      ["Ciclo Básico (Tabela 6)", 1260, c.chDaCategoria("basico")],
      /* A área "Circuitos Elétricos, 240h" da Tabela 8 pede quatro
         disciplinas de 60h e só três se encaixam pelo nome; o documento não
         diz qual é a quarta. Como isso muda só a cor de um nó, o que se
         confere é a soma dos dois ciclos, que não depende da escolha. */
      ["Essencial + Específico obrigatório (Tabela 6)", 1845, c.chDaCategoria("prof", "espec")],
      ["eletivas (Tabelas 6 e 9)", 360, c.chDaCategoria("eletiva")],
      ["Ciclo Complementar (Tabelas 6 e 10)", 240, c.chDaCategoria("compl")],
      ["currículo pleno (§2.5)", 3705, c.ch(c.ds)],
    ],
    notas: [
      "Perfil de 2012, de quando o curso se chamava apenas Engenharia",
      "Eletrônica — é o mesmo curso da matriz de 2020, renomeado. A Tabela 11",
      "escreve pré e co-requisito POR NOME em",
      "linhas próprias — o formato mais legível dos seis PPCs lidos — e não",
      "tem coluna de código: os códigos aqui foram herdados por nome das",
      "outras grades.",
      "",
      "A Tabela 8 não fecha sozinha: a área \"Circuitos Elétricos, 240h\" pede",
      "quatro disciplinas de 60h e só três se encaixam pelo nome. Por isso o",
      "script confere Essencial + Específico somados, e não cada um.",
      "",
      "Este PPC não publica piso de CH para o estágio.",
    ],
  },
  {
    sigla: "eletronica",
    curso: "Engenharia Elétrica Eletrônica",
    matriz: "2020",
    observacao:
      "Matriz de 2020. Quem entrou antes segue a de 2012, de quando o curso se chamava Engenharia Eletrônica.",
    chTotalCurso: 3720,
    /* Sem `estagioFracao`: este PPC não publica piso de CH para o estágio. */
    disciplinas: ELETRONICA_2020,
    herdarCodigos: true,
    /* Subtotais da Tabela 6. As atividades complementares não têm linha lá. */
    porPeriodo: [330, 405, 360, 420, 390, 405, 330, 480, 240, 300],
    foraDoPeriodo: ["ATCOMP"],
    contas: (c) => [
      /* A CH das componentes EXT sai do núcleo e vai para o balde da
         Extensão, então cada núcleo se confere somando de volta as suas. */
      ["NCB + as duas EXT do NCB (Tabela 1)", 1275, c.chDaCategoria("basico")],
      ["NCP, que não tem nenhuma EXT (Tabela 1)", 1035, c.chDaCategoria("prof")],
      /* 660 do NCE + 210 das suas EXT + 180 do estágio + 60 das atividades
         complementares. O PFC fica dentro dos 660. */
      ["NCE + suas EXT + estágio + complementares", 1110, c.chDaCategoria("espec", "compl")],
      ["eletivas: 120h de extensão + 180h do NFC (Tabela 1)", 300, c.chDaCategoria("eletiva")],
      ["Extensão, todas as componentes EXT (Tabela 1)", 390, c.ch(c.ds.filter((d) => d.dcext))],
      ["carga horária total (Tabela 1)", 3720, c.ch(c.ds)],
    ],
    notas: [
      "Matriz de 2020. A anterior, de 2012, está em eletronica-2012.yaml — e",
      "naquela época o curso chamava-se apenas Engenharia Eletrônica. São o",
      "mesmo curso, renomeado.",
      "",
      "A Tabela 6 marca cada componente com o NÚCLEO e com a dimensão (ENS de",
      "ensino, EXT de extensão). A CH das EXT sai do núcleo e vai para o balde",
      "da Extensão da Tabela 1 — é por isso que as contas por núcleo aqui",
      "somam as EXT de volta.",
      "",
      "Sem coluna de código: os que aparecem no mapa foram herdados por nome",
      "das outras grades.",
    ],
  },
  {
    sigla: "telecom-2010",
    /* O curso foi renomeado: o PPC antigo é de "Engenharia de
       Telecomunicações", o de 2021 é de "Engenharia Elétrica de
       Telecomunicações". Mesmo curso, e as duas grades declaram o nome novo
       para o índice agrupá-las. */
    curso: "Engenharia Elétrica de Telecomunicações",
    matriz: "2010",
    observacao:
      "Perfil antigo, de quando o curso se chamava apenas Engenharia de Telecomunicações. A matriz nova é a de 2021.",
    chTotalCurso: 3645,
    /* Tabela 15: o estágio pede "60% curso". */
    estagioFracao: 0.6,
    disciplinas: TELECOM_2010,
    porPeriodo: [315, 315, 330, 360, 330, 390, 375, 390, 540, 300],
    contas: (c) => [
      ["Ciclo Básico (Tabelas 10 e 11)", 1320, c.chDaCategoria("basico")],
      ["Ciclo Profissional Essencial (Tabelas 10 e 12)", 1005, c.chDaCategoria("prof")],
      ["Específico, obrigatórias (Tabelas 10 e 13)", 720, c.chDaCategoria("espec")],
      ["eletivas (Tabelas 10 e 13)", 360, c.chDaCategoria("eletiva")],
      ["Ciclo Complementar (Tabelas 10 e 14)", 240, c.chDaCategoria("compl")],
      ["currículo pleno (§7.4)", 3645, c.ch(c.ds)],
    ],
    notas: [
      "Perfil antigo, do PPC anterior à revisão de 2021.",
      "",
      "É o PPC que mais fecha de todos: os três ciclos resolvem sem",
      "ambiguidade, cada área das Tabelas 11 e 12 casando exatamente com as",
      "disciplinas pelo nome. Inclusive a área \"Circuitos Elétricos, 240h\",",
      "que em Eletrônica 2012 ficou faltando uma disciplina — aqui fecha com",
      "Circuitos 1 e 2, Instalações Elétricas e Medidas Elétricas.",
      "",
      "Códigos no formato curto da época, como o PPC os imprime.",
    ],
  },
  {
    sigla: "telecom",
    curso: "Engenharia Elétrica de Telecomunicações",
    matriz: "2021",
    observacao:
      "Matriz a executar, da revisão de 2021 do projeto pedagógico. Quem entrou antes segue a de 2010.",
    chTotalCurso: 3750,
    /* Sem `estagioFracao`: não há piso de CH; o estágio sai por
       pré-requisito. */
    disciplinas: TELECOM_2021,
    herdarCodigos: true,
    porPeriodo: [330, 405, 360, 420, 360, 375, 360, 390, 390, 360],
    contas: (c) => [
      ["NCB (Tabela 1)", 1335, c.chDaCategoria("basico")],
      /* A Tabela 1 imprime 825 aqui, e a soma das componentes marcadas NCP dá
         855. São 30h que o documento não realoca em lugar nenhum — ver a nota
         em Gestão Organizacional. O valor conferido é o da transcrição, que
         trava a digitação mesmo sem resolver a divergência. */
      ["NCP pela coluna Núcleo (a Tabela 1 imprime 825)", 855, c.chDaCategoria("prof")],
      /* NCE 960 das obrigatórias + 180 do estágio e do PFC. */
      ["NCE + estágio (Tabela 1)", 1140, c.chDaCategoria("espec", "compl")],
      ["eletivas: 240h do NFC + 180h de extensão (Tabela 1)", 420, c.chDaCategoria("eletiva")],
      ["componentes de extensão (Tabela 1)", 390, c.ch(c.ds.filter((d) => d.dcext))],
      ["carga horária total (Tabela 1)", 3750, c.ch(c.ds)],
    ],
    notas: [
      "Matriz a executar, da revisão de 2021. A anterior, de 2010, está em",
      "telecom-2010.yaml — e naquela época o curso chamava-se apenas",
      "Engenharia de Telecomunicações. São o mesmo curso, renomeado.",
      "",
      "Quatro contas da Tabela 1 fecham exato com a coluna Núcleo: NCB 1335,",
      "NCE 960, extensão 390 e NFC 240. A quinta não: somando as componentes",
      "marcadas NCP dá 855h e a Tabela 1 imprime 825h. As 30h de diferença",
      "ficaram registradas em nota, não resolvidas por palpite.",
      "",
      "A Tabela 7 não tem coluna de código. Os que aparecem no mapa vieram da",
      "consulta do SIGA ao perfil EL03-1 do mesmo curso, por nome.",
    ],
  },
];

/* ==========================================================================
   REGISTRO COMPARTILHADO DE CÓDIGOS

   Um PPC pode não publicar código nenhum — o de Engenharia Mecânica de 2021
   diz que "os códigos das disciplinas são gerados automaticamente pelo
   sistema de gestão acadêmica - Siga" e não os lista. Mas a mesma disciplina
   costuma aparecer noutro curso, e lá o código está escrito: Química é
   QUIM0002 tanto em Automação quanto em Mecânica Industrial.

   Então o registro é montado a partir das grades que TÊM código, e as que não
   têm herdam por nome. Duas regras impedem que isso vire chute:

   1. Só o formato atual da UPE (AAAA9999). Os códigos curtos dos PPCs antigos
      (MAT01, ECA01, INF01) são locais de cada curso e de cada época — MAT01
      quer dizer coisas diferentes em documentos diferentes.
   2. Se um nome aparece com códigos DIFERENTES em cursos diferentes, ninguém
      herda nada. Isso acontece de verdade, e é informação, não ruído: cada
      pleno registra o seu próprio componente para várias disciplinas
      (Resistência dos Materiais é MCTR0005 em Automação e RMAT0001 em
      Mecânica). Só o que é unânime passa.

   Além disso, o código da OUTRA MATRIZ DO MESMO CURSO tem prioridade sobre o
   de outro curso: é a mesma disciplina, do mesmo pleno, só de outra época.
   ========================================================================== */
/* Quatro dígitos ou mais é o que separa o registro atual dos códigos curtos
   dos PPCs antigos: MATM0018 e PFC00001 entram, MAT01 e ECA10 não. Os curtos
   são locais de cada curso e de cada época — MAT01 quer dizer coisas
   diferentes em documentos diferentes, e herdar por ali seria chute. */
const CODIGO_ATUAL = /^[A-Z]{3,4}\d{4,5}$/;

/* Nome vira chave: sem acento, sem as abreviações que eu uso nas tabelas, sem
   as palavras de ligação — para "Complementos de Matemática" e "Complementos
   da Matemática" caírem na mesma chave. */
function chaveNome(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bcalc\.?\b/g, "calculo")
    .replace(/\bdif\.?\b/g, "diferencial")
    .replace(/\bfund\.?\b/g, "fundamentos")
    .replace(/\bamb\.?\b/g, "ambiente")
    .replace(/\blab\.?\b/g, "laboratorio")
    .replace(/\bcomp\.?\b/g, "computacionais")
    .replace(/\bp\//g, "para ")
    .replace(/\bdcext\b/g, " ")
    .replace(/\b(da|de|do|das|dos|e|em|a|o)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    /* Singular e plural na mesma chave: "Máquina de Elevação" e "Máquinas de
       Elevação" são a mesma disciplina. O corte do "s" final é aplicado dos
       dois lados, então não importa se o radical fica torto ("materiais" ->
       "materiai") — importa que fique igual. */
    .split(" ")
    .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w))
    .join(" ");
}

/* nome -> {codigos: Set, cursos: Map<curso, Set>} */
function montarRegistro(grades) {
  const reg = new Map();
  for (const g of grades) {
    for (const d of g.disciplinas) {
      if (!CODIGO_ATUAL.test(d.codigo)) continue;
      const k = chaveNome(d.nome);
      if (!reg.has(k)) reg.set(k, { codigos: new Set(), porCurso: new Map() });
      const e = reg.get(k);
      e.codigos.add(d.codigo);
      if (!e.porCurso.has(g.curso)) e.porCurso.set(g.curso, new Set());
      e.porCurso.get(g.curso).add(d.codigo);
    }
  }
  return reg;
}

/* Devolve o código herdado, ou undefined quando não há um só candidato.

   `soDoCurso` para os componentes administrativos — estágio, PFC, atividades
   complementares. Esses cada pleno registra por conta própria, então o código
   de outro curso não diz nada sobre este; já o da outra matriz DO MESMO curso
   diz. */
function herdar(reg, curso, nome, soDoCurso = false) {
  const e = reg.get(chaveNome(nome));
  if (!e) return undefined;
  const doCurso = e.porCurso.get(curso);
  if (doCurso?.size === 1) return [...doCurso][0];
  if (soDoCurso) return undefined;
  return e.codigos.size === 1 ? [...e.codigos][0] : undefined;
}

/* ==========================================================================
   Conferência e emissão. Nada é gravado se alguma conta não fechar.
   ========================================================================== */
const esc = (s) => (/[:#{}[\],&*?|>=!%@`"']|^\s|\s$/.test(s) ? JSON.stringify(s) : s);

function gerar(g, registro) {
  const erros = [];
  const ds = g.disciplinas.map((d) => ({ pre: [], co: [], dcext: false, estagio: false, ...d }));

  /* Herança de código, só onde a grade pede e o campo está vazio. */
  const herdados = [];
  const semCodigo = [];
  if (g.herdarCodigos) {
    for (const d of ds) {
      if (d.codigo !== "—") continue;
      const c = herdar(registro, g.curso, d.nome, d.categoria === "compl");
      if (c) {
        d.codigo = c;
        herdados.push(`${c} ${d.nome}`);
      } else if (d.categoria !== "eletiva") {
        semCodigo.push(d.nome);
      }
    }
  }
  const porId = new Map(ds.map((d) => [d.id, d]));
  const chDe = (d) => d.teorica + d.pratica;
  const ch = (lista) => lista.reduce((s, d) => s + chDe(d), 0);
  /* O que cada PPC chama de "obrigatórias" não é a mesma coisa: a Tabela 5 de
     2021 não lista Atividades Complementares, e a Tabela 18 de 2010 lista.
     Então o contexto entrega o conjunto sem eletivas e cada grade recorta. */
  const semEletivas = ds.filter((d) => d.categoria !== "eletiva");

  if (porId.size !== ds.length) erros.push("há id repetido na tabela");

  /* --- grafo: alvo existe, vem antes, e não há ciclo ------------------ */
  for (const d of ds) {
    for (const [campo, lista] of [
      ["pre", d.pre],
      ["co", d.co],
    ]) {
      for (const alvo of lista) {
        const a = porId.get(alvo);
        if (!a) {
          erros.push(`${d.id}: ${campo} aponta para "${alvo}", que não existe`);
          continue;
        }
        if (alvo === d.id) erros.push(`${d.id} é requisito de si mesma`);
        /* pré-requisito tem de estar num período ANTERIOR; co-requisito pode
           estar no mesmo. Um requisito depois da disciplina é erro de
           transcrição, não uma matriz exótica. */
        const ok = campo === "pre" ? a.periodo < d.periodo : a.periodo <= d.periodo;
        if (!ok) erros.push(`${d.id} (${d.periodo}º) tem ${campo} ${alvo} no ${a.periodo}º período`);
      }
    }
  }
  /* ciclo: com pré-requisito sempre em período anterior o grafo já é
     acíclico, mas o co-requisito recíproco (A co B, B co A) passaria. Ele é
     quase sempre erro de transcrição — quase: há PPC que exige duas
     disciplinas juntas de propósito, e aí a grade declara o par em
     `coReciproco` para o par passar sem afrouxar a checagem para os outros. */
  const combinado = new Set((g.coReciproco ?? []).map(([a, b]) => [a, b].sort().join("+")));
  for (const d of ds) {
    for (const alvo of d.co) {
      if (porId.get(alvo)?.co.includes(d.id) && !combinado.has([d.id, alvo].sort().join("+"))) {
        erros.push(`${d.id} e ${alvo} são co-requisito um do outro`);
      }
    }
  }

  /* --- carga horária contra os totais do PPC -------------------------- */
  const contas = g.contas({
    ds,
    semEletivas,
    ch,
    chDaCategoria: (...cats) => ch(ds.filter((d) => cats.includes(d.categoria))),
  });
  for (const [o, esperado, real] of contas) {
    if (real !== esperado) erros.push(`${o}: transcrição dá ${real}, o PPC diz ${esperado}`);
  }
  /* Por período: é a conferência mais forte que existe aqui, porque uma CH
     digitada errada aparece na soma do período dela e em nenhuma outra. */
  const contaNoPeriodo = ds.filter((d) => !(g.foraDoPeriodo ?? []).includes(d.id));
  g.porPeriodo.forEach((esperado, i) => {
    const p = i + 1;
    const real = ch(contaNoPeriodo.filter((d) => d.periodo === p));
    if (real !== esperado) erros.push(`${p}º período: transcrição dá ${real}h, o PPC diz ${esperado}h`);
  });

  /* --- coerência interna --------------------------------------------- */
  for (const d of ds) {
    if (chDe(d) === 0) erros.push(`${d.id} está com CH zero`);
    if (d.periodo < 1 || d.periodo > 10) erros.push(`${d.id}: período ${d.periodo} fora da matriz`);
  }
  const comEstagio = ds.filter((d) => d.estagio);
  if (comEstagio.length !== 1) erros.push(`${comEstagio.length} disciplinas marcadas como estágio`);

  if (erros.length) {
    console.error(`\n  ${g.sigla}: ${erros.length} problema(s) na transcrição — nada gravado:\n`);
    for (const e of erros) console.error("    · " + e);
    console.error("");
    return false;
  }

  /* --- emissão -------------------------------------------------------- */
  const L = [];
  L.push(cabecalho(g.sigla + ".yaml"));
  L.push("# " + "*".repeat(72));
  L.push(`# Grade de ${g.curso} — POLI/UPE, matriz ${g.matriz}.`);
  L.push("#");
  L.push("# GERADO por scripts/extrair-grade-ppc.mjs, a partir do PPC do curso.");
  L.push("# Editar à mão se perde na próxima geração: a correção vai no script.");
  L.push("#");
  for (const n of g.notas) L.push(n ? "# " + n : "#");
  L.push("#");
  L.push("# `pre` = pré-requisito (seta contínua) · `co` = co-requisito (tracejada)");
  L.push("# `cadeira` liga o nó à página da cadeira no site, quando ela existe.");
  L.push("# " + "*".repeat(72));
  L.push(`curso: ${esc(g.curso)}`);
  L.push(`sigla: ${g.sigla}`);
  L.push(`matriz: ${JSON.stringify(g.matriz)}`);
  L.push(`observacao: ${esc(g.observacao)}`);
  L.push(`chTotalCurso: ${g.chTotalCurso}`);
  /* Ausente quando o PPC não publica piso de CH para o estágio. */
  if (g.estagioFracao !== undefined) L.push(`estagioFracao: ${g.estagioFracao}`);
  L.push("disciplinas:");
  for (const d of ds) {
    L.push(`  - id: ${d.id}`);
    L.push(`    codigo: ${esc(d.codigo)}`);
    L.push(`    nome: ${esc(d.nome)}`);
    L.push(`    periodo: ${d.periodo}`);
    L.push(`    teorica: ${d.teorica}`);
    L.push(`    pratica: ${d.pratica}`);
    L.push(`    categoria: ${d.categoria}`);
    L.push(`    pre: [${d.pre.join(", ")}]`);
    L.push(`    co: [${d.co.join(", ")}]`);
    if (d.dcext) L.push("    dcext: true");
    if (d.estagio) L.push("    estagio: true");
    if (d.nota) L.push(`    nota: ${esc(d.nota)}`);
    if (d.cadeira) L.push(`    cadeira: ${d.cadeira}`);
  }

  const destino = `src/content/grade/${g.sigla}.yaml`;
  writeFileSync(destino, L.join("\n") + "\n");
  console.log(
    `  ${destino}: ${ds.length} disciplinas ` +
      `(${semEletivas.length} da matriz + ${ds.length - semEletivas.length} eletivas), ` +
      `${ds.reduce((s, d) => s + d.pre.length, 0)} pré + ` +
      `${ds.reduce((s, d) => s + d.co.length, 0)} co, ` +
      `${ch(ds)}h — ${contas.length + g.porPeriodo.length} contas do PPC conferidas`,
  );
  if (g.herdarCodigos) {
    console.log(
      `    códigos herdados por nome: ${herdados.length}` +
        (semCodigo.length ? `; ${semCodigo.length} sem código` : ""),
    );
    /* Quem ficou sem código fica DITO, não escondido: a lista é o que sobra
       para conferir à mão se um dia aparecer a fonte. */
    for (const n of semCodigo) console.log(`      — ${n}`);
  }
  return true;
}

const pedido = process.argv[2];
const alvos =
  !pedido || pedido === "--todas" ? GRADES : GRADES.filter((g) => g.sigla === pedido);
if (!alvos.length) {
  console.error(`grade "${pedido}" não existe. Há: ${GRADES.map((g) => g.sigla).join(", ")}`);
  process.exit(1);
}
/* O registro sai de TODAS as grades, mesmo quando só uma é gerada: o código
   de Mecânica 2021 vem de Automação, que pode não estar sendo regerada. */
const registro = montarRegistro([...GRADES, CODIGOS_SIGA_TELECOM]);
if (!alvos.map((g) => gerar(g, registro)).every(Boolean)) process.exit(1);
