/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                             grade-ui.ts *
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
/* ==========================================================================
   grade-ui.ts — a interface do mapa da grade.

   Liga o que fluxograma.ts calcula: clique para concluir, destaque da
   cadeia no hover, zoom, modo lista para telas estreitas, estatísticas e
   exportação em PDF.

   O PDF é IMPORTADO SOB DEMANDA. No fluxograma solto, html-to-image e jsPDF
   vinham colados no arquivo: 400 dos 416 KB. Aqui, quem só olha o mapa não
   baixa gerador de PDF nenhum.
   ========================================================================== */
import { criarMapa, desenharSetas, type Grade } from "./fluxograma";

const CORREDOR = 40; /* precisa casar com --corredor no CSS */

export function ligarGrade() {
  const encontrada = document.querySelector<HTMLElement>("[data-grade]");
  if (!encontrada) return;
  /* Alias com tipo explícito: o narrowing da guarda acima não atravessa
     declarações `function`, que são hoistadas e poderiam, em teoria, rodar
     antes dela. Assim não é preciso asserção em cada uso. */
  const raiz: HTMLElement = encontrada;

  const grade = JSON.parse(raiz.dataset.gradeJson!) as Grade;
  const mapa = criarMapa(grade);

  const quadro = raiz.querySelector<HTMLElement>("[data-quadro]")!;
  const rolagem = raiz.querySelector<HTMLElement>("[data-rolagem]")!;
  const svg = raiz.querySelector<SVGSVGElement>("[data-fios]")!;
  /* Só os cartões DO QUADRO entram no mapa de geometria. O mesmo
     data-disciplina existe também na lista, e como a lista vem depois no
     DOM ela sobrescrevia as entradas — estando `display:none`, devolvia
     offset zero e todas as setas degeneravam num ponto. */
  const cartoes = new Map<string, HTMLElement>();
  for (const el of quadro.querySelectorAll<HTMLElement>("[data-disciplina]")) {
    cartoes.set(el.dataset.disciplina!, el);
  }
  const cartao = (id: string) => cartoes.get(id);

  /* ------------------------------------------------------------- estados */
  function pintar() {
    let liberadas = 0;
    const chFeita = mapa.chFeita();

    for (const d of grade.disciplinas) {
      const feita = mapa.concluida(d.id);
      const livre = mapa.liberada(d);
      if (livre) liberadas++;
      /* o mesmo id aparece no quadro e na lista: pinta os dois */
      for (const el of raiz.querySelectorAll<HTMLElement>(`[data-disciplina="${d.id}"]`)) {
        el.classList.toggle("feita", feita);
        el.classList.toggle("livre", livre);
        el.classList.toggle("travada", !feita && !livre);
        el.setAttribute("aria-pressed", String(feita));

        const est = el.querySelector<HTMLElement>("[data-estagio]");
        if (est) {
          const falta = Math.max(0, mapa.chEstagio - chFeita);
          est.textContent =
            falta > 0
              ? `Regra ${Math.round(grade.estagioFracao * 100)}%: ${chFeita}h de ${mapa.chEstagio}h — faltam ${falta}h`
              : `Regra ${Math.round(grade.estagioFracao * 100)}% cumprida (${chFeita}h)`;
        }
      }
    }

    const pct = mapa.chMatriz ? Math.round((100 * chFeita) / mapa.chMatriz) : 0;
    const set = (sel: string, txt: string) => {
      const el = raiz.querySelector<HTMLElement>(sel);
      if (el) el.textContent = txt;
    };
    set("[data-feitas]", String(mapa.feitas));
    set("[data-total]", String(mapa.total));
    set("[data-ch]", `${chFeita}h`);
    set("[data-pct]", `${pct}% da matriz`);
    set("[data-liberadas]", String(liberadas));
    const barra = raiz.querySelector<HTMLElement>("[data-barra]");
    if (barra) barra.style.width = `${pct}%`;

    const flag = raiz.querySelector<HTMLElement>("[data-flag-estagio]");
    if (flag) {
      const falta = mapa.chEstagio - chFeita;
      flag.textContent =
        falta > 0
          ? `Estágio: faltam ${falta}h para os ${Math.round(grade.estagioFracao * 100)}%`
          : `Estágio: ${Math.round(grade.estagioFracao * 100)}% da CH cumprida`;
      flag.classList.toggle("ok", falta <= 0);
    }
  }

  /* --------------------------------------------------- clique e cadeia */
  raiz.addEventListener("click", (ev) => {
    const alvo = ev.target as HTMLElement | null;
    /* o link para a cadeira do site tem de navegar, não marcar */
    if (alvo?.closest("a")) return;
    const el = alvo?.closest<HTMLElement>("[data-disciplina]");
    if (!el) return;
    mapa.alternar(el.dataset.disciplina!);
    pintar();
  });

  function traco(id: string | null) {
    raiz.classList.toggle("tracando", id !== null);
    const set = id ? mapa.cadeia(id) : null;
    for (const el of raiz.querySelectorAll<HTMLElement>("[data-disciplina]")) {
      const meu = el.dataset.disciplina!;
      el.classList.toggle("traco", !!set?.has(meu));
      el.classList.toggle("traco-eu", id === meu);
    }
    for (const fio of svg.querySelectorAll<SVGPathElement>(".fio")) {
      const de = fio.dataset.de!;
      const para = fio.dataset.para!;
      fio.classList.toggle("fio-forte", !!set?.has(de) && !!set.has(para));
    }
  }
  /* o destaque da cadeia vale nos dois modos, então escuta em todos os
     cartões — não só nos do quadro */
  for (const el of raiz.querySelectorAll<HTMLElement>("[data-disciplina]")) {
    const id = el.dataset.disciplina!;
    el.addEventListener("mouseenter", () => traco(id));
    el.addEventListener("mouseleave", () => traco(null));
    el.addEventListener("focus", () => traco(id));
    el.addEventListener("blur", () => traco(null));
  }

  /* ------------------------------------------------------------- desenho */
  let escala: number | null = null; /* null = ajustar à largura */

  /* `zoom` OU `transform`, e a diferença importa: zoom afeta o LAYOUT, então
     o contêiner encolhe junto e não sobra barra de rolagem quando o mapa
     cabe. `transform` só afeta a pintura — o elemento continua ocupando os
     ~2100px originais e o contêiner mostra barra mesmo com tudo visível. Era
     essa a barra que aparecia com o mapa já ajustado.

     Medimos o suporte em vez de supor, e transform fica como reserva. */
  const temZoom = typeof CSS !== "undefined" && CSS.supports?.("zoom", "0.5");

  /* Largura natural do mapa. Com zoom aplicado, scrollWidth devolve a
     largura JÁ escalada — medir assim realimentaria o cálculo a cada
     chamada. Então mede-se uma vez com o zoom limpo e guarda-se: a largura
     não depende da janela (as colunas têm largura fixa). */
  let larguraNatural = 0;
  function medirNatural() {
    if (larguraNatural) return larguraNatural;
    const antes = quadro.style.zoom;
    quadro.style.zoom = "";
    larguraNatural = quadro.scrollWidth;
    quadro.style.zoom = antes;
    return larguraNatural;
  }

  function ajuste() {
    const estilo = getComputedStyle(rolagem);
    const padding = parseFloat(estilo.paddingLeft) + parseFloat(estilo.paddingRight);
    const disponivel = rolagem.clientWidth - padding;
    /* sem o teto de 1 o mapa esticaria além do tamanho natural em tela
       larga, e os cartões ficariam borrados — melhor sobrar margem */
    return Math.min(1, disponivel / Math.max(1, medirNatural()));
  }

  function aplicarEscala() {
    const z = escala ?? ajuste();
    if (temZoom) {
      quadro.style.zoom = String(z);
      quadro.style.transform = "";
      quadro.style.transformOrigin = "";
      /* com zoom o layout acompanha: nada de altura calculada à mão */
      rolagem.style.height = "";
    } else {
      quadro.style.zoom = "";
      quadro.style.transform = `scale(${z})`;
      quadro.style.transformOrigin = "0 0";
      const estilo = getComputedStyle(rolagem);
      const padY = parseFloat(estilo.paddingTop) + parseFloat(estilo.paddingBottom);
      rolagem.style.height = `${quadro.scrollHeight * z + padY}px`;
    }
    const lbl = raiz.querySelector<HTMLElement>("[data-zoom]");
    if (lbl) lbl.textContent = `${Math.round(z * 100)}%`;
  }

  /* A ORDEM importa: escala primeiro, setas depois. Com zoom, offsetLeft e
     offsetTop passam a vir na escala aplicada; desenhar antes deixaria as
     setas medidas numa escala e pintadas em outra. */
  function redesenhar() {
    aplicarEscala();
    desenharSetas(grade, svg, cartao, CORREDOR);
  }

  raiz.querySelector("[data-zoom-mais]")?.addEventListener("click", () => {
    escala = Math.min(1.6, (escala ?? ajuste()) + 0.1);
    redesenhar();
  });
  raiz.querySelector("[data-zoom-menos]")?.addEventListener("click", () => {
    escala = Math.max(0.3, (escala ?? ajuste()) - 0.1);
    redesenhar();
  });
  raiz.querySelector("[data-zoom-ajustar]")?.addEventListener("click", () => {
    escala = null;
    redesenhar();
  });

  /* ---------------------------------------------------- quadro <-> lista */
  const btnModo = raiz.querySelector<HTMLButtonElement>("[data-modo]");
  function definirModo(m: "quadro" | "lista") {
    raiz.dataset.modoAtual = m;
    if (btnModo) {
      btnModo.textContent = m === "quadro" ? "Modo lista" : "Modo fluxograma";
      btnModo.setAttribute("aria-pressed", String(m === "lista"));
    }
    if (m === "quadro") requestAnimationFrame(redesenhar);
  }
  btnModo?.addEventListener("click", () =>
    definirModo(raiz.dataset.modoAtual === "quadro" ? "lista" : "quadro"),
  );

  /* na lista, o chip de requisito rola até a disciplina */
  raiz.addEventListener("click", (ev) => {
    const chip = (ev.target as HTMLElement | null)?.closest<HTMLElement>("[data-ir]");
    if (!chip) return;
    ev.stopPropagation();
    const alvo = raiz.querySelector<HTMLElement>(
      `.lista [data-disciplina="${chip.dataset.ir}"]`,
    );
    if (!alvo) return;
    alvo.scrollIntoView({ behavior: "smooth", block: "center" });
    alvo.classList.add("apontada");
    window.setTimeout(() => alvo.classList.remove("apontada"), 1400);
  });

  raiz.querySelector("[data-limpar-grade]")?.addEventListener("click", () => {
    if (!window.confirm("Apagar todas as disciplinas marcadas como concluídas?")) return;
    mapa.limpar();
    pintar();
  });

  /* --------------------------------------------------------------- PDF ---
     Import dinâmico: as duas libs juntas passam de 300 KB, e só quem clica
     precisa delas. No fluxograma solto vinham embutidas no arquivo. */
  async function baixarPdf(btn: HTMLButtonElement, semProgresso: boolean) {
    const rot = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Gerando PDF…";
    const zoomAntes = quadro.style.zoom;
    const escalaAntes = quadro.style.transform;
    const modoAntes = raiz.dataset.modoAtual;
    try {
      const [{ toJpeg }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      if (modoAntes !== "quadro") definirModo("quadro");
      if (semProgresso) raiz.classList.add("sem-estado");
      quadro.style.zoom = "";
      quadro.style.transform = "none";
      desenharSetas(grade, svg, cartao, CORREDOR);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      /* O PDF sai no tema em que a pessoa está — o que ela vê é o que ela
         leva. A página do jsPDF nasce branca, então é pintada com a MESMA
         cor da captura (senão sobra moldura branca em volta) e o tom do
         texto do cabeçalho vem da luminância dela. */
      const fundoCss = getComputedStyle(document.body).backgroundColor;
      const [fr, fg, fb] = (fundoCss.match(/\d+(?:\.\d+)?/g) ?? ["255", "255", "255"])
        .slice(0, 3)
        .map(Number) as [number, number, number];
      const claro = (0.2126 * fr + 0.7152 * fg + 0.0722 * fb) / 255 > 0.55;

      const largura = quadro.scrollWidth;
      const altura = quadro.scrollHeight;
      /* limite de canvas dos navegadores móveis fica perto de 4096px */
      const pr = Math.min(2, 4000 / largura, 4000 / altura);
      const png = await toJpeg(quadro, {
        backgroundColor: fundoCss,
        pixelRatio: pr,
        quality: 0.92,
      });
      const img = new Image();
      img.src = png;
      await img.decode();

      const PX_MM = 25.4 / 96;
      const lMm = (img.width / pr) * PX_MM;
      const aMm = (img.height / pr) * PX_MM;
      const M = 8;
      const CAB = 13;
      const pw = lMm + 2 * M;
      const ph = aMm + CAB + 2 * M;
      const pdf = new jsPDF({
        orientation: pw > ph ? "landscape" : "portrait",
        unit: "mm",
        format: [pw, ph],
      });
      /* fundo da página igual ao da captura: nada de moldura branca */
      pdf.setFillColor(fr, fg, fb);
      pdf.rect(0, 0, pw, ph, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      /* tom do texto conforme a luminância do fundo: tinta no papel,
         papel na planta */
      const tit = claro ? [26, 32, 42] : [232, 238, 244];
      pdf.setTextColor(tit[0]!, tit[1]!, tit[2]!);
      pdf.text(`${grade.curso} — mapa da grade · POLI/UPE · matriz ${grade.matriz}`, M, M + 4);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      const sub = claro ? [90, 100, 111] : [157, 176, 189];
      pdf.setTextColor(sub[0]!, sub[1]!, sub[2]!);
      pdf.text(
        semProgresso
          ? "Mapa completo · seta contínua = pré-requisito · tracejada = co-requisito"
          : `Progresso: ${mapa.feitas}/${mapa.total} disciplinas · ${mapa.chFeita()}h concluídas`,
        M,
        M + 9,
      );
      pdf.addImage(png, "JPEG", M, M + CAB, lMm, aMm);
      pdf.save(semProgresso ? `grade-${grade.sigla}.pdf` : `grade-${grade.sigla}-progresso.pdf`);
    } catch (e) {
      window.alert(`Não consegui gerar o PDF.\n\n${(e as Error).message}`);
    } finally {
      raiz.classList.remove("sem-estado");
      quadro.style.zoom = zoomAntes;
      quadro.style.transform = escalaAntes;
      if (modoAntes && modoAntes !== "quadro") definirModo(modoAntes as "lista");
      else redesenhar();
      btn.disabled = false;
      btn.textContent = rot;
    }
  }
  raiz.querySelector<HTMLButtonElement>("[data-pdf-progresso]")?.addEventListener("click", (ev) =>
    baixarPdf(ev.currentTarget as HTMLButtonElement, false),
  );
  raiz.querySelector<HTMLButtonElement>("[data-pdf-limpo]")?.addEventListener("click", (ev) =>
    baixarPdf(ev.currentTarget as HTMLButtonElement, true),
  );

  /* -------------------------------------------------------------- ligar */
  pintar();
  definirModo(window.matchMedia("(max-width: 840px)").matches ? "lista" : "quadro");
  requestAnimationFrame(redesenhar);

  let t: number | undefined;
  window.addEventListener("resize", () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => {
      /* invalida a medida guardada: a largura natural não depende da janela,
         mas fonte que carrega tarde pode mudá-la, e o resize é a deixa mais
         barata para conferir de novo */
      larguraNatural = 0;
      if (raiz.dataset.modoAtual === "quadro") redesenhar();
    }, 120);
  });
}
