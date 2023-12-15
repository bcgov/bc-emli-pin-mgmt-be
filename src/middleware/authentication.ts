import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import 'dotenv/config';
import { prepareTokenInfo } from '../helpers/auth';

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res
                .status(404)
                .json({ success: false, msg: 'Token not found' });
        }
        const verified = jwt.verify(token, JWT_SECRET as string);
        if (!verified) {
            return res
                .status(401)
                .json({ result: 'Token verification failed' });
        }
        if (
            (verified as any).role === null ||
            (verified as any).role === undefined
        ) {
            if (
                req.route.path === '/user-requests' &&
                req.route.methods.post === true
            ) {
                // skip this activity, it's for creating an access request
            } else {
                // check db if added to the user table
                const tokenExpiry = 30 * 60 * 1000;
                let payload;
                if ((verified as any).identity_provider === 'idir')
                    payload = {
                        ...(verified as object),
                        idir_user_guid: (verified as any).user_guid,
                    };
                else
                    payload = {
                        ...(verified as object),
                        bceid_user_guid: (verified as any).user_guid,
                    };
                const tokenDetails = await prepareTokenInfo(payload); // this function checks the db
                if (
                    tokenDetails.role === null ||
                    tokenDetails.role === undefined
                ) {
                    return res
                        .status(401)
                        .json({ result: 'Token verification failed' });
                }
                const signedToken = jwt.sign(
                    tokenDetails,
                    JWT_SECRET as string,
                    {
                        expiresIn: tokenExpiry,
                    },
                );
                res.cookie('token', signedToken, {
                    domain: process.env.DOMAIN_NAME,
                    path: '/',
                    maxAge: tokenExpiry,
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                });
                req.cookies.token = signedToken;
            }
        }
        next();
    } catch (error: any) {
        return res.status(401).json({ success: false, msg: error.message });
    }
}
