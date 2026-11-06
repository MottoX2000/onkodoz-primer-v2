import { defineConfig } from "cypress";

export default defineConfig({
  // 60 saniyelik E2E demo videosunu otomatik kaydetmek için video: true
  video: true,
  videoCompression: 32,
  viewportWidth: 375,
  viewportHeight: 812,
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
