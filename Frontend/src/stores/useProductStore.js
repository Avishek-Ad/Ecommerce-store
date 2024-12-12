import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const useProductStore = create((set, get) => ({
    products: [],
    loading: false,

    setProducts: (products) => set({ products }),

    createProduct: async (productData) => {
        set({ loading: true })
        try {
            const res = await axios.post("/products", productData)
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false
            }))
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "An error occured")
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true })
        try {
            const res = await axios.get("/products")
            set({ products: res.data.products, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "Failed to fetch products")
        }
    },

    fetchProductsByCategory: async (category) => {
        set({ loading: true })
        try {
            const res = await axios.get(`/products/category/${category}`)
            set({ products: res.data.products, loading: false })
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "Failed to fetch products")
        }
    },

    deleteProduct: async (productId) => {
        set({ loading: true })
        try {
            await axios.delete(`/products/${productId}`)
            set((prevState) => ({
                products: prevState.products.filter((product) => product._id !== productId),
                loading: false
            }))
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "Failed to delete product")
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`/products/${productId}`)
            set((prevState) => ({
                products: prevState.products.map((product) => (
                    product._id === productId ? { ...product, isFeatured: res.data.isFeatured } : product
                )),
                loading: false
            }))
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "Failed to toggle featured product")
        }
    }
}))

export default useProductStore