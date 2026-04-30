import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button/Button'
import { GradientBackground } from '../../shared/components/GradientBackground/GradientBackground'
import styles from './ErrorPage.module.scss'

interface ServerErrorPageProps {
    error?: Error
    resetError?: () => void
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({
                                                                    error,
                                                                    resetError
                                                                }) => {
    const navigate = useNavigate()

    const handleRetry = () => {
        if (resetError) {
            resetError()
        }
        window.location.reload()
    }

    const handleGoHome = () => {
        if (resetError) {
            resetError()
        }
        navigate('/servers')
    }

    const isDev = import.meta.env.DEV

    return (
        <GradientBackground>
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.code}>500</h1>
                    <h2 className={styles.title}>Внутренняя ошибка сервера</h2>

                    <p className={styles.message}>
                        Что-то пошло не так на нашей стороне. Мы уже работаем над исправлением.
                    </p>

                    {error && isDev && (
                        <div className={styles.errorDetails}>
                            <strong>Детали ошибки:</strong>
                            <pre>{error.message}</pre>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Button variant="primary" onClick={handleRetry}>
                            Попробовать снова
                        </Button>
                        <Button variant="secondary" onClick={handleGoHome}>
                            На главную
                        </Button>
                    </div>
                </div>
            </div>
        </GradientBackground>
    )
}