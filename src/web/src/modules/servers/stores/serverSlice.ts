import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {Guild} from "../../../shared/types/requestTypes.ts";
import {getUserGuilds} from "../../../processes/guild/getUserGuilds.ts";

interface ServerState {
    servers: Guild[]
    currentServer: Guild | null
    isLoading: boolean
    error: string | null
}

const initialState: ServerState = {
    servers: [],
    currentServer: null,
    isLoading: false,
    error: null,
}

// Асинхронный thunk для загрузки серверов
export const fetchServers = createAsyncThunk(
    'servers/fetchServers',
    async () => {
        const response = await getUserGuilds()
        return response
    }
)

const serverSlice = createSlice({
    name: 'servers',
    initialState,
    reducers: {
        setCurrentServer: (state, action: PayloadAction<Guild | null>) => {
            state.currentServer = action.payload
        },
        clearServers: (state) => {
            state.servers = []
            state.currentServer = null
            state.error = null
        },
        addServer: (state, action: PayloadAction<Guild>) => {
            state.servers.push(action.payload)
        },
        removeServer: (state, action: PayloadAction<string>) => {
            state.servers = state.servers.filter(s => s.id !== action.payload)
            if (state.currentServer?.id === action.payload) {
                state.currentServer = null
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServers.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchServers.fulfilled, (state, action) => {
                state.isLoading = false
                state.servers = action.payload
            })
            .addCase(fetchServers.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.error.message || 'Failed to fetch servers'
            })
    },
})

export const { setCurrentServer, clearServers, addServer, removeServer } = serverSlice.actions
export default serverSlice.reducer

// Селекторы
export const selectServers = (state: { servers: ServerState }) => state.servers.servers
export const selectCurrentServer = (state: { servers: ServerState }) => state.servers.currentServer
export const selectServersLoading = (state: { servers: ServerState }) => state.servers.isLoading
export const selectServersError = (state: { servers: ServerState }) => state.servers.error