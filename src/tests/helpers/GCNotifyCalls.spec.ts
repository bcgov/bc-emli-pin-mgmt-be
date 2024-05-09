import GCNotifyCaller from '../../helpers/GCNotifyCaller';
import {
    sendAccessApproveAndRejectNotifications,
    sendAccessRequestNotifications,
    sendCreateRegenerateOrExpireNotification,
    sendDeactiveUserNotifications,
    sendUpdateUserNotifications,
    standardizeRole,
} from '../../helpers/GCNotifyCalls';
import {
    GCNotifyEmailErrorResponse,
    GCNotifyEmailSuccessResponse,
    AccessRequestBody,
    AccessRequestUpdateRequestBody,
    UserDeactivateRequestBody,
    UserUpdateRequestBody,
    validCreatePinBodyName,
    AccessRequestBodyStandard,
    validCreatePinBodySinglePid,
    validCreatePinBodyPhoneOnly,
} from '../commonResponses';
import * as Users from '../../db/Users.db';

jest.mock('notifications-node-client', () => {
    return {
        NotifyClient: jest.fn().mockImplementation(() => {
            return {};
        }),
    };
});

describe('GCNotify Calls tests', () => {
    test('standardizeRole returns SuperAdmin', () => {
        const formattedRole = standardizeRole('SuperAdmin');
        expect(formattedRole).toBe('System administrator');
    });

    test('standardizeRole returns Standard', () => {
        const formattedRole = standardizeRole('Standard');
        expect(formattedRole).toBe('Customer support agent');
    });

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

    test('testing successful sendAccessRequestNotifications call standard user', async () => {
        jest.spyOn(GCNotifyCaller.prototype as any, 'sendEmail')
            .mockResolvedValueOnce(GCNotifyEmailSuccessResponse)
            .mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        jest.spyOn(Users, 'findUser').mockResolvedValueOnce([
            { email: 'abc@abc.com' },
            { email: 'abc@abc.com' },
        ]);
        const response = await sendAccessRequestNotifications(
            AccessRequestBodyStandard,
        );
        expect(response).toBe(true);
    });

    test('testing unsuccessful sendAccessRequestNotifications call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmailNotification',
        ).mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        await expect(
            sendAccessRequestNotifications(AccessRequestBody),
        ).rejects.toThrow(
            'Encountered Error calling sendAccessRequestNotifications: Oops!',
        );
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

    test('testing successful sendCreateRegenerateOrExpireNotification() call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);
        const response = await sendCreateRegenerateOrExpireNotification(
            validCreatePinBodyName,
            'fake-template-id',
            'fake-template-id',
            {
                pin: '12345678',
            },
        );
        expect(response).toBe(true);
    });

    test('testing unsuccessful sendCreateRegenerateOrExpireNotification call', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmailAndPhoneNotification',
        ).mockImplementationOnce(async () => {
            return false;
        });
        await expect(
            sendCreateRegenerateOrExpireNotification(
                validCreatePinBodyName,
                'fake-email-template-id',
                'fake-phone-template-id',
                {
                    pin: '12345678',
                },
            ),
        ).rejects.toThrow(
            `Encountered Error calling sendCreateRegenerateOrExpireNotification: Failed to send email and phone GC Notify Notification.`,
        );
    });

    test('testing successful sendCreateRegenerateOrExpireNotification call email only', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockImplementationOnce(async () => {
            return GCNotifyEmailSuccessResponse;
        });
        const response = await sendCreateRegenerateOrExpireNotification(
            validCreatePinBodySinglePid,
            'fake-email-template-id',
            'fake-phone-template-id',
            {
                pin: '12345678',
            },
        );
        expect(response).toBe(true);
    });

    test('testing successful sendCreateRegenerateOrExpireNotification call phone only', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockImplementationOnce(async () => {
            return GCNotifyEmailSuccessResponse;
        });
        const response = await sendCreateRegenerateOrExpireNotification(
            validCreatePinBodyPhoneOnly,
            'fake-email-template-id',
            'fake-phone-template-id',
            {},
        );
        expect(response).toBe(true);
    });
});
