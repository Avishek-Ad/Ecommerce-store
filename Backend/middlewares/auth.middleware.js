import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" })
        }
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decoded.userId)
            if (!user) {
                return res.status(401).json({ message: "Unauthorized - User not found" })
            }
            req.user = user
            next()
        } catch (error) {
            if (error.name === "TOKEN_EXPIRED_ERROR") {
                return res.status(401).json({ message: "Unauthorized - Access token expired" })
            }
            throw error 
        }
    } catch (error) {
        console.log("Error in protectRoute Middleware", error.message)
        res.status(401).json({message : "Unauthorized - Invalid access token"})
    }
}

const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    }else{
        res.status(403).json({message:" Access Denied - Admin only"})
    }
}
export {protectRoute, adminRoute}