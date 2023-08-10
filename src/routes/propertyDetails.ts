import express, { Request, Response } from 'express';
import { PropertiesController } from '../controllers/PropertiesController';

const propertyDetailsRouter = express.Router();

propertyDetailsRouter.get(
    '/propertyDetails',
    async (req: Request, res: Response) => {
        const controller = new PropertiesController();
        const response = await controller.getPropertyDetails(req.params.siteID);
        return res.send(response);
    },
);

export default propertyDetailsRouter;
