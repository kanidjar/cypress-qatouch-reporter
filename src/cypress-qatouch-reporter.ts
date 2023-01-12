/// <reference types="cypress" />

import { Runner, Test } from "mocha";
import { ReporterOptions } from "./interfaces/reporter-options.interface";
import { ChildProcess, spawn } from "child_process";
import { Process } from "./interfaces/process.interface";
import { Status } from "./enums/status.enum";
import { glob } from "glob";

/**
 * CypressQaTouchReporter class
 *
 * Manages cypress/mocha test runner event and publish results to QA Touch
 */
export default class CypressQaTouchReporter {
  private _reporterOptions: ReporterOptions | undefined;
  private _process: Process = {
    command: "node",
    args: [`${__dirname}/processes/push.process.js`],
  };

  private readonly TITLE_REGEXP = /^\[QATouch-([A-Za-z0-9]+)\]/;

  constructor(runner: Runner, options: { reporterOptions?: ReporterOptions }) {
    this._reporterOptions = options.reporterOptions;

    this.validateReporterOptions([
      "domain",
      "apiToken",
      "projectKey",
      "testRunKey",
    ]);

    runner.on(Runner.constants.EVENT_TEST_PASS, (test: Test) => {
      this.push(test, Status.passed);
    });

    runner.on(Runner.constants.EVENT_TEST_FAIL, (test: Test) => {
      this.push(test, Status.failed);
    });
  }

  /**
   * Validate the existence of options
   * @param {string[]} options options to be validated
   */
  public validateReporterOptions(options: string[]): void {
    if (!this._reporterOptions) {
      throw new Error("Missing reporterOptions in cypress config");
    }

    options.forEach((option: string) => {
      if (!this._reporterOptions?.[option]) {
        throw new Error(
          "Missing " +
            option +
            " value. Please update reporterOptions in cypress.json"
        );
      }
    });
  }

  /**
   *
   * @param test The test
   * @returns first screenshot found or null
   */
  private _getScreenshot(test: Test, status: Status): string | null {
    if (!this._reporterOptions?.screenshotsFolder || status === Status.passed) {
      return null;
    }

    const filename = `${test.parent ? `${test.parent.title} -- ` : ""}${
      test.title
    }`;

    return (
      glob
        .sync(`${this._reporterOptions.screenshotsFolder}/**/*.*`)
        .map((file) => file)
        .filter((file) => file.includes(filename))
        .pop() ?? null
    );
  }

  /**
   * Initialize child process to push results to QATouch
   *
   * @param {Test} test the test
   * @param {Status} status the status of the test
   */
  public push(test: Test, status: Status): ChildProcess | null {
    const testRunResultKey = this.TITLE_REGEXP.exec(test.title)?.[1];
    let childProcess: ChildProcess | null = null;
    let screenshot = null;

    screenshot = this._getScreenshot(test, status);

    if (testRunResultKey) {
      (childProcess = spawn(this._process.command, this._process.args, {
        detached: true,
        stdio: "inherit",
        env: Object.assign(process.env, {
          reporterOptions: JSON.stringify(this._reporterOptions),
          result: JSON.stringify({
            testRunResultKey,
            status,
            screenshot,
          }),
        }),
      })).unref();
    } else {
      console.warn(
        `[QATouch] The test "${test.title}" does not seem to have a test result key "[QATouch-XXX]"`
      );
    }

    return childProcess;
  }
}
