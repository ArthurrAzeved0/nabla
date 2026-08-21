/* **************************************************************************
   * Nabla — Guia do aluno POLI/UPE                       content.config.ts *
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
   content.config.ts — os schemas do conteúdo.

   Aqui está o ganho central da migração: o que antes era convenção
   combinada em comentário (e quebrava calada) agora é CONTRATO verificado
   no build. Questão sem gabarito, tema que não existe no mapa da teoria ou
   prova fora de {1ee,2ee,final} viram ERRO DE BUILD, não bug silencioso.
   ========================================================================== */
/* `z` vem de "astro/zod", não de "astro:content": a reexportação dali está
   depreciada e sai no Astro 7. */
import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob, file } from "astro/loaders";

const PROVAS = ["1ee", "2ee", "final"] as const;

/* ---------------------------------------------------------------- cadeiras
   Substitui o window.CURSOS de js/cursos.js. */
const cadeiras = defineCollection({
  loader: file("src/content/cadeiras/cadeiras.json"),
  schema: z.object({
    /* usado na URL e no nome das pastas: sem espaço, sem acento */
    id: z.string().regex(/^[a-z0-9]+$/, "só minúsculas e dígitos"),
    nome: z.string(),
    codigo: z.string(),
    descricao: z.string(),
    /* ordem de exibição na home */
    ordem: z.number().int(),
    /* Mapa tema -> id da seção da teoria. Alimenta os botões "Ver material"
       (na questão) e "Praticar este assunto" (na teoria). Antes vivia solto
       em js/cursos.js; agora é validado. */
    teoria: z.record(z.string(), z.string()),
  }),
});

/* ------------------------------------------------------------------ teoria
   Um arquivo MDX por cadeira. As seções são <section class="topico"> com id
   — o mesmo id que o mapa `teoria` da cadeira aponta. */
const teoria = defineCollection({
  loader: glob({ base: "src/content/teoria", pattern: "**/*.mdx" }),
  schema: z.object({
    cadeira: reference("cadeiras"),
    titulo: z.string(),
    /* Unidades da ementa, para montar o sumário sem duplicar a informação. */
    unidades: z
      .array(
        z.object({
          nome: z.string(),
          secoes: z.array(z.object({ id: z.string(), titulo: z.string() })),
        }),
      )
      .optional(),
  }),
});

/* ---------------------------------------------------------------- questões
   Um arquivo por questão, em questoes/<cadeira>/<prova>/qNN.mdx.
   cadeira, prova e número são DERIVADOS do caminho — não se digita de novo,
   então não há como divergir do lugar onde o arquivo está. */
const questoes = defineCollection({
  loader: glob({ base: "src/content/questoes", pattern: "**/*.mdx" }),
  schema: z
    .object({
    /* Procedência da questão, PADRONIZADA. O rótulo da prova (1º EE / 2º EE /
       Final) NÃO vem daqui: é derivado da pasta, para não haver como digitar
       "1ª Avaliação" num arquivo e "1º EE" noutro. Aqui fica só a origem:

         "2023.2"                 prova real
         "2024.1 · 2ª chamada"    segunda chamada
         "Banco" / "Banco · 2026.1"   lista ou banco de questões
         "Revisão · Prof. César"  lista de revisão
         "Baseada em 2024.1"      derivada de uma prova real
         "Final 2022.2"           veio de outra prova (6 casos: a pasta diz
                                  que unidade treina, isto diz de onde veio)

       Ausente só nas questões inventadas, que se declaram por estiloDeProva. */
    origem: z.string().optional(),
    /* Rótulo legível do assunto: "Limites", "Campo magnético · Fios num quadrado". */
    tema: z.string(),
    /* CHAVE do mapa `teoria` da cadeira. É o que liga a questão à seção
       certa do conteúdo; validado contra o mapa em tempo de build. */
    temaId: z.string(),
    pontos: z.string().optional(),
    /* Questão inventada/prevista, sem prova antiga confirmada. */
    estiloDeProva: z.boolean().default(false),
    })
    /* Toda questão tem de dizer de onde veio: ou traz procedência, ou se
       declara inventada. Sem isso, o leitor não sabe o que está estudando. */
    .refine((q) => q.origem !== undefined || q.estiloDeProva, {
      message:
        "questão sem procedência: informe `origem` ou marque `estiloDeProva: true`",
      path: ["origem"],
    }),
});

export const collections = { cadeiras, teoria, questoes };
export { PROVAS };
export type Prova = (typeof PROVAS)[number];
