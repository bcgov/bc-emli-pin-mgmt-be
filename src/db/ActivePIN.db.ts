import { AppDataSource } from '../data-source';
import { ActivePin } from '../entity/ActivePin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findPin(
    select?: object,
    where?: object,
): Promise<ActivePin[] | any> {
    const PINRepo = await AppDataSource.getRepository(ActivePin);
    console.log(select, where);
    const query = {
        select: select ? select : undefined,
        where: where ? where : undefined,
    };
    let result;
    if (query.where === undefined && query.select === undefined) {
        result = await PINRepo.find();
    } else {
        result = await PINRepo.find(query);
    }
    return result;
}