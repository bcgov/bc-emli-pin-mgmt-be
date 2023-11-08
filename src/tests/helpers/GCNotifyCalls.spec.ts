import GCNotifyCaller from '../../helpers/GCNotifyCaller';
import {
    sendAccessApproveAndRejectNotifications,
    sendAccessRequestNotifications,
    sendDeactiveUserNotifications,
    sendUpdateUserNotifications,
} from '../../helpers/GCNotifyCalls';
import {
    GCNotifyEmailErrorResponse,
    GCNotifyEmailSuccessResponse,
    AccessRequestBody,
    AccessRequestUpdateRequestBody,
    UserDeactivateRequestBody,
    UserUpdateRequestBody,
} from '../commonResponses';

jest.mock('notifications-node-client', () => {
    return {
        NotifyClient: jest.fn().mockImplementation(() => {
            return {};
        }),
    };
});

describe('GCNotify Calls tests', () => {
    test('testing successful sendAccessRequestNotifications() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const response = await sendAccessRequestNotifications(
            AccessRequestBody,
        );
        expect(response).toBe(true);
    });

    test('testing unsuccessful sendAccessRequestNotifications() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        const response = await sendAccessRequestNotifications(
            AccessRequestBody,
        );
        expect(response).toBe(undefined);
    });

    test('testing successful sendAccessApproveAndRejectNotifications() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const response = await sendAccessApproveAndRejectNotifications(
            AccessRequestUpdateRequestBody,
            'fake-template-id',
        );
        expect(response).toBe(true);
    });

    test('testing unsuccessful sendAccessApproveAndRejectNotifications() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        const response = await sendAccessApproveAndRejectNotifications(
            AccessRequestUpdateRequestBody,
            'fake-template-id',
        );
        expect(response).toBe(undefined);
    });

    test('testing successful sendDeactiveUserNotifications() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const response = await sendDeactiveUserNotifications(
            UserDeactivateRequestBody,
            'fake-template-id',
        );
        expect(response).toBe(true);
    });

    test('testing successful sendDeactiveUserNotifications() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        const response = await sendDeactiveUserNotifications(
            UserDeactivateRequestBody,
            'fake-template-id',
        );
        expect(response).toBe(undefined);
    });

    test('testing successful sendUpdateUserNotifications() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const response = await sendUpdateUserNotifications(
            UserUpdateRequestBody,
            'fake-template-id',
        );
        expect(response).toBe(true);
    });

    test('testing successful sendUpdateUserNotifications()  call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            throw GCNotifyEmailErrorResponse;
        });
        const response = await sendUpdateUserNotifications(
            UserUpdateRequestBody,
            'fake-template-id',
        );
        expect(response).toBe(undefined);
    });
});
