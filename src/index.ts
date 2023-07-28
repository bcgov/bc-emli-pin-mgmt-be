// Basic test file for Express

import express, { Express, Response, Request, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from './build/routes';
import Router from './routes';
import swaggerUI from 'swagger-ui-express';
import swagger from './build/swagger.json';
import logger from './middleware/logger';
import morganConfig from './middleware/morgan';

const app: Express = express();
const port: number = 3000;

// Middleware configuration
app.use(express.json());
app.use(morganConfig);
app.use(express.static('public'));

// Route configuration
app.use(Router);
app.use('/docs', swaggerUI.serve, async (req: Request, res: Response) => {
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
        console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
        return res.status(422).json({
            message: 'Validation Failed',
            details: err?.fields,
        });
    }
    if (err instanceof Error) {
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }

    next();
});

app.listen(port, () => {
    logger.debug(`[Server]: I am running at port:${port}`);
});
