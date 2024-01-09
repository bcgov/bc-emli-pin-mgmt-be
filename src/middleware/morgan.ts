// Configuring morgan for http logging
import morgan, { StreamOptions } from 'morgan';
import Logger from './logger';

const stream: StreamOptions = {
    // Use http from winston, remove added newline
    write: (message) =>
        Logger.http(message.substring(0, message.lastIndexOf('\n'))),
};

const morganConfig = morgan(
    function (tokens, req, res) {
        const returnArray = [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'),
            '-',
        ];
        if (tokens.res(req, res, 'X-Response-Time') !== undefined) {
            returnArray.push(tokens.res(req, res, 'X-Response-Time'));
        } else {
            returnArray.push(tokens['response-time'](req, res));
        }
        returnArray.push('ms');
        return returnArray.join(' ');
    },
    { stream },
);

export default morganConfig;
