import { response_500 } from '../utils/statuscodes.utils.js';
import prisma from '../config/db.config.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import { response_200, response_201, response_401, response_400 } from '../utils/statuscodes.utils.js';

const selectFields = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    weight: true,
    height: true,
  };

export async function sendFriendRequest(req, res) {
    try{
        const userId = req.user.userId;
    const {friendEmail} = req.body;
        console.log("email: ",friendEmail)
    if(!userId || !friendEmail)
    {
        return response_400(res, "Please provide all the fields")
    }
    
    const friend= await prisma.user.findUnique({
        where: {
            email: friendEmail
        }
        
    })

    if(!friend)
    {
        return response_400(res, "Friend doesnt exist")
    }

    const friendId = friend.id;
    if(await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                  userId1: userId,
                  userId2: friendId,
                },
                {
                  userId1: friendId,
                  userId2: userId,
                },
              ],
        }
    })){
        return response_400(res, "You are already friends with this user");
    }
    console.log("friendId: ",friendId)
    console.log("userId: ",userId)
    const request = await prisma.requests.create({
        data: {
            userFrom: userId,
            userTo: friendId
        }
    })
    return response_201(res, "request sent successfully")
    }
    catch(error)
    {
        return response_500(res, "could not send request",error)
    }
}

export async function acceptDeclineRequest(req, res)
{
    try
    {
        const {accept, requestId} = req.body
        console.log("requeest: ",requestId)
        const request = await prisma.requests.findUnique({
            where: {
                id: requestId
            }
        });
        console.log(request)
        if(!request)
        {
            return response_400(res, "Request does not exist")
        }
        const userId = request.userFrom;
        const friendId = request.userTo

        const deletedRequests = await prisma.requests.deleteMany({
            where:
            {
                OR: 
                [
                    {
                        userFrom: userId,
                        userTo: friendId
                    },
                    {
                        userFrom: friendId,
                        userTo: userId
                    }
                ]
            }
        })
        if(accept)
        {
            const response = await createFriendship(userId, friendId)
            return res.status(response.status).json(response.message)
        }
        return response_200(res, "Request declined successfully");
        
    }
    catch(error)
    {
        return response_500(res,"could not process request" , error)
    }
}

export async function createFriendship(userId, friendId) {
    try {
        if (!userId || !friendId) {
            return {
                status: 400,
                message: "Please provide all the fields"
            };
        }

        if (userId === friendId) {
            return {
                status: 400,
                message: "You cannot be friends with yourself"
            };
        }

        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    {
                        userId1: userId,
                        userId2: friendId,
                    },
                    {
                        userId1: friendId,
                        userId2: userId,
                    },
                ],
            }
        });

        if (existingFriendship) {
            return {
                status: 400,
                message: "You are already friends with this user"
            };
        }

        const friendship = await prisma.friendship.create({
            data: {
                userId1: userId,
                userId2: friendId
            }
        });

        return {
            status: 201,
            message: "Friendship created successfully",
            friendship: friendship
        };
    } catch (error) {
        console.error("Error creating friendship: ", error);
        return {
            status: 500,
            message: "Error creating friendship",
            error: error
        };
    }
}


export async function getFriendships(req, res) {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return response_401(res, "Unauthorized");
        }
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        userId1: userId
                    },
                    {
                        userId2: userId
                    }
                ]
            }
        });
        //extract friend ids
        const friendIds = friendships.map(friendship => {
            if(friendship.userId1 === userId){
                return friendship.userId2;
            }
            return friendship.userId1;
        });
        const friendArray = await prisma.user.findMany({
            where: {
                id: {
                    in: friendIds
                }
            },
            select: selectFields
        });
        return response_200(res, "Friendships fetched successfully", friendArray);
    } catch (error) {
        return response_500(res, "Error fetching friendships", error);
    }
}

export async function deleteFriendship(req, res) {
    try {
        const { friendId } = req.body;
        const userId = req.user.userId;
        console.log("userId: ",userId)
        console.log("friendId: ",friendId)
        if (!userId || !friendId) {
            return response_400(res, "Please provide all the fields");
        }
        const friendship = await prisma.friendship.deleteMany({
            where: {
                OR: [
                    {
                        userId1: userId,
                        userId2: friendId
                    },
                    {
                        userId1: friendId,
                        userId2: userId
                    }
                ]
            }
        });
        return response_200(res, "Friendship deleted successfully", friendship);
    } catch (error) {
        return response_500(res, "Error deleting friendship", error);
    }
}

export async function outgoingRequests(req, res) {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return response_401(res, "Unauthorized");
        }
        const requests = await prisma.requests.findMany({
            where: {
                userFrom: userId
            }
        });
        const friendIds = requests.map(request => request.userTo);
        
        const friendArray = await prisma.user.findMany({
            where: {
                id: {
                    in: friendIds
                }
            }
        });
        // in the friends array, store the request id as well
        
        return response_200(res, "Outgoing requests fetched successfully", friendArray);
    } catch (error) {
        return response_500(res, "Error fetching outgoing requests", error);
    }
}

export async function incomingRequests(req, res) {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return response_401(res, "Unauthorized");
        }
        const requests = await prisma.requests.findMany({
            where: {
                userTo: userId
            }
        });
        const friendIds = requests.map(request => request.userFrom);
        const friendArray = await prisma.user.findMany({
            where: {
                id: {
                    in: friendIds
                }
            }
        });
        friendArray.forEach((friend, index) => {
            friend.requestId = requests[index].id;
        });
        return response_200(res, "Incoming requests fetched successfully", friendArray);
    } catch (error) {
        return response_500(res, "Error fetching incoming requests", error);
    }
}