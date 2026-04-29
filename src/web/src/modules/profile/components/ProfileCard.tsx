import React from 'react'
import styles from './ProfileCard.module.scss'
import {Icon} from "../../../shared/components/Icon/Icon.tsx";

interface User {
    id: string
    username: string
    email: string
    avatar?: string
    createdAt?: Date
    serversCount?: number
    status?: 'online' | 'offline' | 'idle' | 'dnd'
}

interface ProfileCardProps {
    user: User
    onEdit?: () => void
    onLogout?: () => void
    onClose?: () => void
    showActions?: boolean
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
                                                            user,
                                                            onEdit,
                                                            onLogout,
                                                            onClose,
                                                            showActions = true,
                                                        }) => {
    return (
        <div className={styles.card}>
            {onClose && (
                <button onClick={onClose} className={styles.closeBtn}>
                    <Icon name="arrow-left" size={18} />
                </button>
            )}

            <div className={styles.avatar}>
                {user.avatar || user.username?.charAt(0).toUpperCase()}
            </div>

            <div className={styles.username}>{user.username}</div>
            <div className={styles.email}>{user.email}</div>

            <div className={styles.details}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Аккаунт создан</span>
                    <span className={styles.detailValue}>
            {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                : '20 апреля 2026'}
          </span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Серверов</span>
                    <span className={styles.detailValue}>{user.serversCount || 3}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Статус</span>
                    <span className={`${styles.detailValue} ${styles[user.status || 'online']}`}>
            {user.status === 'online' && 'Онлайн'}
                        {user.status === 'offline' && 'Офлайн'}
                        {user.status === 'idle' && 'Не активен'}
                        {user.status === 'dnd' && 'Не беспокоить'}
                        {!user.status && 'Онлайн'}
          </span>
                </div>
            </div>

            {showActions && (
                <div className={styles.actions}>
                    {onEdit && (
                        <button onClick={onEdit} className={styles.editBtn}>
                            <Icon name="edit" size={16} />
                            Редактировать
                        </button>
                    )}
                    {onLogout && (
                        <button onClick={onLogout} className={styles.logoutBtn}>
                            <Icon name="logout" size={16} />
                            Выйти
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}