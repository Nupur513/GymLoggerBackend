import  { response_500, response_200,response_404 } from '../utils/statuscodes.utils.js';
import prisma from '../config/db.config.js';

export async function createWorkout(req, res) {
    try{
        const {workoutExercises} = req.body;
        const workout = await prisma.workout.create({
            data: {
                status: "yetToStart",
                workoutExercises: {
                    create: workoutExercises.map(currentExcercise => ({
                        exercise: {
                            connect: { id: currentExcercise.exerciseId }
                        },
                        name: currentExcercise.name,
                        sets: currentExcercise.sets,
                        reps: currentExcercise.reps,
                        weight: currentExcercise.weight,
                        status: currentExcercise.status || "yetToStart"
                    }))
                },
                
            }
        });
        response_200(res,"workout created successfully" ,workout);
    }
    catch(error)
    {
        response_500(res, "error creating workout: ",error);
    }
}

export async function modifyWorkoutStatus(req,res){
    try{
        const {workoutId} = req.params;
        const {status} = req.body;
        if(!(status == "active" || status == "completed")) {
            response_404(res, "cannot modify workout status to the given status");
            return ;
        }
        const workout = await prisma.workout.findUnique({
            where:{
                id: workoutId
            }
        });
        if(!workout)
        {
            response_404(res, "workout not found");
            return;
        }
        if(workout.status == "completed"){
            response_404(res, "cannot modify status of completed workout");
            return;
        }
        const modifiedWorkout = await prisma.workout.update({
            where: {
                id: workoutId
            },
            data: {
                status: status
            }
        });
        response_200(res,"workout status modified successfully",modifiedWorkout);
    }
    catch(error){
        response_500(res, "error modifying workout status: ",error);
    }
}

export async function modifyExerciseStatus(req,res){
    try{
        const {exerciseId} = req.params;
        const {status}  = req.body;
        if(!(status == "active" || status == "completed")) {
            response_404(res, "cannot modify exercise status to the given status");return;
        }
        const exercise = await prisma.workoutExercise.findUnique({
            where: {
                id: exerciseId
            }
        });
        if(!exercise){
            response_404(res, "exercise not found");
            return;
        }
        if(exercise.status == "completed"){
            response_404(res, "cannot modify status of completed exercise");
            return;
        }
        const modifiedExercise = await prisma.workoutExercise.update({
            where: {
                id: exerciseId,   
            },
            data: {
                status: status
            }
        });
        
        response_200(res,"exercise status modified successfully",modifiedExercise);
    }
    catch(error){
        response_500(res, "error modifying exercise status: ",error);
    }
}

