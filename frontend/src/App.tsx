import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import LoginForm from './components/LoginForm'
import ChatScreen from './components/ChatScreen'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 로그인/회원가입/게스트 옵션 */}
        <Route path="/" element={<LoginForm />} />{' '}
        <Route path="/chat" element={<ChatScreen />} /> {/* 채팅 화면 */}
        <Route path="*" element={<Navigate to="/" />} /> {/* 404 처리 */}
      </Routes>
    </Router>
  )
}

export default App
