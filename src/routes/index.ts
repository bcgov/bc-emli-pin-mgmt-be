import express, { NextFunction, Request, Response } from 'express';
import { HelloWorldController } from '../controllers/helloworld';
import logger from '../middleware/logger';
import {
    authenticate,
    getAccessToken,
    getAuthorizationUrl,
    getLogoutUrl,
    getUserInfo,
} from '../middleware/auth';

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
            res.redirect(`http://localhost:3000`);
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
router.get('/oauth', async (req, res, next: NextFunction) => {
    try {
        if (req.cookies) {
            const { code } = req.query;
            console.log('-----------AUTH RESPONSE---------', code);
            const tokens = await getAccessToken({ code });
            const { access_token } = tokens;
            const userInfo = await getUserInfo({ accessToken: access_token });
            console.log(userInfo);
            req.cookies.authorization = {
                ...req.query,
            };

            req.cookies.tokens = {
                ...tokens,
            };

            req.cookies.user = {
                ...userInfo,
            };
            res.cookie('token', access_token, {
                maxAge: ONE_DAY,
            });
        }
        next();
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
        console.log('-----------LOGGING OUT---------FE');
        res.setHeader('Set-Cookie', 'token=; path=/; Max-Age=-1');
        res.redirect(`http://localhost:3000`);
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

export default router;
