import Product from "../models/product.model.js"

const getCartProducts = async (req, res) => {
    try {
        const productIds = req.user.cartItems.map((item) => item.id);
        const products = await Product.find({_id: {$in: productIds}})

        //add quantity to each product
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id)
            return {...product.toJSON(), quantity: item.quantity}
        })
        res.json(cartItems)
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const addToCart = async (req, res) => {
    try {
        const {productId} = req.body
        const user = req.user

        const existingItem = user.cartItems.find(item => item.id === productId)
        if (existingItem){
            existingItem.quantity += 1
        }else{
            user.cartItems.push(productId)
        }
        await user.save()
        res.json(user.cartItems)
    } catch (error) {
        console.log("Error in addToCart controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const removeAllFromCart = async(req, res) => {
    try {
        const {productId} = req.body
        const user = req.user

        if (!productId){
            user.cartItems = []
        }else{
            user.cartItems = user.cartItems.filter(item => item.id !== productId)
        }
        await user.save()
        res.json(user.cartItems)
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const removeOneFromCart = async(req, res) => {
    try {
        const { id:productId } = req.params
        const user = req.user
        user.cartItems = user.cartItems.filter(item => item.id !== productId)
        await user.save()
        res.json(user.cartItems)
    } catch (error) {
        console.log("Error in removeOneFromCart controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const updateQuantity = async(req, res) => {
    try {
        const { id:productId } = req.params
        const {quantity} = req.body
        const user = req.user

        const existingItem= user.cartItems.find(item => item.id === productId)
        if (existingItem){
            if (quantity === 0){
                user.cartItems = user.cartItems.filter(item => item.id !== productId)
                await user.save()
                return res.json(user.cartItems)
            }
            existingItem.quantity = quantity
            await user.save()
            res.json(user.cartItems)
        }else{
            return res.status(404).json({message:"Product not found in cart"})
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

export {
    addToCart,
    removeAllFromCart,
    getCartProducts,
    updateQuantity,
    removeOneFromCart
}