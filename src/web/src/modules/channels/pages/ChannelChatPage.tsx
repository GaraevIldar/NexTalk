import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../auth/stores/authStore'
import { useChatStore } from '../../chat/stores/chatStore'
import { useChannelStore } from '../stores/channelStore'
import { MessageList } from '../../chat/components/MessageList'
import { MessageInput } from '../../chat/components/MessageInput'
import { ServerSidebar } from '../../../shared/components/Layout/ServerSidebar'
import { ChannelSidebar } from '../components/ChannelSidebar'
import { MembersSidebar } from '../../../shared/components/Layout/MembersSidebar'
import { Button } from '../../../shared/components/Button/Button'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './ChannelChatPage.module.scss'

export const ChannelChatPage: React.FC = () => {
    const { serverId, channelId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { messages, sendMessage } = useChatStore()
    const { channels, fetchChannels } = useChannelStore()

    useEffect(() => {
        if (serverId) {
            fetchChannels(serverId)
        }
    }, [serverId, fetchChannels])

    const currentMessages = messages[channelId || ''] || []
    const currentChannel = channels.find(c => c.id === channelId)

    const handleSend = (text: string) => {
        if (!user || !channelId) return
        sendMessage(channelId, text, user.id, user.username)
    }

    const handleInvite = () => {
        if (serverId) {
            navigate(`/servers/${serverId}/invite`)
        }
    }

    if (!serverId) {
        return (
            <div className={styles.layout}>
                <ServerSidebar />
                <div className={styles.chatArea}>
                    <div className={styles.loading}>Загрузка...</div>
                </div>
            </div>
        )
    }

    if (!currentChannel && channels.length > 0) {
        return (
            <div className={styles.layout}>
                <ServerSidebar />
                <ChannelSidebar />
                <div className={styles.chatArea}>
                    <div className={styles.header}>
                        <div className={styles.title}>
                            <Icon name="hash" size={20} />
                            Канал не найден
                        </div>
                    </div>
                    <div className={styles.notFound}>
                        <Icon name="message" size={48} />
                        <p>Канал не найден</p>
                        <Button variant="secondary" onClick={() => window.history.back()}>
                            Вернуться назад
                        </Button>
                    </div>
                </div>
                <MembersSidebar />
            </div>
        )
    }

    if (!currentChannel) {
        return (
            <div className={styles.layout}>
                <ServerSidebar />
                <ChannelSidebar />
                <div className={styles.chatArea}>
                    <div className={styles.loading}>Загрузка канала...</div>
                </div>
                <MembersSidebar />
            </div>
        )
    }

    return (
        <div className={styles.layout}>
            <ServerSidebar />
            <ChannelSidebar />

            <div className={styles.chatArea}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Icon name="hash" size={20} />
                        <span>{currentChannel.name}</span>
                    </div>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={handleInvite}
                    >
                        <Icon name="plus" size={14} />
                        Пригласить
                    </Button>
                </div>

                <MessageList messages={currentMessages} />

                <div className={styles.inputArea}>
                    <MessageInput
                        onSend={handleSend}
                        placeholder={`Сообщение в #${currentChannel.name}`}
                    />
                </div>
            </div>

            <MembersSidebar />
        </div>
    )
}