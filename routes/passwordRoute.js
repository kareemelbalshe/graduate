import { Router } from "express";
import { resetPasswordCtrl, sendResetPasswordCtrl } from "../controllers/passwordController.js";

const router = new Router();

// Route to send reset password OTP
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.post("/reset-password-otp", sendResetPasswordCtrl);

// Route to reset password
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.route("/reset-password/:userId").post(resetPasswordCtrl);

export default router;
