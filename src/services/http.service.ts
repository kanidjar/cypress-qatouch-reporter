import axios, { Axios } from "axios";
import { PushResponse } from "../interfaces/api/push.response";
import { ReporterOptions } from "../interfaces/reporter-options.interface";

export class HttpService {
  private __client: Axios = axios.create();

  public constructor(private __reporterOptions: ReporterOptions) {}

  public async updateStatus(
    status: string,
    testRunResultKey: string
  ): Promise<PushResponse> {
    const data: PushResponse = await this.__client
      .patch("https://api.qatouch.com/api/v1/testRunResults/status", null, {
        params: {
          status,
          project: this.__reporterOptions.projectKey,
          test_run: this.__reporterOptions.testRunKey,
          run_result: testRunResultKey,
          comments: "Published from Cypress",
        },
        headers: {
          "api-token": this.__reporterOptions.apiToken,
          domain: this.__reporterOptions.domain,
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data as PushResponse)
      .catch(() => ({ success: false }));

    if (!data.success) {
      console.error(
        `[QATouch] An error occurred while updating test result "${testRunResultKey}" with status "${status}": ${JSON.stringify(
          data
        )}"`
      );
    }

    return data;
  }
}
