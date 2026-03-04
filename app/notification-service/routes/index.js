import express from "express";
import gatewayController from "../controllers/index.js";

/**
 * Định nghĩa các route trong này -> gọi hàm controller để xử lý
 */

const router = express.Router();

router.get("/test", gatewayController.test);
export default router;
