import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button/Button'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './InvitePage.module.scss'

export const InvitePage: React.FC = () => {
  const navigate = useNavigate()
  const { serverId } = useParams()
  const [copied, setCopied] = useState(false)

  const inviteUrl = `https://nextalk.gg/invite/server-${serverId || 'demo'}-xyz123`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
      <GradientBackground>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.serverIcon}>
              <Icon name="server-default" size={48} />
            </div>
            <div className={styles.serverName}>Game Night</div>
            <div className={styles.subtitle}>Пригласите друзей в сервер</div>

            <div className={styles.inviteLink}>
              <input type="text" value={inviteUrl} readOnly className={styles.linkInput} />
              <Button onClick={handleCopy} size="small">
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
            </div>

            <div className={styles.settings}>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>Срок действия</span>
                <span className={styles.settingValue}>7 дней</span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>Макс. использований</span>
                <span className={styles.settingValue}>Не ограничено</span>
              </div>
            </div>

            <Button variant="primary" onClick={() => navigate(`/servers/${serverId}/channels/general`)} fullWidth>
              Готово
            </Button>
          </div>
        </div>
      </GradientBackground>
  )
}