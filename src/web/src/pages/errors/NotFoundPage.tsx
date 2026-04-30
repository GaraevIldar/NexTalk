import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button/Button'
import { GradientBackground } from '../../shared/components/GradientBackground/GradientBackground'
import styles from './ErrorPage.module.scss'

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate()

    return (
        <GradientBackground>
            <div className={styles.container}>
                <div className={styles.card}>

                    <h1 className={styles.code}>404</h1>
                    <h2 className={styles.title}>Страница не найдена</h2>

                    <p className={styles.message}>
                        Извините, страница, которую вы ищете, не существует или была перемещена.
                    </p>

                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/servers')}
                        >
                            На главную
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate(-1)}
                        >
                            Вернуться назад
                        </Button>
                    </div>

                    <div className={styles.hint}>
                        Проверьте правильность введённого адреса
                    </div>
                </div>
            </div>
        </GradientBackground>
    )
}