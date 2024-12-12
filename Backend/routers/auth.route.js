import express from "express"
import {signup, login, logout, refreshToken, getProfile} from "../controllers/auth.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/refresh-token').post(refreshToken)
router.route('/profile').get(protectRoute, getProfile)

export default router