// routes/bscs.ts
import express, { Request, Response } from 'express';

import { BscsController } from '../controllers/bcscController';

const bcscRouter = express.Router();
const controller = new BscsController();

bcscRouter.get('/', async (req: Request, res: Response) => {
    const { siteId, redirect } = req.query;

    // // Set a secure, HTTP-only cookie with the `siteID`
    res.cookie('siteId', siteId, {
        httpOnly: true, // The cookie cannot be accessed via client-side JavaScript
        secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS
        sameSite: 'lax', // Controls whether the cookie is sent with cross-origin requests
    });

    await controller.initiateLogin(
        () => {},
        () => {},
        siteId as string,
        redirect as string,
    );
});

bcscRouter.get('/validate', async (req: Request) => {
    const { livePinId, pid } = req.query;

    await controller.validateUserData(
        () => {},
        () => {},
        () => {},
        livePinId as string,
        pid as string[],
    );
});

bcscRouter.get('/userinfo', async (req: Request) => {
    const { code, state } = req.query;

    await controller.handleCallback(
        () => {},
        () => {},
        () => {},
        () => {},
        // () => {},
        code as string,
        state as string,
    );

    // req.session.user = response;

    // const redirection = `${response.redirect}?livePinId=${response.livePinId}&pids=${response.pids}`

    // return res.redirect(redirection);
});

export default bcscRouter;
