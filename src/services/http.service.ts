import axios, { Axios } from "axios";
import { PushResponse } from "../interfaces/api/push.response";
import { ReporterOptions } from "../interfaces/reporter-options.interface";
import FormData from "form-data";
import fs from "fs";
import { Result } from "../interfaces/result.interface";
import path from "path";

export class HttpService {
  private _client: Axios = axios.create();
  private _formData = new FormData();
  private readonly _url =
    "https://api.qatouch.com/api/v1/testRunResults/add/results";

  public constructor(private _reporterOptions: ReporterOptions) {}

  public async updateStatus(result: Result): Promise<PushResponse> {
    this._addScreenshot(result.screenshot);

    const data: PushResponse = await this._client
      .post(this._url, this._formData, {
        params: {
          status: result.status,
          project: this._reporterOptions.projectKey,
          test_run: this._reporterOptions.testRunKey,
          run_result: [result.testRunResultKey],
          comments: "Published from Cypress",
        },
        headers: this._formData.getHeaders({
          "api-token": this._reporterOptions.apiToken,
          domain: this._reporterOptions.domain,
        }),
      })
      .then((response) => response.data as PushResponse)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      .catch((e) => ({ error: e, success: false }));

    if (!data.success) {
      console.error(
        `[QATouch] An error occurred while updating test result "${
          result.testRunResultKey
        }" with status "${result.status}": ${JSON.stringify(data.error)}"`
      );
    }

    return data;
  }

  private _addScreenshot(screenshot?: string) {
    if (screenshot && fs.existsSync(screenshot)) {
      this._formData.append(
        "file[]",
        fs.readFileSync(screenshot),
        path.basename(screenshot)
      );
    }
  }
}
