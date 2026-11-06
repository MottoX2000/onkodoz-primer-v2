export default {
  video: false,
  viewportWidth: 390,
  viewportHeight: 844,
  screenshotsFolder: "linkedin-screenshots",
  trashAssetsBeforeRuns: true,
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/linkedin/*.cy.js",
    supportFile: false,
    setupNodeEvents(on) {
      on("before:browser:launch", (browser, opts) => {
        if (browser.family === "chromium") opts.args.push("--force-device-scale-factor=3");
        return opts;
      });
    },
  },
};
