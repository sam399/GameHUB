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
import UserReviews from './pages/UserReviews';
import ForumHome from './pages/ForumHome';
import ForumCategoryPage from './pages/ForumCategory';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
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
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

