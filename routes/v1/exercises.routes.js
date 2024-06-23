import  express from "express";
import { createExercise, getExercises, getUserExercises} from "../../controllers/exercises.controllers.js";

const router = express.Router();

router.route('/createExercise').post(createExercise);
router.route('/getExercises').get(getExercises);
router.route('/getUserExercises').get(getUserExercises);
export default router;