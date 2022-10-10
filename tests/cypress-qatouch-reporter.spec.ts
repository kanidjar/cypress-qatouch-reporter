import CypressQaTouchReporter from "../src/cypress-qatouch-reporter";
import { Runner, Suite, Test } from "mocha";
import { ReporterOptions } from "../src/interfaces/reporter-options.interface";
import { describe, it, expect, test, jest } from "@jest/globals";

describe("Cypress QATouch reporter", () => {
  const reporterOptions: ReporterOptions = {
    domain: "my-domain",
    apiToken: "xxxxx",
    projectKey: "my-project-key",
    testRunKey: "my-test-run-key",
  };

  const runner: Mocha.Runner = new Runner(new Suite("Test suite"));
  let reporter: CypressQaTouchReporter;

  beforeEach(() => {
    reporter = new CypressQaTouchReporter(runner, {
      reporterOptions,
    });
  });

  afterEach(() => {
    runner.dispose();
  });

  it("should instantiate reporter", () => {
    expect(reporter).not.toBeFalsy();
  });

  describe("Reporter options", () => {
    it("should throw when the reporter options are not provided", () => {
      expect(() => new CypressQaTouchReporter(runner, {})).toThrow();
    });

    it("should throw when an option is missing", () => {
      expect(
        () =>
          new CypressQaTouchReporter(runner, {
            reporterOptions: {
              ...reporterOptions,
              apiToken: undefined,
            },
          })
      ).toThrow();
    });
  });

  describe("Mocha test events", () => {
    const events: Record<string, string> = {
      [Runner.constants.EVENT_TEST_FAIL]: "failed",
      [Runner.constants.EVENT_TEST_PASS]: "passed",
    };

    test.each(Object.keys(events))(
      `should call push method on %s`,
      (name: string) => {
        reporter.push = jest.fn(() => null);
        runner.emit(name, new Test(name));
        expect(reporter.push).toHaveBeenCalledWith(events[name], name);
      }
    );
  });

  describe("Data push", () => {
    it("should start the spawn process when testResultKey is provided", () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      reporter["__process"] = {
        command: "true",
        args: [],
      };

      const process = reporter.push(
        "passed",
        "[QATouch-testKey] This is a test"
      );

      expect(process).not.toBeNull();

      return new Promise((resolve) => {
        process?.on("exit", () => {
          expect(process.exitCode).toEqual(0);
          resolve(null);
        });
      });
    });

    it("should not spawn a process when testResultKey is not provided", () => {
      console.warn = jest.fn();
      const process = reporter.push("passed", "[foo-testKey] This is a test");

      expect(console.warn).toHaveBeenCalled();
      expect(process).toBeNull();
      jest.restoreAllMocks();
    });
  });
});
