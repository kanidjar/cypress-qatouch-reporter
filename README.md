<h2 align="center">Cypress QATouch Reporter</h2>
<h3 align="center">
Push your Cypress test results into QATouch
</h3>

[![build](https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/build.yaml/badge.svg?branch=main)](https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/build.yaml)
[![test](https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/test.yaml)
[![lint](https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/lint.yaml/badge.svg?branch=main)](https://github.com/kanidjar/cypress-qatouch-reporter/actions/workflows/lint.yaml)

## Introduction

This Cypress plugin allows you to push your Cypress test results into QATouch.

### Installation

```sh
npm install @kanidjar/cypress-qatouch-reporter
```

### Configuration

```javascript
// cypress.config.js
const cypressJsonConfig = {
  reporter: "./node_modules/@kanidjar/cypress-qatouch-reporter",
  reporterOptions: {
    domain: "your_domain",
    apiToken: "your_api_token",
    projectKey: "your_project_key",
    testRunKey: "your_test_run_key",
  },
};
```

or using [cypress-multi-reporters](https://github.com/you54f/cypress-multi-reporters)

```javascript
// cypress.config.js
const cypressJsonConfig = {
  reporter: "./node_modules/cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: ["@kanidjar/cypress-qatouch-reporter"],
    kanidjarCypressQatouchReporterReporterOptions: {
      domain: "your_domain",
      apiToken: "your_api_token",
      projectKey: "your_project_key",
      testRunKey: "your_test_run_key",
    },
  },
};
```

### Usage

The title of your tests must start with "[QATouch-XXX]", XXX being your test result key.

```javascript
it("[QATouch-XXXX] should do something", () => {});
```

## License

Distributed under the Apache License. See `LICENSE.txt` for more information.

## Changelog

See `CHANGELOG.md` for more information.
