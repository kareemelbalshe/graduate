import { Router } from "express";
import { getResetPasswordLinkCtrl, resetPasswordCtrl, sendResetPasswordLinkCtrl } from "../controllers/passwordController.js";

const router = new Router()

router.post("/reset-password-link", sendResetPasswordLinkCtrl)

router.route("/reset-password/:userId/:token")
    .get(getResetPasswordLinkCtrl)
    .post(resetPasswordCtrl)

export default router