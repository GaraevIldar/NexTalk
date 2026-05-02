import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GradientBackground } from '../../../shared/components/GradientBackground/GradientBackground'
import { Icon } from '../../../shared/components/Icon/Icon'
import styles from './MembersPage.module.scss'
import { axiosInstance } from "../../../processes/axiosInstance"
import {Member} from "../../../shared/types/requestTypes.ts";

const USE_MOCK = import.meta.env.VITE_USE_AUTH_MOCK === 'true'

// ===== MOCK STORAGE (важно: НЕ const внутри компонента)
let mockMembers: Member[] = [
  { id: '1', name: 'Иван', avatar: 'И', role: 'owner', username: '@ivan', userId: "1" },
  { id: '2', name: 'Мария', avatar: 'М', role: 'admin', username: '@maria', userId: "2" },
  { id: '3', name: 'Дмитрий', avatar: 'Д', role: 'admin', username: '@dmitry', userId: "3" },
  { id: '4', name: 'Алексей', avatar: 'А', role: 'member', username: '@alexey', userId: "4" },
  { id: '5', name: 'Светлана', avatar: 'С', role: 'member', username: '@svetlana', userId: "5" },
  { id: '6', name: 'Максим', avatar: 'М', role: 'member', username: '@maxim', userId: "6" },
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

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // ===== LOAD =====
  useEffect(() => {
    if (!serverId) return

    const load = async () => {
      setLoading(true)

      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 300))
        setMembers(mockMembers)
      } else {
        const res = await axiosInstance.get(`/api/guilds/${serverId}/members`)
        setMembers(res.data)
      }

      setLoading(false)
    }

    load()
  }, [serverId])

  // ===== ACTIONS =====
  const handleKick = async (id: string, name: string) => {
    if (!window.confirm(`Исключить ${name}?`)) return

    if (USE_MOCK) {
      mockMembers = mockMembers.filter(m => m.id !== id)
      setMembers([...mockMembers])
      return
    }

    await axiosInstance.post(`/api/guilds/${serverId}/members/${id}/kick`)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const handleBan = async (id: string, name: string) => {
    if (!window.confirm(`Заблокировать ${name}?`)) return

    if (USE_MOCK) {
      mockMembers = mockMembers.filter(m => m.id !== id)
      setMembers([...mockMembers])
      return
    }

    await axiosInstance.post(`/api/guilds/${serverId}/members/${id}/ban`)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  // ===== GROUPING =====
  const owners = members.filter(m => m.role === 'owner')
  const admins = members.filter(m => m.role === 'admin')
  const users = members.filter(m => m.role === 'member')


  if (loading) {
    return <div className={styles.container}>Загрузка...</div>
  }

  return (
      <GradientBackground>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <button
                  onClick={() => navigate(`/servers/${serverId}/channels/general`)}
                  className={styles.backBtn}
              >
                <Icon name="arrow-left" size={20} />
              </button>
              <div className={styles.title}>Участники</div>
            </div>

            <div className={styles.membersList}>
              <MemberGroup title="owner" members={owners} onKick={handleKick} onBan={handleBan} />
              <MemberGroup title="admin" members={admins} onKick={handleKick} onBan={handleBan} />
              <MemberGroup title="member" members={users} onKick={handleKick} onBan={handleBan} />
            </div>
          </div>
        </div>
      </GradientBackground>
  )
}

interface GroupProps {
  title: string
  members: Member[]
  onKick: (id: string, name: string) => void
  onBan: (id: string, name: string) => void
}

const MemberGroup: React.FC<GroupProps> = ({ title, members, onKick, onBan }) => {
  if (members.length === 0) return null

  return (
      <>
        <div className={styles.roleHeader}>
          {getRoleLabel(title)} — {members.length}
        </div>

        {members.map(member => (
            <MemberItem
                key={member.id}
                member={member}
                onKick={onKick}
                onBan={onBan}
            />
        ))}
      </>
  )
}

interface MemberItemProps {
  member: Member
  onKick: (id: string, name: string) => void
  onBan: (id: string, name: string) => void
}

const MemberItem: React.FC<MemberItemProps> = ({ member, onKick, onBan }) => {
  return (
      <div className={styles.memberItem}>
        <div className={styles.memberAvatar}>{member.avatar}</div>

        <div className={styles.memberInfo}>
          <div className={styles.memberName}>{member.name}</div>
          <div className={styles.memberTag}>{member.username}</div>
        </div>

        {/*<div className={`${styles.memberStatus} ${member.status === 'online' ? styles.online : styles.offline}`}>*/}
        {/*  {member.status === 'online' ? 'В сети' : 'Не в сети'}*/}
        {/*</div>*/}

        {member.role !== 'owner' && (
            <div className={styles.memberActions}>
              <button onClick={() => onKick(member.id, member.name)} className={styles.kickBtn}>
                Исключить
              </button>
              <button onClick={() => onBan(member.id, member.name)} className={styles.banBtn}>
                Заблокировать
              </button>
            </div>
        )}
      </div>
  )
}