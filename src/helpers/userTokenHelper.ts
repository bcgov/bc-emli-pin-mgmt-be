// import logger from '../middleware/logger';
import { findUser, findPermissionByRole } from '../db/Users.db';
// import { TypeORMError } from 'typeorm';

// TODO: Incorporate error handling after testing
export const checkActiveUser = async (userGuid: any) => {
    let userPermissions;
    const where = { userGuid: userGuid, isActive: true };
    const userResult = await findUser(undefined, where);

    if (userResult.length < 0) {
        return { roleType: null, permissions: null };
    }
    const role = userResult[0].role;
    const permissionList = await findPermissionByRole(role);
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
