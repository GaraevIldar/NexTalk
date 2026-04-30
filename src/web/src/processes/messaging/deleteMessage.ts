import {axiosInstance} from "../axiosInstance.ts";

export async function deleteMessage(
    messageId: string,
    reason?: string
): Promise<{ success: boolean; messageId: string }> {
    try {
        const response = await axiosInstance.delete(`/api/messages/${messageId}`, {
            data: { reason }
        })
        return response.data
    } catch (error) {
        console.error('Ошибка удаления сообщения:', error)
        throw error
    }
}