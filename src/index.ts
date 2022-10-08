import { Runner, Test } from 'mocha';
import {} from 'colors';
import { ReporterOptions } from './interfaces/reporter-options.interface';
import { spawn } from 'child_process';

/**
 * CypressQaTouchReporter class
 *
 * Manages cypress/mocha test runner event and publishes results to QA Touch
 */
export class CypressQaTouch {
    private __reporterOptions: ReporterOptions;

    constructor(runner: Runner, options: { reporterOptions: ReporterOptions }) {
        this.__reporterOptions = options.reporterOptions;

        this.validateReporterOptions(['domain', 'apiToken', 'projectKey', 'testRunKey']);

        runner.on(Runner.constants.EVENT_TEST_PASS, (test: Test) => {
            this.push('passed', test.title);
        });

        runner.on(Runner.constants.EVENT_TEST_PASS, (test: Test) => {
            this.push('untested', test.title);
        });

        runner.on(Runner.constants.EVENT_TEST_PASS, (test: Test) => {
            this.push('failed', test.title);
        });
    }

    /**
     * Validate the existence of options
     * @param {string[]} options options to be validated
     */
     validateReporterOptions(options: string[]) {
        if (!this.__reporterOptions) {
            throw new Error('Missing reporterOptions in cypress config');
        }

        options.forEach(
            (option: string) => {
                if (!this.__reporterOptions[option]) {
                    throw new Error('Missing ' + option + ' value. Please update reporterOptions in cypress.json');
                }
            }
        )
    }

    /**
     * Initialize child process to push results to QATouch
     *
     * @param {string} status the status of the test
     * @param {string} title the title of the test
     */
    push(status: string, title: string) {
        const testRunResultKey = /^\[QATouch\-([A-Za-z0-9]+)\]/.exec(title)?.[1];

        if (testRunResultKey) {
            spawn('node', [`${__dirname}/child_processes/push.js`], {
                detached: true, // To detach the child process from the parent process
                stdio: 'inherit', // To inherit the parent process stdio which makes the sub process write to the main parent terminal window
                env: Object.assign(process.env, {
                    reporterOptions: JSON.stringify(this.__reporterOptions),
                    result: JSON.stringify({
                        testRunResultKey,
                        status
                    })
                })
            }).unref();
        } else {
            console.warn(
                `[QATouch] The test "${title}" does not seem to have a test result key "[QATouch-XXX])"`.yellow
            );
        }
    }
}
