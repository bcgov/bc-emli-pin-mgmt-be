import express, { Request, Response } from 'express';
import { HelloWorldController } from '../controllers/helloworld';
import logger from '../middleware/logger';
import {
    getAccessToken,
    getAuthorizationUrl,
    getLogoutUrl,
} from '../helpers/auth';
import 'dotenv/config';

const router = express.Router();

router.get('/helloworld', async (req: Request, res: Response) => {
    const controller = new HelloWorldController();
    const response = await controller.getMessage();
    return res.send(response);
});

// Auth handling
const ONE_DAY = 120 * 60 * 1000; // 5 minutes

router.get('/login', async (req, res) => {
    try {
        if (req.session?.user) {
            res.redirect(`${process.env.FE_APP_URL}`);
        } else {
            const authUrl = await getAuthorizationUrl();
            res.redirect(authUrl);
        }
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            res.json({ success: false, error: err.message || err });
        }
    }
});

// router.get('/bcsc', async (req, res) => {
//     try {
//         if (req.session?.user) {
//             res.redirect(`${process.env.FE_APP_URL}`);
//         } else {
//             const authUrl = await getAuthorizationUrl({
//                 identity_provider: 'bcsc',
//             });
//             res.redirect(authUrl);
//         }
//     } catch (err) {
//         if (err instanceof Error) {
//             logger.error(err.message);
//             res.json({ success: false, error: err.message || err });
//         }
//     }
// });

// // BCSC Callback; performs UserInfo request
// router.get('/userinfo', async (req, res) => {
//     try {
//         const { code } = req.query;

//         // Ensure code is a string
//         if (!code || Array.isArray(code)) {
//             throw new Error('Authorization code is missing or invalid');
//         }

//         const authorizationCode = code as string;

//         // Step 1: Exchange the authorization code for tokens
//         const tokenResponse = await fetch(
//             `${process.env.CSS_DOMAIN_NAME_URL}/token`,
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: new URLSearchParams({
//                     grant_type: process.env.OIDC_GRANT_TYPE || '',
//                     client_id: process.env.BCSC_OIDC_CLIENT_ID || '',
//                     client_secret: process.env.BCSC_OIDC_CLIENT_SECRET || '',
//                     code: authorizationCode,
//                     redirect_uri: `${process.env.BE_APP_URL}/userinfo`, // Must match the original redirect URI
//                 }),
//             },
//         );

//         const tokenData = await tokenResponse.json();

//         if (!tokenData.access_token) {
//             throw new Error('Token exchange failed');
//         }

//         // Step 2: Use the access token to request user info
//         const userInfoResponse = await fetch(
//             `${process.env.CSS_DOMAIN_NAME_URL}/userinfo`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${tokenData.access_token}`,
//                 },
//             },
//         );

//         const userInfo = await userInfoResponse.json();

//         /*
//         userInfo.address.street_address
//         userInfo.address.locality
//         userInfo.address.region
//         */
//         console.log(userInfo); // Logs user information
//         // const userAddress = `${userInfo.address.street_address} ${userInfo.address.locality}, ${userInfo.address.region}`;

//         res.json({
//             success: true,
//             token: tokenData.access_token,
//             refreshToken: tokenData.refresh_token,
//         });
//     } catch (err) {
//         if (err instanceof Error) {
//             logger.error(err.message);
//             res.json({ success: false, error: err.message || err });
//         }
//     }
// });

// Callback; Authorization Response
// see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
router.get('/oauth', async (req, res) => {
    try {
        if (req.cookies) {
            const { code } = req.query;
            const token = await getAccessToken({ code });
            res.cookie('token', token, {
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

router.get('/logout', (req, res) => {
    try {
        if (req.session && req.session.user) {
            req.session.user = undefined;
        }
        const logoutUrl = getLogoutUrl();
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

export default router;
