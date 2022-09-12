import express from "express";

import * as registerController from '../controllers/register.controllers.js';
import * as authorizationMiddleware from '../middleware/authorization.middleware.js'

const registerRouter = express.Router();

registerRouter.get('/wallet', authorizationMiddleware.authenticateToken, registerController.listRegisters)
registerRouter.post('/wallet/add', authorizationMiddleware.authenticateToken, registerController.addRegister)

export default registerRouter;