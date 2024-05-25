import express from "express";
import {modifyWorkoutStatus,createWorkout,  modifyExerciseStatus} from "../../controllers/workout.controllers.js";

const router = express.Router();

router.route('/createWorkout').post(createWorkout);
router.route('/modifyWorkoutStatus/:workoutId').patch(modifyWorkoutStatus);
router.route('/modifyExerciseStatus/:exerciseId').patch(modifyExerciseStatus);
export default router;