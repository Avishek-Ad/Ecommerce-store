import mongoose from "mongoose";

const coupenSchema = mongoose.Schema({
    code:{
        type: String,
        required: [true, "Code is required"],
        unique: true
    },
    discountPercentage:{
        type: Number,
        required: [true, "Discount percentage is required"],
        min: 0,
        max: 100
    },
    expirationDate:{
        type: Date,
        required: [true, "Expiration date is required"]
    },
    isActive:{
        type: Boolean,
        default: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User id is required"]
    }
}, {timestamps: true})

export default mongoose.model("Coupen", coupenSchema)