import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServerStore } from '../../../modules/servers/stores/serverStore'
import { ServerIcon } from '../ServerIcon/ServerIcon'
import styles from './ServerSidebar.module.scss'

// Определяем тип сервера по названию
const getServerType = (name: string): 'game' | 'dev' | 'music' | 'study' | 'friends' | 'default' => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('game') || lowerName.includes('night')) return 'game'
    if (lowerName.includes('dev') || lowerName.includes('team')) return 'dev'
    if (lowerName.includes('music') || lowerName.includes('song')) return 'music'
    if (lowerName.includes('study') || lowerName.includes('learn')) return 'study'
    if (lowerName.includes('friend')) return 'friends'
    return 'default'
}

export const ServerSidebar: React.FC = () => {
    const navigate = useNavigate()
    const { servers, setCurrentServer } = useServerStore()
    const { serverId } = useParams()

    const handleServerClick = (serverId: string) => {
        setCurrentServer(serverId)
        navigate(`/servers/${serverId}/channels/general`)
    }

    return (
        <div className={styles.sidebar}>
            {servers.map((server) => (
                <ServerIcon
                    key={server.id}
                    type={getServerType(server.name)}
                    isActive={serverId === server.id}
                    onClick={() => handleServerClick(server.id)}
                />
            ))}

            <ServerIcon isAdd onClick={() => navigate('/create-server')} />
        </div>
    )
}