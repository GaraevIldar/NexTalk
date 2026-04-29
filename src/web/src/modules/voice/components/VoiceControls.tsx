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
    volume?: number
    onVolumeChange?: (volume: number) => void
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
                                                                isMuted,
                                                                isDeafened,
                                                                isConnected,
                                                                onToggleMute,
                                                                onToggleDeafen,
                                                                onDisconnect,
                                                                volume = 80,
                                                                onVolumeChange,
                                                            }) => {
    return (
        <div className={styles.controls}>
            <div className={styles.leftSection}>
                {/* Статус подключения */}
                <div className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}>
                    <div className={styles.statusDot} />
                    <span>{isConnected ? 'Подключен' : 'Не подключен'}</span>
                </div>

                {/* Индикатор уровня громкости (визуализация) */}
                {isConnected && !isMuted && (
                    <div className={styles.volumeVisualizer}>
                        <div className={styles.volumeBar} style={{ width: `${volume}%` }} />
                    </div>
                )}
            </div>

            <div className={styles.rightSection}>
                {/* Ползунок громкости */}
                {onVolumeChange && (
                    <div className={styles.volumeSlider}>
                        <Icon name="mic" size={16} />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => onVolumeChange(Number(e.target.value))}
                            className={styles.slider}
                        />
                    </div>
                )}

                {/* Кнопка Mute/Unmute */}
                <button
                    onClick={onToggleMute}
                    className={`${styles.controlBtn} ${isMuted ? styles.active : ''}`}
                    title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
                >
                    <Icon name={isMuted ? 'mic-off' : 'mic'} size={20} />
                </button>

                {/* Кнопка Deafen/Undeafen (глухота) */}
                <button
                    onClick={onToggleDeafen}
                    className={`${styles.controlBtn} ${isDeafened ? styles.active : ''}`}
                    title={isDeafened ? 'Включить звук' : 'Выключить звук'}
                >
                    <Icon name={isDeafened ? 'headphones-off' : 'headphones'} size={20} />
                </button>

                {/* Кнопка отключения от голосового канала */}
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