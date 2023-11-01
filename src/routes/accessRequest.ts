import express from 'express';
import { AccessRequestController } from './../controllers/AccessRequestController';
import { Request, Response } from 'express';
import {
    accessRequestResponseBody,
    accessRequestUpdateRequestBody,
    requestListQueryParam,
} from '../helpers/types';

const accessRequestRouter = express.Router();
const controller = new AccessRequestController();

accessRequestRouter.post('', async (req: Request, res: Response) => {
    const response = await controller.createAccessRequest(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as accessRequestResponseBody,
    );
    return res.send(response);
});

accessRequestRouter.get('', async (req: Request, res: Response) => {
    const response = await controller.getAllRequests(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        req.params.status as requestListQueryParam,
        req,
    );
    return res.send(response);
});

accessRequestRouter.put('', async (req: Request, res: Response) => {
    const response = await controller.updateAccessRequest(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as accessRequestUpdateRequestBody,
        req,
    );
    return res.send(response);
});

export default accessRequestRouter;
