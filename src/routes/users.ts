import express from 'express';
import { UserController } from '../controllers/UserController';
import { Request, Response } from 'express';
import {
    userDeactivateRequestBody,
    userListQueryParam,
} from '../helpers/types';

const userRouter = express.Router();
const controller = new UserController();

userRouter.get('', async (req: Request, res: Response) => {
    const response = await controller.getAllUsers(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        req.params.active as userListQueryParam,
        req,
    );
    return res.send(response);
});

userRouter.put('deactivate', async (req: Request, res: Response) => {
    const response = await controller.deactivateUsers(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as userDeactivateRequestBody,
        req,
    );
    return res.send(response);
});
