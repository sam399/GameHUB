import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';
import GameLibrary from './pages/GameLibrary';
import GameDetails from './pages/GameDetails';
import Navbar from './components/Navbar';

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
          {user && (
            <nav>
              <button onClick={logout} className="btn-ghost">Logout</button>
            </nav>
          )}
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
 