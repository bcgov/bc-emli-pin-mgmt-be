import logger from '../middleware/logger';
import { findUser, findPermissionByRole } from '../db/Users.db';
import { TypeORMError } from 'typeorm';

export const checkActiveUser = async (userGuid: any) => {
    let userPermissions;
    const where = { userGuid: userGuid, isActive: true };
    let userResult;
    try {
        userResult = await findUser(undefined, where);
    } catch (err) {
        if (err instanceof Error) {
            logger.error(
                `Encountered error in checkActiveUser: ${err.message}`,
            );
            throw new TypeORMError(err.message);
        }
    }
    if (userResult.length < 1) {
        return { roleType: null, permissions: null };
    }
    const role = userResult[0].role;
    let permissionList;
    try {
        permissionList = await findPermissionByRole(role);
    } catch (err) {
        if (err instanceof Error) {
            logger.error(
                `Encountered error in checkActiveUser: ${err.message}`,
            );
            throw new TypeORMError(err.message);
        }
    }
    if (permissionList.length > 0) {
        const permissions: any[] = [];
        permissionList.forEach((p: any) => {
            permissions.push(p.permission);
        });
        userPermissions = permissions;
    } else {
        userPermissions = null;
    }
    return { roleType: role, permissions: userPermissions };
};
