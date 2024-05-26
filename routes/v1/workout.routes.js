import express from "express";
import {modifyWorkoutStatus,createWorkout, getWorkoutDates, modifyExerciseStatus} from "../../controllers/workout.controllers.js";

const router = express.Router();

router.route('/createWorkout').post(createWorkout);
router.route('/getWorkoutDates').get(getWorkoutDates);
router.route('/modifyWorkoutStatus/:workoutId').patch(modifyWorkoutStatus);
router.route('/modifyExerciseStatus/:workoutId/:exerciseId').patch(modifyExerciseStatus);
export default router;