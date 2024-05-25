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