import express from 'express'
import { register, login,  logout } from '../../controllers/auth.controllers.js'


const router = express.Router();

//router.route('/verify-token').get(authVerify).post(authVerify);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);

export default router;