import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CreateDisputePage } from './pages/CreateDisputePage'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import { RoomPage } from './pages/RoomPage'

function NotFoundPage() {
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateDisputePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/result/:roomId" element={<ResultPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
