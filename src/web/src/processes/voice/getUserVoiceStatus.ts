import {axiosInstance} from "../axiosInstance.ts";

export async function getUserVoiceStatus(
    userId: string
): Promise<{ inVoice: boolean; channelId?: string; guildId?: string; joinedAt?: Date }> {
    try {
        const response = await axiosInstance.get(`/api/voice/user/${userId}/status`)
        return {
            ...response.data,
            joinedAt: response.data.joinedAt ? new Date(response.data.joinedAt) : undefined
        }
    } catch (error) {
        console.error('Ошибка получения статуса пользователя:', error)
        throw error
    }
}