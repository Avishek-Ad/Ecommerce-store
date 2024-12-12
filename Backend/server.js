import express from "express";
import dotenv from "dotenv"
dotenv.config()
import cookieParser from "cookie-parser";
//dataBase
import connectDB from "./dbs/connect.js";

//routes
import authRoutes from "./routers/auth.route.js"
import productRoutes from "./routers/product.route.js"
import cartRoutes from "./routers/cart.route.js"
import coupenRoutes from "./routers/coupon.route.js"
import paymentRoutes from "./routers/payment.route.js"
import analyticsRoutes from "./routers/analytics.route.js"

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json( { limit: "10mb" } ))
app.use(cookieParser())

//routes
app.use("/api/auth/", authRoutes)
app.use("/api/products/", productRoutes)
app.use("/api/cart/", cartRoutes)
app.use("/api/coupons/", coupenRoutes)
app.use("/api/payments", paymentRoutes)
app.use("api/analytics", analyticsRoutes)

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, ()=>{
            console.log(`Server is listening on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()