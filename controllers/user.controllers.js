import { response_500 } from '../utils/statuscodes.utils.js';
import prisma from '../config/db.config.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { response_200, response_201, response_401, response_400 } from '../utils/statuscodes.utils.js';

export async function getUser(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const id = payload.userId;
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });
        return response_200(res, 'User fetched successfully', user);
    } catch (error) {
        return response_500(res, 'Error fetching user', error);
    }
}

export async function updateUser(req, res){
    try{
        const {firstName, lastName, weight, height} = req.body;
        const userId = req.user.userId;
        if(!userId){
            return response_401(res, "Unauthorized");
        }
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                firstName,
                lastName,
                weight,
                height
            }
        });
        return response_200(res, "User updated successfully", user);
    }
    catch(error){
        return response_500(res, "Error updating user", error);
    }
}
