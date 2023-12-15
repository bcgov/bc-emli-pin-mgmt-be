// Configuring morgan for http logging
import morgan, { StreamOptions } from 'morgan';
import Logger from './logger';

const stream: StreamOptions = {
    // Use http from winston, remove added newline
    write: (message) =>
        Logger.http(message.substring(0, message.lastIndexOf('\n'))),
};

const morganConfig = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream },
);

export default morganConfig;
