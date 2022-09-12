import express from "express";
import * as accountController from '../controllers/account.controllers.js';

const userRouter = express.Router();

userRouter.post('/sign-up', accountController.createAccount);
userRouter.post('/sign-in', accountController.signInAccount);


export default userRouter;