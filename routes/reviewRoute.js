import { Router } from "express";
import { getAllReviews,createReview, deleteReview } from "../controllers/reviewController.js";
import { verifyToken, verifyTokenAndAdmin  } from "../middlewares/verifyToken.js";
import validateObject from "../middlewares/validateObject.js";
import { isBlock } from "../middlewares/isBlock.js";

const router=Router({mergeParams:true})

router.route('/').get(verifyTokenAndAdmin,getAllReviews).post(isBlock,verifyToken,createReview)
router.delete('/:reviewId',validateObject,verifyTokenAndAdmin,deleteReview)

export default router