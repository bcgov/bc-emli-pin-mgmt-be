import express, { Request, Response } from 'express';
import { HelloWorldController } from '../controllers/helloworld';
import { authenticate } from '../middleware/auth';
import 'dotenv/config';

const router = express.Router();

router.get('/helloworld', authenticate, async (req: Request, res: Response) => {
    const controller = new HelloWorldController();
    const response = await controller.getMessage();
    return res.send(response);
});

export default router;
