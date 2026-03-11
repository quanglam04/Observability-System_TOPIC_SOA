import express from "express";
import userController from "../controllers/index.js";

/**
 * Định nghĩa các route trong này -> gọi hàm controller để xử lý
 */

const router = express.Router();

router.get("/test", userController.test);
router.post("/register", userController.register)
router.post("/login", userController.login)
router.get("/profile/:id", userController.profile)
router.post("/forgot-password", userController.forgotPassword)
router.put("/change-password/:id", userController.changePassword);
export default router;
