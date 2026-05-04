import React, { useState } from 'react'
import styles from './AuthCard.module.scss'
import { Icon } from '../../../shared/components/Icon/Icon'

interface AuthCardProps {
    isLogin: boolean
    onLogin: (email: string, password: string) => void
    onRegister: (
        username: string,
        nickname: string,
        email: string,
        password: string
    ) => void
    onToggleMode: () => void
    isLoading?: boolean
    error?: string
}

export const AuthCard: React.FC<AuthCardProps> = ({
                                                      isLogin,
                                                      onLogin,
                                                      onRegister,
                                                      onToggleMode,
                                                      isLoading = false,
                                                      error,
                                                  }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [nickname, setNickname] = useState('')
    const [acceptPolicy, setAcceptPolicy] = useState(false)

    const validateLogin = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!email.trim()) newErrors.email = 'Введите email'
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Неверный формат email'
        if (!password) newErrors.password = 'Введите пароль'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateRegister = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!name.trim()) newErrors.name = 'Введите имя пользователя'
        else if (name.length < 3) newErrors.username = 'Минимум 3 символа'

        if (!nickname.trim()) newErrors.nickname = 'Введите никнейм'
        else if (nickname.length < 2) newErrors.nickname = 'Минимум 2 символа'

        if (!email.trim()) newErrors.email = 'Введите email'
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Неверный формат email'

        if (!password) newErrors.password = 'Введите пароль'
        else if (password.length < 6) newErrors.password = 'Минимум 6 символов'

        if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают'

        if (!acceptPolicy) newErrors.policy = 'Необходимо принять политику'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLogin) {
            if (validateLogin()) onLogin(email, password)
        } else {
            if (validateRegister()) {
                onRegister(name, nickname, email, password)
            }
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.logo}>
                <span className={styles.logoIcon}>N</span>
                <span className={styles.logoText}>NexTalk</span>
            </div>

            <h1 className={styles.title}>
                {isLogin ? 'Добро пожаловать' : 'Создать аккаунт'}
            </h1>
            <p className={styles.subtitle}>
                {isLogin
                    ? 'Войдите в свой аккаунт, чтобы продолжить'
                    : 'Заполните форму для регистрации'}
            </p>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                {!isLogin && (
                    <>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                <Icon name="user" size={16} />
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Введите имя"
                                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                                disabled={isLoading}
                            />
                            {errors.username && <span className={styles.error}>{errors.username}</span>}
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                <Icon name="at-sign" size={16} />
                                Никнейм
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Например: nexdude"
                                className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`}
                                disabled={isLoading}
                            />
                            {errors.nickname && <span className={styles.error}>{errors.nickname}</span>}
                        </div>
                    </>

                )}

                <div className={styles.field}>
                    <label className={styles.label}>
                        <Icon name="mail" size={16} />
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.ru"
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        disabled={isLoading}
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        <Icon name="lock" size={16} />
                        Пароль
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                        disabled={isLoading}
                    />
                    {errors.password && <span className={styles.error}>{errors.password}</span>}
                </div>

                {!isLogin && (
                    <>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                <Icon name="lock" size={16} />
                                Подтверждение пароля
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
                        </div>
                        <div className={styles.checkboxField}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={acceptPolicy}
                                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span>
                                    Я принимаю Политику обработки персональных данных,
                                    соответствующую требованиям Федерального закона № 152-ФЗ «О персональных данных»
                                </span>
                            </label>
                            {errors.policy && <span className={styles.error}>{errors.policy}</span>}
                        </div>
                    </>

                )}

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isLoading}
                >
                    <Icon name={isLogin ? "login" : "user-plus"} size={18} />
                    {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                </button>
            </form>

            <div className={styles.footer}>
                <button
                    onClick={onToggleMode}
                    className={styles.toggleBtn}
                    disabled={isLoading}
                >
                    {isLogin
                        ? <span>Нет аккаунта? <span>Зарегистрироваться</span></span>
                        : <span>Уже есть аккаунт? <span>Войти</span></span>}
                </button>
            </div>
        </div>
    )
}