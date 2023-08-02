import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    automock: false,
    setupFiles: ['./src/tests/setupJest.ts'],
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/([a-zA-Z_]*).{js,ts}',
        '!**/*.spec.{js,ts}',
        '!dist/**/*.spec.{js,ts}',
        '!src/build/**/*.{js,ts}',
        '!src/routes/**/*.{js,ts}',
        '!src/entity/**/*.{js,ts}',
    ],
    testPathIgnorePatterns: ['dist/tests/*'],
};

export default jestConfig;
