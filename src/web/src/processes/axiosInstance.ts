import axios from 'axios';
import {logout, refreshToken, selectAccessToken} from "../modules/auth/stores/authSlice.ts";
import {store} from "../store.ts";


export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const state = store.getState()
        const token = selectAccessToken(state)

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Интерцептор для обработки 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Диспатчим refreshToken и ждем результата
                const result = await store.dispatch(refreshToken()).unwrap()

                // Обновляем заголовок
                originalRequest.headers.Authorization = `Bearer ${result?.access_token}`

                // Повторяем запрос
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                // Если не удалось обновить - выходим
                store.dispatch(logout())
                window.location.href = '/auth'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)