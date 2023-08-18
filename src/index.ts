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
import session from 'express-session';
// declare module 'express-session' {
//   export interface SessionData {
//     user: { [key: string]: any };
//   }
// }
import createMemoryStore from 'memorystore';
import cookieParser from 'cookie-parser';
import { decodingJWT } from './middleware/auth';

const app: Express = express();
const port: number = process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT as string)
    : 3000;

// Middleware configuration
app.use(express.json());
app.use(morganConfig);
app.use(express.static('public'));
app.use(cookieParser());

// Route configuration
app.use('/api-specs', swaggerUI.serve, async (req: Request, res: Response) => {
    return res.send(swaggerUI.generateHTML(swagger));
});

RegisterRoutes(app);

app.use(router);

// tsoa error handling
app.use(function notFoundHandler(_req, res: Response) {
    res.status(404).send({
        message: 'Not Found',
    });
});

app.use(function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
): Response | void {
    if (err instanceof ValidateError) {
        logger.warn(
            `Caught Validation Error for ${req.path}: ${JSON.stringify(
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
            `Encountered unknown Internal Server Error for ${req.path}:`,
            err.message,
        );
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }

    next();
});

// Auth handling
const ONE_DAY = 24 * (60 * 60 * 1000);
const MemoryStore = createMemoryStore(session);

const store = new MemoryStore({
    checkPeriod: ONE_DAY,
});

app.use(
    session({
        name: process.env.COOKIE_SESSION_NAME
            ? process.env.COOKIE_SESSION_NAME
            : '',
        secret: process.env.COOKIE_SESSION_SECRET
            ? process.env.COOKIE_SESSION_SECRET
            : '',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: ONE_DAY,
            httpOnly: true,
            secure: false,
        },
        store,
    }),
);

app.disable('x-powered-by');

app.set('trust proxy', 1);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, async () => {
        await AppDataSource.initialize();
        logger.debug(`[Server]: I am running at port:${port}`);
        console.log(
            decodingJWT(
                'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJxUWlFWDB2T2Z1SlBuWUw4MWo0Q2tDOHVPdEJ1aFZvM0xBd2ppczZWbHRzIn0.eyJleHAiOjE2OTIzODQ4MTEsImlhdCI6MTY5MjM4NDUxMSwiYXV0aF90aW1lIjoxNjkyMzgzMzAxLCJqdGkiOiIyODJlMDQ4ZC05OTdkLTRiNjQtYTM1YS0yM2Q1ZmZmMDVhODMiLCJpc3MiOiJodHRwczovL2Rldi5sb2dpbnByb3h5Lmdvdi5iYy5jYS9hdXRoL3JlYWxtcy9zdGFuZGFyZCIsImF1ZCI6InZpcnR1YWwtaG9tZS1lbmVyZ3ktcmF0aW5nLXN5c3RlbS00OTMyIiwic3ViIjoiNjk0ZDFhYjc3MTc3NDI5ODk0NmY0N2E3YjUyM2U5ODJAaWRpciIsInR5cCI6IkJlYXJlciIsImF6cCI6InZpcnR1YWwtaG9tZS1lbmVyZ3ktcmF0aW5nLXN5c3RlbS00OTMyIiwic2Vzc2lvbl9zdGF0ZSI6IjliMTBmODU0LTkyZjYtNGFjNS1hOTExLWEwNzQyMTg3MGFlOCIsInNjb3BlIjoib3BlbmlkIGlkaXIgYmNlaWRidXNpbmVzcyBlbWFpbCBwcm9maWxlIiwic2lkIjoiOWIxMGY4NTQtOTJmNi00YWM1LWE5MTEtYTA3NDIxODcwYWU4IiwiaWRpcl91c2VyX2d1aWQiOiI2OTREMUFCNzcxNzc0Mjk4OTQ2RjQ3QTdCNTIzRTk4MiIsImlkZW50aXR5X3Byb3ZpZGVyIjoiaWRpciIsImlkaXJfdXNlcm5hbWUiOiJITUNET05BTCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlhUOk1jRG9uYWxkLCBIYW5uYWggV0xSUzpJTiIsInByZWZlcnJlZF91c2VybmFtZSI6IjY5NGQxYWI3NzE3NzQyOTg5NDZmNDdhN2I1MjNlOTgyQGlkaXIiLCJnaXZlbl9uYW1lIjoiSGFubmFoIiwiZGlzcGxheV9uYW1lIjoiWFQ6TWNEb25hbGQsIEhhbm5haCBXTFJTOklOIiwiZmFtaWx5X25hbWUiOiJNY0RvbmFsZCIsImVtYWlsIjoiaGFtYWNkb25hbGRAZGVsb2l0dGUuY2EifQ.JsY_4e3d1m_icXRW4r9AjcfTBUNnyCFArzJaDZ0dQLcdmC6pXags2J8XufNC0DePPMAaMTEpyMBR0Zc26Z_q1oB43-SQdh3Q08gJHrLO3mrTVHM7fxZ5cztNrm6jiFr5jMhoTKLaJXSda3Lfvc7Yfuu_yVnv2pItzHRKy7skSVtLLpH9dTmecIDstuXS8SM4Ptfp3lbWYLD1u36Jiwd6lGRproY2Beq0KGtmH9l6z1v0p9iAEH2A8hxfrnMnVhi-CzmLiiDQU_5pOqYC_xCPvG5bGguoKy4NC6eAx-dn8MmO8xIZJm-JEEtveZ9QKYkn8QEYhQlffXaSSsUiWuWlKQ',
            ),
        );
    });
}

export { app, AppDataSource };
