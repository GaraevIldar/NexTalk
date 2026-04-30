import {axiosInstance} from "../axiosInstance.ts";

export async function leaveVoiceChannel(
    channelId: string,
    userId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await axiosInstance.post(`/api/voice/${channelId}/leave`, {
            userId
        })
        return response.data
    } catch (error) {
        console.error('Ошибка выхода из голосового канала:', error)
        throw error
    }
}