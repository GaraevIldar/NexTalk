import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChannelStore } from '../stores/channelStore'
import { Button } from '../../../shared/components/Button/Button'
import { Input } from '../../../shared/components/Input/Input'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import styles from './CreateChannelPage.module.scss'
import {Icon} from "../../../shared/components/Icon/Icon.tsx";

export const CreateChannelPage: React.FC = () => {
  const navigate = useNavigate()
  const { serverId } = useParams()
  const { createChannel } = useChannelStore()
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'voice'>('text')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !serverId) return
    setLoading(true)
    await createChannel(serverId, name.toLowerCase().replace(/\s/g, '-'), type)
    setLoading(false)
    navigate(`/servers/${serverId}/channels/general`)
  }

  return (
      <GradientBackground>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.title}>Создать канал</div>

            <div className={styles.typeSelector}>
              <button
                  type="button"
                  onClick={() => setType('text')}
                  className={`${styles.typeOption} ${type === 'text' ? styles.active : ''}`}
              >
                <div className={styles.typeEmoji}>#️</div>
                <div>Текстовый</div>
              </button>
              <button
                  type="button"
                  onClick={() => setType('voice')}
                  className={`${styles.typeOption} ${type === 'voice' ? styles.active : ''}`}
              >
                <Icon name="voice" size={18} />
                <div>Голосовой</div>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                  label="Название канала"
                  placeholder="например: general"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
              />

              <div className={styles.buttons}>
                <Button type="button" variant="secondary" onClick={() => navigate(`/servers/${serverId}/channels/general`)} fullWidth>
                  Отмена
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={loading}>
                  {loading ? 'Создание...' : 'Создать'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </GradientBackground>
  )
}