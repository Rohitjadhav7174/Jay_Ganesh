import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('jay-ganesh-backend-m704wpzqt-rohitjadhav7174s-projects.vercel.app/api/login', formData);
      onLogin(response.data.token);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" >
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
        <div className="shape shape4"></div>
      </div>

      <form className="login-form animated-form" onSubmit={handleSubmit}>
        {/* Animated Header */}
        <div className="login-header">
          <div className="company-logo">
            <div className="logo-icon">🚛</div>
          </div>
          <h1 className="animated-text">Jay Ganesh Transport</h1>
          <h2 className="animated-subtitle">& Rugved Roadlines</h2>
          <h1 className="company-name">A R Trading Company</h1>
        </div>
        
        {/* Animated Form Content */}
        <div className="form-content">
          {error && (
            <div className="error animated-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <div className="form-group animated-input">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group animated-input">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary animated-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
