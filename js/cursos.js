/* ==========================================================================
   cursos.js — REGISTRO CENTRAL DE CADEIRAS.
   Para adicionar uma cadeira nova ao site, basta:
     1. Adicionar um objeto neste array (veja o modelo comentado no fim);
     2. Criar o arquivo de teoria em conteudo/<id>.html;
     3. Criar as pastas questoes/<id>/{1ee,2ee,final}/ com os blocos de questão;
     4. Registrar as questões em questoes/manifest.js.
   Nada mais precisa ser alterado: a home e a página da cadeira leem daqui.
   ========================================================================== */
window.CURSOS = [
  {
    id: "calculo3",                    // usado nas URLs e nomes de pasta (sem espaços/acentos)
    nome: "Cálculo Diferencial e Integral Vetorial (Cálculo 3)", // nome completo da cadeira
    codigo: "MAT05 · 60h",
    descricao: "Funções de várias variáveis, limites, derivadas parciais, máximos e mínimos, integrais múltiplas, integrais de linha e de superfície, e os teoremas de Green, Gauss e Stokes.",
    // Ícone em SVG (desenhado à mão, sem bibliotecas externas):
    icone: '<svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true"><path d="M5 26c4-1 6-4 7-9s3-10 8-11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 6h7M20 6l6 8M26 6l-6 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M4 28h24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    // Mapa tema (data-tema da questão) -> id da seção em conteudo/<id>.html.
    // Usado pelo botão "Ver material" de cada questão (abre a teoria na âncora).
    teoria: {
      "funcoes-varias-variaveis": "c3-funcoes",
      "limites": "c3-limites",
      "derivadas-parciais": "c3-parciais",
      "gradiente-derivada-direcional": "c3-gradiente",
      "derivada-direcional": "c3-gradiente",
      "plano-tangente": "c3-gradiente",
      "plano-tangente-aproximacao-linear": "c3-gradiente",
      "pontos-criticos": "c3-maxmin",
      "maximos-e-minimos": "c3-maxmin",
      "multiplicadores-lagrange": "c3-lagrange",
      "integrais-multiplas": "c3-multiplas",
      "integrais-duplas": "c3-multiplas",
      "integrais-duplas-polares": "c3-multiplas",
      "integrais-triplas-esfericas": "c3-multiplas",
      "integrais-triplas-cilindricas": "c3-multiplas",
      "integrais-de-linha": "c3-linha",
      "campos-conservativos": "c3-linha",
      "integrais-de-linha-green": "c3-green",
      "teorema-de-green": "c3-green",
      "plano-tangente-superficie-parametrizada": "c3-superficie",
      "integral-de-superficie": "c3-superficie",
      "area-de-superficie": "c3-superficie",
      "fluxo-integral-de-superficie": "c3-superficie",
      "teorema-da-divergencia": "c3-gauss",
      "teorema-de-stokes": "c3-stokes"
    }
  },

  {
    id: "eqdiferenciais",
    nome: "Equações Diferenciais (Cálculo 4)",
    codigo: "MAT06 · 60h",
    descricao: "EDOs de 1ª ordem (lineares, separáveis, exatas, Bernoulli), 2ª ordem e ordem superior, aplicações (oscilador, RLC), sistemas lineares por autovalores, séries de potências, Cauchy-Euler e Frobenius.",
    icone: '<svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true"><path d="M4 26c5 0 5-20 10-20s5 20 10 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 8h7M22 8l6 7M28 8l-6 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M4 28h24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    // Mapa tema (data-tema) -> id da seção em conteudo/eqdiferenciais.html (botão "Ver material").
    teoria: {
      "crescimento-exponencial": "ed-aplicacoes1",
      "arrefecimento-de-newton": "ed-aplicacoes1",
      "fator-integrante": "ed-lineares",
      "fator-integrante-exatas": "ed-exatas",
      "equacoes-exatas": "ed-exatas",
      "bernoulli": "ed-bernoulli",
      "equacao-caracteristica": "ed-homogenea",
      "reducao-de-ordem": "ed-wronskiano",
      "coeficientes-indeterminados": "ed-coef-indeterminados",
      "variacao-de-parametros": "ed-variacao-parametros",
      "oscilador-amortecido": "ed-aplicacoes2",
      "circuito-rlc": "ed-aplicacoes2",
      "ordem-superior": "ed-cauchy-euler",
      "cauchy-euler": "ed-cauchy-euler",
      "sistemas-autovalores-reais": "ed-sistemas",
      "sistemas-verificacao": "ed-sistemas",
      "sistemas-matriz-fundamental": "ed-sistemas",
      "sistemas-3x3": "ed-sistemas",
      "sistemas-analise-qualitativa": "ed-sistemas",
      "sistemas-autovalores-complexos": "ed-sistemas-casos",
      "sistemas-autovalor-repetido": "ed-sistemas-casos",
      "sistemas-3x3-autovalor-repetido": "ed-sistemas-casos",
      "sistemas-nao-homogeneos": "ed-sistemas-casos",
      "series-ponto-ordinario": "ed-series",
      "series-ponto-deslocado": "ed-series",
      "frobenius": "ed-frobenius"
    }
  },

  {
    id: "eletromag",
    nome: "Fundamentos do Eletromagnetismo",
    codigo: "FÍSICA 3 · 60h",
    descricao: "Carga e campo elétrico, Lei de Gauss, potencial, capacitância, circuitos CC, campos magnéticos, Biot-Savart e Ampère, indução, circuitos RL/RLC e Equações de Maxwell.",
    icone: '<svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true"><path d="M18 3 8 18h6l-2 11 12-16h-7l3-10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    // Mapa tema (data-tema) -> id da seção em conteudo/eletromag.html (botão "Ver material").
    teoria: {
      "lei-de-coulomb": "em-carga",
      "campo-eletrico": "em-campo",
      "campo-eletrico-vetorial": "em-campo",
      "campo-eletrico-cargas-pontuais": "em-campo",
      "fluxo-lei-de-gauss": "em-gauss",
      "lei-de-gauss-esfera": "em-gauss",
      "lei-de-gauss-esfera-uniforme": "em-gauss",
      "lei-de-gauss-esfera-nao-uniforme": "em-gauss",
      "lei-de-gauss-plano": "em-gauss",
      "lei-de-gauss-cilindro": "em-gauss",
      "lei-de-gauss-condutor": "em-gauss",
      "potencial-eletrico": "em-potencial",
      "potencial-eletrico-trabalho": "em-potencial",
      "forca-entre-placas-capacitor": "em-capacitancia",
      "resistencia-tronco-cone": "em-corrente",
      "resistencia-cabo-coaxial": "em-corrente",
      "resistencia-cilindro-oco": "em-corrente",
      "circuitos-resistivos": "em-circuitos",
      "circuitos-kirchhoff": "em-circuitos",
      "kirchhoff-multi-malha": "em-circuitos",
      "circuitos-potencia-maxima": "em-circuitos",
      "circuito-dc-chave": "em-circuitos",
      "circuito-rc-carga": "em-circuitos",
      "forca-magnetica": "em-magnetico",
      "forca-magnetica-equilibrio": "em-magnetico",
      "efeito-hall": "em-magnetico",
      "torque-momento-dipolo": "em-magnetico",
      "torque-momento-dipolar": "em-magnetico",
      "biot-savart-fio-reto": "em-fontes",
      "lei-de-ampere": "em-fontes",
      "lei-de-ampere-fio-grosso": "em-fontes",
      "lei-de-ampere-cabo-coaxial": "em-fontes",
      "campo-eixo-espira": "em-fontes",
      "campo-magnetico-fios-resultante": "em-fontes",
      "campo-magnetico-tres-fios": "em-fontes",
      "campo-magnetico-quatro-fios": "em-fontes",
      "forca-entre-fios-paralelos": "em-fontes",
      "inducao-faraday": "em-inducao",
      "lei-de-faraday-espira": "em-inducao",
      "inducao-energia-dissipada": "em-inducao",
      "inducao-barra-em-V": "em-inducao",
      "inducao-campo-invertido": "em-inducao",
      "inducao-campo-exponencial": "em-inducao",
      "circuito-rl": "em-indutancia",
      "circuito-rlc": "em-oscilacoes",
      "circuito-rlc-ressonancia": "em-oscilacoes",
      "rlc-ressonancia-grafico": "em-oscilacoes",
      "rlc-indutores-paralelo": "em-oscilacoes",
      "rlc-capacitores-misto": "em-oscilacoes",
      "rlc-sem-capacitor-fasores": "em-oscilacoes",
      "rlc-componentes-associados": "em-oscilacoes"
    }
  }
  

  /* ------------------- MODELO PARA NOVA CADEIRA -------------------
  ,{
    id: "fisica4",
    nome: "Nome da Cadeira",
    codigo: "CÓDIGO · carga horária",
    descricao: "Resumo de uma ou duas linhas do que a cadeira cobre.",
    icone: '<svg viewBox="0 0 32 32" width="34" height="34">...</svg>'
  }
  ------------------------------------------------------------------ */
];
