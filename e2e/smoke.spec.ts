import { test, expect } from "@playwright/test";

test("home loads and has main landmark", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByText("CLOG TV WORLD", { exact: false })).toBeVisible();
});

test("news search page responds", async ({ page }) => {
  await page.goto("/news");
  await expect(page.getByRole("heading", { name: /search & discovery/i })).toBeVisible();
});
