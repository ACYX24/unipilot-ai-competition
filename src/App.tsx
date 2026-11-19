import { BrowserRouter as Router, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RoomProvider, useRoom, type FlowStage } from './state/RoomContext'
import { HomePage } from './pages/HomePage'
import { CreateRoomPage } from './pages/CreateRoomPage'
import { JoinRoomPage } from './pages/JoinRoomPage'
import { StatementPage } from './pages/StatementPage'
import { WaitingPage } from './pages/WaitingPage'
import { PrivateFeedbackPage } from './pages/PrivateFeedbackPage'
import { SharedAnalysisPage } from './pages/SharedAnalysisPage'
import { InteractionPage } from './pages/InteractionPage'
import { AgreementPage } from './pages/AgreementPage'

const stagePath: Record<FlowStage, string> = {
  statement: 'statement',
  waiting: 'waiting',
  feedback: 'feedback',
  analysis: 'analysis',
  agreement: 'agreement',
}

/** /room/:roomId 入口：按当前流程阶段自动跳转到对应页面 */
function RoomEntry() {
  const { roomId } = useParams()
  const { stage } = useRoom()
  return <Navigate to={`/room/${roomId}/${stagePath[stage]}`} replace />
}

function NotFoundPage() {
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <RoomProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateRoomPage />} />
            <Route path="/join" element={<JoinRoomPage />} />
            <Route path="/room/:roomId" element={<RoomEntry />} />
            <Route path="/room/:roomId/statement" element={<StatementPage />} />
            <Route path="/room/:roomId/waiting" element={<WaitingPage />} />
            <Route path="/room/:roomId/feedback" element={<PrivateFeedbackPage />} />
            <Route path="/room/:roomId/analysis" element={<SharedAnalysisPage />} />
            <Route path="/room/:roomId/interaction" element={<InteractionPage />} />
            <Route path="/room/:roomId/agreement" element={<AgreementPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </RoomProvider>
  )
}
