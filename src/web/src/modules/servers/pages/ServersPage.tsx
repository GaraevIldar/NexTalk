import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../auth/stores/authStore'
import { useServerStore } from '../stores/serverStore'
import { ServerCard } from '../components/ServerCard'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import styles from './ServersPage.module.scss'

export const ServersPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { servers, fetchServers, setCurrentServer } = useServerStore()

    useEffect(() => {
        fetchServers()
    }, [fetchServers])

    const handleServerClick = (serverId: string) => {
        setCurrentServer(serverId)
        navigate(`/servers/${serverId}/channels/1`)
    }

    return (
        <GradientBackground>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.welcome}>Добро пожаловать, {user?.username || 'Гость'}!</div>
                    <div className={styles.userMenu} onClick={() => navigate('/profile')}>
                        <div className={styles.avatar}>{user?.username?.charAt(0).toUpperCase() || '?'}</div>
                        <span>{user?.username || 'Профиль'}</span>
                    </div>
                </div>

                <div className={styles.grid}>
                    {servers.map((server) => (
                        <ServerCard key={server.id} server={server} onClick={() => handleServerClick(server.id)} />
                    ))}

                    <div className={styles.createCard} onClick={() => navigate('/create-server')}>
                        <div className={styles.plus}>+</div>
                        <div>Создать сервер</div>
                        <div className={styles.subtext}>новое сообщество</div>
                    </div>
                </div>
            </div>
        </GradientBackground>
    )
}