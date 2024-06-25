import { Router } from "express";
import { UserBeDoctor, askToBeDoctor, createReport, deleteReport, deleteUserProfileCtrl, getAllReports, getAllUsersCtrl, getUserProfileCtrl, makeBlock, profilePhotoUploadCtrl, updateUserProfileCtrl } from "../controllers/userController.js";
import { verifyDoctor, verifyToken, verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import validateObject from "../middlewares/validateObject.js";
import { photoUpload } from "../middlewares/photoUpload.js";
import { isBlock } from "../middlewares/isBlock.js";
import { getChatList, getAllDoctors, getLikeList, getWishList, toggleLikeCtrl, updateDoctor, popularDoctor, newDoctor, getDoctor, searchAboutPatient, searchAboutDoctor } from "../controllers/doctorController.js";
import { createHistory, deleteHistory, getAllHistory, getSingleHistory, getUserHistory, updateHistory, updateHistoryPhoto } from "../controllers/historyController.js";
import { approvedBooking, cancelledBooking, deleteBooking, getAllBooking, getBookingToDoctor, getBookingToPatient, getCheckoutSession } from "../controllers/bookingController.js";
import { createReview, deleteReview, getAllReviews, getDoctorReviews, updateReviewCtrl } from "../controllers/reviewController.js";
import { createLocation, deleteLocation, getAllLocations, getLocations } from "../controllers/locationController.js";

const router = new Router();

// Admin routes
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.get("/admin/dashboard/patient", verifyTokenAndAdmin, getAllUsersCtrl);
router.get("/admin/dashboard/search-patient", verifyTokenAndAdmin, searchAboutPatient);
router.get("/admin/dashboard/history", verifyTokenAndAdmin, getAllHistory);
router.get("/admin/dashboard/doctor", verifyTokenAndAdmin, getAllDoctors);
router.get("/admin/dashboard/search-doctor", verifyTokenAndAdmin, searchAboutDoctor);
router.get("/admin/dashboard/review", verifyTokenAndAdmin, getAllReviews);
router.get("/admin/dashboard/booking", verifyTokenAndAdmin, getAllBooking);
router.get("/admin/dashboard/report", verifyTokenAndAdmin, getAllReports);

router.route('/:id/makeDoctor').post(validateObject, verifyTokenAndAdmin, UserBeDoctor);
router.route("/block/:id").post(verifyTokenAndAdmin, makeBlock);

router.route('/askToBeDoctor').post(verifyToken, askToBeDoctor);


// User routes
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.route("/profile/:id")
    .get(validateObject, getUserProfileCtrl)
    .put(validateObject, verifyTokenAndOnlyUser, isBlock, updateUserProfileCtrl)
    .delete(validateObject, verifyTokenAndAuthorization, isBlock, deleteUserProfileCtrl)
    .post(validateObject, verifyDoctor, isBlock, updateDoctor);

router.route("/profile/profile-photo-upload")
    .post(verifyToken, isBlock, photoUpload.single("image"), profilePhotoUploadCtrl);

// Booking routes
router.post('/:id/booking', validateObject, verifyToken, isBlock, getCheckoutSession);
router.post('/booking-approve/:bookingId', verifyDoctor, isBlock, approvedBooking);
router.post('/booking-cancel/:bookingId', verifyToken, isBlock, cancelledBooking);
router.delete('/booking/:bookingId', verifyToken, isBlock, deleteBooking);
router.get('/booking-doctor', verifyDoctor, isBlock, getBookingToDoctor);
router.get('/booking-patient', verifyToken, isBlock, getBookingToPatient);

// search routes
router.get("/doctor", getDoctor);
router.get("/location", getLocations);

// Like, wish, and chat list routes
router.route("/:id/like").post(validateObject, verifyToken, isBlock, toggleLikeCtrl);
router.route("/:id/like-list").get(validateObject, verifyDoctor, isBlock, getLikeList);
router.route("/:id/wish-list").get(validateObject, verifyTokenAndOnlyUser, isBlock, getWishList);
router.route("/:id/chat-list").get(validateObject, verifyTokenAndOnlyUser, isBlock, getChatList);

// Review routes
router.route("/profile/:id/review")
    .get(validateObject, verifyDoctor, isBlock, getDoctorReviews)
    .post(validateObject, verifyToken, isBlock, createReview);
router.route("/profile/:id/review/:reviewId")
    .put(validateObject, verifyToken, isBlock, updateReviewCtrl)
    .delete(validateObject, verifyTokenAndAuthorization, isBlock, deleteReview);

// Location routes
router.route('/profile/:id/location')
    .post(validateObject, verifyDoctor, isBlock, createLocation)
    .get(validateObject, verifyToken, isBlock, getAllLocations);
router.route('/profile/:id/location/:locationId')
    .delete(validateObject, verifyTokenAndAuthorization, deleteLocation);

// History routes
router.route("/profile/:id/history")
    .post(validateObject, verifyDoctor, isBlock, photoUpload.single("image"), createHistory)
    .get(validateObject, verifyToken, isBlock, getUserHistory);
router.route("/profile/history/:historyId")
    .get(verifyToken, isBlock, getSingleHistory)
    .delete(verifyTokenAndAuthorization, isBlock, deleteHistory)
    .post(verifyDoctor, isBlock, updateHistory);
router.route("/profile/history/update-image/:historyId")
    .put(verifyTokenAndOnlyUser, isBlock, photoUpload.single("image"), updateHistoryPhoto);

// Report routes
router.route("/:id/report").post(validateObject, verifyToken, isBlock, createReport);
router.route("/report/:reportId").delete(verifyTokenAndAdmin, isBlock, deleteReport);

// Additional routes
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.get("/search-patient", verifyDoctor, isBlock, searchAboutPatient);
router.get("/popular-doctors", popularDoctor);
router.get("/new-doctors", newDoctor);

export default router;
