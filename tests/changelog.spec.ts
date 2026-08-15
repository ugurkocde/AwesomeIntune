import { expect, test, type Page } from "@playwright/test";

const apiPattern =
  "https://changelog.ugurlabs.com/api/changelog/awesomeintune?limit=20*";

const feed = {
  product: {
    id: "awesomeintune",
    name: "AwesomeIntune",
    websiteUrl: "https://www.awesomeintune.com",
  },
  entries: [
    {
      id: "release-2026-08-15",
      title: "A clearer way to follow updates",
      summary:
        "Product improvements are now available without leaving the directory.",
      type: "improved",
      publishedOn: "2026-08-15",
      sourceUrl: "https://example.com/this-must-not-be-rendered",
    },
  ],
};
const firstEntry = feed.entries[0]!;

async function mockLocalApis(page: Page) {
  await page.route("**/api/subscriber-count", async (route) => {
    await route.fulfill({ json: { count: 0 } });
  });
  await page.route("**/api/views", async (route) => {
    await route.fulfill({ json: { views: 0 } });
  });
  await page.route("**/api/votes", async (route) => {
    await route.fulfill({ json: { votes: 0 } });
  });
}

async function mockFeed(page: Page) {
  await mockLocalApis(page);
  await page.route(apiPattern, async (route) => {
    await route.fulfill({ json: feed });
  });
}

test.describe("changelog navigation", () => {
  test.beforeEach(async ({ page }) => {
    await mockFeed(page);
    await page.goto("/");
  });

  test("opens from the keyboard, traps focus, and restores it", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: /open changelog/i });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Latest updates" });
    const closeButton = dialog.getByRole("button", { name: "Close changelog" });
    await expect(dialog).toBeVisible();
    await expect(closeButton).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(
      dialog.getByRole("link", { name: "View all updates" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("renders public update content without type or source labels", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /open changelog/i }).click();
    const dialog = page.getByRole("dialog", { name: "Latest updates" });

    await expect(dialog.getByText(firstEntry.title)).toBeVisible();
    await expect(dialog.getByText(firstEntry.summary)).toBeVisible();
    await expect(dialog.getByText("Improved", { exact: true })).toHaveCount(0);
    await expect(dialog.getByText("View source", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      dialog.locator(`a[href="${firstEntry.sourceUrl}"]`),
    ).toHaveCount(0);
    await expect(
      dialog.getByRole("link", { name: "View on changelog" }),
    ).toHaveAttribute(
      "href",
      "https://changelog.ugurlabs.com/?product=awesomeintune#change-release-2026-08-15",
    );
  });

  test("keeps the bell target at least 44 pixels", async ({ page }) => {
    const box = await page
      .getByRole("button", { name: /open changelog/i })
      .boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test("clears the unread indicator across responsive bell instances", async ({
    page,
  }) => {
    const unreadDots = page.getByTestId("changelog-unread-dot");
    await expect(unreadDots).toHaveCount(2);

    await page.getByRole("button", { name: /open changelog/i }).click();
    await expect(unreadDots).toHaveCount(0);
  });
});

test("uses a full-viewport sheet on mobile", async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("mobile"),
    "Mobile viewport only",
  );
  await mockFeed(page);
  await page.goto("/");
  await page.getByRole("button", { name: /open changelog/i }).click();

  const box = await page
    .getByRole("dialog", { name: "Latest updates" })
    .boundingBox();
  const viewport = await page.evaluate(() => ({
    height: window.innerHeight,
    width: window.innerWidth,
  }));

  expect(box?.width).toBeCloseTo(viewport.width, 3);
  expect(box?.height).toBeCloseTo(viewport.height, 3);
});

test("shows a recoverable state when the API is unavailable", async ({
  page,
}) => {
  await mockLocalApis(page);
  await page.route(apiPattern, async (route) => {
    await route.fulfill({ status: 503, body: "Service unavailable" });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /open changelog/i }).click();

  const dialog = page.getByRole("dialog", { name: "Latest updates" });
  await expect(
    dialog.getByText("Updates are temporarily unavailable"),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Try again" })).toBeVisible();
});
