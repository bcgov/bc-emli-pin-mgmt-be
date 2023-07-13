import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    automock: false,
    setupFiles: ['./src/tests/setupJest.ts'],
}

export default jestConfig
