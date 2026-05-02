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
            <div>{server.name}</div>
            <div className={styles.stats}>
                <span>5 каналов</span>
                <span>{server.memberCount} участников</span>
            </div>
        </div>
    )
}