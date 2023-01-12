export interface ReporterOptions {
  [key: string]: string | undefined;
  domain?: string;
  apiToken?: string;
  projectKey?: string;
  testRunKey?: string;
  screenshotsFolder?: string;
}
