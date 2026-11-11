import { expect, test } from "../support/fixtures";

test.describe("CRM — cadastro de empresa", () => {
  test("valida campos obrigatórios e persiste a empresa criada", async ({
    page,
  }) => {
    const companyName = `E2E CRM ${Date.now()}`;

    await page.goto("/leads/new");
    await page.getByRole("button", { name: "Salvar empresa" }).click();

    await expect(
      page.getByText("Não foi possível salvar a empresa"),
    ).toBeVisible();
    await expect(page.getByText("Informe o nome da empresa.")).toBeVisible();
    await expect(
      page.getByText("Informe o segmento/nicho da empresa."),
    ).toBeVisible();

    await page.getByLabel("Nome da empresa").fill(companyName);
    await page.getByLabel("Segmento/nicho").fill("Marketing digital");
    await page.getByLabel("Cidade").fill("São Paulo");
    await page.getByRole("button", { name: "Salvar empresa" }).click();

    await expect(page).toHaveURL(/\/leads\/[^/?]+\?created=1$/);
    await expect(
      page.getByRole("heading", { name: companyName }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: companyName }),
    ).toBeVisible();

    await page.goto("/leads");
    await expect(page.getByRole("link", { name: companyName })).toBeVisible();
  });

  test("mostra 'Empresa não encontrada' para id inexistente", async ({
    page,
  }) => {
    // The route has a `loading.tsx`, so Next streams the response: the HTTP
    // status is already 200 when `notFound()` runs. Only the UI is asserted.
    await page.goto("/leads/id-que-nao-existe");

    await expect(page.getByText("Empresa não encontrada")).toBeVisible();
  });
});
