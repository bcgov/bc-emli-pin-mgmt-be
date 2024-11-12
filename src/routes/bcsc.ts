// routes/bscs.ts
import express, { Request, Response } from 'express';

import { BscsController } from '../controllers/bcscController';

const bcscRouter = express.Router();
const controller = new BscsController();

bcscRouter.get('/', async (req: Request, res: Response) => {
    const { siteId } = req.query;

    // Set a secure, HTTP-only cookie with the `siteID`
    res.cookie('siteId', siteId, {
        httpOnly: true, // The cookie cannot be accessed via client-side JavaScript
        secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS
        sameSite: 'lax', // Controls whether the cookie is sent with cross-origin requests
    });

    await controller.initiateLogin(
        () => {},
        () => {},
        siteId as string,
    );
});

bcscRouter.get('/userinfo', async (req: Request, res: Response) => {
    const { code, state } = req.query;

    const response = await controller.handleCallback(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        code as string,
        state as string,
    );

    return res.send(response);
});

export default bcscRouter;
