import express from 'express';
import { UserController } from '../controllers/UserController';
import { Request, Response } from 'express';
import { userDeactivateRequestBody } from '../helpers/types';

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
        req.params.active,
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
