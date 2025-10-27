import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Billing from './Billing';
import { LogOut, FileText, Menu } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('billing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    setActiveTab(path);
    navigate(`/dashboard/${path}`);
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard">
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>Billing System</h2>
        </div>
        <ul className="sidebar-nav">
          <li 
            className={activeTab === 'billing' ? 'active' : ''}
            onClick={() => handleNavigation('billing')}
          >
<FileText 
  size={18} 
  color="white" 
  style={{ marginRight: '10px' }} 
/>
            Billing
          </li>
          <li className="logout" onClick={handleLogout}>
            <LogOut size={18} color="white" style={{ marginRight: '10px' }} />
            Logout
          </li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="mobile-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <h1>Billing System</h1>
        </div>
        
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <Routes>
          <Route path="billing" element={<Billing />} />
          <Route path="/" element={<Billing />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
