import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Billing from './Billing';
import { LogOut, FileText } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('billing');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Billing System</h2>
        </div>
        <ul className="sidebar-nav">
          <li 
            className={activeTab === 'billing' ? 'active' : ''}
            onClick={() => {
              setActiveTab('billing');
              navigate('/dashboard/billing');
            }}
          >
            <FileText size={18} style={{ marginRight: '10px' }} />
            Billing
          </li>
          <li className="logout" onClick={handleLogout}>
            <LogOut size={18} style={{ marginRight: '10px' }} />
            Logout
          </li>
        </ul>
      </div>
      
      <div className="main-content">
        <Routes>
          <Route path="billing" element={<Billing />} />
          <Route path="/" element={<Billing />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;