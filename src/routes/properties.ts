import express from 'express';
import { Request, Response } from 'express';
import { PropertiesController } from '../controllers/PropertiesController';
import { roleType } from '../helpers/types';

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

propertiesRouter.get(
    '/details/:siteID&role',
    async (req: Request, res: Response) => {
        const controller = new PropertiesController();
        const response = await controller.getPropertyDetails(
            () => {},
            () => {},
            () => {},
            () => {},
            () => {},
            () => {},
            req.params.siteID,
            req.params.role as roleType,
        );
        return res.send(response);
    },
);

export default propertiesRouter;
