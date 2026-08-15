import { expect, test, type Page } from "@playwright/test";

const communityUrl = "https://www.linkedin.com/groups/14802021/";

async function preparePage(page: Page) {
  await page.route("**/api/subscriber-count", async (route) => {
    await route.fulfill({ json: { count: 0 } });
  });
  await page.route("**/api/views", async (route) => {
    await route.fulfill({ json: { views: 0 } });
  });
  await page.route("**/api/votes", async (route) => {
    await route.fulfill({ json: { votes: 0 } });
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
  await page.goto("/");
}

test("places Community in the desktop navigation and official group in the footer", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("desktop"),
    "Desktop navigation only",
  );
  await preparePage(page);

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const communityLink = navigation.getByRole("link", {
    name: "Community",
    exact: true,
  });
  await expect(communityLink).toBeVisible();
  await expect(communityLink).toHaveAttribute("href", communityUrl);
  await expect(communityLink).toHaveAttribute("target", "_blank");
  await expect(communityLink).toHaveAttribute("rel", "noopener noreferrer");
  await communityLink.focus();
  await expect(communityLink).toBeFocused();

  const linkLabels = await navigation.getByRole("link").allTextContents();
  expect(linkLabels.indexOf("Community")).toBeLessThan(
    linkLabels.indexOf("GitHub"),
  );

  const footerLink = page
    .locator("footer")
    .getByRole("link", { name: "LinkedIn Community" });
  await expect(footerLink).toHaveAttribute("href", communityUrl);
  await expect(footerLink).toHaveAttribute("target", "_blank");
  await expect(footerLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("presents the community as a touch-friendly mobile menu destination", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("mobile"),
    "Mobile navigation only",
  );
  await preparePage(page);

  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  const communityLink = page.getByRole("link", {
    name: /Community Join the official LinkedIn group/,
  });
  await expect(communityLink).toBeVisible();
  await expect(communityLink).toHaveAttribute("href", communityUrl);
  await expect(communityLink).toHaveAttribute("target", "_blank");

  const box = await communityLink.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(box?.width).toBeLessThanOrEqual(375);
});

test("keeps the community destination uncluttered at tablet widths", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("desktop"),
    "Tablet breakpoint uses the desktop browser project",
  );
  await page.setViewportSize({ width: 1024, height: 768 });
  await preparePage(page);

  await expect(
    page.getByRole("button", { name: "Toggle navigation menu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  await expect(
    page.getByRole("link", {
      name: /Community Join the official LinkedIn group/,
    }),
  ).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});
