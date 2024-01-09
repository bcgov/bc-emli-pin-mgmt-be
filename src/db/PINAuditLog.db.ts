import { PinAuditLog } from '../entity/PinAuditLog';
import { AppDataSource } from '../data-source';
import { FindOptionsOrderValue } from 'typeorm';

export async function findAuditLog(
    select?: object,
    where?: object,
): Promise<PinAuditLog[] | any> {
    const LogRepo = await AppDataSource.getRepository(PinAuditLog);
    const query = {
        select: select ? select : undefined,
        where: where ? where : undefined,
        order: { logCreatedAt: 'DESC' as FindOptionsOrderValue },
        take: 500, // max 500 results, I can't imagine anywhere near this unless someone was trying to break the server
    };
    let result;
    if (query.where === undefined && query.select === undefined) {
        result = await LogRepo.find({ order: { logCreatedAt: 'DESC' } });
    } else {
        result = await LogRepo.find(query);
    }
    return result;
}
