import { Router } from "express";
import { UserBeDoctor, deleteUserProfileCtrl, getAllUsersCtrl, getUserProfileCtrl, getUsersCountCtrl, makeBlock, profilePhotoUploadCtrl, sendSMSPhone, setPhone, updateUserProfileCtrl } from "../controllers/userController.js";
import { verifyDoctor, verifyToken, verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import validateObject from "../middlewares/validateObject.js";
import { photoUpload } from "../middlewares/photoUpload.js";
import { isBlock } from "../middlewares/isBlock.js";
import { getAllDoctors, getLikeList, getWishList, toggleLikeCtrl, updateDoctor } from "../controllers/doctorController.js";
import { createHistory } from "../controllers/historyController.js";
import { getCheckoutSession } from "../controllers/bookingController.js";

const router = new Router()

router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl)
router.route("/profile").get(verifyTokenAndAdmin, getAllDoctors)

router.route("/profile/:id")
    .get(validateObject,isBlock, getUserProfileCtrl)
    .put(validateObject,isBlock, verifyTokenAndOnlyUser, updateUserProfileCtrl)
    .delete(validateObject,isBlock, verifyTokenAndAuthorization, deleteUserProfileCtrl)
    .post(validateObject,verifyToken,updateDoctor)

    router.post('/profile/:id/booking',validateObject,verifyToken,getCheckoutSession)

router.route("/profile/:id/like-list").get(validateObject, getLikeList)
router.route("/profile/:id/wish-list").get(validateObject, getWishList)

router.route("/profile/profile-photo-upload")
.post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl)

router.route('/profile/:id/addHistory').post(validateObject,verifyDoctor, photoUpload.single("image"), createHistory)

router.route('/profile/:id/makeDoctor').post(validateObject,verifyTokenAndAdmin,UserBeDoctor)

router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl)

router.route("profile/:id/like").post(validateObject,verifyToken, toggleLikeCtrl)
router.route("/like").post(verifyToken, toggleLikeCtrl)

router.route("profile/:id/block").post(validateObject,verifyTokenAndAdmin,makeBlock)
router.route("/block").post(verifyTokenAndAdmin,makeBlock)

router.route("profile/sendSMS").post(verifyToken, sendSMSPhone)
router.route("profile/:id/set-phone").post(validateObject,verifyToken, setPhone)


export default router