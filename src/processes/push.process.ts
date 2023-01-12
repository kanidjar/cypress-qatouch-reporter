import { exit } from "process";
import { PushResponse } from "src/interfaces/api/push.response";
import { ReporterOptions } from "../interfaces/reporter-options.interface";
import { Result } from "../interfaces/result.interface";
import { HttpService } from "../services/http.service";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

(async (): Promise<PushResponse> => {
  if (
    process.env.reporterOptions === undefined ||
    process.env.result === undefined
  ) {
    exit(1);
  }
  const reporterOptions = JSON.parse(
    process.env.reporterOptions
  ) as ReporterOptions;

  const result = JSON.parse(process.env.result) as Result;

  return await new HttpService(reporterOptions).updateStatus(result);
})()
  .then(() => exit())
  .catch(() => exit(1));
