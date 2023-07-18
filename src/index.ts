// Basic test file for Express

import express, { Express, Response, Request } from 'express';
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

app.listen(port, () => {
    logger.debug(`[Server]: I am running at port:${port}`);
});
