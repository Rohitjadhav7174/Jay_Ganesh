import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        // Basic token validation
        if (storedToken && typeof storedToken === 'string' && storedToken.length > 10) {
          setToken(storedToken);
          console.log('Token found and set');
        } else {
          console.log('No valid token found');
          setToken(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (newToken) => {
    if (newToken && typeof newToken === 'string') {
      setToken(newToken);
      localStorage.setItem('token', newToken);
      console.log('Login successful');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    console.log('Logout successful');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !token ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard/billing" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              token ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={token ? "/dashboard/billing" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
