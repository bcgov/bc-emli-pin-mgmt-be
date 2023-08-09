import express, { Request, Response } from 'express';
import { PropertyDetailsController } from '../controllers/propertyDetailsController';

const propertyDetailsRouter = express.Router();

propertyDetailsRouter.get(
    '/propertyDetails',
    async (req: Request, res: Response) => {
        const controller = new PropertyDetailsController();
        const response = await controller.getPropertyDetails(1);

        return res.send(response);
    },
);

export default propertyDetailsRouter;
