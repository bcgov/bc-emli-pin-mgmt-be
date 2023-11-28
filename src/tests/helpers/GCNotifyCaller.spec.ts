import GCNotifyCaller from '../../helpers/GCNotifyCaller';
import {
    GCNotifyEmailErrorResponse,
    GCNotifyEmailSuccessResponse,
} from '../commonResponses';

jest.mock('notifications-node-client', () => {
    return {
        NotifyClient: jest.fn().mockImplementation(() => {
            return {};
        }),
    };
});

describe('GCNotify Caller tests', () => {
    afterEach(() => {
        process.env.GC_NOTIFY_RETRY_LIMIT = '2';
    });
    test('construct GCNotifyCaller with not given retry limit', () => {
        const caller = new GCNotifyCaller();
        expect((caller as any).retryLimit).toBe(3);
    });
    test('construct GCNotifyCaller with non-numeric retry limit', () => {
        process.env.GC_NOTIFY_RETRY_LIMIT = 'hijk';
        const caller = new GCNotifyCaller();
        expect((caller as any).retryLimit).toBe(3);
    });
    test('sendEmailNotification should work with the correct email address and parameters', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const caller = new GCNotifyCaller();
        const response = await caller.sendEmailNotification(
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'example@example.com',
            {
                line_1: 'This is a test.',
                line_2: 'This should work',
                pin: 'abcdefg',
            },
        );
        expect(response).toBe(true);
    });

    test('sendEmailNotification should work with the correct email address and parameters', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const caller = new GCNotifyCaller();
        const response = await caller.sendEmailNotification(
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'example@example.com',
            {
                line_1: 'This is a test.',
                line_2: 'This should work',
                pin: 'abcdefg',
            },
        );
        expect(response).toBe(true);
    });

    test('sendEmailNotification should throw an error upon failure', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        const caller = new GCNotifyCaller();
        await expect(
            caller.sendEmailNotification(
                'cf430240-e5b6-4224-bd71-a02e098cc6e7',
                'example@example.com',
                {},
            ),
        ).rejects.toThrow(
            'Error(s) sending GCNotify email - 400 Bad Request:\nBadRequestError: Template not found',
        );
    });

    test('sendPhoneNotification should work with the correct number and parameters', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const caller = new GCNotifyCaller();
        const response = await caller.sendPhoneNotification(
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            '19021234567',
            { line_1: 'This is a test.', line_2: 'This should work' },
        );
        expect(response).toBe(true);
    });

    test('sendPhoneNotification should throw an error upon failure', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        const caller = new GCNotifyCaller();
        await expect(
            caller.sendPhoneNotification(
                'cf430240-e5b6-4224-bd71-a02e098cc6e7',
                '19021234567',
                { pin: 'ABCD1234' },
            ),
        ).rejects.toThrow(
            'Error(s) sending GCNotify text - 400 Bad Request:\nBadRequestError: Template not found',
        );
    });

    test('sendEmailAndPhoneNotification should work with the correct parameters', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const caller = new GCNotifyCaller();
        const response = await caller.sendEmailAndPhoneNotification(
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'abc@example.com',
            '19021234567',
            { line_1: 'This is a test.', line_2: 'This should work' },
        );
        expect(response).toBe(true);
    });

    test('sendEmailAndPhoneNotification should work with one email failure', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const caller = new GCNotifyCaller();
        const response = await caller.sendEmailAndPhoneNotification(
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'abc@example.com',
            '19021234567',
            { line_1: 'This is a test.', line_2: 'This should work' },
        );
        expect(response).toBe(true);
    });

    test('sendEmailAndPhoneNotification should return false with one email failure and phone response undefined', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(undefined);
        const caller = new GCNotifyCaller();
        const response = await caller.sendEmailAndPhoneNotification(
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'cf430240-e5b6-4224-bd71-a02e098cc6e8',
            'abc@example.com',
            '19021234567',
            { line_1: 'This is a test.', line_2: 'This should work' },
        );
        expect(response).toBe(false);
    });

    test('sendEmailAndPhoneNotification should throw error on repeat failures', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        const caller = new GCNotifyCaller();
        await expect(
            caller.sendEmailAndPhoneNotification(
                'cf430240-e5b6-4224-bd71-a02e098cc6e8',
                'cf430240-e5b6-4224-bd71-a02e098cc6e8',
                'abc@example.com',
                '19021234567',
                { line_1: 'This is a test.', line_2: 'This should work' },
            ),
        ).rejects.toThrow(
            'Error(s) sending GCNotify email & text - 400 Bad Request:\nBadRequestError: Template not found',
        );
    });
});
