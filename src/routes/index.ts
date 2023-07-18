import express from 'express';
import HelloWorldController from '../controllers/helloworld';

const router = express.Router();

router.get('/helloworld', async (req, res) => {
    const controller = new HelloWorldController();
    const response = await controller.getMessage();
    return res.send(response);
});

export default router;
