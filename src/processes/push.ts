import axios from 'axios';
import {} from 'colors';
import { ReporterOptions } from '../interfaces/reporter-options.interface';
import { Result } from '../interfaces/result.interface';

const result: Result = JSON.parse(process.env.result as string);
const reporterOptions: ReporterOptions = JSON.parse(process.env.reporterOptions as string) as ReporterOptions;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

(async () => {
    const response = await axios({
        method: 'PATCH',
        url: 'https://api.qatouch.com/api/v1/testRunResults/status',
        params: {
            status: result.status,
            project: reporterOptions.projectKey,
            test_run: reporterOptions.testRunKey,
            run_result: result.testRunResultKey,
            comments: 'Published from Cypress'
        },
        headers: {
            'api-token': reporterOptions.apiToken,
            domain: reporterOptions.domain,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.data)
        .catch(error => error);

    if (!response?.success) {
        console.log(
            `[QATouch] An error occurred while updating test result "${result.testRunResultKey}" with status "${
                result.status
            }": ${JSON.stringify(response)}"`.red
        );
    }
})();
