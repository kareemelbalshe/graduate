import jwt from "jsonwebtoken";

export const verifyToken = function (req, res, next) {
    const authToken = req.headers.authorization
    if (authToken) {
        const token = authToken.split(" ")[1]
        try {
            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decodedPayload
            next()
        }
        catch (error) {
            return res.status(401).json({ message: "invalid token, access denied" })
        }
    }
    else {
        return res.status(401).json({ message: "no token provider, access denied" })
    }
}

export const verifyDoctor=function(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.role==='doctor'){
            next()
        }
        else{
            return res.status(403).json({ message: "not allowed, only doctor" })
        }
    })
}

export const verifyTokenAndAdmin = function (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role==='admin') {
            next()
        }
        else {
            return res.status(403).json({ message: "not allowed, only admin" })
        }
    })
}

export const verifyTokenAndOnlyUser = function (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id = req.params.id) {
            next()
        }
        else {
            return res.status(403).json({ message: "not allowed, only user himself" })
        }
    })
}

export const verifyTokenAndAuthorization = function (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id = req.params.id || req.user.role==='admin') {
            next()
        }
        else {
            return res.status(403).json({ message: "not allowed, only user himself or admin" })
        }
    })
}