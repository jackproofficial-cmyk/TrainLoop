import axios from "axios";

const api= axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        'Content-Type' : 'application/json'
    }
})


api.interceptors.response.use(
    (response)=> response,
    (error)=> {
        if(error.response && error.response.status === 401) {
            localStorage.removeItem('isLoggedIn')

            const publicPaths = ['/login', '/register', '/', '/pricing', '/contact', '/features']
            if (!publicPaths.includes(window.location.pathname)){window.location.href = '/login'}
        }
        return Promise.reject(error)
    }
)



export default api