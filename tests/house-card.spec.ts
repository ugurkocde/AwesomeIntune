import { expect, test, type Page } from "@playwright/test";

// The messages take turns by calendar day in Berlin. These two are
// consecutive days, at noon.
const DAY_ONE = new Date("2026-11-12T11:00:00Z");
const DAY_TWO = new Date("2026-11-13T11:00:00Z");

const FREE_URL = (campaign: string) =>
  `https://www.tenuvault.com/download?utm_source=awesomeintune.com&utm_medium=house_ad&utm_campaign=${campaign}&utm_content=free_v1`;
const RESTORE_URL = (campaign: string) =>
  `https://www.tenuvault.com/intune-restore?utm_source=awesomeintune.com&utm_medium=house_ad&utm_campaign=${campaign}&utm_content=restore_v1`;

async function openOn(page: Page, day: Date, path = "/") {
  await page.clock.setFixedTime(day);
  await page.goto(path);
  const row = page.locator("[data-house-card]");
  await expect(row).not.toHaveAttribute("data-house-card", "pending");
  return row;
}

test.describe("TenuVault placements", () => {
  test("the two messages take turns by day, each with its own tagged link", async ({
    page,
  }) => {
    const seen: Record<string, string | null> = {};
    for (const day of [DAY_ONE, DAY_TWO]) {
      const row = await openOn(page, day);
      const id = (await row.getAttribute("data-house-card"))!;
      const action = row.locator('a[target="_blank"]');
      await expect(action).toBeVisible();
      await expect(action).toHaveAttribute("rel", "sponsored noopener");
      seen[id] = await action.getAttribute("href");

      await expect(row).toContainText("From the maker of Awesome Intune");
      await expect(row.getByRole("link", { name: "Details" })).toHaveAttribute(
        "href",
        "/tools/tenuvault",
      );
      if (id === "free") {
        await expect(
          row.getByText("Back up your Intune configuration in minutes."),
        ).toBeVisible();
        await expect(
          row.getByRole("link", { name: /^Download free/ }),
        ).toBeVisible();
        await expect(row.getByText("Deleted an Intune policy?")).toBeHidden();
      } else {
        await expect(
          row.getByText("Deleted an Intune policy? Intune has no recycle bin."),
        ).toBeVisible();
        await expect(
          row.getByRole("link", { name: /^See how restore works/ }),
        ).toBeVisible();
      }
    }
    expect(seen).toEqual({
      free: FREE_URL("home_grid"),
      restore: RESTORE_URL("home_grid"),
    });
  });

  test("the whole Berlin day shows one message", async ({ page }) => {
    const noon = await (
      await openOn(page, DAY_ONE)
    ).getAttribute("data-house-card");
    // 00:30 and 23:30 Berlin time on the same day.
    for (const time of ["2026-11-11T23:30:00Z", "2026-11-12T22:30:00Z"]) {
      await expect(await openOn(page, new Date(time))).toHaveAttribute(
        "data-house-card",
        noon!,
      );
    }
    await expect(
      await openOn(page, new Date("2026-11-12T23:30:00Z")),
    ).not.toHaveAttribute("data-house-card", noon!);
  });

  test("nothing is stored in the browser for the message", async ({ page }) => {
    await openOn(page, DAY_ONE);
    const keys = await page.evaluate(() => Object.keys(window.localStorage));
    expect(keys.filter((key) => /house|message/i.test(key))).toEqual([]);
  });

  for (const width of [360, 414, 768, 1280]) {
    test(`the tools below sit at the same place for either message at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const offsets: number[] = [];
      for (const day of [DAY_ONE, DAY_TWO]) {
        const row = await openOn(page, day);
        offsets.push(
          await row.evaluate((node) => {
            const box = node.getBoundingClientRect();
            return Math.round(box.bottom + window.scrollY);
          }),
        );
      }
      expect(offsets[0]).toBe(offsets[1]);
    });
  }

  test("the house row sits between two rows of tools", async ({ page }) => {
    const row = await openOn(page, DAY_ONE);
    const position = await row.evaluate((node) =>
      Array.from(node.parentElement!.children).indexOf(node),
    );
    expect(position).toBe(6);
    expect(
      await row.evaluate(
        (node) => node.parentElement!.querySelectorAll("article").length,
      ),
    ).toBeGreaterThan(6);
  });

  test("the list view shows the row with its own placement", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem("awesome-intune-view-mode", "list"),
    );
    const row = await openOn(page, DAY_ONE);
    const href = await row.locator('a[target="_blank"]').getAttribute("href");
    expect([FREE_URL("home_list"), RESTORE_URL("home_list")]).toContain(href);
  });

  test("a search or a filter shows tools only", async ({ page }) => {
    await page.goto("/?category=packaging");
    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("[data-house-card]")).toHaveCount(0);

    await page.goto("/?q=autopilot");
    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("[data-house-card]")).toHaveCount(0);
  });

  test("before the message is known the row offers no link to click", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    const row = page.locator("[data-house-card]");
    await expect(row).toHaveAttribute("data-house-card", "pending");
    // Without JavaScript the whole directory section stays hidden, so the
    // link's own style is checked: it must be hidden by itself.
    expect(
      await row
        .locator('a[target="_blank"]')
        .evaluate((node) => getComputedStyle(node).visibility),
    ).toBe("hidden");
    await context.close();
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

  test("the entry's card and the comparison table are tagged too", async ({
    page,
  }) => {
    await page.goto("/?q=tenuvault");
    const card = page.locator("article", { hasText: "TenuVault" }).first();
    await expect(card.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "https://www.tenuvault.com/download?utm_source=awesomeintune.com&utm_medium=listing&utm_campaign=tool_card",
    );

    await page.goto("/compare?tools=tenuvault,intune-management");
    await expect(
      page.locator('a[href*="tenuvault.com"]').first(),
    ).toHaveAttribute(
      "href",
      "https://www.tenuvault.com/intune-backup?utm_source=awesomeintune.com&utm_medium=listing&utm_campaign=compare",
    );
  });

  test("other tools keep their links untouched", async ({ page }) => {
    await page.goto("/tools/intune-management");
    const hrefs = await page
      .locator('a[target="_blank"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          href: node.getAttribute("href") ?? "",
          rel: node.getAttribute("rel") ?? "",
        })),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const { href, rel } of hrefs) {
      expect(rel).toBe("noopener noreferrer");
      // Only the sponsor links in the footer carry a tag on this page.
      if (href.includes("utm_")) {
        expect(href).toContain("utm_source=awesome_intune");
      }
    }
  });
});
