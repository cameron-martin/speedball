type Test = (name: string, test?: (() => void)) => void;
type TestWrapper = (name: string, tests: (() => void)) => void;

declare var suite: TestWrapper;
declare var test: Test;

declare var setup: (f: () => void) => void;
