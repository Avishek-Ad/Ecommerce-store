import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    cartItems: [
        {
            quantity:{
                type: Number,
                default: 1
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            }
        }
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    }
}, {
    timestamps: true
})

userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next()
    }
    try {
        const salt = bcrypt.genSaltSync(10)
        this.password = bcrypt.hashSync(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function(password) {
    const isMatch = bcrypt.compareSync(password, this.password)
    return isMatch
}

export default mongoose.model("User", userSchema)