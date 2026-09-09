import { test, expect } from "@playwright/test";

test("community card uses fresh server count instead of a fixed value", async ({
  page,
}) => {
  await page.route("**/api/community-count", (route) =>
    route.fulfill({ json: { count: 17, updatedAt: new Date().toISOString() } }),
  );
  await page.goto("/");
  const card = page.getByRole("region", { name: "Talk Intune with us." });
  await expect(card.getByText("17", { exact: true })).toBeVisible();
  await expect(
    card.getByText("community members", { exact: true }),
  ).toBeVisible();
});

test("community card hides expired count and retains invitation", async ({
  page,
}) => {
  await page.route("**/api/community-count", (route) =>
    route.fulfill({
      json: {
        count: 999,
        updatedAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
      },
    }),
  );
  await page.goto("/");
  const card = page.getByRole("region", { name: "Talk Intune with us." });
  await expect(card.getByText("on WhatsApp", { exact: false })).toBeVisible();
  await expect(card.getByText("999", { exact: true })).toHaveCount(0);
  await expect(
    card.getByRole("link", { name: /Join the community/ }),
  ).toBeVisible();
});
