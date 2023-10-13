import express from 'express';
import { AccessRequestController } from './../controllers/AccessRequestController';
import { Request, Response } from 'express';
import { accessRequestResponseBody } from '../helpers/types';

const accessRequestRouter = express.Router();
const controller = new AccessRequestController();

accessRequestRouter.post('', async (req: Request, res: Response) => {
    const response = await controller.createAccessRequest(
        () => {},
        () => {},
        () => {},
        req.body as accessRequestResponseBody,
    );
    return res.send(response);
});

export default accessRequestRouter;
