import { Router } from "express";
import { registerUserCtrl, loginUserCtrl, verifyUserAccountCtrl } from "../controllers/authController.js";
// import passport from "passport";

const router = new Router()

router.post("/register", registerUserCtrl)

router.post("/login", loginUserCtrl)

router.get("/:userId/verify/:token", verifyUserAccountCtrl)

// router.get("/login/success", (req, res) => {
// 	if (req.user) {
// 		res.status(200).json({
// 			error: false,
// 			message: "Successfully Login In",
// 			user: req.user,
// 		});
// 	} else {
// 		res.status(403).json({ error: true, message: "Not Authorized" });
// 	}
// });

// router.get("/login/failed", (req, res) => {
// 	res.status(401).json({
// 		error: true,
// 		message: "Log in failure",
// 	});
// });

// router.get("/google", passport.authenticate("google", ["profile", "email"]));

// router.get(
// 	"/google/callback",
// 	passport.authenticate("google", {
// 		successRedirect: 'http://localhost:3000',
// 		failureRedirect: "/login/failed",
// 	})
// );

// router.get("/logout", (req, res) => {
// 	req.logout();
// 	res.redirect('http://localhost:3000');
// });

export default router