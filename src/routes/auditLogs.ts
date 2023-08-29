import express from 'express';
import { Request, Response } from 'express';
import { PinAuditLogController } from '../controllers/PinAuditLogController';

const logsRouter = express.Router();
const controller = new PinAuditLogController();

logsRouter.get('', async (req: Request, res: Response) => {
    const response = await controller.getAuditLogs(
        () => {},
        () => {},
        () => {},
        req.params.livePinIds,
    );
    return res.send(response);
});

export default logsRouter;
