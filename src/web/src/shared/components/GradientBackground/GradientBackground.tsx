import React from 'react'
import styles from './GradientBackground.module.scss'

interface GradientBackgroundProps {
    children: React.ReactNode
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => {
    return (
        <div className={styles.container}>
            <div className={styles.ball1} />
            <div className={styles.ball2} />
            <div className={styles.ball3} />
            <div className={styles.content}>{children}</div>
        </div>
    )
}