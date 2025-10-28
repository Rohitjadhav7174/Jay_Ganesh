import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://jay-ganesh-backend.vercel.app';

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
      const response = await axios.post(`${API_BASE_URL}/api/login`, formData);
      
      if (response.data.token) {
        onLogin(response.data.token);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 0) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultUser = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/create-default-user`);
      setFormData({
        username: 'admin',
        password: 'admin123'
      });
      alert('Default user created! Username: admin, Password: admin123');
    } catch (error) {
      setError('Error creating default user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
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
              disabled={loading}
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
              disabled={loading}
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

          <div className="login-help">
            <p>Don't have an account?</p>
            <button 
              type="button" 
              className="btn btn-link"
              onClick={handleCreateDefaultUser}
              disabled={loading}
            >
              Create Default User
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
