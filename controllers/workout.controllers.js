import  { response_500, response_200, response_201,response_400, response_404 } from '../utils/statuscodes.utils.js';
import prisma from '../config/db.config.js';
import { format } from 'date-fns';
import cookieParser from 'cookie-parser';
export async function createWorkout(req, res) {
    try{
        const {workoutExercises} = req.body;
        const uid = req.user.userId;
        if (!uid) {
            return response_400(res, "User ID is missing in the request");
        }
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
                        status: currentExcercise.status || "yetToStart",
                        
                    }))
                },
                userId: uid
                
            }
        });
        response_201(res,"workout created successfully" ,workout);
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
            response_400(res, "cannot modify workout status to the given status");
            return ;
        }
        const workout = await prisma.workout.findUnique({
            where:{
                userId: req.user.userId,
                id: workoutId
            }
        });
        if(!workout)
        {
            response_404(res, "workout not found");
            return;
        }
        if(workout.status == "completed"){
            response_400(res, "cannot modify status of completed workout");
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
        const {workoutId, exerciseId} = req.params;
        const {status}  = req.body;
        if(!(status == "active" || status == "completed")) {
            response_400(res, "cannot modify exercise status to the given status");return;
        }
        const exercise = await prisma.workout.findUnique({
            where: {
                id: workoutId
            }
        });
        
        if(!exercise){
            response_404(res, "exercise not found");
            return;
        }
        if(req.user.userId != exercise.userId){
            response_403(res, "forbidden");
            return;
        }
        if(exercise.status == "completed"){
            response_400(res, "cannot modify status of completed exercise");
            return;
        }
        const modifiedExercise = await prisma.workoutExercise.update({
            where: {
                id: exerciseId, 
                workoutId: exercise.id
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

export const getWorkoutDates = async (req, res) => {
    try {
        const workouts = await prisma.workout.findMany({
            where: {
                userId: req.user.userId,
                //status: "completed"
            },
            select: {
                created: true,
            }
        });
          // Debugging: Print the retrieved workouts
    

    const creationDates = workouts.map(workout => {
        const date = new Date(workout.created);
        return date.toISOString().split('T')[0];
      });
          
      console.log('Retrieved workout dates:', creationDates);

        response_200(res, "workouts fetched successfully", creationDates);
    } catch (error) {
        response_500(res, "error fetching workouts: ", error);
    }
}

export const getWorkouts = async(req,res) => {
    try{
        const userId = req.user.userId;
        const workouts = await prisma.workout.findMany({
            where: {
                userId: userId
            },
            include: {
                workoutExercises: true
            }
        });

        response_200(res, "workouts fetched successfully", workouts);
    }
    catch(error){
        response_500(res, "error fetching workouts: ", error);
    }
}

export const getWorkoutByDate = async(req,res) => {
    try{
        const {date} = req.params;
        const userId = req.user.userId;
        const targetDate = new Date(date);

        // Calculate start and end of the day for the given date in UTC
        const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));
    
        console.log('Start of day (UTC):', startOfDay.toISOString());
        console.log('End of day (UTC):', endOfDay.toISOString());
    
        // Query workouts within the date range
        const workouts = await prisma.workout.findMany({
          where: {
            userId: userId,
            AND: [
              {
                created: {
                  gte: startOfDay.toISOString(), // Greater than or equal to start of the day (UTC)
                },
              },
              {
                created: {
                  lte: endOfDay.toISOString(), // Less than or equal to end of the day (UTC)
                },
              },
            ],
          },
          include: {
            workoutExercises: true
        }
        });
    
        console.log("workout: ", workouts)
        response_200(res, "workouts fetched successfully", workouts);
    }
    catch(error){
        response_500(res, "error fetching workouts: ", error);
    }
}

export const markPreviosWorkoutAsIncomplete = async(req,res) => {
    try{
        const userId = req.user.userId;
        let currentDate = new Date();
        currentDate.setUTCHours(0,0,0,0);
        console.log("current date: ", currentDate);
        const workouts = await prisma.workout.findMany({
            where: {
                userId: userId,
                status:{ in: ["yetToStart","active"]},
                created: {
                    lte: currentDate.toISOString()
                }
            }
        });

        if(workouts){
            const modifiedWorkouts = await Promise.all(workouts.map(async workout => {
                
                const modifiedWorkout = await prisma.workout.update({
                    where: {
                        id: workout.id
                    },
                    data: {
                        status: "incomplete"
                    }
                });
                return modifiedWorkout;
            }));
            response_200(res, "workout status modified successfully", modifiedWorkouts);
        }
        else{
            response_404(res, "no active workout found");
        }
    }
    catch(error){
        response_500(res, "error modifying workout status: ", error);
    }
}