import express from "express"
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js"
import { getAnalytics } from "../controllers/analytics.controller.js"

const router = express.Router()

router.route("/").get(protectRoute, adminRoute, getAnalytics)

export default router