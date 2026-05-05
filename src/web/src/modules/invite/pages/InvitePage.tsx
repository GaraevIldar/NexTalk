import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button/Button'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './InvitePage.module.scss'
import {useAppDispatch, useAppSelector} from "../../../store.ts";
import {createInviteThunk} from "../../../shared/slices/inviteSlice.ts";

export const InvitePage: React.FC = () => {
  const navigate = useNavigate()
  const { serverId } = useParams()
  const dispatch = useAppDispatch()

  const loading = useAppSelector(state => state.invite.loading)

  const [copied, setCopied] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')

  const handleCreate = async () => {
    if (!serverId) return

    try {
      const result = await dispatch(
          createInviteThunk({
            guildId: serverId,
            data: {
              channelId: '1', // 👉 пока хардкод, потом подставишь реальный
              maxUses: undefined,
              expiresIn: 60 * 60 * 24 * 7, // 7 дней
            },
          })
      ).unwrap()

      const code = result.invite.code
      setInviteUrl(`https://nextalk.gg/invite/${code}`)

    } catch (e) {
      console.error('Ошибка создания инвайта', e)
    }
  }

  const handleCopy = () => {
    if (!inviteUrl) return
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

            <div className={styles.serverName}>Invite</div>
            <div className={styles.subtitle}>Создайте ссылку-приглашение</div>

            {!inviteUrl ? (
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? 'Создание...' : 'Создать ссылку'}
                </Button>
            ) : (
                <>
                  <div className={styles.inviteLink}>
                    <input
                        type="text"
                        value={inviteUrl}
                        readOnly
                        className={styles.linkInput}
                    />
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
                </>
            )}

            <Button
                variant="primary"
                onClick={() => navigate(`/servers/${serverId}/channels`)}
                fullWidth
            >
              Готово
            </Button>
          </div>
        </div>
      </GradientBackground>
  )
}