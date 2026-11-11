import { seedSiteWithSections } from "../support/db";
import { expect, test } from "../support/fixtures";

const FALLBACK_URL = "/dev/hero-showcase-fallback.svg";
const FALLBACK_ALT = "Ilustração do produto";

test.describe("Site-builder — edição da experiência 3D (#48)", () => {
  test("mantém o que foi digitado após erro, aplica padrão em campo vazio e persiste", async ({
    page,
  }) => {
    const { companyId } = await seedSiteWithSections(page);

    await page.goto(`/leads/${companyId}/site-builder`);
    await page.getByRole("button", { name: "Configurar 3D" }).first().click();

    // 1) Inválido: partículas acima do máximo (120) → erro, valores mantidos.
    await page.getByLabel("Forma").selectOption("octahedron");
    await page.getByLabel(/Quantidade de partículas/).fill("999");
    await page.getByLabel("Imagem de fallback (2D)").fill(FALLBACK_URL);
    await page
      .getByLabel("Texto alternativo da imagem de fallback")
      .fill(FALLBACK_ALT);
    await page.getByRole("button", { name: "Salvar", exact: true }).click();

    await expect(
      page.getByText("Não foi possível salvar a experiência 3D"),
    ).toBeVisible();
    await expect(page.getByLabel("Forma")).toHaveValue("octahedron");
    await expect(page.getByLabel(/Quantidade de partículas/)).toHaveValue(
      "999",
    );
    await expect(page.getByLabel("Imagem de fallback (2D)")).toHaveValue(
      FALLBACK_URL,
    );
    await expect(
      page.getByLabel("Texto alternativo da imagem de fallback"),
    ).toHaveValue(FALLBACK_ALT);

    // 2) Válido, com intensidade vazia → usa o padrão do preset (0.5), não 0.
    await page.getByLabel(/Quantidade de partículas/).fill("60");
    await page.getByLabel(/Intensidade do movimento/).fill("");
    await page.getByRole("button", { name: "Salvar", exact: true }).click();

    await expect(
      page.getByRole("button", { name: "Editar 3D" }).first(),
    ).toBeVisible();

    // 3) Persistência após recarregar.
    await page.reload();
    await page.getByRole("button", { name: "Editar 3D" }).first().click();

    await expect(page.getByLabel("Forma")).toHaveValue("octahedron");
    await expect(page.getByLabel(/Intensidade do movimento/)).toHaveValue(
      "0.5",
    );
    await expect(page.getByLabel(/Quantidade de partículas/)).toHaveValue("60");
    await expect(page.getByLabel("Imagem de fallback (2D)")).toHaveValue(
      FALLBACK_URL,
    );
    await expect(
      page.getByLabel("Texto alternativo da imagem de fallback"),
    ).toHaveValue(FALLBACK_ALT);

    // A outra seção continua sem experiência 3D.
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(
      page.getByRole("button", { name: "Configurar 3D" }),
    ).toHaveCount(1);
  });
});
