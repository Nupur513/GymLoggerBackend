import express from 'express';

import { default as exerciseRouter } from './exercises.routes.js'
import { default as workoutRouter } from './workout.routes.js'

const router = express.Router();


router.use('/exercises', exerciseRouter);
router.use('/workout', workoutRouter);

export default router;