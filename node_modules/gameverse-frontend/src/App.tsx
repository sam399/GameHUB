import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';
import GameLibrary from './pages/GameLibrary';
import GameDetails from './pages/GameDetails';
import Navbar from './components/Navbar';
import Toasts from './components/notifications/Toasts';
import UserReviews from './pages/UserReviews';
import ForumHome from './pages/ForumHome';
import ForumCategoryPage from './pages/ForumCategory';
import { SocketProvider } from './contexts/SocketContext';
import ChatPage from './pages/Chat';
import Friends from './pages/Friends';
import { NotificationProvider } from './contexts/NotificationContext';
import Notifications from './pages/Notifications';
import NotificationBell from './components/notifications/NotificationBell';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminModeration from './pages/AdminModeration';
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!['admin', 'moderator'].includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !user ? <>{children}</> : <Navigate to="/profile" />;
};

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <Navbar />
      <Toasts />
      <header className="App-header site-hero">
        <div className="container">
          <h1>🎮 GameVerse</h1>
          <p className="hero-sub">AI-Powered Gaming Community Platform</p>
          {/* hero content only; navigation is provided by Navbar */}
        </div>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<GameLibrary />} />
          <Route path="/games/:id" element={<GameDetails />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/reviews" element={
            <ProtectedRoute>
              <UserReviews />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={<ProtectedRoute><ForumHome />
              </ProtectedRoute>
          } />
          <Route path="/forum/category/:categoryId" element={
              <ProtectedRoute>
                <ForumCategoryPage />
              </ProtectedRoute>
          } />
          <Route path="/friends" element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/reports" element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <AdminRoute>
              <AdminAuditLogs />
            </AdminRoute>
          } />
          <Route path="/admin/moderation" element={
            <AdminRoute>
              <AdminModeration />
            </AdminRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
export default App;

