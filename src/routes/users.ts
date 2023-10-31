import express from 'express';
import { UserController } from '../controllers/UserController';
import { Request, Response } from 'express';

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
