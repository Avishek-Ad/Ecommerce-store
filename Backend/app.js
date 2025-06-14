import express from "express";
import cookieParser from "cookie-parser";

//routes
import authRoutes from "./routers/auth.route.js";
import productRoutes from "./routers/product.route.js";
import cartRoutes from "./routers/cart.route.js";
import coupenRoutes from "./routers/coupon.route.js";
import paymentRoutes from "./routers/payment.route.js";
import analyticsRoutes from "./routers/analytics.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

//routes
app.use("/api/auth/", authRoutes);
app.use("/api/products/", productRoutes);
app.use("/api/cart/", cartRoutes);
app.use("/api/coupons/", coupenRoutes);
app.use("/api/payments", paymentRoutes);
app.use("api/analytics", analyticsRoutes);

app.use("/", (req, res) => {
  res.send("Hello from backend");
});

export default app;
