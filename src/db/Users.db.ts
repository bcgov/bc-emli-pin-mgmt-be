import { Users } from '../entity/Users';
import { Permission } from '../entity/Permission';
import { AppDataSource } from '../data-source';
import { UserRoles } from '../helpers/types';
import { FindOptionsOrderValue } from 'typeorm';

export async function findUser(
    select?: object,
    where?: object,
): Promise<Users[] | any> {
    const userRepo = await AppDataSource.getRepository(Users);
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
    const result = await permissionRepo.find(query);
    return result;
}

/* The `getUserList` function is retrieving a list of users from the database. It
accepts an optional `where` parameter to filter the results. The function uses
the `AppDataSource` to get the repository for the `Users` entity. It then
constructs a query object with the desired fields to select, the optional
`where` condition, and an order by clause to sort the results by the
`createdAt` field in ascending order. If the `where` parameter is not
provided, the function retrieves all users from the repository using the
default order. The function returns the resulting list of users. */

export async function getUserList(where?: object): Promise<Users[] | any> {
    const repo = await AppDataSource.getRepository(Users);
    const query = {
        select: {
            userId: true,
            userGuid: true,
            identityType: true,
            role: true,
            organization: true,
            email: true,
            userName: true,
            givenName: true,
            lastName: true,
            isActive: true,
            deactivationReason: true,
        },
        where: where ? where : undefined,
        order: { createdAt: 'ASC' as FindOptionsOrderValue },
    };

    let result;
    if (query.where === undefined) {
        result = await repo.find({ order: { createdAt: 'ASC' } });
    } else {
        result = await repo.find(query);
    }

    return result;
}
