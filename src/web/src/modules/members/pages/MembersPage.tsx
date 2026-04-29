import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './MembersPage.module.scss'

interface Member {
  id: string
  name: string
  avatar: string
  role: 'owner' | 'admin' | 'member'
  status: 'online' | 'offline'
  tag?: string
}

const mockMembers: Member[] = [
  { id: '1', name: 'Иван', avatar: 'И', role: 'owner', status: 'online', tag: '@ivan' },
  { id: '2', name: 'Мария', avatar: 'М', role: 'admin', status: 'online', tag: '@maria' },
  { id: '3', name: 'Дмитрий', avatar: 'Д', role: 'admin', status: 'online', tag: '@dmitry' },
  { id: '4', name: 'Алексей', avatar: 'А', role: 'member', status: 'online', tag: '@alexey' },
  { id: '5', name: 'Светлана', avatar: 'С', role: 'member', status: 'online', tag: '@svetlana' },
  { id: '6', name: 'Максим', avatar: 'М', role: 'member', status: 'offline', tag: '@maxim' },
  { id: '7', name: 'Ольга', avatar: 'О', role: 'member', status: 'offline', tag: '@olga' },
  { id: '8', name: 'Сергей', avatar: 'С', role: 'member', status: 'offline', tag: '@sergey' },
  { id: '9', name: 'Екатерина', avatar: 'Е', role: 'member', status: 'offline', tag: '@kate' },
]

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'owner': return 'ВЛАДЕЛЕЦ'
    case 'admin': return 'АДМИНИСТРАТОР'
    default: return 'УЧАСТНИК'
  }
}

export const MembersPage: React.FC = () => {
  const navigate = useNavigate()
  const { serverId } = useParams()

  const owners = mockMembers.filter((m) => m.role === 'owner')
  const admins = mockMembers.filter((m) => m.role === 'admin')
  const members = mockMembers.filter((m) => m.role === 'member')

  const handleKick = (name: string) => {
    if (window.confirm(`Вы уверены, что хотите исключить ${name}?`)) {
      console.log(`${name} был исключен`)
    }
  }

  const handleBan = (name: string) => {
    if (window.confirm(`Вы уверены, что хотите заблокировать ${name}?`)) {
      console.log(`${name} был заблокирован`)
    }
  }

  return (
      <GradientBackground>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <button onClick={() => navigate(`/servers/${serverId}/channels/general`)} className={styles.backBtn}>
                <Icon name="arrow-left" size={20} />
              </button>
              <div className={styles.title}>Участники</div>
            </div>

            <div className={styles.stats}>9 участников · 5 в сети</div>

            <div className={styles.membersList}>
              {owners.length > 0 && (
                  <>
                    <div className={styles.roleHeader}>{getRoleLabel('owner')} — {owners.length}</div>
                    {owners.map((member) => (
                        <MemberItem key={member.id} member={member} onKick={handleKick} onBan={handleBan} />
                    ))}
                  </>
              )}

              {admins.length > 0 && (
                  <>
                    <div className={styles.roleHeader}>{getRoleLabel('admin')} — {admins.length}</div>
                    {admins.map((member) => (
                        <MemberItem key={member.id} member={member} onKick={handleKick} onBan={handleBan} />
                    ))}
                  </>
              )}

              {members.length > 0 && (
                  <>
                    <div className={styles.roleHeader}>{getRoleLabel('member')} — {members.length}</div>
                    {members.map((member) => (
                        <MemberItem key={member.id} member={member} onKick={handleKick} onBan={handleBan} />
                    ))}
                  </>
              )}
            </div>
          </div>
        </div>
      </GradientBackground>
  )
}

interface MemberItemProps {
  member: Member
  onKick: (name: string) => void
  onBan: (name: string) => void
}

const MemberItem: React.FC<MemberItemProps> = ({ member, onKick, onBan }) => {
  return (
      <div className={styles.memberItem}>
        <div className={styles.memberAvatar}>{member.avatar}</div>
        <div className={styles.memberInfo}>
          <div className={styles.memberName}>{member.name}</div>
          <div className={styles.memberTag}>{member.tag}</div>
        </div>
        <div className={`${styles.memberStatus} ${member.status === 'online' ? styles.online : styles.offline}`}>
          {member.status === 'online' ? 'В сети' : 'Не в сети'}
        </div>
        {member.role !== 'owner' && (
            <div className={styles.memberActions}>
              <button className={styles.kickBtn} onClick={() => onKick(member.name)}>Исключить</button>
              <button className={styles.banBtn} onClick={() => onBan(member.name)}>Заблокировать</button>
            </div>
        )}
      </div>
  )
}