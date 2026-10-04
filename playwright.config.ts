import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    channel: "msedge",
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "tablet",
      grep: /routes majeures/,
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone SE"],
        defaultBrowserType: "chromium",
        channel: "msedge",
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
