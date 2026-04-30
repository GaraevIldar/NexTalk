// profile/pages/ProfilePage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { selectUser, logout } from '../../auth/stores/authSlice'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import { ProfileCard } from "../components/ProfileCard"
import styles from './ProfilePage.module.scss'
import {useAppDispatch, useAppSelector} from "../../../store.ts";

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const user = useAppSelector(selectUser)

    const handleLogout = async () => {
        await dispatch(logout())
        window.location.href = '/auth'
    }

    const handleEdit = () => {
        console.log('Edit profile')
        // TODO: открыть модалку редактирования профиля
    }

    // Форматирование даты создания аккаунта
    const formatCreatedAt = () => {
        // Если есть реальная дата из JWT или API
        if (user?.emailVerified) {
            // Можно получить из токена или отдельного запроса
            return new Date('2026-04-20')
        }
        return new Date('2026-04-20')
    }

    return (
        <GradientBackground>
            <div className={styles.container}>
                <ProfileCard
                    user={{
                        id: user?.id || '1',
                        username: user?.username || 'User',
                        email: user?.email || 'user@example.com',
                        displayName: user?.displayName || user?.username || 'User',
                        avatar: user?.avatar,
                        createdAt: formatCreatedAt(),
                        serversCount: 3, // TODO: получать из serverSlice
                        status: 'online', // TODO: получать из presence service
                    }}
                    onEdit={handleEdit}
                    onLogout={handleLogout}
                    onClose={() => navigate('/servers')}
                />
            </div>
        </GradientBackground>
    )
}