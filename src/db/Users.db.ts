import { Users } from '../entity/Users';
import { Permission } from '../entity/Permission';
import { AppDataSource } from '../data-source';
import {
    UserRoles,
    userDeactivateRequestBody,
    userUpdateRequestBody,
} from '../helpers/types';
import { FindOptionsOrderValue, UpdateResult } from 'typeorm';
import logger from '../middleware/logger';
import {
    sendDeactiveUserNotifications,
    sendUpdateUserNotifications,
} from '../helpers/GCNotifyCalls';
import { NotFoundError } from '../helpers/NotFoundError';

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
            updatedAt: true,
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
 */
export async function updateUser(
    userId: object,
    updateFields: object,
    requestBody: userUpdateRequestBody,
): Promise<any | undefined> {
    let transactionReturn;
    const templateId = process.env.GC_NOTIFY_UPDATE_USER_EMAIL_TEMPLATE_ID!;
    try {
        transactionReturn = (await AppDataSource.transaction(
            async (manager) => {
                const updatedRequest = await manager.update(
                    Users,
                    userId,
                    updateFields,
                );
                // Call GC Notify only if role is updated
                if ('role' in updateFields) {
                    const notificationResponse =
                        await sendUpdateUserNotifications(
                            requestBody,
                            templateId,
                        );
                    if (notificationResponse) {
                        return { updatedRequest };
                    } else {
                        throw new Error(
                            `Error calling sendUpdateUserNotifications`,
                        );
                    }
                } else {
                    return { updatedRequest };
                }
            },
        )) as { updatedRequest: UpdateResult };
    } catch (err) {
        if (err instanceof Error) {
            const message = `An error occured while calling updateUser: ${err.message}`;
            throw new Error(message);
        }
    }
    if (typeof transactionReturn?.updatedRequest != 'undefined') {
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
    username: string,
): Promise<any | undefined> {
    const updateFields = {
        isActive: false,
        deactivationReason: requestBody.deactivationReason,
        updatedBy: username,
    };
    const idList: any[] = [];

    for (const itemId in requestBody?.userIds) {
        const where = { userId: requestBody?.userIds[itemId] };
        idList.push(where);
    }

    let transactionReturn;
    const templateId =
        process.env.GC_NOTIFY_USER_DEACTIVATION_EMAIL_TEMPLATE_ID!;

    try {
        transactionReturn = (await AppDataSource.transaction(
            async (manager) => {
                const updatedUser = await manager.update(
                    Users,
                    idList,
                    updateFields,
                );
                if (!updatedUser.affected || updatedUser.affected === 0) {
                    throw new NotFoundError(
                        'User(s) to deactivate not found in database',
                    );
                }
                const notificationResponse =
                    await sendDeactiveUserNotifications(
                        requestBody,
                        templateId,
                    );
                if (notificationResponse) {
                    return { updatedUser };
                } else {
                    throw new Error(
                        `Error calling sendDeactiveUserNotifications`,
                    );
                }
            },
        )) as { updatedUser: UpdateResult };
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw err;
        }
        if (err instanceof Error) {
            const message = `An error occured while calling deactivateUsers: ${err.message}`;
            throw new Error(message);
        }
    }
    if (typeof transactionReturn?.updatedUser != 'undefined') {
        if (
            transactionReturn.updatedUser.affected &&
            transactionReturn.updatedUser.affected !== 0
        ) {
            logger.debug(
                `Successfully updated ${transactionReturn.updatedUser.affected} users(s)`,
            );
            return transactionReturn.updatedUser.affected;
        }
    }
}
