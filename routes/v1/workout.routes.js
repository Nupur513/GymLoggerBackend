import express from "express";
import {modifyWorkoutStatus,createWorkout, getWorkoutDates, getWorkouts, modifyExerciseStatus, getWorkoutByDate} from "../../controllers/workout.controllers.js";
import { authVerify } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.route('/createWorkout').get(authVerify).post(createWorkout);
router.route('/getWorkoutDates').get(getWorkoutDates);
router.route('/modifyWorkoutStatus/:workoutId').patch(modifyWorkoutStatus);
router.route('/modifyExerciseStatus/:workoutId/:exerciseId').patch(modifyExerciseStatus);
router.route('/getWorkouts').get(authVerify).get(getWorkouts);
router.route('/:date').get(authVerify).get(getWorkoutByDate);
export default router;