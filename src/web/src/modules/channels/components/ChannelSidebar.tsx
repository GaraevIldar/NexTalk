import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChannelStore, Channel } from '../stores/channelStore'
import { CreateChannelModal } from './CreateChannelModal'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './ChannelSidebar.module.scss'

export const ChannelSidebar: React.FC = () => {
    const navigate = useNavigate()
    const { serverId, channelId } = useParams()
    const { channels, fetchChannels, setCurrentChannel } = useChannelStore()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const textChannels = channels.filter((c) => c.type === 'text')
    const voiceChannels = channels.filter((c) => c.type === 'voice')

    const handleChannelClick = (channel: Channel) => {
        setCurrentChannel(channel.id)
        if (channel.type === 'text') {
            navigate(`/servers/${serverId}/channels/${channel.id}`)
        } else {
            navigate(`/servers/${serverId}/voice/${channel.id}`)
        }
    }

    const handleModalSuccess = () => {
        if (serverId) {
            fetchChannels(serverId)
        }
    }

    return (
        <>
            <div className={styles.sidebar}>
                <div className={styles.serverHeader}>
                    <div className={styles.serverTitle}>
                        Game Night
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Текстовые каналы</div>
                    {textChannels.map((channel) => (
                        <div
                            key={channel.id}
                            onClick={() => handleChannelClick(channel)}
                            className={`${styles.channel} ${channelId === channel.id ? styles.active : ''}`}
                        >
                            <Icon name="hash" size={16} />
                            <span>{channel.name}</span>
                        </div>
                    ))}
                    <div
                        className={styles.addChannel}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Icon name="plus" size={14} />
                        <span>Добавить канал</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Голосовые каналы</div>
                    {voiceChannels.map((channel) => (
                        <div
                            key={channel.id}
                            onClick={() => handleChannelClick(channel)}
                            className={`${styles.channel} ${channelId === channel.id ? styles.active : ''}`}
                        >
                            <Icon name="voice" size={16} />
                            <span>{channel.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <CreateChannelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
            />
        </>
    )
}