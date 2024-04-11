import { Router } from "express";
import { UserBeDoctor, createReport, deleteReport, deleteUserProfileCtrl, getAllReports, getAllUsersCtrl, getUserProfileCtrl, getUsersCountCtrl, makeBlock, profilePhotoUploadCtrl, sendSMSPhone, setPhone, updateUserProfileCtrl } from "../controllers/userController.js";
import { verifyDoctor, verifyToken, verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import validateObject from "../middlewares/validateObject.js";
import { photoUpload } from "../middlewares/photoUpload.js";
import { isBlock } from "../middlewares/isBlock.js";
import { getChatList, getAllDoctors, getLikeList, getWishList, toggleLikeCtrl, updateDoctor, searchDoctor, popularDoctor, newDoctor, getDoctor } from "../controllers/doctorController.js";
import { createHistory, deleteHistory, getAllHistory, getHistoryCount, getSingleHistory, updateHistory, updateHistoryPhoto } from "../controllers/historyController.js";
import { getCheckoutSession } from "../controllers/bookingController.js";
import { createReview, deleteReview, getAllReviews, updateReviewCtrl } from "../controllers/reviewController.js";
import { createLocation, deleteLocation, getAllLocations } from "../controllers/locationController.js";

const router = new Router()

router.route("/admin/dashboard")
    .get(verifyTokenAndAdmin, getAllUsersCtrl)
    .get(verifyTokenAndAdmin, getAllHistory)
    .get(verifyTokenAndAdmin, getAllDoctors)
    .get(verifyTokenAndAdmin, getAllReviews)
    .get(verifyTokenAndAdmin, getAllReports)
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl)


router.get("/",isBlock,verifyToken,getDoctor)


router.route("/profile/:id")
    .get(validateObject, isBlock, verifyTokenAndOnlyUser, getUserProfileCtrl)
    .put(validateObject, isBlock, verifyTokenAndOnlyUser, updateUserProfileCtrl)
    .delete(validateObject, isBlock, verifyTokenAndAuthorization, deleteUserProfileCtrl)
    .post(validateObject, isBlock, verifyDoctor, updateDoctor)
router.route("/profile/profile-photo-upload")
    .post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl)

router.post('/profile/:id/booking', validateObject, isBlock, verifyToken, getCheckoutSession)


router.route("/profile/:id/like-list")
    .get(validateObject, verifyDoctor, getLikeList)
router.route("/profile/:id/wish-list")
    .get(validateObject, verifyTokenAndOnlyUser, getWishList)
router.route("/:id/chat-list")
    .get(validateObject, verifyTokenAndOnlyUser, getChatList)


router.route("/profile/:id/review")
    .post(validateObject, isBlock, verifyToken, createReview)
    .put(validateObject, isBlock, verifyToken, updateReviewCtrl)
    .delete(validateObject, verifyTokenAndAuthorization, deleteReview)
// router.route("/profile/:id/review/:reviewId")


router.route('/profile/:id/makeDoctor')
.post(validateObject, verifyTokenAndAdmin, UserBeDoctor)


router.route('/profile/:id/location')
.post(validateObject, verifyTokenAndOnlyUser, createLocation)
.get(validateObject, verifyTokenAndOnlyUser, getAllLocations)
.delete(validateObject, verifyTokenAndOnlyUser, deleteLocation)


router.route("/:id/like").post(validateObject, verifyToken, toggleLikeCtrl)


// router.route("profile/:id/block").post(validateObject,verifyTokenAndAdmin,makeBlock)
router.route("/block").post(verifyTokenAndAdmin, makeBlock)


router.route("/sendSMS").post(verifyToken, sendSMSPhone)
router.route("profile/:id/set-phone").post(validateObject, verifyToken, setPhone)



router.route("/profile/:id/history")
.post(validateObject, verifyToken, photoUpload.single("image"), createHistory)
router.route("/profile/:id/history/count")
    .get(validateObject, verifyTokenAndAdmin, getHistoryCount)
router.route("/profile/:id/history/:historyId")
    .get(validateObject, getSingleHistory)
    .delete(validateObject, verifyToken, deleteHistory)
    .put(validateObject, verifyToken, updateHistory)
router.route("/profile/:id/history/update-image/:historyId")
    .put(validateObject, verifyToken, photoUpload.single("image"), updateHistoryPhoto)


router.route("/:id/report")
    .post(validateObject, isBlock, verifyToken, createReport)
    .delete(validateObject, isBlock, verifyTokenAndAdmin, deleteReport)


router.get("/search-doctor",isBlock,verifyDoctor,searchDoctor)


router.get("/popular-doctors",isBlock,verifyToken,popularDoctor)


router.get("/new-doctors",isBlock,verifyToken,newDoctor)


export default router