// routes/bscs.ts
import express, { Request, Response } from 'express';

import { BscsController } from '../controllers/bcscController';

const bcscRouter = express.Router();
const controller = new BscsController();

bcscRouter.get('/', async () => {
    await controller.initiateLogin(
        () => {},
        () => {},
    );
});

bcscRouter.get('/userinfo/:siteId', async (req: Request, res: Response) => {
    const { code } = req.query;
    const response = await controller.handleCallback(
        () => {},
        () => {},
        () => {},
        code as string,
    );

    return res.send(response);
});

export default bcscRouter;
