import express from 'express';

import { default as exerciseRouter } from './exercises.routes.js'
import { default as workoutRouter } from './workout.routes.js'
import {default as authRouter}  from './auth.routes.js'

const router = express.Router();


router.use('/exercises', exerciseRouter);
router.use('/workout', workoutRouter);
router.use('/auth', authRouter);

export default router;