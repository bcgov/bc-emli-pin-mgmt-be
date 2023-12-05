import express, { Express, Response, Request, NextFunction } from 'express';
import router from './routes/index';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './build/routes';
import swaggerUI from 'swagger-ui-express';
import swagger from './build/swagger.json';
import logger from './middleware/logger';
import morganConfig from './middleware/morgan';
import 'dotenv/config';
import { AppDataSource } from './data-source';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { AuthenticationError } from './middleware/AuthenticationError';
import { responseLogger, startTime } from './middleware/responseLogger';

declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any };
    }
}
const FE_APP_URL =
    process.env.FE_APP_URL && process.env.FE_APP_URL !== ''
        ? process.env.FE_APP_URL
        : '';
const app: Express = express();
const port: number =
    process.env.SERVER_PORT && process.env.SERVER_PORT !== '3000'
        ? parseInt(process.env.SERVER_PORT as string)
        : 3000;

app.use(startTime);
// TO-DO: update after testing in dev
const setHeaderURL = FE_APP_URL?.includes('localhost') ? '*' : FE_APP_URL;
// Add headers before the routes are defined
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', setHeaderURL);

    // Request methods you wish to allow
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );

    // Request headers you wish to allow
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type,x-api-key',
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();
});

const corsDomain = [
    process.env.FE_APP_URL,
    process.env.BE_APP_URL,
    process.env.PROPERATE_STAGING_URL,
    process.env.PROPERATE_TEST_URL,
];

const origin = (origin: any, callback: any) => {
    if (!origin || corsDomain.indexOf(origin) !== -1) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
};

const corsOptions = {
    origin,
    optionsSuccessStatus: 200,
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
};

const corsOptionsLocal = {
    credentials: true,
    origin: true,
};

console.log(`NODE_ENV is ${process.env.NODE_ENV}`);
if (process.env.FE_APP_URL?.includes('localhost')) {
    app.use(cors(corsOptionsLocal));
} else {
    app.use(cors(corsOptions));
}

// Middleware configuration
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(morganConfig);
app.use(responseLogger);

// Route configuration
app.use('/api-specs', swaggerUI.serve, async (req: Request, res: Response) => {
    return res.send(swaggerUI.generateHTML(swagger));
});

RegisterRoutes(app);

app.use(router);

// tsoa error handling
app.use(function notFoundHandler(_req, res: Response) {
    res.status(404).json({
        message: 'Not Found',
    });
});

const errorHandler = function (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction,
): Response | void {
    if (err instanceof AuthenticationError) {
        logger.warn(
            `Caught Authentication Error for ${_req.path}: ${err.status} ${err.message}`,
        );
        return res.status(err.status).json({
            message: err.message,
        });
    }
    if (err instanceof ValidateError) {
        logger.warn(
            `Caught Validation Error for ${_req.path}: ${JSON.stringify(
                err?.fields,
            )}`,
        );
        return res.status(422).json({
            message: 'Validation Failed',
            details: err?.fields,
        });
    }
    if (err instanceof Error) {
        logger.warn(
            `Encountered unknown Internal Server Error for ${_req.path}: ${err.message}`,
        );
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
    next();
};

app.use(errorHandler);

app.disable('x-powered-by');

app.set('trust proxy', 1);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, async () => {
        await AppDataSource.initialize();
        logger.debug(`[Server]: I am running at port:${port}`);
    });
}

export { app, AppDataSource, origin, errorHandler };
