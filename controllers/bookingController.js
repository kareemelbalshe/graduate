import Stripe from 'stripe'
import Doctor from '../models/Doctor.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import asyncHandler from "express-async-handler"


export const getCheckoutSession=asyncHandler(async(req,res)=>{
    try {
        const doctor=await Doctor.findOne({user:req.params.id})
        const user =await User.findById(req.user.id)

        const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)

        const session=await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:'payment',
            success_url:'http://localhost:58217/checkout-success',
            cancel_url:`${req.protocol}://${req.get('host')}/doctors/${doctor._id}`,
            customer_email:user.email,
            client_reference_id:req.params.doctorId,
            line_items:[
                {
                    price_data:{
                        currency:'bdt',
                        unit_amount:doctor.ticketPrice*100,
                        product_data:{
                            name:doctor.user.username,
                            images:[doctor.user.photo]
                        }
                    },
                    quantity:1
                }
            ]
        })
        const booking=new Booking({
            doctor:doctor.user._id,
            user:user._id,
            ticketPrice:doctor.ticketPrice,
            session:session.id
        })
        await booking.save()
        res.status(200).json({success:true,message:'Successfully paid',session})
    } catch (error) {
        res.status(500).json({success:false,message:'Error creating checkout session',session})
    }
})

export const getAllBooking=asyncHandler(async(req,res)=>{
    const booking=await Booking.find().populate("user").populate("doctor")
    res.status(200).json({success:true,booking})
})