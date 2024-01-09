import { DataSource, EntityMetadata, Repository } from 'typeorm';
import { createAPIAuditLog } from '../../db/VHERSAuditLog.db';
import { VHERSAuditLogResponse } from '../commonResponses';

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

describe('VHERS Audit Log tests', () => {
    test('createAPIAuditLog returns sucessfully', async () => {
        jest.spyOn(Repository.prototype, 'create').mockImplementationOnce(
            async () => {
                return VHERSAuditLogResponse;
            },
        );
        jest.spyOn(Repository.prototype, 'save').mockImplementationOnce(
            async () => {
                return VHERSAuditLogResponse;
            },
        );
        const res = await createAPIAuditLog(
            'POST /pins/verify',
            undefined,
            undefined,
            undefined,
            123.45,
        );
        expect(res.statusCode).toBe(500);
    });
});
