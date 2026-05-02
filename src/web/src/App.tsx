import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { ServersPage } from './modules/servers/pages/ServersPage'
import { ChannelChatPage } from './modules/channels/pages/ChannelChatPage'
import { VoiceChannelPage } from './modules/voice/pages/VoiceChannelPage'
import { CreateServerPage } from './modules/servers/pages/CreateServerPage'
import { CreateChannelPage } from './modules/channels/pages/CreateChannelPage'
import { MembersPage } from './modules/members/pages/MembersPage'
import { ProfilePage } from './modules/profile/pages/ProfilePage'
import { InvitePage } from './modules/invite/pages/InvitePage'
import { NotFoundPage } from './pages/errors/NotFoundPage'
import { ServerErrorPage } from './pages/errors/ServerErrorPage'
import { AuthPage } from './modules/auth/pages/AuthPage'
import {store} from "./store.ts";
import {Provider} from "react-redux";

function App() {

    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/servers" element={<ServersPage />} />
                    <Route path="/servers/:serverId/channels/:channelId" element={<ChannelChatPage />} />
                    <Route path="/servers/:serverId/voice/:channelId" element={<VoiceChannelPage />} />
                    <Route path="/create-server" element={<CreateServerPage />} />
                    <Route path="/servers/:serverId/create-channel" element={<CreateChannelPage />} />
                    <Route path="/servers/:serverId/members" element={<MembersPage />} />
                    <Route path="/servers/:serverId/invite" element={<InvitePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/error" element={<ServerErrorPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    )
}

export default App