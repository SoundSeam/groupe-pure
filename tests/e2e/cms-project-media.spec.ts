import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.CMS_E2E_BASE_URL;
const email = process.env.CMS_E2E_EMAIL;
const password = process.env.CMS_E2E_PASSWORD;
const projectVideo = Buffer.from(
  "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",
  "base64",
);

async function signInIfNeeded(page: Page) {
  await page.goto("/admin/fr/projects");
  const emailInput = page.getByLabel("Email");
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/admin/fr/projects");
  }
}

async function uploadProjectMedia(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
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
  await chooser.setFiles(file);
  const registration = await registrationPromise;
  expect(registration.ok()).toBeTruthy();
  const registeredPayload = (await registration.json()) as {
    asset: { publicUrl: string };
  };

  await expect(page.getByText("Média enregistré")).toBeVisible();
  return registeredPayload.asset.publicUrl;
}

test.describe("project media editor", () => {
  test.skip(
    !baseUrl || !email || !password,
    "Set CMS_E2E_BASE_URL, CMS_E2E_EMAIL, and CMS_E2E_PASSWORD for the isolated CMS test environment.",
  );

  test("uploads, saves, reloads, and previews a project image", async ({ page }) => {
    await signInIfNeeded(page);
    const uploadedUrl = await uploadProjectMedia(page, {
      name: `cms-e2e-${Date.now()}.png`,
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    });
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

  test("uploads, saves, reloads, and previews a project video", async ({ page }) => {
    await signInIfNeeded(page);
    const uploadedUrl = await uploadProjectMedia(page, {
      name: `cms-e2e-${Date.now()}.mp4`,
      mimeType: "video/mp4",
      buffer: projectVideo,
    });

    await page.reload();
    const firstProject = page.locator("aside article").first();
    await expect(
      firstProject.getByRole("button", { name: "Modifier" }),
    ).toBeVisible();
    await expect(firstProject.locator("video")).toHaveAttribute(
      "src",
      uploadedUrl,
    );

    if (process.env.CMS_E2E_ALLOW_PUBLISH === "true") {
      await page.getByRole("button", { name: "Publier" }).click();
      await page.goto("/fr/projects");
      await expect(
        page.locator(`video[src="${uploadedUrl}"]`).first(),
      ).toBeVisible();
    }
  });
});
