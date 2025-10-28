import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://jay-ganesh-backend.vercel.app';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin123'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

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
      if (error.response?.status === 404) {
        setError('Login endpoint not found. The server might be restarting.');
      } else if (error.response?.status === 0) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultUser = async () => {
    setCreatingUser(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/create-default-user`);
      setFormData({
        username: 'admin',
        password: 'admin123'
      });
      setError('Default user created successfully! Use username: admin, password: admin123');
    } catch (error) {
      console.error('Create user error:', error);
      if (error.response?.status === 404) {
        setError('Create user endpoint not found. Please check if the server is running.');
      } else {
        setError(error.response?.data?.message || 'Error creating default user');
      }
    } finally {
      setCreatingUser(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      setError(`Connection successful: ${response.data.message}`);
    } catch (error) {
      setError(`Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <div className="animated-bg">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
        <div className="shape shape4"></div>
      </div>

      <form className="login-form animated-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <div className="company-logo">
            <div className="logo-icon">🚛</div>
          </div>
          <h1 className="animated-text">Jay Ganesh Transport</h1>
          <h2 className="animated-subtitle">& Rugved Roadlines</h2>
          <h1 className="company-name">A R Trading Company</h1>
        </div>
        
        <div className="form-content">
          {error && (
            <div className={`error animated-error ${error.includes('successful') ? 'success' : ''}`}>
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
              disabled={loading || creatingUser}
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
              disabled={loading || creatingUser}
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary animated-btn ${loading ? 'loading' : ''}`}
            disabled={loading || creatingUser}
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
