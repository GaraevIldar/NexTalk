import React from 'react'
import styles from './ServerIcon.module.scss'
import {Icon} from "../../../../shared/components/Icon/Icon.tsx";

interface ServerIconProps {
    type?: 'game' | 'dev' | 'music' | 'study' | 'friends' | 'settings' | 'default'
    isActive?: boolean
    isAdd?: boolean
    onClick?: () => void
}

const iconMap: Record<string, string> = {
    game: 'server-game',
    dev: 'server-dev',
    music: 'server-music',
    study: 'server-study',
    friends: 'server-friends',
    settings: 'server-settings',
    default: 'server-default',
}

export const ServerIcon: React.FC<ServerIconProps> = ({
                                                          type = 'default',
                                                          isActive = false,
                                                          isAdd = false,
                                                          onClick,
                                                      }) => {
    // Кнопка "Добавить сервер"
    if (isAdd) {
        return (
            <button onClick={onClick} className={`${styles.serverIcon} ${styles.add}`}>
                <Icon name="server-add" size={24} />
            </button>
        )
    }

    // Обычная иконка сервера
    const iconName = iconMap[type] || 'server-default'

    return (
        <button
            onClick={onClick}
            className={`${styles.serverIcon} ${styles[type]} ${isActive ? styles.active : ''}`}
        >
            <Icon name={iconName} size={28} />
        </button>
    )
}