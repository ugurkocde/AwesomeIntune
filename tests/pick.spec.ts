import { expect, test, type Page } from "@playwright/test";

const communityUrl = "https://www.linkedin.com/groups/14802021/";

async function preparePickPage(page: Page) {
  await page.route("**/api/subscriber-count", async (route) => {
    await route.fulfill({ json: { count: 0 } });
  });
  await page.route(
    "https://changelog.ugurlabs.com/api/changelog/awesomeintune?limit=20*",
    async (route) => {
      await route.fulfill({
        json: {
          product: {
            id: "awesomeintune",
            name: "AwesomeIntune",
            websiteUrl: "https://www.awesomeintune.com",
          },
          entries: [],
        },
      });
    },
  );
  await page.goto("/pick");
}

test("renders the complete English launch state and program terms", async ({
  page,
}) => {
  await preparePickPage(page);

  await expect(
    page.getByRole("heading", { name: "Awesome Pick", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Every month we recognize the most useful community contribution in the Awesome Intune group.",
    ),
  ).toBeVisible();
  await expect(page.getByText("First Pick: August 2026")).toBeVisible();

  const joinLink = page
    .getByRole("link", {
      name: "Join the Awesome Intune community on LinkedIn",
    })
    .first();
  await expect(joinLink).toHaveAttribute("href", communityUrl);
  await expect(joinLink).toHaveAttribute("target", "_blank");
  await expect(joinLink).toHaveAttribute("rel", "noopener noreferrer");

  const terms = page.locator("details");
  const summary = terms.locator("summary");
  await expect(summary).toHaveText(/Read the full terms/);
  await summary.click();
  await expect(terms).toHaveAttribute("open", "");
  await expect(
    terms.getByText("Ugurlabs UG (haftungsbeschränkt)").first(),
  ).toBeVisible();
  await expect(terms.getByText(/Legal recourse is excluded\./)).toBeVisible();
  await expect(
    terms.getByText(
      "This program is not sponsored, endorsed, administered by, or associated with LinkedIn.",
      { exact: true },
    ),
  ).toBeVisible();

  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.locator("footer").getByText("Sponsors")).toHaveCount(0);
});

test("uses English only and keeps selection jury-led", async ({ page }) => {
  await preparePickPage(page);

  await expect(
    page.getByText("Likes and comments are not the selection metric."),
  ).toBeVisible();

  const pageCopy = await page.locator("main").innerText();
  expect(pageCopy).not.toMatch(
    /Deutsch|Teilnahme|Auswahlkriterien|Community beitreten|Regeln ansehen|Erster Pick|Jeden Monat|Kommentare sind kein Auswahlmaßstab/i,
  );
  await expect(page.locator('[lang="de"]')).toHaveCount(0);
  await expect(
    page.locator('meta[property="og:locale:alternate"]'),
  ).toHaveCount(0);

  expect(pageCopy).not.toContain("Diamond Award");
  expect(pageCopy).not.toContain("Workplace Ninja");
  expect(pageCopy).not.toContain("conference");
  expect(pageCopy).not.toContain("—");
  expect(pageCopy).not.toMatch(
    /Kairavo|TenantPDF|Awesome Intune Master Class/i,
  );
});

test("exposes Pick in site navigation and uses the required metadata", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("desktop"),
    "Desktop navigation only",
  );
  await preparePickPage(page);

  await expect(page).toHaveTitle(
    "Awesome Pick - Monthly Community Recognition | Awesome Intune",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.awesomeintune.com/pick",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /variant=pick/,
  );

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await expect(
    navigation.getByRole("link", { name: "Pick", exact: true }),
  ).toHaveAttribute("href", "/pick");
  await expect(
    page.locator("footer").getByRole("link", { name: "Awesome Pick" }),
  ).toHaveAttribute("href", "/pick");
});

test("remains responsive without horizontal overflow", async ({ page }) => {
  await preparePickPage(page);

  await expect(
    page.getByRole("heading", { name: "How it works" }),
  ).toBeVisible();
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});
