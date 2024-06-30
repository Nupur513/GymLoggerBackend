import express from 'express'
import { register, login,  logout } from '../../controllers/auth.controllers.js'
import { authVerify } from '../../middlewares/auth.middleware.js'

const router = express.Router();

router.route('/verify-token').get(authVerify).get(authVerify, (req, res) => {
    // If authVerify passes, we will reach this point
    return res.status(200).json({ valid: true, message: "Authorized" });
});
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);

export default router;