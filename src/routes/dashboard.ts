import express from 'express';
import { Request, Response } from 'express';
import { DashboardController } from '../controllers/DashboardController';
const dashboardRouter = express.Router();
const controller = new DashboardController();

dashboardRouter.get('', async (req: Request, res: Response) => {
    const response = await controller.getDashboardURL(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        req,
    );
    return res.send(response);
});

export default dashboardRouter;
