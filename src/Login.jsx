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
  const [debugInfo, setDebugInfo] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const testConnection = async () => {
    try {
      setDebugInfo('Testing connection...');
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      setDebugInfo(`✅ Connection successful: ${response.data.message}`);
    } catch (error) {
      setDebugInfo(`❌ Connection failed: ${error.message}`);
    }
  };

  const createDefaultUser = async () => {
    try {
      setLoading(true);
      setDebugInfo('Creating default user...');
      const response = await axios.post(`${API_BASE_URL}/api/create-default-user`);
      setDebugInfo(`✅ ${response.data.message}`);
      setFormData({
        username: 'admin',
        password: 'admin123'
      });
    } catch (error) {
      setDebugInfo(`❌ Create user failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('Attempting login...');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, formData);
      
      if (response.data.token) {
        setDebugInfo('✅ Login successful!');
        onLogin(response.data.token);
      } else {
        setError('Invalid response from server');
        setDebugInfo('❌ No token in response');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error - cannot reach server';
      } else if (error.response?.status === 404) {
        errorMessage = 'Server endpoint not found (404)';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error (500)';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      setDebugInfo(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
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
            <div className="error animated-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {debugInfo && (
            <div className="debug-info">
              <small>{debugInfo}</small>
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
            <div className="help-buttons">
              <button 
                type="button" 
                className="btn btn-link"
                onClick={createDefaultUser}
                disabled={loading}
              >
                Create Default User
              </button>
              
              <button 
                type="button" 
                className="btn btn-link"
                onClick={testConnection}
                disabled={loading}
              >
                Test Connection
              </button>
            </div>
            
            <div className="default-credentials">
              <small>Default: admin / admin123</small>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
