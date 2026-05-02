// useVoice.ts
import { useState } from 'react'
import { useWebRTC } from "./useWerbRtc.ts"
import { axiosInstance } from "../../processes/axiosInstance.ts"

const USE_MOCK = import.meta.env.VITE_USE_AUTH_MOCK === 'true'

export const useVoice = () => {
    const webrtc = useWebRTC({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ],
        signalingServerUrl: 'http://localhost:3001'
    })

    // ===== MOCK STATE =====
    const [mockConnected, setMockConnected] = useState(false)
    const [mockMuted, setMockMuted] = useState(false)
    const [mockParticipants, setMockParticipants] = useState<any[]>([])

    // ===== JOIN =====
    const joinVoice = async (channelId: string, username: string) => {
        if (USE_MOCK) {
            setMockConnected(true)

            setMockParticipants([
                { id: '1', name: 'Алексей', avatar: 'А', isSpeaking: true, isMuted: false },
                { id: '2', name: 'Мария', avatar: 'М', isSpeaking: false, isMuted: false },
            ])

            return
        }

        const res = await axiosInstance.post(`/api/voice/${channelId}/join`)
        const { token, url } = res.data

        console.log('Connect to LiveKit:', token, url)
    }

    // ===== LEAVE =====
    const leaveVoice = async (channelId: string) => {
        if (USE_MOCK) {
            setMockConnected(false)
            setMockParticipants([])
            return
        }

        await axiosInstance.post(`/api/voice/${channelId}/leave`)
    }

    // ===== MIC =====
    const toggleMic = () => {
        if (USE_MOCK) {
            setMockMuted(prev => !prev)
            return
        }

        webrtc.toggleMic()
    }

    // ===== RETURN =====
    if (USE_MOCK) {
        return {
            isConnected: mockConnected,
            isMuted: mockMuted,
            participants: mockParticipants,

            joinVoice,
            leaveVoice,
            toggleMic,
        }
    }

    return {
        ...webrtc,
        isConnected: webrtc.connectionStatus === 'connected',
        joinVoice,
        leaveVoice,
    }
}