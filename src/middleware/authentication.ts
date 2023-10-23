import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || '';

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

        const verified = jwt.verify(token, JWT_SECRET);
        if (!verified) {
            return res.json({ result: 'Token verification failed' });
        }
        next();
    } catch (error: any) {
        return res.status(401).json({ success: false, msg: error.message });
    }
}
