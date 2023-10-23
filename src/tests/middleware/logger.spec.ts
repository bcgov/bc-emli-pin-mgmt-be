process.env.NODE_ENV = 'development';
import logger from '../../middleware/logger';

describe('logger tests', () => {
    test('logger uses different levels in development', () => {
        expect(logger.isSillyEnabled()).toBeTruthy;
    });
    afterAll(() => {
        process.env.NODE_ENV = 'test';
        jest.resetModules();
    });
});
