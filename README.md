# Automatic E2E tests for the Beckett site

## Summary

This project introduces the E2E Frontend automatic tests for https://beckett.com/ site, which works as a hub for trading cards.
First iteration of the project provides the ability to check happy flow (flow without any alternative paths) for card submission
Project is hosted on https://github.com/AgnieszkaPawlak/cypress repository

## Architecture

### Technology stack


| Technology                   | Description                                                                                                   | License (link to license text)                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Node.js 24                   | JavaScript runtime built on the V8 engine for executing tooling and test runners from the command line.       | MIT —[LICENSE](https://github.com/nodejs/node/blob/main/LICENSE)                             |
| npm                          | Package manager for the Node.js ecosystem; handles dependency installation, scripts, and publishing.          | Artistic License 2.0 —[LICENSE](https://github.com/npm/cli/blob/latest/LICENSE)              |
| Cypress                      | Testing framework for web applications E2E testing with a built in network stubbing, and DOM automation APIs. | MIT —[LICENSE](https://github.com/cypress-io/cypress/blob/develop/LICENSE)                   |
| TypeScript                   | Statically typed superset of JavaScript that compiles to plain JavaScript                                     | Apache License 2.0 —[LICENSE](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
| cypress-mochawesome-reporter | Mochawesome reporter for Cypress, used for pretty reports generation                                          | MIT —[LICENSE)](https://github.com/LironEr/cypress-mochawesome-reporter/blob/main/LICENSE)   |

### Project composition


| File / Directory            | Description                                       |
| --------------------------- | ------------------------------------------------- |
| cypress\e2e\beckett\*.cy.ts | test case files                                   |
| cypress\fixtures\           | test data used in the test cases                  |
| cypress\support\            | commands implementations, DTO files               |
| cypress.config.ts           | global configuration file                         |
| config\*.json               | environmental variables dedicated for CI/CD tools |

## CI/CD integration

For CI/CD purposes, there is a folder named "config" consist of different variables sets based on specific environment.
To add new environment - just add new file (for example uat.json) and change target_environment to the new designated value. This way when creating docker container, this file can be injected by CI/CD tool (for example Jenkins) with baseUrl targeting the test environment or container with merge candidate built from the new code.

for example: `npx cypress run --spec "cypress/e2e/beckett/*.cy.ts" --env target_environment=uat`

## Prerequisites

### Windows Installation

1. **Install Node 24**:
   - Download version 24.7 from https://nodejs.org/en/download - Standalone Binary, for example: node-v22.18.0-win-x64.zip
   - Unzip to Your local directory, for following instruction C:\Installations\node-v22.18.0-win-x64 will be used as reference
   - Click on Windows Search button and look for "Edit the system environment variables" -> "Environment Variables" and edit "Path" variable - add C:\Installations\node-v22.18.0-win-x64 as new row and save.
2. **Download Beckett E2E tests**
   - Check if one has a access to the repository - https://github.com/AgnieszkaPawlak/beckett-cypress-e2e (if not please contact me via agnieszka@pawlak.io)
   - (Optional - if not already installed) Download git for Windows https://git-scm.com/downloads/win and install it
   - Download codes from https://github.com/AgnieszkaPawlak/beckett-cypress-e2e (branch main) using command line in target directory, where codes should be placed (for example C:\Sources\):
     - open command line (for example click on the Windows Explorer path and type "cmd" there - this will open command line already placed in desired path)
     - `git clone https://github.com/AgnieszkaPawlak/beckett-cypress-e2e`
3. Install all dependencies:
   - Go to downloaded directory (for example C:\Sources\cypress)
   - run from command line: `npm install`

## Run scripts

### Run as Interactive Mode

1. Run: `npm run cypress:open`
2. Script uses chrome, if different should be used, please change "chrome" in following file to any other listed below:
   - `npx cypress open --e2e --browser chrome --project`
   - example other browsers: electron, chrome, chromium, chrome-for-testing, edge, firefox

### Run as Headless Mode

1. Run: `npm run cypress:run`

## Reports

Reports with screenshots are being saved to the "artifacts\reports\" directory
