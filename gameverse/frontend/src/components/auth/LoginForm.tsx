import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData = requires2FA 
        ? { ...credentials, twoFactorToken }
        : credentials;
      
      await login(loginData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Connection Failed';
      
      // Check if 2FA is required
      if (err.response?.data?.requires2FA) {
        setRequires2FA(true);
        setError('Please enter your 2FA code');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-form">
      <h2>🎮 Resume Game</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            disabled={requires2FA}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            disabled={requires2FA}
          />
        </div>
        
        {requires2FA && (
          <div className="form-group">
            <label htmlFor="twoFactorToken">🔐 Two-Factor Code</label>
            <input
              type="text"
              id="twoFactorToken"
              name="twoFactorToken"
              value={twoFactorToken}
              onChange={(e) => setTwoFactorToken(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              autoFocus
            />
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Connecting...' : '🎮 Connect'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;