import bcrypt from 'bcryptjs'
import {response_400, response_404, response_201, response_500} from '../utils/statuscodes.utils.js';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.config.js';

export async function register(req, res) {
    try{
        const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName || !email || !password) {
        response_400(res, "Please provide all the fields");return;
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(user){
        response_400(res, "User already exists");
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword
        }
    });

    const token = jwt.sign({userId: newUser.id, firstName: newUser.firstName, lastName: newUser.lastName}, process.env.JWT_SECRET, {expiresIn: "30d"});

    const returnedUser = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        token: token
    }
    const defaultExercises = await prisma.exercise.createMany({
        data: exercisesArray.map(exercise=>({
            ...exercise,
            userId: newUser.id
        })),
    })
    response_201(res, "User registered successfully", returnedUser);
    }
    catch(error)
    {
        response_500(res, "error registering user: ", error);
    }
}

export async function login(req, res) {
    try{
        const {email, password} = req.body;

        if(email=="" || password==""){
            response_400(res, "invald credentials");
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(!user){
            response_404(res, "user not found");
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            response_400(res, "invalid credentials");return;
        }

        const token = jwt.sign({userId: user.id, firstName: user.firstName, lastName: user.lastName}, process.env.JWT_SECRET, {expiresIn: "30d"}) ;

        const returnedUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            token: token
        }
        response_201(res, "User logged in successfully", returnedUser);
    }
    catch(error)
    {
        response_500(res, "error logging in user: ", error);
    }
}

const exercisesArray = [
    {
        "name": "Dumbell Press",
        "bodyPart": "Chest",
        "equipment": "Dumbell",
        "description": "The dumbell press is a compound exercise that targets the chest, shoulders, and triceps. It involves lying on a bench with weighted dumbells and pressing it upwards from the chest."
    },
    {
        "name": "Barbell Squat",
        "bodyPart": "Legs",
        "equipment": "Barbell",
        "description": "The barbell squat is a compound exercise that targets the quadriceps, hamstrings, glutes, and lower back. It involves lowering your hips from a standing position and then standing back up while holding a barbell across your shoulders."
    },
    {
        "name": "Pull-Up",
        "bodyPart": "Back",
        "equipment": "Pull-Up Bar",
        "description": "The pull-up is a bodyweight exercise that targets the latissimus dorsi, biceps, and upper back. It involves hanging from a pull-up bar and pulling your body upwards until your chin is above the bar."
    },
    {
        "name": "Deadlift",
        "bodyPart": "Back",
        "equipment": "Barbell",
        "description": "The deadlift is a compound exercise that targets the lower back, hamstrings, glutes, and core. It involves lifting a barbell from the ground to hip level while keeping the back straight."
    },
    {
        "name": "Bicep Curl",
        "bodyPart": "Arms",
        "equipment": "Dumbell",
        "description": "The bicep curl is an isolation exercise that targets the biceps. It involves lifting a dumbell from the waist to shoulder level while keeping the upper arm stationary."
    },
    {
        "name": "Tricep Dip",
        "bodyPart": "Arms",
        "equipment": "Dip Bar",
        "description": "The tricep dip is a bodyweight exercise that targets the triceps. It involves lowering and raising your body by bending and extending the elbows while supporting your weight on dip bars."
    },
    {
        "name": "Lateral Raise",
        "bodyPart": "Shoulders",
        "equipment": "Dumbell",
        "description": "The lateral raise is an isolation exercise that targets the lateral deltoids. It involves lifting dumbells from your sides to shoulder height while keeping your arms straight."
    },
    {
        "name": "Leg Press",
        "bodyPart": "Legs",
        "equipment": "Leg Press Machine",
        "description": "The leg press is a compound exercise that targets the quadriceps, hamstrings, and glutes. It involves pushing a weighted platform away from your body using your legs while seated on a leg press machine."
    },
    {
        "name": "Plank",
        "bodyPart": "Core",
        "equipment": "Bodyweight",
        "description": "The plank is a bodyweight exercise that targets the core, including the rectus abdominis, obliques, and lower back. It involves holding a push-up position with your body in a straight line from head to heels."
    },
    {
        "name": "Bench Press",
        "bodyPart": "Chest",
        "equipment": "Barbell",
        "description": "The bench press is a compound exercise that targets the chest, shoulders, and triceps. It involves lying on a bench and pressing a barbell upwards from the chest."
    }
]
