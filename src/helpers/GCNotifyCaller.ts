// eslint-disable-next-line @typescript-eslint/no-var-requires
const NotifyClient = require('notifications-node-client').NotifyClient;
import logger from '../middleware/logger';
import { gcNotifyError } from './types';

export default class GCNotifyCaller {
    // The number of times you want to retry sending the text / email, read in from the environment variables
    private retryLimit: number;

    constructor() {
        this.retryLimit = process.env.GC_NOTIFY_RETRY_LIMIT
            ? Number.isInteger(parseInt(process.env.GC_NOTIFY_RETRY_LIMIT)) &&
              parseInt(process.env.GC_NOTIFY_RETRY_LIMIT) > 0
                ? parseInt(process.env.GC_NOTIFY_RETRY_LIMIT)
                : 3
            : 3;
    }

    // Private functions for jest mocking
    private async sendEmail(
        notifyClient: unknown,
        templateId: string,
        email: string,
        personalisation?: object,
    ) {
        return await (notifyClient as any).sendEmail(
            templateId,
            email,
            personalisation,
        );
    }

    private async sendSms(
        notifyClient: unknown,
        templateId: string,
        phone: string,
        personalisation?: object,
    ) {
        return await (notifyClient as any).sendSms(
            templateId,
            phone,
            personalisation,
        );
    }

    /**
     * Sends a GCNotify email to the specified email address.
     * @param templateId is the templateId for the email
     * @param email is the email address you wish to send the email to
     * @param personalisation is an object with the parameters that can be customized in the template (ex: name, PIN)
     * @returns true if GCNotify returns a 2xx response code, or an error otherwise
     */
    public async sendEmailNotification(
        templateId: string,
        email: string,
        personalisation?: object,
    ) {
        const notifyClient = new NotifyClient(
            process.env.GC_NOTIFY_URL as string,
            process.env.GC_NOTIFY_API_KEY as string,
        );
        // Attempt to send email x number of times. Throw error otherwise
        for (let i = 0; i < this.retryLimit; i++) {
            try {
                if (personalisation && Object.hasOwn(personalisation, 'pin')) {
                    (personalisation as any).pin =
                        ((personalisation as any).pin as string).substring(
                            0,
                            4,
                        ) +
                        '-' +
                        ((personalisation as any).pin as string).substring(4);
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await this.sendEmail(
                    notifyClient,
                    templateId,
                    email,
                    { personalisation: personalisation },
                );
                return true;
            } catch (err) {
                let message =
                    `Error(s) sending GCNotify email - ` +
                    (err as gcNotifyError).response.status +
                    ` ` +
                    (err as gcNotifyError).response.statusText +
                    `:`;
                for (const error of (err as gcNotifyError).response.data
                    .errors) {
                    message =
                        message + `\n` + error.error + `: ` + error.message;
                }
                logger.error(message);
                if (i + 1 === this.retryLimit) {
                    throw new Error(message);
                }
                continue;
            }
        }
    }

    /**
     * Sends a GCNotify text to the specified phone number.
     * @param templateId is the templateId for the text message
     * @param phone is the phone number you wish to send the text to, in string format
     * @param personalisation is an object with the parameters that can be customized in the template (ex: name, PIN)
     * @returns true if GCNotify returns a 2xx response code, or an error otherwise
     */
    public async sendPhoneNotification(
        templateId: string,
        phone: string,
        personalisation?: object,
    ) {
        const notifyClient = new NotifyClient(
            process.env.GC_NOTIFY_URL as string,
            process.env.GC_NOTIFY_API_KEY as string,
        );
        // Attempt to send text x number of times. Throw error otherwise
        for (let i = 0; i < this.retryLimit; i++) {
            try {
                if (personalisation && Object.hasOwn(personalisation, 'pin')) {
                    (personalisation as any).pin =
                        ((personalisation as any).pin as string).substring(
                            0,
                            4,
                        ) +
                        '-' +
                        ((personalisation as any).pin as string).substring(4);
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await this.sendSms(
                    notifyClient,
                    templateId,
                    phone,
                    { personalisation: personalisation },
                );
                return true;
            } catch (err) {
                let message =
                    `Error(s) sending GCNotify text - ` +
                    (err as gcNotifyError).response.status +
                    ` ` +
                    (err as gcNotifyError).response.statusText +
                    `:`;
                for (const error of (err as gcNotifyError).response.data
                    .errors) {
                    message =
                        message + `\n` + error.error + `: ` + error.message;
                }
                logger.error(message);
                if (i + 1 === this.retryLimit) {
                    throw new Error(message);
                }
                continue;
            }
        }
    }

    /**
     * Sends a GCNotify email and text to the specified email and phone number.
     * @param templateId is the templateId for the text message
     * @param email is the email address you wish to send the email to
     * @param phone is the phone number you wish to send the text to, in string format
     * @param personalisation is an object with the parameters that can be customized in the template (ex: name, PIN)
     * @returns true if GCNotify returns a 2xx response code, or an error otherwise
     */
    public async sendEmailAndPhoneNotification(
        emailTemplateId: string,
        phoneTemplateId: string,
        email: string,
        phone: string,
        personalisation?: object,
    ) {
        const notifyClient = new NotifyClient(
            process.env.GC_NOTIFY_URL as string,
            process.env.GC_NOTIFY_API_KEY as string,
        );

        let phoneResponse;
        let emailResponse;

        // Attempt to send text x number of times. Throw error otherwise
        for (let i = 0; i < this.retryLimit; i++) {
            if (personalisation && Object.hasOwn(personalisation, 'pin')) {
                (personalisation as any).pin =
                    ((personalisation as any).pin as string).substring(0, 4) +
                    '-' +
                    ((personalisation as any).pin as string).substring(4);
            }

            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                emailResponse = await this.sendEmail(
                    notifyClient,
                    emailTemplateId,
                    email,
                    { personalisation: personalisation },
                );

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                phoneResponse = await this.sendSms(
                    notifyClient,
                    phoneTemplateId,
                    phone,
                    { personalisation: personalisation },
                );

                if (emailResponse | phoneResponse) {
                    return true;
                }
            } catch (err) {
                if (emailResponse) {
                    return true;
                } else {
                    try {
                        if (!phoneResponse) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            phoneResponse = await this.sendSms(
                                notifyClient,
                                phoneTemplateId,
                                phone,
                                { personalisation: personalisation },
                            );
                        }
                        return emailResponse | phoneResponse ? true : false;
                    } catch {
                        let message =
                            `Error(s) sending GCNotify email & text - ` +
                            (err as gcNotifyError).response.status +
                            ` ` +
                            (err as gcNotifyError).response.statusText +
                            `:`;
                        for (const error of (err as gcNotifyError).response.data
                            .errors) {
                            message =
                                message +
                                `\n` +
                                error.error +
                                `: ` +
                                error.message;
                        }
                        logger.error(message);
                        if (i + 1 === this.retryLimit) {
                            throw new Error(message);
                        }

                        return emailResponse | phoneResponse ? true : false;
                    }
                }
            }
        }
    }
}
