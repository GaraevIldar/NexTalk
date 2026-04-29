import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './MembersSidebar.module.scss'

interface Member {
    id: string
    name: string
    avatar: string
    status: 'online' | 'offline'
    role?: string
}

const mockMembers: Member[] = [
    { id: '1', name: 'Алексей', avatar: 'А', status: 'online', role: 'Admin' },
    { id: '2', name: 'Мария', avatar: 'М', status: 'online' },
    { id: '3', name: 'Дмитрий', avatar: 'Д', status: 'online' },
    { id: '4', name: 'Яна', avatar: 'Я', status: 'online' },
    { id: '5', name: 'Сергей', avatar: 'С', status: 'offline' },
]

export const MembersSidebar: React.FC = () => {
    const navigate = useNavigate()
    const { serverId } = useParams()

    return (
        <div className={styles.sidebar}>
            <div className={styles.title}>Участники — 12 онлайн</div>

            <div className={styles.list}>
                {mockMembers.map((member) => (
                    <div
                        key={member.id}
                        onClick={() => navigate(`/servers/${serverId}/members`)}
                        className={styles.member}
                    >
                        <div className={styles.avatar}>{member.avatar}</div>
                        <div className={styles.name}>{member.name}</div>
                        <div className={`${styles.status} ${member.status === 'online' ? styles.online : styles.offline}`} />
                        {member.role && <div className={styles.role}>{member.role}</div>}
                    </div>
                ))}
            </div>
        </div>
    )
}