import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const Register: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <RegisterForm />
        <p className="auth-link">
          Already have an account? <Link to="/login">Resume Game</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;