import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import './App.css';

function App() {
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    // Redirect will happen automatically due to state change
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/';
  };

  // Check authentication status
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Always show login page on root path */}
          <Route 
            path="/" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/billing" 
            element={
              isAuthenticated ? (
                <Billing />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
