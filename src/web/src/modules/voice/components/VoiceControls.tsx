import React from 'react'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './VoiceControls.module.scss'

interface VoiceControlsProps {
    isMuted: boolean
    isDeafened: boolean
    isConnected: boolean
    onToggleMute: () => void
    onToggleDeafen: () => void
    onDisconnect: () => void
    onVolumeChange?: (volume: number) => void
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
                                                                isMuted,
                                                                isDeafened,
                                                                isConnected,
                                                                onToggleMute,
                                                                onToggleDeafen,
                                                                onDisconnect,
                                                            }) => {
    return (
        <div className={styles.controls}>
            <div className={styles.leftSection}>
                <div className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}>
                    <div className={styles.statusDot} />
                    <span>{isConnected ? 'Подключен' : 'Не подключен'}</span>
                </div>

            </div>

            <div className={styles.rightSection}>


                <button
                    onClick={onToggleMute}
                    className={`${styles.controlBtn} ${isMuted ? styles.active : ''}`}
                    title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
                >
                    <Icon name={isMuted ? 'mic-off' : 'mic'} size={20} />
                </button>

                <button
                    onClick={onToggleDeafen}
                    className={`${styles.controlBtn} ${isDeafened ? styles.active : ''}`}
                    title={isDeafened ? 'Включить звук' : 'Выключить звук'}
                >
                    <Icon name={isDeafened ? 'headphones-off' : 'headphones'} size={20} />
                </button>

                <button
                    onClick={onDisconnect}
                    className={`${styles.controlBtn} ${styles.disconnect}`}
                    title="Покинуть канал"
                >
                    <Icon name="logout" size={20} />
                </button>
            </div>
        </div>
    )
}