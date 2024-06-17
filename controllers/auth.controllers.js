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

    const refreshToken = jwt.sign({userId: user.id, firstName: user.firstName, lastName: user.lastName}, process.env.JWT_SECRET, {expiresIn: "30d"}) ;
    const accessToken = jwt.sign({userId: user.id, firstName: user.firstName, lastName: user.lastName}, process.env.JWT_SECRET, {expiresIn: "1m"}) ;

        res.cookie("refreshToken", refreshToken, {httpOnly: true, maxAge: 30*24*60*60*1000, secure: true, sameSite: "strict"});
        res.cookie("accessToken", accessToken, {httpOnly: true, maxAge: 60*1000, secure: true, sameSite: "strict"});

    const returnedUser = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
       // token: token
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

        const refreshToken = jwt.sign({userId: user.id, firstName: user.firstName, lastName: user.lastName}, process.env.JWT_SECRET, {expiresIn: "30d"}) ;
        const accessToken = jwt.sign({userId: user.id, firstName: user.firstName, lastName: user.lastName}, process.env.JWT_SECRET, {expiresIn: "1m"}) ;

        res.cookie("refreshToken", refreshToken, {httpOnly: true, maxAge: 30*24*60*60*1000, secure: true, sameSite: "strict"});
        res.cookie("accessToken", accessToken, {httpOnly: true, maxAge: 60*1000, secure: true, sameSite: "strict"});

        const returnedUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            success:true
        }
        response_201(res, "User logged in successfully", returnedUser);
    }
    catch(error)
    {
        response_500(res, "error logging in user: ", error);
    }
}


// export async function authVerify(req, res){
//     // const authHeader = req.headers.authorization;
//     // if(!authHeader || !authHeader.startsWith('Bearer ')){
//     //     return res.status(401).json({message: "Unauthorized"});
//     // }
//     // const token = authHeader.split(' ')[1];
//     console.log(req.cookies.accessToken);
//     const valid = false;
    
//     const accesstoken = req.cookies.accessToken;
//     if(!accesstoken){
//         if(renewAccessToken(req, res).exist){
//             return response_201(res, "Authorized");
//         }
//         else
//         {
//             console.log("22");
//             return res.status(401).json({valid: valid, message: "Unauthorized1"});
//         }
//     }
//     try{
//         console.log("23");
//         const payload = jwt.verify(accesstoken, process.env.JWT_SECRET);
//         if(!payload){
//             console.log("24");
//             return res.status(401).json({valid: valid, message: "Unauthorized2"});
//         }
//         req.user = {
//             userId: payload.userId,
//             firstName: payload.firstName,
//             lastName: payload.lastName
//         };
//         console.log(req.user);
//         console.log("harsq");
        
//         console.log("25");
//         return res.status(200).json({valid: true, message: "Authorized"});
//         }
    
//     catch(error){
//         return res.status(401).json({valid: valid, message: "Unauthorized3"}); 
//     }
// }

export async function authVerify(req, res) {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            const renewed = await renewAccessToken(req, res);
            if (renewed.exist) {
                console.log("renewing token");
                return res.status(200).json({ valid: true, message: "Authorized" });
            } else {
                console.log("cannot be renewed");
                return res.status(401).json({ valid: false, message: "Unauthorized1" });
            }
        }

        const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
        if (!payload) {
            return res.status(401).json({ valid: false, message: "Unauthorized2" });
        }

        req.user = {
            userId: payload.userId,
            firstName: payload.firstName,
            lastName: payload.lastName
        };

        return res.status(200).json({ valid: true, message: "Authorized" });
    } catch (error) {
        console.error("Error in authVerify:", error);
        return res.status(401).json({ valid: false, message: "Unauthorized3" });
    }
}

export async function renewAccessToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    let exist = false; // Use let here because exist might change

    if (!refreshToken) {
        // Instead of sending response here, return value
        return { exist: false };
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (!payload) {
            // Instead of sending response here, return value
            return { exist: false };
        }

        const accessToken = jwt.sign({ userId: payload.userId, firstName: payload.firstName, lastName: payload.lastName }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 10 * 1000, secure: true, sameSite: "strict" });

        exist = true;
        // Instead of sending response here, return value
        return { exist: true };
    } catch (error) {
        console.error("Error in renewAccessToken:", error);
        // Instead of sending response here, return value
        return { exist: false };
    }
}

// Other functions (register, login) should similarly ensure they only send one response per request.


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
