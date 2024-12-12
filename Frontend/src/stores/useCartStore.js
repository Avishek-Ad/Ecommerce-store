import {create} from 'zustand'
import { toast } from 'react-hot-toast'
import axios from '../lib/axios'
import { updateQuantity } from '../../../Backend/controllers/cart.controller';

const useCartStore = create((set, get) => ({
    cart:[],
    coupon:null,
    total:0,
    subTotal:0,

    getCartItems: async () => {
		try {
			const res = await axios.get("/cart");
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			set({ cart: [] });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

    addToCart: async (product) => {
        try {
            await axios.post('/cart', { productId : product._id })
            toast.success('Product added to cart')

            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id)

                const newCart = existingItem
					? prevState.cart.map((item) =>
							item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					  )
					: [...prevState.cart, { ...product, quantity: 1 }];
                return { cart: newCart }                
            })

            get().calculateTotals()

        } catch (error) {
            toast.error(error.response.data.message || 'Failed to add product to cart')   
        }
    },

    calculateTotals: () => {
        const {cart, coupon} = get()
        const subTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
        let total = subTotal
        
        if (coupon) {
            const discount = subTotal * (coupon.discountPercentage / 100)
            total = subTotal - discount
        }

        set({ subTotal, total })
    },

    removeFromCart: async (id) => {
        try {
            await axios.delete(`/cart/${id}`)
            toast.success('Product removed from cart')
            get().getCartItems()
        } catch (error) {
            toast.error(error.response.data.message || 'Failed to remove product from cart')
        }
    },

    updateQuantity: async (id, quantity) => {
        try {
            if (quantity < 1) {
                return get().removeFromCart(id) 
            }
            await axios.put(`/cart/${id}`, { quantity })
            toast.success('Product quantity updated')
            get().getCartItems()
        } catch (error) {
            toast.error(error.response.data.message || 'Failed to update product quantity')
        }
    },
}))

export default useCartStore