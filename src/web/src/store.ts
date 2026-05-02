import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authReducer from './modules/auth/stores/authSlice'
import serverReducer from './modules/servers/stores/serverSlice'
import channelReducer from './modules/channels/stores/channelSlice'
import chatReducer from './modules/chat/stores/chatSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        servers: serverReducer,
        channels: channelReducer,
        chat: chatReducer,
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