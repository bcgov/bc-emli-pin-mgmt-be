// Configuring winston

import winston from 'winston';

winston.addColors({
    error: 'bold red',
    warn: 'yellow',
    info: 'white',
    http: 'magenta',
    debug: 'cyan',
    silly: 'grey',
});

const level = () => {
    const env =
        process.env.NODE_ENV !== 'development'
            ? process.env.NODE_ENV
            : 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MMM-DD HH:mm:ss UTCZZ' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

const outputFormat = winston.format.combine(
    winston.format.label({ label: 'pin-mgmt-be' }),
    winston.format.timestamp({ format: 'YYYY-MMM-DD HH:mm:ss UTCZZ' }),
    winston.format.printf(
        (info) =>
            `[${info.label}] ${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

const transports = [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: outputFormat,
    }),
    new winston.transports.File({
        filename: 'logs/full.log',
        format: outputFormat,
    }),
];

const logger = winston.createLogger({
    level: level(),
    transports: transports,
});

export default logger;
