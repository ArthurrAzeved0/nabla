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
    "1ee": ["q01.html", "q02.html", "q03.html", "q04.html"],
    "2ee": ["q01.html", "q02.html", "q03.html"],
    "final": ["q01.html", "q02.html", "q03.html", "q04.html", "q05.html"]
  },
  eletromag: {
    "1ee": ["q01.html", "q02.html", "q03.html", "q04.html"],
    "2ee": ["q01.html", "q02.html", "q03.html", "q04.html"],
    "final": ["q01.html", "q02.html", "q03.html", "q04.html"]
  }

  /* ------------------- MODELO PARA NOVA CADEIRA -------------------
  ,fisica4: {
    "1ee": ["q01.html"],
    "2ee": [],
    "final": []
  }
  ------------------------------------------------------------------ */
};
