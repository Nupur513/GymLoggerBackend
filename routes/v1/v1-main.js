import express from 'express';

import { default as exerciseRouter } from './exercises.routes.js'

const router = express.Router();


router.use('/exercises', exerciseRouter);

export default router;