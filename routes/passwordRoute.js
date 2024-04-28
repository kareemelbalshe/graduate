import { Router } from "express";
import { resetPasswordCtrl, sendResetPasswordCtrl } from "../controllers/passwordController.js";

const router = new Router()

router.post("/reset-password-otp", sendResetPasswordCtrl)

router.route("/reset-password/:userId").post(resetPasswordCtrl)// to modify

export default router