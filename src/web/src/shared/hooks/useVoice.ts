import { useState } from 'react'
import { useWebRTC } from "./useWerbRtc.ts"
import { joinVoiceChannel } from "../../processes/voice/joinVoiceChannel.ts"
import { leaveVoiceChannel } from "../../processes/voice/leaveVoiceChannel.ts"
import { getVoiceChannelParticipants } from "../../processes/voice/getVoiceChannelParticipants.ts"

const USE_MOCK = import.meta.env.VITE_USE_AUTH_MOCK === 'true'

export const useVoice = () => {
    const webrtc = useWebRTC({
        signalingServerUrl: 'http://localhost:3001',
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ]
    })

    // ===== MOCK STATE =====
    const [mockConnected, setMockConnected] = useState(false)
    const [mockMuted, setMockMuted] = useState(false)
    const [mockParticipants, setMockParticipants] = useState<any[]>([])

    // ===== REAL STATE =====
    const [participants, setParticipants] = useState<any[]>([])

    // ===== JOIN =====
    const joinVoice = async (
            channelId: string,
            user: { id: string; name: string }
        ) => {
        if (USE_MOCK) {
            setMockConnected(true)

            setMockParticipants([
                { id: '1', name: 'Алексей', avatar: 'А', isSpeaking: true, isMuted: false },
                { id: '2', name: 'Мария', avatar: 'М', isSpeaking: false, isMuted: false },
            ])

            return
        }

        // 1. JOIN API
        await joinVoiceChannel(channelId, {
            userId: user.id,
            username: user.name,
            displayName: user.name,
        })

        // 2. GET PARTICIPANTS
        const users = await getVoiceChannelParticipants(channelId)

        setParticipants(
            users.map(u => ({
                id: u.userId,
                name: u.username,
                avatar: u.username[0].toUpperCase(),
                isSpeaking: false,
                isMuted: false,
            }))
        )

        // 3. WEBRTC
        await webrtc.joinRoom(channelId, user.name)
        await webrtc.startVoice()
    }

    // ===== LEAVE =====
    const leaveVoice = async (channelId: string, userId?: string) => {
        if (USE_MOCK) {
            setMockConnected(false)
            setMockParticipants([])
            return
        }

        await leaveVoiceChannel(channelId, userId || '')
        webrtc.stopVoice()
        setParticipants([])
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
        isConnected: webrtc.connectionStatus === 'connected',
        isMuted: webrtc.isMuted,
        participants,

        joinVoice,
        leaveVoice,
        toggleMic,
    }
}