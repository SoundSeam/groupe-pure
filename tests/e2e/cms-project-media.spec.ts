import { expect, test } from "@playwright/test";

const baseUrl = process.env.CMS_E2E_BASE_URL;
const email = process.env.CMS_E2E_EMAIL;
const password = process.env.CMS_E2E_PASSWORD;

test.describe("project media editor", () => {
  test.skip(
    !baseUrl || !email || !password,
    "Set CMS_E2E_BASE_URL, CMS_E2E_EMAIL, and CMS_E2E_PASSWORD for the isolated CMS test environment.",
  );

  test("uploads, saves, reloads, and previews a project image", async ({ page }) => {
    await page.goto("/admin/fr/projects");
    const emailInput = page.getByLabel("Email");
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill(email!);
      await page.getByLabel("Password").fill(password!);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL("**/admin/fr/projects");
    }

    await page.getByRole("button", { name: "Modifier" }).first().click();
    await page.getByRole("button", { name: "Remplacer le média" }).click();

    const chooserPromise = page.waitForEvent("filechooser");
    const registrationPromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/cms/assets") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Importer" }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: `cms-e2e-${Date.now()}.png`,
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    const registration = await registrationPromise;
    expect(registration.ok()).toBeTruthy();
    const registeredPayload = (await registration.json()) as {
      asset: { publicUrl: string };
    };
    const uploadedUrl = registeredPayload.asset.publicUrl;

    await expect(page.getByText("Média enregistré")).toBeVisible();
    await page.reload();
    const firstProject = page.locator("aside article").first();
    await expect(
      firstProject.getByRole("button", { name: "Modifier" }),
    ).toBeVisible();
    await expect(firstProject.locator("img")).toHaveAttribute("src", uploadedUrl);

    if (process.env.CMS_E2E_ALLOW_PUBLISH === "true") {
      await page.getByRole("button", { name: "Publier" }).click();
      await page.goto("/fr/projects");
      await expect(page.locator(`img[src="${uploadedUrl}"]`).first()).toBeVisible();
    }
  });
});
