import Coupon from "../models/coupon.model.js"

const getCoupon = async(req, res) => {
    try {
        const coupon = await Coupon.findOne({userId: req.user._id, isActive: true})
        
        res.json(coupon || null)
    } catch (error) {
        console.log("Error in getCoupon controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const validateCoupon = async(req, res) => {
    try {
        const {code} = req.body
        const coupon = await Coupon.findOne({code:code, userId: req.user._id, isActive: true})

        if (!coupon){
            res.status(404).json({message:"Coupon not found"})
        }

        if (coupon.expiryDate < Date.now()){
            coupon.isActive = false
            await coupon.save()
            res.status(404).json({message:"Coupon expired"})
        }

        res.json({
            message:"Coupon is valid",
            discountPercentage: coupon.discountPercentage,
            code: coupon.code
        })
    } catch (error) {
        console.log("Error in validateCoupon controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

export {getCoupon, validateCoupon}