import express from 'express';

import userRouter from './userRouter.js';
import registerRouter from './registersRouter.js'

const router = express.Router();


router.use(userRouter);
router.use(registerRouter);

export default router;