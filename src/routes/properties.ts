import express from 'express';
import { Request, Response } from 'express';
import { PropertiesController } from '../controllers/PropertiesController';

const propertiesRouter = express.Router();
const controller = new PropertiesController();

propertiesRouter.get(
    '/address/:address',
    async (req: Request, res: Response) => {
        const response = await controller.getSiteID(
            () => {},
            () => {},
            () => {},
            req.params.address,
        );
        return res.send(response);
    },
);

export default propertiesRouter;
