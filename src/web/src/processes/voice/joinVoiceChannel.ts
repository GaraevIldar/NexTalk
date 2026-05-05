import {axiosInstance} from "../axiosInstance.ts";
import {JoinRequest, JoinVoiceResponse} from "../../shared/types";

export async function joinVoiceChannel(
    channelId: string,
    data: JoinRequest
): Promise<JoinVoiceResponse> {
    try {
        const response = await axiosInstance.post(`/api/voice/${channelId}/join`, data)
        return {
            ...response.data,
            joinAt: new Date(response.data.joinAt)
        }
    } catch (error) {
        console.error('Ошибка подключения к голосовому каналу:', error)
        throw error
    }
}