import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import BotDetail from './pages/BotDetail';
import MyBots from './pages/MyBots';
import SupportBot from './components/SupportBot';
import './App.css';

const GOOGLE_CLIENT_ID = '1078241988035-fbrjhlueth7ubl9rsdd55ns88n2b0kri.apps.googleusercontent.com';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen"><div className="loader"></div></div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/shop" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/shop" /> : <Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:botId" element={<BotDetail />} />
        <Route path="/my-bots" element={
          <ProtectedRoute><MyBots /></ProtectedRoute>
        } />
      </Routes>
      <SupportBot />
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ChatProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
