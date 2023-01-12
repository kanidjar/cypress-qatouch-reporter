/* eslint-disable @typescript-eslint/dot-notation */
import { ReporterOptions } from "../../src/interfaces/reporter-options.interface";
import { describe, it, expect, jest } from "@jest/globals";
import { HttpService } from "../../src/services/http.service";
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { AxiosInstance } from "axios";
import { Status } from "../../src/enums/status.enum";
import FormData from "form-data";

describe("HttpService", () => {
  const reporterOptions: ReporterOptions = {
    domain: "my-domain",
    apiToken: "xxxxx",
    projectKey: "my-project-key",
    testRunKey: "my-test-run-key",
  };

  const httpService = new HttpService(reporterOptions);

  it("should update the status of a test", async () => {
    httpService["_client"] = Substitute.for<AxiosInstance>();
    (httpService["_client"] as SubstituteOf<AxiosInstance>)
      .post(Arg.all())
      .resolves({ data: { success: true } });

    const data = await httpService.updateStatus({
      status: Status.passed,
      testRunResultKey: "myTestRunKey",
    });
    expect(data.success).toBeTruthy();
  });

  it("should fail while updating the status of a test", async () => {
    httpService["_client"] = Substitute.for<AxiosInstance>();
    (httpService["_client"] as SubstituteOf<AxiosInstance>)
      .post(Arg.all())
      .rejects(new Error());

    console.error = jest.fn();

    const data = await httpService.updateStatus({
      status: Status.failed,
      testRunResultKey: "myTestRunKey",
    });
    expect(data.success).toBeFalsy();

    jest.restoreAllMocks();
  });

  it("should add a screenshot to the test", () => {
    httpService["_formData"] = new FormData();

    expect(httpService["_formData"].getLengthSync()).toEqual(0);

    httpService["_addScreenshot"](__filename);

    expect(httpService["_formData"].getLengthSync()).not.toEqual(0);
  });

  it("should not add a screenshot to the test", () => {
    httpService["_formData"] = new FormData();

    expect(httpService["_formData"].getLengthSync()).toEqual(0);

    httpService["_addScreenshot"]("foo");

    expect(httpService["_formData"].getLengthSync()).toEqual(0);

    jest.restoreAllMocks();
  });
});
