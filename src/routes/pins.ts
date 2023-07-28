import express from 'express';
import { PINController } from '../controllers/pinController';
import { Request, Response } from 'express';

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

export default pinsRouter;
