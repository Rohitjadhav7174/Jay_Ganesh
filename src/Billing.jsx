import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillForm from './BillForm';
import { Plus, Edit, Trash2, Download, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'https://jay-ganesh-backend.vercel.app';

const Billing = () => {
  const [selectedLocation, setSelectedLocation] = useState('Ratanagiri');
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBills();
  }, [selectedLocation]);

  const fetchBills = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log(`🔄 Fetching bills for: ${selectedLocation}`);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/bills/${selectedLocation}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const billsData = response.data.bills || response.data;
      console.log(`✅ Received ${billsData.length} bills for ${selectedLocation}`);
      setBills(billsData);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError(error.response?.data?.message || 'Error fetching bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = () => {
    setEditingBill(null);
    setShowForm(true);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/bills/${billId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
        setError('Error deleting bill');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingBill(null);
    fetchBills();
  };

  const handlePrintBill = (bill) => {
    console.log('Print bill:', bill);
    handleEditBill(bill);
  };

  const handleRefresh = () => {
    fetchBills();
  };

  if (showForm) {
    return (
      <BillForm
        bill={editingBill}
        location={selectedLocation}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    );
  }

  return (
    <div className="billing">
      <div className="billing-header">
        <div className="header-info">
          <h1>Billing Management</h1>
          <p>Manage invoices for <strong>{selectedLocation}</strong></p>
          {error && (
            <div className="error-message">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline" 
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Bills"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="btn btn-primary createbtn" onClick={handleCreateBill}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Create New Bill
          </button>
        </div>
      </div>

      <div className="location-tabs">
        <div
          className={`tab ${selectedLocation === 'Ratanagiri' ? 'active' : ''}`}
          onClick={() => setSelectedLocation('Ratanagiri')}
        >
          Ratanagiri
        </div>
        <div
          className={`tab ${selectedLocation === 'Singhururg' ? 'active' : ''}`}
          onClick={() => setSelectedLocation('Singhururg')}
        >
          Singhururg
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bills for {selectedLocation}...</p>
        </div>
      ) : (
        <div className="bills-container">
          {bills.length > 0 ? (
            <div>
              <div className="bills-summary">
                <p>Found <strong>{bills.length}</strong> bills for {selectedLocation}</p>
              </div>
              <div className="bills-grid">
                {bills.map((bill) => (
                  <div key={bill._id} className="bill-card">
                    <div className="bill-header">
                      <div className="bill-info">
                        <h3>Bill No: {bill.billNumber}</h3>
                        <p className="bill-date">
                          Date: {new Date(bill.date).toLocaleDateString()}
                        </p>
                        <p className="bill-location">
                          Location: {bill.location}
                        </p>
                      </div>
                      <div className="bill-actions">
                        <button
                          className="btn btn-sm btn-edit"
                          onClick={() => handleEditBill(bill)}
                          title="Edit Bill"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-print"
                          onClick={() => handlePrintBill(bill)}
                          title="Print Bill"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-delete"
                          onClick={() => handleDeleteBill(bill._id)}
                          title="Delete Bill"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bill-details">
                      <div className="detail-row">
                        <span className="detail-label">Supplier:</span>
                        <span className="detail-value">{bill.supplier?.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Buyer:</span>
                        <span className="detail-value">{bill.buyer?.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Items:</span>
                        <span className="detail-value">{bill.items?.length || 0}</span>
                      </div>
                      <div className="detail-row total-row">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value total-amount">
                          ₹{bill.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No bills found for {selectedLocation}</h3>
              <p>Create your first bill to get started!</p>
              <button className="btn btn-primary" onClick={handleCreateBill}>
                <Plus size={18} style={{ marginRight: '8px' }} />
                Create First Bill
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Billing;
