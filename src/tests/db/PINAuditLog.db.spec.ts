import { DataSource, EntityMetadata, Repository } from 'typeorm';
import { AuditLogMultiResponse } from '../commonResponses';
import * as PINAuditLog from '../../db/PINAuditLog.db';

// mock out db
jest.mock('typeorm', () => {
    const actual = jest.requireActual('typeorm');
    return {
        ...actual,
        getRepository: jest.fn(),
    };
});

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

describe('Audit Log DB tests', () => {
    test('findAuditLog successful search empty select & where sorts desc', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return AuditLogMultiResponse;
            },
        );

        const res = await PINAuditLog.findAuditLog();
        expect(res.length).toBe(2);
        const firstDate = new Date(res[0].logCreatedAt);
        const secondDate = new Date(res[1].logCreatedAt);
        const isDesc = firstDate >= secondDate ? true : false;
        expect(isDesc).toBeTruthy();
    });
    test('findAuditLog successful search with where and select', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                if (AuditLogMultiResponse[1].action === 'C')
                    return [AuditLogMultiResponse[1]];
                else return [];
            },
        );

        const res = await PINAuditLog.findAuditLog(
            {
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
            },
            { action: 'C' },
        );
        expect(res.length).toBe(1);
        expect(res[0].action).toBe('C');
    });
});
