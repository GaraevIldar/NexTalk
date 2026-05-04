import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/Button/Button'
import { Input } from '../../../shared/components/Input/Input'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './CreateServerPage.module.scss'
import {createGuild} from "../../../processes/guild/createGuild.ts";
import {createServer} from "../stores/serverSlice.ts";
import {useAppDispatch} from "../../../store.ts";

const SERVER_TYPES = [
  { id: 'game', name: 'Игровой', iconName: 'server-game' },
  { id: 'dev', name: 'Разработка', iconName: 'server-dev' },
  { id: 'music', name: 'Музыка', iconName: 'server-music' },
  { id: 'study', name: 'Обучение', iconName: 'server-study' },
  { id: 'friends', name: 'Друзья', iconName: 'server-friends' },
  { id: 'default', name: 'Сообщество', iconName: 'server-default' },
]

export const CreateServerPage: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState('game')
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const USE_MOCK = import.meta.env.VITE_USE_AUTH_MOCK === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)

    if (USE_MOCK) {
      await new Promise(res => setTimeout(res, 300))

      const newServer = {
        name,
        description,
        icon: selectedType,
      }

      dispatch(createServer(newServer))

      setLoading(false)
      navigate('/servers')
      return
    }

    const data = {
      name,
      description,
      icon: selectedType
    }

    await createGuild(data)

    setLoading(false)
    navigate('/servers')
  }

  return (
      <GradientBackground>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.backLink} onClick={() => navigate('/servers')}>
              <Icon name="arrow-left" size={16} />
              Назад к серверам
            </div>

            <div className={styles.title}>Создать сервер</div>

            <form onSubmit={handleSubmit}>
              <Input
                  label="Название сервера"
                  placeholder="Например: Game Night"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
              />

              <div className={styles.iconSection}>
                <label className={styles.label}>Иконка сервера</label>
                <div className={styles.iconGrid}>
                  {SERVER_TYPES.map((type) => (
                      <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={`${styles.iconOption} ${selectedType === type.id ? styles.selected : ''}`}
                      >
                        <Icon name={type.iconName} size={28} />
                        <span className={styles.iconLabel}>{type.name}</span>
                      </button>
                  ))}
                </div>
              </div>

              <Input
                  label="Описание (необязательно)"
                  placeholder="Короткое описание сервера"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.input}
              />

              <div className={styles.buttons}>
                <Button type="button" variant="secondary" onClick={() => navigate('/servers')} fullWidth>
                  Отмена
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={loading}>
                  {loading ? 'Создание...' : 'Создать сервер'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </GradientBackground>
  )
}