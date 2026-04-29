import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../auth/stores/authStore'
import { ServerSidebar } from '../../../shared/components/Layout/ServerSidebar'
import { ChannelSidebar } from '../../channels/components/ChannelSidebar'
import { VoiceControls } from '../components/VoiceControls'
import { VoiceParticipantList } from '../components/VoiceParticipantList'
import styles from './VoiceChannelPage.module.scss'
import {VoiceParticipantProps} from "../../../App.tsx";

const mockParticipants: VoiceParticipantProps[] = [
  { id: '1', name: 'Алексей', avatar: 'А', isSpeaking: true, isMuted: false, isDeafened: false, volume: 75 },
  { id: '2', name: 'Мария', avatar: 'М', isSpeaking: false, isMuted: false, isDeafened: false, volume: 45 },
  { id: '3', name: 'Дмитрий', avatar: 'Д', isSpeaking: false, isMuted: true, isDeafened: false, volume: 0 },
  { id: '4', name: 'Яна', avatar: 'Я', isSpeaking: false, isMuted: false, isDeafened: true, volume: 30 },
]

export const VoiceChannelPage: React.FC = () => {
  const navigate = useNavigate()
  const { serverId } = useParams()
  const { user } = useAuthStore()

  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [volume, setVolume] = useState(75)
  const [participants, setParticipants] = useState(mockParticipants)

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    setParticipants(prev => prev.map(p =>
        p.id === user?.id ? { ...p, isMuted: !isMuted } : p
    ))
  }

  const handleToggleDeafen = () => {
    setIsDeafened(!isDeafened)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    navigate(`/servers/${serverId}/channels/general`)
  }

  const handleMuteUser = (userId: string) => {
    setParticipants(prev => prev.map(p =>
        p.id === userId ? { ...p, isMuted: !p.isMuted } : p
    ))
  }

  const handleKickUser = (userId: string) => {
    if (window.confirm('Исключить участника из голосового канала?')) {
      setParticipants(prev => prev.filter(p => p.id !== userId))
    }
  }

  const participantsWithCurrent = user
      ? [
        ...participants,
        {
          id: user.id,
          name: user.username,
          avatar: user.username.charAt(0).toUpperCase(),
          isSpeaking: false,
          isMuted,
          isDeafened,
          isCurrentUser: true,
          volume: volume,
        } as VoiceParticipantProps,
      ]
      : participants

  return (
      <div className={styles.layout}>
        <ServerSidebar />
        <ChannelSidebar />

        <div className={styles.voiceArea}>
          <div className={styles.header}>
            <div className={styles.title}>General Voice</div>
          </div>

          <div className={styles.content}>
            <div className={styles.participantsSection}>
              <VoiceParticipantList
                  participants={participantsWithCurrent}
                  currentUserId={user?.id}
                  onMuteUser={handleMuteUser}
                  onKickUser={handleKickUser}
              />
            </div>
          </div>

          <div className={styles.controlsSection}>
            <VoiceControls
                isMuted={isMuted}
                isDeafened={isDeafened}
                isConnected={isConnected}
                onToggleMute={handleToggleMute}
                onToggleDeafen={handleToggleDeafen}
                onDisconnect={handleDisconnect}
                volume={volume}
                onVolumeChange={setVolume}
            />
          </div>
        </div>
      </div>
  )
}