import {create} from 'zustand'
import {toast} from 'react-hot-toast'
import axios from '../lib/axios'


const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({name, email, password, confirmPassword}) => {
        set({loading: true})

        if (password !== confirmPassword) {
            set({loading: false})
            return toast.error('Passwords do not match')
        }

        try {
            const res = await axios.post('/auth/signup', {name, email, password})
            set({ user: res.data.user, loading: false})
        } catch (error) {
            toast.error(error.response.data.message || "An error occured")
            set({loading: false})
        }
    },

    login: async ({email, password}) => {
        set({loading: true})
        try {
            const res = await axios.post('/auth/login', { email, password })
            set({ user: res.data.user, loading: false })
        } catch (error) {
            toast.error(error.response.data.message || "An error occured")
            set({loading: false})
        }
    },

    logout: async () => {
        try {
            await axios.post('/auth/logout')
            set({user: null})
        } catch (error) {
            toast.error(error.response.data.message || "An error occured")
        }
    },

    checkAuth: async () => {
        set({checkingAuth: true})
        try {
            const res = await axios.get('/auth/profile')
            set({ user:res.data.user, checkingAuth: false })
        } catch (error) {
            set({checkingAuth: false, user:null})
        }
    }
}))

export default useUserStore