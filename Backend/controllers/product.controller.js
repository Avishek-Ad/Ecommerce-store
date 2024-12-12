import Product from "../models/product.model.js"
import radis from "../dbs/redis.js"
import cloudinary from "../dbs/cloudinary.js"

const getAllProducts = async (req, res) => {
    try{
        const products = await Product.find({})
        res.status(200).json({ products })
    }catch(error){
        console.log("Error in getAllProducts controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const getFeaturedProducts = async(req, res) => {
    try{
        //check if featured products are in radis
        let featuredProducts = await radis.get("featured_products")
        if (!featuredProducts){
            return res.json(json.parse(featuredProducts))
        }

        //if not in radis, get from mongodb
        //.lean() is gonna return a plain js object instead of mongoose document
        //which is good for performance
        featuredProducts = await Product.find({isFeatured : true}).lean()

        await radis.set("featured_products", json.stringify(featuredProducts))
        res.json(featuredProducts)
    }catch(error){
        console.log("Error in getFeaturedProducts controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const createProduct = async(req, res) => {
    try {
        const {name, description, price, category, image} = req.body
        let cloudinaryResponse = null

        if (image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"})
        }
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category
        })
        res.status(201).json(product)
    } catch (error) {
        console.log("Error in createProduct controller", error.message)
        res.status(500).json({message:"Server Error", error: error.message})
    }
}

const deleteProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product){
            return res.status(404).json({message:"Product not found"})
        }

        if (product.image){
            const publicId = product.image.split("/").pop().split(".")[0]
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("deleted image from cloudinary")
            } catch (error) {
                console.log("Error deleting image from cloudinary", error)
            }
        }
        await Product.findByIdAndDelete(req.params.id)
        res.json({message: "product deleted successfully"})
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message)
        res.status(500).json({message:"Server Error", error:error.message})
    }
}

const getRecommendedProducts = async(req, res) => {
    try {
        const product = await Product.aggregate([
            {
                $sample: {size: 3}
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1
                }
            }
        ])
        res.json(product)
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message)
        res.status(500).json({message:"Server Error", error:error.message})
    }
}

const getProductsByCategory = async(req, res) => {
    const {category} = req.params
    try {
        const products = await Product.find({category})
        res.json({products})
    } catch (error) {
        console.log("Error in getProductsByCategory", error.message)
        res.status(500).json({message:"Server Error", error:error.message})
    }
}

const toggleFeaturedProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (product){
            product.isFeatured = !product.isFeatured
            const updatedProduct = await product.save()
            await updateFeaturedProductsCache()
            res.json(updatedProduct)
        }
        else{
            res.status(404).json({message:"Product not found"})
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message)
        res.status(500).json({message:"Server Error", error:error.message})
    }
}

async function updateFeaturedProductsCache(){
    try {
        const featuredProducts = await Product.find({ isFeatured:true }).lean()
        await radis.set("featured_products", JSON.stringify(featuredProducts))
    } catch (error) {
        console.log("Error in updating cache function")
    }
}

export {
    getAllProducts,
    getFeaturedProducts,
    createProduct,
    deleteProduct,
    getRecommendedProducts,
    getProductsByCategory,
    toggleFeaturedProduct
}