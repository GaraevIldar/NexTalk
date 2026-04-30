import React, { useState } from 'react'
import { login, selectIsLoading, selectAuthError } from '../stores/authSlice'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import { AuthCard } from '../components/AuthCard'
import styles from './AuthPage.module.scss'
import {useAppDispatch, useAppSelector} from "../../../store.ts";

export const AuthPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const isLoading = useAppSelector(selectIsLoading)
    const error = useAppSelector(selectAuthError)
    const [isLogin, setIsLogin] = useState(true)
    const [demoMode, setDemoMode] = useState(false)

    const handleLogin = async () => {
        await dispatch(login())
    }

    const handleRegister = async () => {
        // Реальный OIDC flow с параметром prompt=create
        const authUrl = new URL(import.meta.env.VITE_OIDC_AUTHORITY + '/oauth/v2/authorize')
        authUrl.searchParams.set('client_id', import.meta.env.VITE_OIDC_CLIENT_ID)
        authUrl.searchParams.set('redirect_uri', import.meta.env.VITE_OIDC_REDIRECT_URI)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', 'openid profile email offline_access')
        authUrl.searchParams.set('prompt', 'create')

        window.location.href = authUrl.toString()

    }

    const toggleMode = () => {
        setIsLogin(!isLogin)
    }

    const toggleDemoMode = () => {
        setDemoMode(!demoMode)
    }

    return (
        <GradientBackground>
            <div className={styles.container}>
                <AuthCard
                    isLogin={isLogin}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onToggleMode={toggleMode}
                    isLoading={isLoading}
                    error={error || undefined}
                />

                {/* Кнопка для переключения демо-режима (только для разработки) */}
                {import.meta.env.DEV && (
                    <button onClick={toggleDemoMode} className={styles.demoToggle}>
                        {demoMode ? 'Режим: ДЕМО' : 'Режим: OIDC'}
                    </button>
                )}
            </div>
        </GradientBackground>
    )
}