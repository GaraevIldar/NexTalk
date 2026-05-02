import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authReducer from './modules/auth/stores/authSlice'
import serverReducer from './modules/servers/stores/serverSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        servers: serverReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['auth/handleAuthCallback/fulfilled'],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

import { injectStore } from './processes/axiosInstance'

injectStore(store)