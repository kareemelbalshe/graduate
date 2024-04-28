import { Router } from "express";
import { UserBeDoctor, createReport, deleteReport, deleteUserProfileCtrl, getAllReports, getAllUsersCtrl, getUserProfileCtrl, makeBlock, profilePhotoUploadCtrl, updateUserProfileCtrl } from "../controllers/userController.js";
import { verifyDoctor, verifyToken, verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import validateObject from "../middlewares/validateObject.js";
import { photoUpload } from "../middlewares/photoUpload.js";
import { isBlock } from "../middlewares/isBlock.js";
import { getChatList, getAllDoctors, getLikeList, getWishList, toggleLikeCtrl, updateDoctor, popularDoctor, newDoctor, getDoctor, searchAboutPatient, searchAboutDoctor } from "../controllers/doctorController.js";
import { createHistory, deleteHistory, getAllHistory, getSingleHistory, getUserHistory, updateHistory, updateHistoryPhoto } from "../controllers/historyController.js";
import { getCheckoutSession } from "../controllers/bookingController.js";
import { createReview, deleteReview, getAllReviews, getDoctorReviews, updateReviewCtrl } from "../controllers/reviewController.js";
import { createLocation, deleteLocation, getAllLocations, getLocations } from "../controllers/locationController.js";

const router = new Router()

router.get("/admin/dashboard/patient", verifyTokenAndAdmin, getAllUsersCtrl)
router.get("/admin/dashboard/search-patient", verifyTokenAndAdmin, searchAboutPatient)
router.get("/admin/dashboard/history", verifyTokenAndAdmin, getAllHistory)
router.get("/admin/dashboard/doctor", verifyTokenAndAdmin, getAllDoctors)
router.get("/admin/dashboard/search-doctor", verifyTokenAndAdmin, searchAboutDoctor)
router.get("/admin/dashboard/review", verifyTokenAndAdmin, getAllReviews)
router.get("/admin/dashboard/report", verifyTokenAndAdmin, getAllReports)

router.route('/profile/:id/makeDoctor')
    .post(validateObject, verifyTokenAndAdmin, UserBeDoctor)

router.route("/block").post(verifyTokenAndAdmin, makeBlock)



router.get("/doctor", verifyToken, isBlock, getDoctor)
router.get("/location", verifyToken, isBlock, getLocations)


router.route("/profile/:id")
    .get(validateObject, verifyTokenAndOnlyUser, isBlock, getUserProfileCtrl)
    .put(validateObject, verifyTokenAndOnlyUser, isBlock, updateUserProfileCtrl)
    .delete(validateObject, verifyTokenAndAuthorization, isBlock, deleteUserProfileCtrl)
    .post(validateObject, verifyDoctor, isBlock, updateDoctor)
router.route("/profile/profile-photo-upload")
    .post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl)

router.post('/profile/:id/booking', validateObject, verifyToken, getCheckoutSession)


router.route("/:id/like").post(validateObject, verifyToken, isBlock, toggleLikeCtrl)
router.route("/:id/like-list")
    .get(validateObject, verifyDoctor, getLikeList)
router.route("/:id/wish-list")
    .get(validateObject, verifyTokenAndOnlyUser, getWishList)
router.route("/:id/chat-list")
    .get(validateObject, verifyTokenAndOnlyUser, getChatList)


router.route("/profile/:id/review")
    .get(validateObject, verifyDoctor, isBlock, getDoctorReviews)
    .post(validateObject, verifyToken, isBlock, createReview)
    .put(validateObject, verifyToken, isBlock, updateReviewCtrl)
    .delete(validateObject, verifyTokenAndAuthorization, deleteReview)



router.route('/profile/:id/location')
    .post(validateObject, verifyDoctor, createLocation)
    .get(validateObject, verifyToken, getAllLocations)
    .delete(validateObject, verifyTokenAndAuthorization, deleteLocation)



router.route("/profile/:id/history")
    .post(validateObject, verifyDoctor, photoUpload.single("image"), createHistory)
    .get(validateObject, verifyToken, getUserHistory)

router.route("/history/:historyId")
    .get(verifyToken, getSingleHistory)
    .delete(verifyTokenAndAuthorization, deleteHistory)
    .put(verifyDoctor, updateHistory)
router.route("/history/update-image/:historyId")
    .put(validateObject, verifyTokenAndOnlyUser, photoUpload.single("image"), updateHistoryPhoto)


router.route("/:id/report")
    .post(validateObject, verifyToken, isBlock, createReport)
    .delete(validateObject, verifyTokenAndAdmin, isBlock, deleteReport)


router.get("/search-patient", verifyDoctor, isBlock, searchAboutPatient)
router.get("/search-doctor", verifyToken, isBlock, searchAboutDoctor)


router.get("/popular-doctors", verifyToken, isBlock, popularDoctor)


router.get("/new-doctors", verifyToken, isBlock, newDoctor)


export default router