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

const MAX_CONCURRENT_TESTS = 10;

Rx.Observable.from(createTestCases(config)).flatMap(runTest, MAX_CONCURRENT_TESTS).toArray().subscribe(printResults);

function createTestCases(config: TestConfig[]): TestCase[] {
    return flatMap(config, config => glob.sync(config.files).map(fileName => ({
        fileName,
        expectedResult: config.expectedResult
    })));
}

function runTest(testCase: TestCase): Promise<TestResult> {
    return checkTsFileAsync(testCase.fileName).then(actualResult => ({
        ...testCase,
        actualResult
    }))
}

function printResults(results: TestResult[]): void {
    results.forEach(element => {
        console.log(element.fileName, element.actualResult === element.expectedResult);
    });

    const allPassed = results.every(result => result.actualResult === result.expectedResult);

    process.exit(allPassed ? 0 : 1);
}

interface TestConfig {
    files: string;
    expectedResult: boolean;
}

interface TestCase {
    fileName: string;
    expectedResult: boolean;
}

interface TestResult {
    fileName: string;
    expectedResult: boolean;
    actualResult: boolean;
}

// function checkTsFile(fileName: string): boolean {
//     var result = child_process.spawnSync('tsc', ['--noEmit', '--lib', 'es2015', fileName], { encoding: 'utf8' });

//     return result.status === 0;
// }

function checkTsFileAsync(fileName: string): Promise<boolean> {
    var result = child_process.spawn('tsc', ['--noEmit', '--lib', 'es2015', fileName]);

    return new Promise<boolean>((resolve, reject) => {
        result.once('close', code => {
            resolve(code === 0);
        });
    })
}
