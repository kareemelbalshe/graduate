import { Router } from "express";
import { getResetPasswordLinkCtrl, resetPasswordCtrl, sendResetPasswordCtrl } from "../controllers/passwordController.js";

const router = new Router()

router.post("/reset-password-link", sendResetPasswordCtrl)

router.route("/reset-password/:userId/:token")
    .get(getResetPasswordLinkCtrl)
    .post(resetPasswordCtrl)

export default router