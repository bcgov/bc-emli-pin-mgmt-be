import { Users } from '../entity/Users';
import { Permission } from '../entity/Permission';
import { AppDataSource } from '../data-source';
import { UserRoles, userDeactivateRequestBody } from '../helpers/types';
import { FindOptionsOrderValue, UpdateResult } from 'typeorm';
import logger from '../middleware/logger';

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
/**
 * update user object with updated field value
 *
 * @export
 * @param {object} userId
 * @param {object} updateFields
 * @return {*}  affected row
 */
export async function updateUser(
    userId: object,
    updateFields: object,
): Promise<any | undefined> {
    const transactionReturn = (await AppDataSource.transaction(
        async (manager) => {
            const updatedRequest = await manager.update(
                Users,
                userId,
                updateFields,
            );

            return { updatedRequest };
        },
    )) as { updatedRequest: UpdateResult };
    if (typeof transactionReturn.updatedRequest != 'undefined') {
        if (
            transactionReturn.updatedRequest.affected &&
            transactionReturn.updatedRequest.affected !== null
        ) {
            logger.debug(
                `Successfully updated user(s) with id(s)  '${transactionReturn.updatedRequest.affected}'`,
            );
            return transactionReturn.updatedRequest.affected;
        }
    }
}

/* The `deactivateUsers` function is deactivating users in the database. It
accepts a `requestBody` parameter which contains the user IDs of the users to
be deactivated. */
export async function deactivateUsers(
    requestBody: userDeactivateRequestBody,
): Promise<any | undefined> {
    const updateFields = {
        isActive: false,
    };
    const idList: any[] = [];

    for (const itemId in requestBody?.userIds) {
        const where = { requestId: requestBody?.userIds[itemId] };
        idList.push(where);
    }

    const transactionReturn = (await AppDataSource.transaction(
        async (manager) => {
            const updatedUser = await manager.update(
                Users,
                idList,
                updateFields,
            );

            return { updatedUser };
        },
    )) as { updatedUser: UpdateResult };
    if (typeof transactionReturn.updatedUser != 'undefined') {
        if (
            transactionReturn.updatedUser.affected &&
            transactionReturn.updatedUser.affected !== null
        ) {
            logger.debug(
                `Successfully updated users(s) with id(s)  '${transactionReturn.updatedUser.affected}'`,
            );
            return transactionReturn.updatedUser.affected;
        }
    }
}
