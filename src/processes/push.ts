import axios from 'axios';
import {} from 'colors';
import { exit } from 'process';
import { ReporterOptions } from '../interfaces/reporter-options.interface';
import { Result } from '../interfaces/result.interface';
import { PushResponse } from '../interfaces/api/push.response';

const { result, reporterOptions } = process.env;

if (result === undefined || reporterOptions === undefined) {
    exit(1);
}

const { projectKey, testRunKey, apiToken, domain } = JSON.parse(reporterOptions) as ReporterOptions;
const { status, testRunResultKey } = JSON.parse(result) as Result

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

await (async () => {
    const data: PushResponse = await axios({
        method: 'PATCH',
        url: 'https://api.qatouch.com/api/v1/testRunResults/status',
        params: {
            status,
            project: projectKey,
            test_run: testRunKey,
            run_result: testRunResultKey,
            comments: 'Published from Cypress'
        },
        headers: {
            'api-token': apiToken,
            domain,
            'Content-Type': 'application/json'
        }
    })
    .then(response => (response.data as PushResponse))
    .catch(() => ({ success: false}))

    if (!data.success) {
        console.log(
            `[QATouch] An error occurred while updating test result "${testRunResultKey}" with status "${
                status
            }": ${JSON.stringify(data)}"`.red
        );
    }
})();
