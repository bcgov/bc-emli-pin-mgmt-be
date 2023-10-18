import express from 'express';
import { PINController } from '../controllers/pinController';
import { Request, Response } from 'express';
import {
    createPinRequestBody,
    serviceBCCreateRequestBody,
} from '../helpers/types';

const pinsRouter = express.Router();
const controller = new PINController();

pinsRouter.get('/initial-create', async (req: Request, res: Response) => {
    const response = await controller.getInitialPins(
        () => {},
        () => {},
        parseInt(req.params.quantity),
        parseInt(req.params.pinLength),
        req.params.allowedChars,
    );
    return res.send(response);
});

pinsRouter.post('/vhers-create', async (req: Request, res: Response) => {
    const response = await controller.createPin(
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as createPinRequestBody,
    );
    return res.send(response);
});

pinsRouter.post('/vhers-regenerate', async (req: Request, res: Response) => {
    const response = await controller.recreatePin(
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as createPinRequestBody,
    );
    return res.send(response);
});

pinsRouter.post('/create', async (req: Request, res: Response) => {
    const response = await controller.serviceBCCreatePin(
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as serviceBCCreateRequestBody,
    );
    return res.send(response);
});

pinsRouter.post('/regenerate', async (req: Request, res: Response) => {
    const response = await controller.serviceBCRecreatePin(
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as serviceBCCreateRequestBody,
    );
    return res.send(response);
});

pinsRouter.post('/expire', async (req: Request, res: Response) => {
    const response = await controller.expirePin(
        () => {},
        () => {},
        () => {},
        () => {},
        req.body,
    );
    return res.send(response);
});

pinsRouter.post('/verify', async (req: Request, res: Response) => {
    const response = await controller.verifyPin(
        () => {},
        () => {},
        () => {},
        req.body,
    );
    return res.send(response);
});

export default pinsRouter;
