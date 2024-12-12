import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.mode === 'development' ? 'http://localhost:5000/api' : `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api`,
    withCredentials: true // send cookies to backend

})
export default axiosInstance