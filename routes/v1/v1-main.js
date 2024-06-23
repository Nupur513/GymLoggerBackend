import express from 'express';

import { default as exerciseRouter } from './exercises.routes.js'
import { default as workoutRouter } from './workout.routes.js'
import {default as authRouter}  from './auth.routes.js'
import {default as userRouter} from './user.routes.js'
import {authVerify} from '../../middlewares/auth.middleware.js'
const router = express.Router();


router.use('/exercises', authVerify, exerciseRouter);
router.use('/user', authVerify, userRouter);
router.use('/workout', authVerify, workoutRouter);
router.use('/auth', authRouter);

export default router;