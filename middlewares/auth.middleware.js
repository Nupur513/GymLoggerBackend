import jwt from 'jsonwebtoken';

export async function authVerify(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: "Unauthorized"});
    }
    const token = authHeader.split(' ')[1];
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if(!payload){
            return res.status(401).json({message: "Unauthorized"});
        }
        req.user = {
            userId: payload.userId,
            firstName: payload.firstName,
            lastName: payload.lastName
        };
        console.log(req.user);
        next();
        }
    
    catch(error){
        return res.status(401).json({message: "Unauthorized"}); 
    }
}