import { Status } from "../enums/status.enum";

export interface Result {
  status: Status;
  screenshot?: string;
  testRunResultKey: string;
}
