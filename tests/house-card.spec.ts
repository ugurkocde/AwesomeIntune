import { expect, test } from "@playwright/test";

const MESSAGE_KEY = "awesome-intune-house-message";

test.describe("TenuVault placements", () => {
  test("the house row shows the visitor's stored message with a tagged link", async ({
    page,
  }) => {
    await page.addInitScript(
      ([key]) => window.localStorage.setItem(key!, "free"),
      [MESSAGE_KEY],
    );
    await page.goto("/");

    const row = page.locator('[data-house-card="free"]');
    await expect(row).toBeVisible();
    await expect(row).toContainText("From the maker of Awesome Intune");
    await expect(row).toContainText("Back up your Intune tenant in minutes.");

    const action = row.getByRole("link", { name: "Download free" });
    await expect(action).toHaveAttribute(
      "href",
      "https://www.tenuvault.com/download?utm_source=awesomeintune.com&utm_medium=house_ad&utm_campaign=home_grid&utm_content=free",
    );
    await expect(action).toHaveAttribute("rel", "sponsored noopener");
    await expect(
      row.getByRole("link", { name: "Directory entry" }),
    ).toHaveAttribute("href", "/tools/tenuvault");
  });

  test("a first visit picks one message and keeps it", async ({ page }) => {
    await page.goto("/");
    const row = page.locator("[data-house-card]");
    await expect(row).not.toHaveAttribute("data-house-card", "pending");
    const first = await row.getAttribute("data-house-card");
    expect(["restore", "free"]).toContain(first);
    expect(
      await page.evaluate((key) => window.localStorage.getItem(key), MESSAGE_KEY),
    ).toBe(first);

    await page.reload();
    await expect(page.locator("[data-house-card]")).toHaveAttribute(
      "data-house-card",
      first!,
    );
  });

  test("an unknown stored value is replaced by a fresh pick", async ({
    page,
  }) => {
    await page.addInitScript(
      ([key]) => window.localStorage.setItem(key!, "toString"),
      [MESSAGE_KEY],
    );
    await page.goto("/");
    const row = page.locator("[data-house-card]");
    await expect(row).not.toHaveAttribute("data-house-card", "pending");
    const shown = await row.getAttribute("data-house-card");
    expect(["restore", "free"]).toContain(shown);
    expect(
      await page.evaluate((key) => window.localStorage.getItem(key), MESSAGE_KEY),
    ).toBe(shown);
  });

  test("the house row sits between two rows of tools", async ({ page }) => {
    await page.goto("/");
    const row = page.locator("[data-house-card]");
    await expect(row).toBeVisible();
    const before = await row.evaluate(
      (node) => node.parentElement!.querySelectorAll("article").length,
    );
    expect(before).toBeGreaterThan(6);
    const position = await row.evaluate((node) =>
      Array.from(node.parentElement!.children).indexOf(node),
    );
    expect(position).toBe(6);
  });

  test("a search or a filter shows tools only", async ({ page }) => {
    await page.goto("/?category=packaging");
    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("[data-house-card]")).toHaveCount(0);

    await page.goto("/?q=autopilot");
    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("[data-house-card]")).toHaveCount(0);
  });

  test("the directory entry links to tenuvault.com with tags and a referrer", async ({
    page,
  }) => {
    await page.goto("/tools/tenuvault");
    const download = page.getByRole("link", { name: "Download", exact: true });
    await expect(download).toHaveAttribute(
      "href",
      "https://www.tenuvault.com/download?utm_source=awesomeintune.com&utm_medium=listing&utm_campaign=tool_page",
    );
    await expect(download).toHaveAttribute("rel", "noopener");
    await expect(
      page.getByRole("link", { name: "View on GitHub" }),
    ).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("other tools keep their links untouched", async ({ page }) => {
    await page.goto("/tools/intune-management");
    const links = page.locator('a[target="_blank"][href*="utm_source"]');
    // Only the sponsor links in the footer are tagged on this page.
    for (const href of await links.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href") ?? ""),
    )) {
      expect(href).toContain("utm_source=awesome_intune");
    }
  });
});
