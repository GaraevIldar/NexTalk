import axios from 'axios'
import { logout, refreshToken, selectAccessToken } from "../modules/auth/stores/authSlice.ts"

// 👇 вместо прямого импорта store
let _store: any = null

export const injectStore = (store: any) => {
    _store = store
}

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
})

// ===== REQUEST =====
axiosInstance.interceptors.request.use(
    async (config) => {
        if (_store) {
            const state = _store.getState()
            const token = selectAccessToken(state)

            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }

        return config
    },
    (error) => Promise.reject(error)
)

// ===== RESPONSE =====
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry && _store) {
            originalRequest._retry = true

            try {
                const result = await _store.dispatch(refreshToken()).unwrap()

                originalRequest.headers.Authorization = `Bearer ${result?.access_token}`

                return axiosInstance(originalRequest)
            } catch (refreshError) {
                _store.dispatch(logout())
                window.location.href = '/auth'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)