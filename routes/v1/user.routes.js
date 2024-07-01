import express from "express";
import { getUser,getUserId, updateUser} from "../../controllers/user.controllers.js";
import { authVerify } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.route('/getUser').get(authVerify).get(getUser);
router.route('/getUserId').get(authVerify).get(getUserId);
router.route('/updateUser').get(authVerify).patch(updateUser);
export default router;