import express from 'express';
import { PINController } from '../controllers/pinController';
import { Request, Response } from 'express';
import { createPinRequestBody } from '../helpers/types';

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

pinsRouter.post('/create', async (req: Request, res: Response) => {
    const response = await controller.createPin(
        () => {},
        () => {},
        () => {},
        () => {},
        req.body as createPinRequestBody,
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

export default pinsRouter;
