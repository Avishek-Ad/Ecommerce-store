import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js"

const router = express.Router()

router.route("/").get(protectRoute, getCoupon)
router.route("/").post(protectRoute, validateCoupon)

export default router