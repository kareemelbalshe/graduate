import Doctor from "../models/Doctor.js"
import User from "../models/User.js"

export const getAllDoctors=async(req,res)=>{
    const doctors=await User.find({role:'doctor'}).select("-password")
    res.status(200).json(doctors)
}

export const updateDoctor=async(req,res)=>{
    const doctor=await Doctor.findOneAndUpdate({user:req.params.id},{
        $set:{
            specialization:req.body.specialization,
            bio:req.body.bio,
            about:req.body.about,
            ticketPrice:req.body.ticketPrice
        },
        $push:{
            experiences:req.body.experiences,
            qualifications:req.body.qualifications,
            timeSlots:req.body.timeSlots
        }
    })
    res.status(201).json({ message: "Doctor is updated",doctor })
}

export const toggleLikeCtrl = async (req, res) => {
    const loginUser = req.user.id

    console.log()

    let doctor=await Doctor.findOne({user:(req.params.id||req.body.id)})
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" })
    }
    const isDoctorAlreadyLiked = doctor.likes.find((user) => user.toString() === loginUser)
    if (isDoctorAlreadyLiked) {
        await Doctor.findOneAndUpdate({user:req.params.id}, {
            $set:{
                isLike:false
            },
            $pull: {
                likes: loginUser
            }
        }, { new: true })
        await User.findByIdAndUpdate(loginUser,{
            $pull:{
                wishlist:(req.params.id||req.body.id)
            }
        })
        res.status(200).json({success:false})
    }
    else {
        await Doctor.findOneAndUpdate({user:req.params.id}, {
            $set:{
                isLike:true
            },
            $push: {
                likes: loginUser
            }
        }, { new: true })
        await User.findByIdAndUpdate(loginUser,{
            $push:{
                wishlist:(req.params.id||req.body.id)
            }
        })
        res.status(200).json({success:true})
    }
}

export const getLikeList=async(req,res)=>{
    const doctor=await Doctor.findOne({user:req.params.id})

    const users=doctor.likes.find()
    
    res.status(200).json(users)
}

export const getWishList=async(req,res)=>{
    const user=await User.findById(req.params.id)
    const doctors=user.wishlist.find()
    res.status(200).json(doctors)
}
export const searchPatient=async(req,res)=>{
    const user=await User.findById(req.body.id)
    res.status(200).json(user)
}

export const getSpecializationDoctor = async (req, res) => {
    const { specialization } = req.query
    let doctor
    
    if (specialization) {
        doctor = await Doctor.find({ specialization: specialization })
            .sort({ totalRating })
            .populate("user", ["-password"])
    }
    else {
        doctor = await Doctor.find()
            .sort({ totalRating })
            .populate("user", ["-password"])
    }
    res.status(200).json(doctor)
}