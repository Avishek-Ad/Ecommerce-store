import express from "express"
import {
    getCartProducts,
    updateQuantity,
    addToCart,
    removeAllFromCart,
    removeOneFromCart
} from "../controllers/cart.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.route("/").get(protectRoute, getCartProducts)
router.route("/").post(protectRoute, addToCart)
router.route("/").delete(protectRoute, removeAllFromCart)
router.route("/:id").put(protectRoute, updateQuantity)
router.route("/:id").delete(protectRoute, removeOneFromCart)

export default router