import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import radis from "../dbs/redis.js"

const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })

    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })
    return {accessToken, refreshToken}
}

const storeRefreshToken = async (userId, refreshToken) => {
    await radis.set(`refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60)
}

const setCookie = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevents xss attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevents csrf attacks
        maxAge: 15*60*1000 // 15 minutes
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //prevents xss attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevents csrf attacks        
        maxAge: 7*24*60*60*1000 // 7days
    }
    )
}

const signup = async (req,res) => {
    try {
        const {name, email, password} = req.body
        const userExists = await User.findOne({email})
        if (userExists) {
            return res.status(400).json({message:"User already exists"})
        }
        const user = await User.create({name, email, password})

        //authentication
        const {accessToken, refreshToken} = generateTokens(user._id)
        await storeRefreshToken(user._id, refreshToken)
        setCookie(res, accessToken, refreshToken)
        
        res.status(201).json({user:{
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
        }, message:"User created successfully"})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const login = async (req,res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message:"User does not exist"})
        }
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(400).json({message:"Invalid (password) credentials"})
        }

        //authentication
        const {accessToken, refreshToken} = generateTokens(user._id)
        await storeRefreshToken(user._id, refreshToken)
        setCookie(res, accessToken, refreshToken)

        res.status(200).json({user:{
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
        }, message:"Login successful"})
    } catch (error) {
        console.log("Error in login", error.message)
        res.status(500).json({message : error.message})
    }
}

const logout = async (req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            radis.del(`refresh_token:${decoded.userId}`)
        }

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.json({message:"Logout successful"})
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

const refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken){
            return res.status(401).json({message:"No refresh token Provided"})
        }
        
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const storedToken = await radis.get(`refresh_token:${decoded.userId}`)
        
        if (refreshToken !== storedToken){
            return res.status(401).json({message:"Invalid refresh token"})
        }
        const accessToken = jwt.sign({userId:decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn:"15m"
        })
        
        res.cookie("accessToken", accessToken, {
            httpOnly: true, //prevents xss attacks
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // prevents csrf attacks        
            maxAge: 15*60*1000 // 15 minutes
        })
        res.json({message:"Access token refreshed"})
    } catch (error) {
        console.log("Error in Refresh ", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const getProfile = async(req, res) => {
    try {
        res.json({user:req.user})
    } catch (error) {
        console.log("Error in getProfile controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

export {signup, login, logout, refreshToken, getProfile}