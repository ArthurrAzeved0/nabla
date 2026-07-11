/* ==========================================================================
   manifest.js — REGISTRO DO BANCO DE QUESTÕES.

   Cada questão vive em seu próprio arquivo HTML (um "bloco"), em:
       questoes/<id da cadeira>/<prova>/<arquivo>.html
   onde <prova> é "1ee", "2ee" ou "final".

   PARA ADICIONAR UMA QUESTÃO NOVA:
     1. Copie questoes/_modelo-questao.html para a pasta certa
        (ex.: questoes/calculo3/1ee/q05.html);
     2. Edite o enunciado, o gabarito e o passo a passo;
     3. Acrescente o nome do arquivo na lista correspondente abaixo.
   A ordem das listas é a ordem de exibição na página.
   ========================================================================== */
window.QUESTOES_MANIFEST = {
  calculo3: {
    "1ee": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html", "q13.html", "q14.html", "q15.html", "q16.html"],
    "2ee": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html", "q13.html", "q14.html", "q15.html", "q16.html", "q17.html"],
    "final": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html"]
  },
  eletromag: {
    "1ee": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html"],
    "2ee": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html"],
    "final": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html", "q13.html", "q14.html", "q15.html", "q16.html", "q17.html", "q18.html", "q19.html", "q20.html", "q21.html", "q22.html", "q23.html", "q24.html", "q25.html", "q26.html", "q27.html", "q28.html", "q29.html", "q30.html", "q31.html", "q32.html", "q33.html", "q34.html", "q35.html", "q36.html", "q37.html", "q38.html"]
  },
  eqdiferenciais: {
    "1ee": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html", "q13.html", "q14.html", "q15.html", "q16.html"],
    "2ee": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html", "q09.html", "q10.html", "q11.html", "q12.html", "q13.html", "q14.html", "q15.html", "q16.html"],
    "final": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html", "q06.html", "q07.html", "q08.html"]
  }

  /* ------------------- MODELO PARA NOVA CADEIRA -------------------
  ,fisica4: {
    "1ee": ["q01.html"],
    "2ee": [],
    "final": []
  }
  ------------------------------------------------------------------ */
};
