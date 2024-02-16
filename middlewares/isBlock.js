import User from "../models/User.js"

export const isBlock=async(req,res,next)=>{
    const user=await User.findById(req.user.id)
    if(user.isBlocked===true){
        return res.status(400).json({ message: "you are blocked" })
    }
    next()
}