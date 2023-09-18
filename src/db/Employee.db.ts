import { Employee } from '../entity/Employee';
import { Permission } from '../entity/Permission';
import { AppDataSource } from '../data-source';
import { UserRoles } from '../helpers/types';

export async function findEmployee(
    select?: object,
    where?: object,
): Promise<Employee[] | any> {
    const userRepo = await AppDataSource.getRepository(Employee);
    const query = {
        select: select ? select : undefined,
        where: where ? where : undefined,
    };
    let result;
    if (query.where === undefined && query.select === undefined) {
        result = await userRepo.find();
    } else {
        result = await userRepo.find(query);
    }
    return result;
}

export async function findPermissionByRole(role: UserRoles): Promise<any> {
    const permissionRepo = await AppDataSource.getRepository(Permission);

    const query = {
        select: { permission: true },
        where: { role: role },
    };
    let result;
    if (query.where === undefined && query.select === undefined) {
        result = await permissionRepo.find();
    } else {
        result = await permissionRepo.find(query);
    }
    return result;
}
