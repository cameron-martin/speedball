import * as glob from 'glob';
import flatMap = require('lodash/flatMap');

import * as Rx from 'rxjs/Rx';
import * as child_process from 'child_process';

const config: TestConfig[] = [
    {
        files: './type_tests/**/*.succeeds.ts',
        expectedResult: true
    },
    {
        files: './type_tests/**/*.fails.ts',
        expectedResult: false
    }
];

function testPassed(testResult: TestResult): boolean {
    return testResult.actualResult === testResult.expectedResult;
}

const MAX_CONCURRENT_TESTS = 10;

const testCases = createTestCases(config);

console.log(printTapHeader(testCases.length));

Rx.Observable.from(testCases).flatMap(runTest, MAX_CONCURRENT_TESTS).map(printTapLine).subscribe(console.log);

function createTestCases(config: TestConfig[]): TestCase[] {
    let number = 1;

    return flatMap(config, config => glob.sync(config.files).map(fileName => (number++, {
        fileName,
        expectedResult: config.expectedResult,
        number,
    })));
}

function runTest(testCase: TestCase): Promise<TestResult> {
    return checkTsFile(testCase.fileName).then(actualResult => ({
        ...testCase,
        actualResult
    }))
}

function printTapHeader(count: number) {
    return `1..${count}`;
}

function printTapLine(testResult: TestResult, index: number) {
    return `${testPassed(testResult) ? 'ok' : 'not ok'} ${index + 1} ${testResult.fileName}`;
}

interface TestConfig {
    files: string;
    expectedResult: boolean;
}

interface TestCase {
    fileName: string;
    expectedResult: boolean;
    number: number;
}

interface TestResult extends TestCase {
    actualResult: boolean;
}

function checkTsFile(fileName: string): Promise<boolean> {
    var result = child_process.spawn('tsc', ['--noEmit', '--lib', 'es2015', fileName]);

    return new Promise<boolean>((resolve, reject) => {
        result.once('close', code => {
            resolve(code === 0);
        });
    })
}
