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
    nota: "No perfil vigente: Mecânica 2." },
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
    periodo: 4, teorica: 60, pratica: 0, categoria: "basico", pre: ["MEC01"] },

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
];

/* ==========================================================================
   Conferência e emissão. Nada é gravado se alguma conta não fechar.
   ========================================================================== */
const esc = (s) => (/[:#{}[\],&*?|>=!%@`"']|^\s|\s$/.test(s) ? JSON.stringify(s) : s);

function gerar(g) {
  const erros = [];
  const ds = g.disciplinas.map((d) => ({ pre: [], co: [], dcext: false, estagio: false, ...d }));
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
     acíclico, mas o co-requisito recíproco (A co B, B co A) passaria. */
  for (const d of ds) {
    for (const alvo of d.co) {
      if (porId.get(alvo)?.co.includes(d.id)) {
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
  g.porPeriodo.forEach((esperado, i) => {
    const p = i + 1;
    const real = ch(ds.filter((d) => d.periodo === p));
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
  L.push(`estagioFracao: ${g.estagioFracao}`);
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
  return true;
}

const pedido = process.argv[2];
const alvos =
  !pedido || pedido === "--todas" ? GRADES : GRADES.filter((g) => g.sigla === pedido);
if (!alvos.length) {
  console.error(`grade "${pedido}" não existe. Há: ${GRADES.map((g) => g.sigla).join(", ")}`);
  process.exit(1);
}
if (!alvos.map(gerar).every(Boolean)) process.exit(1);
