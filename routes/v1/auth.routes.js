import express from 'express'
import { register, login, authVerify } from '../../controllers/auth.controllers.js'


const router = express.Router();

router.route('/verify-token').get(authVerify).post(authVerify);
router.route('/register').post(register);
router.route('/login').post(login);

export default router;