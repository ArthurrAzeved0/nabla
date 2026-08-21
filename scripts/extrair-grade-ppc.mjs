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
/* Gera src/content/grade/<sigla>.yaml a partir da matriz transcrita do PPC.

   Por que existe, sendo que já há scripts/extrair-grade.mjs? Aquele lê o
   `const COURSES = [...]` do fluxograma do site 1.x — só serve para Civil,
   que já tinha um mapa pronto. Os outros cursos não têm: a fonte é o PPC em
   PDF, e num PDF a tabela de pré-requisitos sai com as células quebradas em
   várias linhas, com o nome da disciplina intercalado com o do requisito na
   mesma faixa vertical. Parser de linha não resolve isso sem inventar.

   Então a matriz é TRANSCRITA aqui, à mão, e o script faz o que máquina faz
   melhor que gente: CONFERIR. Antes de escrever o YAML ele checa a
   transcrição contra os totais que o próprio PPC publica — carga horária por
   núcleo, carga de extensão, total das obrigatórias — e checa a coerência do
   grafo (requisito que não existe, requisito num período posterior, ciclo).
   Se qualquer conta não fechar, ele aborta sem gravar nada. Um erro de
   digitação numa CH deixa de ser um número errado no site e passa a ser um
   script que não roda.

   Uso: node scripts/extrair-grade-ppc.mjs automacao
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

/* ==========================================================================
   ENGENHARIA DE CONTROLE E AUTOMAÇÃO — matriz 2021.1

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
/* A matriz sequencial marca a CH das eletivas com "-*" e explica em nota de
   rodapé: quem define a divisão é a eletiva escolhida. O total é 60h. */
const NOTA_ELETIVA =
  "A divisão entre CH teórica e prática varia conforme a eletiva escolhida; o total é 60h.";

const D = [
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
   Metadados do curso e as contas que o PPC publica — é contra elas que a
   transcrição é conferida.
   ========================================================================== */
const GRADE = {
  sigla: "automacao",
  curso: "Engenharia de Controle e Automação",
  matriz: "2021.1",
  chTotalCurso: 3600,
  /* Ementa do Estágio Curricular Obrigatório: "mínimo de 60% da carga
     horária total do curso integralizado". */
  estagioFracao: 0.6,
  disciplinas: D,
  /* Números impressos no PPC. Mudar aqui é dizer que o PPC mudou. */
  conferir: {
    /* Tabela 4 — CH por núcleo de conteúdos */
    nucleos: { basico: 1425, prof: 705, espec: 1470 },
    /* Áreas de formação: a extensão (DCExt) soma 510h */
    dcext: 510,
    /* Tabela 5 — total das 59 obrigatórias */
    obrigatorias: 3300,
    quantasObrigatorias: 59,
  },
};

/* ==========================================================================
   Conferência. Nada é gravado se alguma conta não fechar.
   ========================================================================== */
const erros = [];
const g = GRADE;
const ds = g.disciplinas.map((d) => ({ pre: [], co: [], dcext: false, estagio: false, ...d }));
const porId = new Map(ds.map((d) => [d.id, d]));
const ch = (d) => d.teorica + d.pratica;
const soma = (lista) => lista.reduce((s, d) => s + ch(d), 0);

if (porId.size !== ds.length) erros.push("há id repetido na tabela");

/* --- grafo: alvo existe, vem antes, e não há ciclo -------------------- */
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
      const limite = campo === "pre" ? a.periodo < d.periodo : a.periodo <= d.periodo;
      if (!limite) {
        erros.push(
          `${d.id} (${d.periodo}º) tem ${campo} ${alvo} no ${a.periodo}º período`,
        );
      }
    }
  }
}
/* ciclo: com pré-requisito sempre em período anterior o grafo já é acíclico,
   mas o co-requisito recíproco (A co B, B co A) passaria — então checa. */
for (const d of ds) {
  for (const alvo of d.co) {
    if (porId.get(alvo)?.co.includes(d.id)) {
      erros.push(`${d.id} e ${alvo} são co-requisito um do outro`);
    }
  }
}

/* --- carga horária contra os totais do PPC ---------------------------- */
const c = g.conferir;
for (const [cat, esperado] of Object.entries(c.nucleos)) {
  /* O NCE do PPC junta o núcleo específico com eletivas e complementares. */
  const grupo =
    cat === "espec"
      ? ds.filter((d) => ["espec", "eletiva", "compl"].includes(d.categoria))
      : ds.filter((d) => d.categoria === cat);
  const tem = soma(grupo);
  if (tem !== esperado) erros.push(`núcleo ${cat}: ${tem}h, o PPC diz ${esperado}h`);
}
const temDcext = soma(ds.filter((d) => d.dcext));
if (temDcext !== c.dcext) erros.push(`extensão (DCExt): ${temDcext}h, o PPC diz ${c.dcext}h`);

const obrigatorias = ds.filter((d) => d.categoria !== "eletiva" && d.id !== "ATCOMP");
if (obrigatorias.length !== c.quantasObrigatorias) {
  erros.push(
    `${obrigatorias.length} obrigatórias, a Tabela 5 traz ${c.quantasObrigatorias}`,
  );
}
const chObr = soma(obrigatorias);
if (chObr !== c.obrigatorias) {
  erros.push(`obrigatórias: ${chObr}h, a Tabela 5 diz ${c.obrigatorias}h`);
}
const chTudo = soma(ds);
if (chTudo !== g.chTotalCurso) {
  erros.push(`matriz inteira: ${chTudo}h, o curso tem ${g.chTotalCurso}h`);
}

/* --- coerência interna ----------------------------------------------- */
for (const d of ds) {
  if (ch(d) === 0) erros.push(`${d.id} está com CH zero`);
  if (d.periodo < 1 || d.periodo > 10) erros.push(`${d.id}: período ${d.periodo} fora da matriz`);
}
const comEstagio = ds.filter((d) => d.estagio);
if (comEstagio.length !== 1) erros.push(`${comEstagio.length} disciplinas marcadas como estágio`);

if (erros.length) {
  console.error(`\n  ${erros.length} problema(s) na transcrição — nada foi gravado:\n`);
  for (const e of erros) console.error("    · " + e);
  console.error("");
  process.exit(1);
}

/* ==========================================================================
   Emissão do YAML.
   ========================================================================== */
const esc = (s) => (/[:#{}[\],&*?|>=!%@`"']|^\s|\s$/.test(s) ? JSON.stringify(s) : s);
const L = [];
L.push(cabecalho(g.sigla + ".yaml"));
L.push("# " + "*".repeat(72));
L.push(`# Grade de ${g.curso} — POLI/UPE, matriz ${g.matriz}.`);
L.push("#");
L.push("# GERADO por scripts/extrair-grade-ppc.mjs, a partir do PPC do curso.");
L.push("# Editar à mão se perde na próxima geração: a correção vai no script.");
L.push("#");
L.push("# O PPC traz DUAS matrizes. Esta é a \"A EXECUTAR\", o perfil que entrou");
L.push("# em 2021.1 — a única que a Tabela 5 descreve com pré e co-requisito. O");
L.push("# perfil vigente desde 2013.1 é outra matriz, e não vem mapeada aqui.");
L.push("#");
L.push("# `codigo` é o do perfil vigente onde a disciplina é a mesma, mesmo");
L.push("# renomeada; `—` onde ela nasceu em 2021 e ainda não tem código.");
L.push("#");
L.push("# `pre` = pré-requisito (seta contínua) · `co` = co-requisito (tracejada)");
L.push("# `cadeira` liga o nó à página da cadeira no site, quando ela existe.");
L.push("# " + "*".repeat(72));
L.push(`curso: ${esc(g.curso)}`);
L.push(`sigla: ${g.sigla}`);
L.push(`matriz: ${JSON.stringify(g.matriz)}`);
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
  `  ${destino}: ${ds.length} disciplinas (${obrigatorias.length} obrigatórias), ` +
    `${ds.reduce((s, d) => s + d.pre.length, 0)} pré + ` +
    `${ds.reduce((s, d) => s + d.co.length, 0)} co, ` +
    `${chTudo}h — conferido contra os totais do PPC`,
);
