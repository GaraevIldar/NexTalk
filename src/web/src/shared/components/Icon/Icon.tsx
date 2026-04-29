import React from 'react'
import styles from './Icon.module.scss'

interface IconProps {
    name: string
    size?: number | string
    className?: string
    onClick?: () => void
}

export const Icon: React.FC<IconProps> = ({
                                              name,
                                              size = 20,
                                              className = '',
                                              onClick
                                          }) => {
    return (
        <svg
            className={`${styles.icon} ${className}`}
            width={size}
            height={size}
            onClick={onClick}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <use href={`/sprite.svg#icon-${name}`} />
        </svg>
    )
}