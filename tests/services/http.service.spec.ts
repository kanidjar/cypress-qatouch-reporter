/* eslint-disable @typescript-eslint/dot-notation */
import { ReporterOptions } from "../../src/interfaces/reporter-options.interface";
import { describe, it, expect, jest } from "@jest/globals";
import { HttpService } from "../../src/services/http.service";
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { AxiosInstance } from "axios";

describe("HttpService", () => {
  const reporterOptions: ReporterOptions = {
    domain: "my-domain",
    apiToken: "xxxxx",
    projectKey: "my-project-key",
    testRunKey: "my-test-run-key",
  };

  const httpService = new HttpService(reporterOptions);

  it("should update the status of a test", async () => {
    httpService["__client"] = Substitute.for<AxiosInstance>();
    (httpService["__client"] as SubstituteOf<AxiosInstance>)
      .patch(Arg.all())
      .resolves({ data: { success: true } });

    const data = await httpService.updateStatus("passed", "myTestRunKey");
    expect(data.success).toBeTruthy();
  });

  it("should fail while updating the status of a test", async () => {
    httpService["__client"] = Substitute.for<AxiosInstance>();
    (httpService["__client"] as SubstituteOf<AxiosInstance>)
      .patch(Arg.all())
      .rejects(new Error());

    console.error = jest.fn();

    const data = await httpService.updateStatus("failed", "myTestRunKey");
    expect(data.success).toBeFalsy();

    jest.restoreAllMocks();
  });
});
