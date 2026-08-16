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

test("renders the complete bilingual launch state and program terms", async ({
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
  await expect(
    page.getByText(
      "Jeden Monat würdigen wir den nützlichsten Community-Beitrag in der Awesome Intune Gruppe.",
    ),
  ).toBeVisible();
  await expect(page.getByText("First Pick: August 2026")).toBeVisible();
  await expect(page.getByText("Erster Pick: August 2026")).toBeVisible();

  const joinLink = page
    .getByRole("link", {
      name: /Join the Awesome Intune community on LinkedIn/,
    })
    .first();
  await expect(joinLink).toHaveAttribute("href", communityUrl);
  await expect(joinLink).toHaveAttribute("target", "_blank");
  await expect(joinLink).toHaveAttribute("rel", "noopener noreferrer");

  const terms = page.locator("details");
  const summary = terms.locator("summary");
  await expect(summary).toContainText("Read the full terms");
  await expect(summary).toContainText("Vollständige Bedingungen lesen");
  await summary.click();
  await expect(terms).toHaveAttribute("open", "");
  await expect(
    terms.getByText("Ugurlabs UG (haftungsbeschränkt)").first(),
  ).toBeVisible();
  await expect(
    terms.getByText(/Der Rechtsweg ist ausgeschlossen\./),
  ).toBeVisible();
  await expect(
    terms.getByText(
      "This program is not sponsored, endorsed, administered by, or associated with LinkedIn.",
      { exact: true },
    ),
  ).toBeVisible();

  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.locator("footer").getByText("Sponsors")).toHaveCount(0);
});

test("keeps the selection jury-led and omits removed program concepts", async ({
  page,
}) => {
  await preparePickPage(page);

  await expect(
    page.getByText("Likes and comments are not the selection metric."),
  ).toBeVisible();
  await expect(
    page.getByText("Likes und Kommentare sind kein Auswahlmaßstab.", {
      exact: true,
    }),
  ).toBeVisible();

  const pageCopy = await page.locator("main").innerText();
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

test("keeps bilingual columns responsive without horizontal overflow", async ({
  page,
}, testInfo) => {
  await preparePickPage(page);

  const pair = page.locator('[data-language-pair="hero-copy"]');
  const englishCopy = pair.locator('[lang="en"]');
  const germanCopy = pair.locator('[lang="de"]');
  await expect(englishCopy).toBeVisible();
  await expect(germanCopy).toBeVisible();
  const englishBox = await englishCopy.boundingBox();
  const germanBox = await germanCopy.boundingBox();

  expect(englishBox).not.toBeNull();
  expect(germanBox).not.toBeNull();
  if (testInfo.project.name.startsWith("mobile")) {
    expect(germanBox!.y).toBeGreaterThan(
      englishBox!.y + englishBox!.height - 1,
    );
  } else {
    expect(Math.abs(germanBox!.y - englishBox!.y)).toBeLessThanOrEqual(2);
  }

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});
