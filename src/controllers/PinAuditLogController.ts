import { Controller, Get, Query, Res, Route, TsoaResponse } from 'tsoa';
import logger from '../middleware/logger';
import { findAuditLog } from '../db/PINAuditLog.db';
import { TypeORMError } from 'typeorm';
import {
    GenericTypeORMErrorType,
    auditLogReturn,
    serverErrorType,
    auditLogInfo,
    requiredFieldErrorType,
} from '../helpers/types';

@Route('audit-trails')
export class PinAuditLogController extends Controller {
    /**
     * Gets the audit logs for a vertical bar seperated (|) string of livePinIds. Limited to 500 logs.
     * Expected error codes and messages:
     * - `422`
     * 	-- `invalid input syntax for type uuid: 'your query here'`
     * - `500`
     * 	-- `Internal Server Error`
     * @param livePinIds The list of ids for the pins, seperated by a vertical bar (|)
     * @returns The audit logs for a particular pin
     */
    @Get('')
    public async getAuditLogs(
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Query() livePinIds: string,
    ): Promise<auditLogReturn | undefined> {
        let res: { [x: string]: { [x: string]: any } };

        try {
            // to do: verification by role
            const parsedPinIDs = livePinIds.split('|');
            if (
                parsedPinIDs.length === 0 ||
                (parsedPinIDs.length >= 1 && parsedPinIDs[0] === '')
            ) {
                throw new Error('No pin ids were provided in the request');
            }
            let where;
            if (parsedPinIDs.length === 1) {
                where = { livePinId: parsedPinIDs[0] };
            } else {
                where = [];
                for (let i = 0; i < parsedPinIDs.length; i++) {
                    where.push({ livePinId: parsedPinIDs[i] });
                }
            }
            const select = {
                logId: true,
                expiredAt: true,
                updatedAt: true,
                action: true,
                expirationReason: true,
                sentToEmail: true,
                sentToPhone: true,
                logCreatedAt: true,
                pinCreatedAt: true,
                alteredByUsername: true,
                livePinId: true,
            };
            res = await findAuditLog(select, where);
            // delete undefined properties
            for (const r in res) {
                Object.keys(res[r]).forEach((key) =>
                    res[r][key] === undefined ? delete res[r][key] : {},
                );
            }
            return { logs: res as unknown as auditLogInfo[] };
        } catch (err) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORMError in getAuditLogs: ${err.message}`,
                );
                return typeORMErrorResponse(422, {
                    message: err.message,
                } as GenericTypeORMErrorType);
            } else if (err instanceof Error) {
                if (err.message === 'No pin ids were provided in the request') {
                    logger.warn(
                        `Encountered RequiredFieldError in getAuditLogs: ${err.constructor.name} ${err.message}`,
                    );
                    return requiredFieldErrorResponse(422, {
                        message: err.message,
                    });
                }
                logger.warn(
                    `Encountered unknown Internal Server Error in getAuditLogs: ${err.constructor.name} ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
    }
}
