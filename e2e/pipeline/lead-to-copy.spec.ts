import type { Page } from "@playwright/test";

import { expect, test } from "../support/fixtures";

/**
 * The whole operator pipeline through the UI, in order: each step is gated by
 * the previous one (eligibility), so the gate itself is asserted before the
 * step is filled. Every save is checked again after a reload (persistence).
 * All steps are manual forms — there is no AI generation in the product.
 */

async function createCompany(page: Page, name: string): Promise<string> {
  await page.goto("/leads/new");
  await page.getByLabel("Nome da empresa").fill(name);
  await page.getByLabel("Segmento/nicho").fill("Clínica odontológica");
  await page.getByRole("button", { name: "Salvar empresa" }).click();
  await expect(page).toHaveURL(/\/leads\/[^/?]+\?created=1$/);
  const id = new URL(page.url()).pathname.split("/")[2];
  if (!id) throw new Error(`no company id in ${page.url()}`);
  return id;
}

/** Submits and waits for the server action's POST to finish. */
async function save(page: Page, button: string) {
  const done = page.waitForResponse(
    (response) => response.request().method() === "POST",
  );
  await page.getByRole("button", { name: button }).click();
  await done;
  await expect(page.getByRole("button", { name: button })).toBeEnabled();
}

test.describe("Pipeline — pesquisa até copy", () => {
  test.describe.configure({ timeout: 90_000 });

  test("percorre pesquisa, diagnóstico, estratégia, planejamento, design, tema e copy", async ({
    page,
  }) => {
    const companyName = `E2E Pipeline ${Date.now()}`;
    const id = await createCompany(page, companyName);

    await test.step("pesquisa: valida e confirma uma informação", async () => {
      await page.goto(`/leads/${id}/research`);
      await expect(
        page.getByRole("heading", { name: companyName }),
      ).toBeVisible();

      // "Confirmado" sem valor é inválido.
      await page.getByLabel("Informação *").selectOption("tradeName");
      await page.getByLabel("Status *").selectOption("confirmed");
      await save(page, "Salvar informação");
      await expect(
        page.getByText("Não foi possível salvar a informação"),
      ).toBeVisible();
      await expect(
        page.getByText("Informe o valor encontrado, ou marque como ausente."),
      ).toBeVisible();

      await page.getByLabel("Informação *").selectOption("tradeName");
      await page.getByLabel("Status *").selectOption("confirmed");
      await page.getByLabel("Valor encontrado").fill("Sorriso E2E");
      await page.getByLabel("Fonte").fill("Google Maps");
      await save(page, "Salvar informação");

      await page.reload();
      await expect(page.getByText("Sorriso E2E")).toBeVisible();
      await expect(page.getByText("Fonte: Google Maps")).toBeVisible();
    });

    await test.step("diagnóstico: salva e persiste", async () => {
      await page.goto(`/leads/${id}/diagnosis`);
      await expect(
        page.getByText("Nenhum diagnóstico gerado ainda"),
      ).toBeVisible();

      await page
        .getByLabel("Resumo do negócio")
        .fill("Clínica de bairro com agenda ociosa.");
      await page
        .getByLabel("Pontos fortes (um por linha)")
        .fill("Atendimento humano\nLocalização");
      await page.getByLabel("Maturidade digital").selectOption("basic");
      await save(page, "Salvar diagnóstico");

      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Diagnóstico atual" }),
      ).toBeVisible();
      await expect(
        page.getByText("Clínica de bairro com agenda ociosa.").first(),
      ).toBeVisible();
      await expect(page.getByText("Básica").first()).toBeVisible();
      await expect(page.getByText("Atendimento humano").first()).toBeVisible();
    });

    await test.step("estratégia: salva e persiste", async () => {
      await page.goto(`/leads/${id}/strategy`);
      await expect(
        page.getByText("Nenhuma estratégia gerada ainda"),
      ).toBeVisible();

      await page
        .getByLabel("Objetivo de marketing")
        .fill("Lotar a agenda de avaliações");
      await page
        .getByLabel("Objetivo de conversão")
        .fill("Agendamento pelo WhatsApp");
      await save(page, "Salvar estratégia");

      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Estratégia atual" }),
      ).toBeVisible();
      await expect(
        page.getByText("Lotar a agenda de avaliações").first(),
      ).toBeVisible();
    });

    await test.step("planejamento do site: salva e persiste", async () => {
      await page.goto(`/leads/${id}/site-planning`);
      await expect(
        page.getByText("Nenhum planejamento gerado ainda"),
      ).toBeVisible();

      await page
        .getByLabel("Objetivo principal do site")
        .fill("Gerar avaliações agendadas");
      await page.getByLabel("CTA principal").fill("Agende sua avaliação");
      await save(page, "Salvar planejamento");

      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Planejamento atual" }),
      ).toBeVisible();
      await expect(
        page.getByText("Agende sua avaliação").first(),
      ).toBeVisible();
    });

    await test.step("design: tema bloqueado sem páginas", async () => {
      await page.goto(`/leads/${id}/design/theme`);
      await expect(
        page.getByText("Dados insuficientes para configurar o tema visual"),
      ).toBeVisible();
    });

    await test.step("design: valida, cria página e seção", async () => {
      await page.goto(`/leads/${id}/design`);
      await expect(
        page.getByText("Nenhuma página cadastrada ainda"),
      ).toBeVisible();

      await page.getByLabel("Identificador da página *").fill("Página Inicial");
      await page.getByLabel("Nome da página *").fill("Home");
      await save(page, "Salvar página");
      await expect(
        page.getByText(
          "Use apenas letras minúsculas, números e hífens (ex.: pagina-inicial).",
        ),
      ).toBeVisible();

      await page.getByLabel("Identificador da página *").fill("inicio");
      await page.getByLabel("Nome da página *").fill("Home");
      await page
        .getByLabel("Etapa da jornada do cliente")
        .selectOption("decision");
      await save(page, "Salvar página");
      await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

      await page.getByLabel("Identificador da seção *").fill("hero");
      await page.getByLabel("Nome da seção *").fill("Hero principal");
      await page
        .getByLabel("CTA priorizado nesta seção")
        .fill("Agende sua avaliação");
      await save(page, "Salvar seção");

      await page.reload();
      await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
      await expect(page.getByText("Página 1 · /inicio")).toBeVisible();
      await expect(
        page.getByText("Decisão", { exact: true }).first(),
      ).toBeVisible();
      await expect(page.getByText("Hero principal")).toBeVisible();
      await expect(page.getByText("(CTA: Agende sua avaliação)")).toBeVisible();
    });

    await test.step("tema: salva e persiste", async () => {
      await page.goto(`/leads/${id}/design/theme`);
      await expect(page.getByText("Nenhum tema definido ainda")).toBeVisible();

      await page.getByLabel("Tom/estilo visual").fill("Clean e acolhedor");
      await page.getByLabel("Preferência de modo de cor").selectOption("light");
      await page
        .getByLabel("Densidade de espaçamento")
        .selectOption("spacious");
      await save(page, "Salvar tema");

      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Tema atual" }),
      ).toBeVisible();
      await expect(page.getByText("Clean e acolhedor").first()).toBeVisible();
      await expect(page.getByText("Modo de cor: Claro")).toBeVisible();
      await expect(
        page.getByText("Densidade de espaçamento: Generoso"),
      ).toBeVisible();
    });

    await test.step("copy: salva conteúdo da seção e persiste", async () => {
      await page.goto(`/leads/${id}/copy`);
      await expect(
        page.getByText("Nenhum conteúdo cadastrado ainda."),
      ).toBeVisible();

      await page
        .getByLabel("Seção *")
        .selectOption({ label: "Home — Hero principal" });
      await page
        .getByLabel("Título/headline")
        .fill("Seu sorriso sem fila de espera");
      await page
        .getByLabel("Texto do CTA exibido nessa seção")
        .fill("Quero agendar");
      await save(page, "Salvar conteúdo");

      await page.reload();
      await expect(
        page.getByText("Seu sorriso sem fila de espera").first(),
      ).toBeVisible();
      await expect(page.getByText("CTA: Quero agendar")).toBeVisible();
    });

    await test.step("site-builder: preview usa a copy salva", async () => {
      await page.goto(`/leads/${id}/site-builder`);
      await expect(
        page.getByRole("heading", { name: "Seu sorriso sem fila de espera" }),
      ).toBeVisible();
    });
  });

  test("bloqueia cada etapa enquanto a anterior não existe", async ({
    page,
  }) => {
    const id = await createCompany(page, `E2E Gates ${Date.now()}`);

    const gates: Array<[string, string]> = [
      [
        "diagnosis",
        "Confirme ao menos uma informação de enriquecimento antes de gerar o diagnóstico.",
      ],
      [
        "strategy",
        "Gere o diagnóstico estratégico da empresa antes de criar a estratégia de marketing e conversão.",
      ],
      [
        "site-planning",
        "Crie a estratégia de marketing e conversão da empresa antes de gerar o planejamento estratégico do site.",
      ],
      [
        "design",
        "Crie o planejamento estratégico do site da empresa antes de definir a arquitetura de páginas.",
      ],
      [
        "design/theme",
        "Defina a arquitetura de páginas da empresa antes de configurar o tema visual do site.",
      ],
    ];

    for (const [route, reason] of gates) {
      await page.goto(`/leads/${id}/${route}`);
      await expect(page.getByText(reason), route).toBeVisible();
    }

    await page.goto(`/leads/${id}/copy`);
    await expect(
      page.getByText("Nenhuma seção cadastrada ainda"),
    ).toBeVisible();
  });
});
