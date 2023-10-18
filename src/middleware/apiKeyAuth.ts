import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

const VHERS_API_KEY = process.env.VHERS_API_KEY || '';

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Extract api key from the request header.
    const apiKey = req.header('x-api-key');

    // Check if api key exists
    if (!apiKey) return res.status(401).json({ msg: 'Access Denied.' });

    if (apiKey === VHERS_API_KEY) {
        next();
    } else return res.status(400).json({ msg: 'Invalid Token.' });
};
