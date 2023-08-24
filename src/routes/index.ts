import express, { Request, Response } from 'express';
import { HelloWorldController } from '../controllers/helloworld';
import logger from '../middleware/logger';
import {
    authenticate,
    getAccessToken,
    getAuthorizationUrl,
    getLogoutUrl,
} from '../middleware/auth';
import 'dotenv/config';

const router = express.Router();

router.get('/helloworld', authenticate, async (req: Request, res: Response) => {
    const controller = new HelloWorldController();
    const response = await controller.getMessage();
    return res.send(response);
});

// Auth handling
const ONE_DAY = 24 * (60 * 60 * 1000);

router.get('/login', async (req, res) => {
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
router.get('/oauth', async (req, res) => {
    try {
        if (req.cookies) {
            const { code } = req.query;
            console.log('-----------AUTH RESPONSE---------', code);
            const tokens = await getAccessToken({ code });
            const { access_token } = tokens;
            res.cookie('token', access_token, {
                maxAge: ONE_DAY,
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            });
            res.redirect(`${process.env.FE_APP_URL}`);
        }
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

router.get('/logout', (req, res) => {
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

router.get('/oauth/logout', (req, res) => {
    try {
        res.setHeader('Set-Cookie', 'token=; path=/; Max-Age=-1');
        res.redirect(`${process.env.FE_APP_URL}`);
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

export default router;
