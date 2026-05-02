import * as signalR from '@microsoft/signalr'
import {store} from "../../../store.ts";
import {selectAccessToken} from "../../auth/stores/authSlice.ts";
import {sendMessageLocal} from "../stores/chatSlice.ts";

class SignalRClient {
    private connection: signalR.HubConnection | null = null

    async connect() {
        if (this.connection) return

        const state = store.getState()
        const token = selectAccessToken(state)

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL}/ws/chat`, {
                accessTokenFactory: () => token || '',
            })
            .withAutomaticReconnect()
            .build()

        // 🔥 входящие сообщения
        this.connection.on('ReceiveMessage', (message: any) => {
            store.dispatch(sendMessageLocal({
                id: message.id,
                channelId: message.channelId,
                authorId: message.authorId,
                authorName: message.authorName,
                content: message.content,
                createdAt: message.createdAt,
            }))
        })

        this.connection.onreconnecting(() => {
            console.log('Reconnecting...')
        })

        this.connection.onreconnected(() => {
            console.log('Reconnected')
        })

        this.connection.onclose(() => {
            console.log('Connection closed')
            this.connection = null
        })

        try {
            await this.connection.start()
            console.log('SignalR connected')
        } catch (err) {
            console.error('SignalR connection error:', err)
        }
    }

    async disconnect() {
        if (!this.connection) return
        await this.connection.stop()
        this.connection = null
    }

    async sendMessage(channelId: string, content: string) {
        if (!this.connection) return

        try {
            await this.connection.invoke('SendMessage', {
                channelId,
                content,
            })
        } catch (err) {
            console.error('SendMessage error:', err)
        }
    }
}

export const signalRClient = new SignalRClient()