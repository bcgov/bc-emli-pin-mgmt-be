import { AppDataSource } from '../data-source';
import { VhersAuditLog } from '../entity/VhersAuditLog';
import logger from '../middleware/logger';

export async function createAPIAuditLog(
    endpointName: string,
    requestBody: object | undefined,
    responseBody: string | undefined,
    statusCode: number | undefined,
    responseTimeMs: number,
): Promise<VhersAuditLog | any> {
    try {
        const VhersAuditLogRepo = await AppDataSource.getRepository(
            VhersAuditLog,
        );
        const params: {
            responseTimeMs: number;
            endpointName: string;
            statusCode: number;
            requestBody?: object;
            responseBody?: object;
        } = {
            responseTimeMs,
            endpointName,
            statusCode: statusCode ? statusCode : 500,
        };
        if (requestBody) params.requestBody = requestBody;
        if (responseBody) params.responseBody = JSON.parse(responseBody);
        const newLog = VhersAuditLogRepo.create(params);
        const result = await VhersAuditLogRepo.save(newLog);
        return result;
    } catch (err) {
        if (err instanceof Error) {
            logger.error(
                `Caught ${err.name} in createAPIAuditLog: ${err.message}`,
            );
            // we don't throw this error because we don't want the function to fail on this error
        }
    }
}
