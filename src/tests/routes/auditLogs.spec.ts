import { app } from '../../index';
import request from 'supertest';
import { DataSource, EntityMetadata, TypeORMError } from 'typeorm';
import * as PINAuditLog from '../../db/PINAuditLog.db';
import { AuditLogMultiResponse } from '../commonResponses';

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

describe('Audit log endpoints', () => {
    test('/audit-trails with typeORM error returns 422', async () => {
        jest.spyOn(PINAuditLog, 'findAuditLog').mockImplementationOnce(
            async () => {
                throw new TypeORMError('An error occurred');
            },
        );

        const res = await request(app)
            .get('/audit-trails')
            .query({ livePinIds: '31be8df8-3284-4b05-bb2b-f11b7e77cba0' });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('An error occurred');
    });

    test('/audit-trails with unknown error returns 500', async () => {
        jest.spyOn(PINAuditLog, 'findAuditLog').mockImplementationOnce(
            async () => {
                throw new Error('An unknown error occurred');
            },
        );

        const res = await request(app)
            .get('/audit-trails')
            .query({ livePinIds: '31be8df8-3284-4b05-bb2b-f11b7e77cba0' });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('An unknown error occurred');
    });

    test('/audit-trails should return an audit log with 200', async () => {
        jest.spyOn(PINAuditLog, 'findAuditLog').mockImplementationOnce(
            async () => {
                return AuditLogMultiResponse;
            },
        );

        const res = await request(app)
            .get('/audit-trails')
            .query({ livePinIds: '31be8df8-3284-4b05-bb2b-f11b7e77cba0' });
        expect(res.statusCode).toBe(200);
        expect(res.body.logs).toBeDefined();
        expect(res.body.logs.length).toBe(2);
        expect(res.body.logs[0].livePinId).toBe(
            '31be8df8-3284-4b05-bb2b-f11b7e77cba0',
        );
        expect(res.body.logs[1].livePinId).toBe(
            '31be8df8-3284-4b05-bb2b-f11b7e77cba0',
        );
    });

    test('/audit-trails with duplicate query should return 200', async () => {
        jest.spyOn(PINAuditLog, 'findAuditLog').mockImplementationOnce(
            async () => {
                return AuditLogMultiResponse;
            },
        );

        const res = await request(app)
            .get('/audit-trails')
            .query({
                livePinIds:
                    '31be8df8-3284-4b05-bb2b-f11b7e77cba0|31be8df8-3284-4b05-bb2b-f11b7e77cba0',
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.logs).toBeDefined();
        expect(res.body.logs.length).toBe(2);
        expect(res.body.logs[0].livePinId).toBe(
            '31be8df8-3284-4b05-bb2b-f11b7e77cba0',
        );
        expect(res.body.logs[1].livePinId).toBe(
            '31be8df8-3284-4b05-bb2b-f11b7e77cba0',
        );
    });

    test('/audit-trails with no pin in query but | returns 422', async () => {
        jest.spyOn(PINAuditLog, 'findAuditLog').mockImplementationOnce(
            async () => {
                return AuditLogMultiResponse;
            },
        );

        const res = await request(app)
            .get('/audit-trails')
            .query({ livePinIds: '|' });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'No pin ids were provided in the request',
        );
    });
});
