import { expect, test } from "@playwright/test";

test("serves the catalog as RSS", async ({ request }) => {
  const response = await request.get("/feed.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain(
    "application/rss+xml"
  );

  const body = await response.text();
  expect(body).toContain('<rss version="2.0">');
  expect(body).toContain("<item>");
  expect(body).toContain('<guid isPermaLink="true">');
  expect(body).toContain("<pubDate>");
});
