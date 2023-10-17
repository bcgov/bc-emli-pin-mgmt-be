import express from 'express';
import { Request, Response } from 'express';
import {
    getAccessToken,
    getAuthorizationUrl,
    getLogoutUrl,
} from '../middleware/auth';
import logger from '../middleware/logger';

const authRouter = express.Router();

// Auth handling
const ONE_DAY = 5 * 60 * 1000; // 5 minutes

authRouter.get('/login', async (req: Request, res: Response) => {
    try {
        if (req.session?.user) {
            res.redirect(`${process.env.FE_APP_URL}`);
        } else {
            const authUrl = await getAuthorizationUrl();
            console.log('-----------LOGIN---------', authUrl);
            res.redirect(authUrl);
        }
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

// Callback; Authorization Response
// see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
authRouter.get('/oauth', async (req: Request, res: Response) => {
    try {
        if (req.cookies) {
            const { code } = req.query;
            console.log('-----------AUTH RESPONSE---------', code);
            const tokens = await getAccessToken({ code });
            const { access_token } = tokens;
            res.cookie('token', access_token, {
                domain: process.env.DOMAIN_NAME,
                path: '/',
                maxAge: ONE_DAY,
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            }).redirect(`${process.env.FE_APP_URL}`);
        }
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

authRouter.get('/logout', (req: Request, res: Response) => {
    try {
        if (req.session && req.session.user) {
            req.session.user = undefined;
        }
        const logoutUrl = getLogoutUrl();
        console.log('-----------LOGGING OUT---------', logoutUrl);
        res.setHeader('Set-Cookie', 'token=; path=/; Max-Age=-1');
        res.redirect(logoutUrl);
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

authRouter.get('/oauth/logout', (req: Request, res: Response) => {
    try {
        res.setHeader('Set-Cookie', 'token=; path=/; Max-Age=-1');
        res.clearCookie('token', {
            domain: process.env.DOMAIN_NAME,
            path: '/',
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        }).redirect(`${process.env.FE_APP_URL}`);
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

export default authRouter;
