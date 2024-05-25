import  express from "express";
import { createExercise, getExercises} from "../../controllers/exercises.controllers.js";

const router = express.Router();

router.route('/createExercise').post(createExercise);
router.route('/getExercises').get(getExercises);

export default router;