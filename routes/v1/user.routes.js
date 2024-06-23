import express from "express";
import { getUser, updateUser} from "../../controllers/user.controllers.js";
import { authVerify } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.route('/getUser').get(authVerify).get(getUser);
router.route('/updateUser').get(authVerify).patch(updateUser);
export default router;