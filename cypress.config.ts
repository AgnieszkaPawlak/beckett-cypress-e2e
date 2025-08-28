import { defineConfig } from 'cypress'
import fs from "fs";

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    defaultCommandTimeout: 20000,
    viewportWidth: 1280,
    viewportHeight: 800,
    video: true,
    setupNodeEvents(on, config) {

      require('cypress-mochawesome-reporter/plugin')(on)
      const fs = require('fs');

      // For CI/CD, use environment name for environment-dependant variables
      console.log('Using environment: ' + config.env.target_environment)
      const environment = config.env.target_environment || 'dev'
      const configFile = `./config/${environment}.json`
      try {
        const fileContent = fs.readFileSync(configFile, 'utf8')
        const settings = JSON.parse(fileContent)

        config.env = { ...config.env, ...settings }
      } catch (err) {
        console.error("File ./config/"+environment+".json not found!")
        throw err
      }

      return config
    },
  },
  reporter: 'cypress-mochawesome-reporter',
  screenshotsFolder: 'artifacts/reports/images',
  reporterOptions: {
    reportDir: 'artifacts/reports/',
    charts: true,
    reportPageTitle: 'Beckett E2E Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveJson: false
  },
})

