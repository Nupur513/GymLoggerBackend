import jwt from 'jsonwebtoken';

export async function authVerify(req, res, next){
    // const authHeader = req.headers.authorization;
    // if(!authHeader || !authHeader.startsWith('Bearer ')){
    //     return res.status(401).json({message: "Unauthorized"});
    // }
    // const token = authHeader.split(' ')[1];
    const accesstoken = req.cookies.accessToken;
    if(!accesstoken){
        if(renewAccessToken(req, res).exist){
            next();
        }
        else
        {
            return;
        }
    }
    try{
        const payload = jwt.verify(accesstoken, process.env.JWT_SECRET);
        if(!payload){
            return res.status(401).json({message: "Unauthorized2"});
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
        return res.status(401).json({message: "Unauthorized3"}); 
    }
}

export async function renewAccessToken(req, res){
    const refreshToken = req.cookies.refreshToken;
    const exist = false;
    console.log(refreshToken)
    if(!refreshToken){
        return res.status(401).json({message: "Unauthorized4"});
    }
    try{
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if(!payload){
            return res.status(401).json({message: "Unauthorized5"});
        }
        const accessToken = jwt.sign({userId: payload.userId, firstName: payload.firstName, lastName: payload.lastName}, process.env.JWT_SECRET, {expiresIn: "15m"}) ;
        res.cookie("accessToken", accessToken, {httpOnly: true, maxAge: 15*60*1000, secure: true, sameSite: "none"});
        exist = true;

        return res.status(200).json({exist:exist, message: "Access token renewed successfully"});
    }
    catch(error){
        return res.status(401).json({message: "Unauthorized6"});
    }
}