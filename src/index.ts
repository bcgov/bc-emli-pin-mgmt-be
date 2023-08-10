import express, { Express, Response, Request, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './build/routes';
import swaggerUI from 'swagger-ui-express';
import swagger from './build/swagger.json';
import logger from './middleware/logger';
import morganConfig from './middleware/morgan';
import 'dotenv/config';
import { AppDataSource } from './data-source';

const app: Express = express();
const port: number = process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT as string)
    : 3000;

// Middleware configuration
app.use(express.json());
app.use(morganConfig);
app.use(express.static('public'));

// Route configuration
app.use('/api-specs', swaggerUI.serve, async (req: Request, res: Response) => {
    return res.send(swaggerUI.generateHTML(swagger));
});

RegisterRoutes(app);

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

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, async () => {
        await AppDataSource.initialize();
        logger.debug(`[Server]: I am running at port:${port}`);
    });
}

export { app, AppDataSource };
