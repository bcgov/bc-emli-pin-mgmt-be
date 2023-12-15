import { Request, Response, NextFunction } from 'express';
import { AuditedURLMethods } from '../helpers/types';
import { createAPIAuditLog } from '../db/VHERSAuditLog.db';

/*
	Overwriting the send function to get a measure of response timing, request and response to send to the audit log.
	Note that this is only an approximate measure of server processing time, and does not account for time in flight.
	We can't do this in the logger because it has no access to the response body.
*/
export async function responseLogger(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const originalSendFunc = res.send.bind(res);
    res.send = function (body: any) {
        const startTimeString = res.get('X-Start-Time')?.split(',');
        const startTime: [number, number] = [
            Number((startTimeString as string[])[0]),
            Number((startTimeString as string[])[1]),
        ];
        const diff = process.hrtime(startTime);
        const time = diff[0] * 1e3 + diff[1] * 1e-6;
        if (res.get('X-Start-Time')) {
            res.removeHeader('X-Start-Time');
        }
        res.set('X-Response-Time', time.toFixed(3)); // this is for morgan to remain consistent with our methods of timing
        if (
            Object.values(AuditedURLMethods).includes(
                `${req.method} ${req.url}` as AuditedURLMethods,
            )
        ) {
            // create audit logs for applicable urls
            createAPIAuditLog(
                `${req.method} ${req.url}`,
                req.body,
                body,
                res.statusCode,
                Number(time.toFixed(3)),
            ).then(() => {});
        }
        return originalSendFunc(body);
    };
    next();
}

/*
	Getting a starting point for when we receive the message.
	This is set in the index as the first middleware to be run, so it should be as accurate as possible
*/
export function startTime(req: Request, res: Response, next: NextFunction) {
    const startTime = process.hrtime();
    res.set(
        'X-Start-Time',
        startTime[0].toString() + ',' + startTime[1].toString(),
    );
    next();
}
