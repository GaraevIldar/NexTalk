import React from 'react'
import { Server } from '../stores/serverStore'
import styles from './ServerCard.module.scss'

interface ServerCardProps {
    server: Server
    onClick: () => void
}

export const ServerCard: React.FC<ServerCardProps> = ({ server, onClick }) => {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.header}>
                <div className={styles.online}>{server.onlineCount} онлайн</div>
            </div>
            <div className={styles.description}>{server.description}</div>
            <div className={styles.stats}>
                <span>5 каналов</span>
                <span>{server.memberCount} участников</span>
            </div>
        </div>
    )
}