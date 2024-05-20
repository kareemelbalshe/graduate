import { Router } from "express";
import { registerUserCtrl, loginUserCtrl, verifyUserAccountCtrl } from "../controllers/authController.js";

const router = new Router(); // Create a new router instance

// Route to handle user registration
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.post("/register", registerUserCtrl);

// Route to handle user login
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.post("/login", loginUserCtrl);

// Route to handle user account verification
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.get("/verify/:userId", verifyUserAccountCtrl);

export default router; // Export the router for use in other modules
