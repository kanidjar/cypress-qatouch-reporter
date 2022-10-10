import { Runner, Test } from "mocha";
import { ReporterOptions } from "./interfaces/reporter-options.interface";
import { ChildProcess, spawn } from "child_process";
import { Process } from "./interfaces/process.interface";

/**
 * CypressQaTouchReporter class
 *
 * Manages cypress/mocha test runner event and publish results to QA Touch
 */
export default class CypressQaTouchReporter {
  private __reporterOptions: ReporterOptions | undefined;
  private __process: Process = {
    command: "node",
    args: [`${__dirname}/processes/push.process.js`],
  };

  private readonly TITLE_REGEXP = /^\[QATouch-([A-Za-z0-9]+)\]/;

  constructor(runner: Runner, options: { reporterOptions?: ReporterOptions }) {
    this.__reporterOptions = options.reporterOptions;

    this.validateReporterOptions([
      "domain",
      "apiToken",
      "projectKey",
      "testRunKey",
    ]);

    runner.on(Runner.constants.EVENT_TEST_PASS, (test: Test) => {
      this.push("passed", test.title);
    });

    runner.on(Runner.constants.EVENT_TEST_FAIL, (test: Test) => {
      this.push("failed", test.title);
    });
  }

  /**
   * Validate the existence of options
   * @param {string[]} options options to be validated
   */
  public validateReporterOptions(options: string[]): void {
    if (!this.__reporterOptions) {
      throw new Error("Missing reporterOptions in cypress config");
    }

    options.forEach((option: string) => {
      if (!this.__reporterOptions?.[option]) {
        throw new Error(
          "Missing " +
            option +
            " value. Please update reporterOptions in cypress.json"
        );
      }
    });
  }

  /**
   * Initialize child process to push results to QATouch
   *
   * @param {string} status the status of the test
   * @param {string} title the title of the test
   */
  public push(status: "passed" | "failed", title: string): ChildProcess | null {
    const testRunResultKey = this.TITLE_REGEXP.exec(title)?.[1];
    let childProcess: ChildProcess | null = null;

    if (testRunResultKey) {
      (childProcess = spawn(this.__process.command, this.__process.args, {
        detached: true,
        stdio: "inherit",
        env: Object.assign(process.env, {
          reporterOptions: JSON.stringify(this.__reporterOptions),
          result: JSON.stringify({
            testRunResultKey,
            status,
          }),
        }),
      })).unref();
    } else {
      console.warn(
        `[QATouch] The test "${title}" does not seem to have a test result key "[QATouch-XXX])"`
      );
    }

    return childProcess;
  }
}
