import React from 'react'
import styles from './ServerCard.module.scss'
import {Guild} from "../../../shared/types/requestTypes.ts";

interface ServerCardProps {
    server: Guild
    onClick: () => void
}

export const ServerCard: React.FC<ServerCardProps> = ({ server, onClick }) => {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.icon}>
                {server.icon ? (
                    <img src={server.icon} alt={server.name} />
                ) : (
                    <div className={styles.placeholder}>
                        {server.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className={styles.name}>{server.name}</div>
            <div className={styles.members}>
                👥 {server.memberCount || 0} участников
            </div>
            {server.description && (
                <div className={styles.description}>{server.description}</div>
            )}
        </div>
    )
}