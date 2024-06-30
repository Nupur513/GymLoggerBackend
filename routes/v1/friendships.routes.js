import express from 'express';
import { getFriendships, deleteFriendship, createFriendship, sendFriendRequest, acceptDeclineRequest, incomingRequests, outgoingRequests } from '../../controllers/friendships.controllers.js';
import { authVerify } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/getFriendships').get(authVerify).get(getFriendships);
router.route('/deleteFriendship').delete(authVerify).delete(deleteFriendship);
//router.route('/createFriendship').post(authVerify).post(createFriendship);
router.route('/sendRequest').post(authVerify).post(sendFriendRequest);
router.route('/acceptDeclineRequest').patch(authVerify).patch(acceptDeclineRequest);
router.route('/incomingRequests').get(authVerify).get(incomingRequests);
router.route('/outgoingRequests').get(authVerify).get(outgoingRequests);
export default router;