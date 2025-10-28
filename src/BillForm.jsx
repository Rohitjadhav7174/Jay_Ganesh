import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Eye, Printer, Plus, Trash2, Building, User, Truck, CreditCard, Banknote, FileText } from 'lucide-react';

const API_BASE_URL = 'https://jay-ganesh-backend.vercel.app';

const BillForm = ({ bill, location, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    billNumber: '',
    date: new Date().toISOString().split('T')[0],
    location: location || '',
    supplier: {
      name: "",
      address: "",
      gstin: ""
    },
    buyer: {
      name: "",
      address: "",
      pan: ""
    },
    deliveryNote: "",
    modeOfPayment: "BANK Transaction",
    dispatchedThrough: "",
    destination: "",
    bankDetails: {
      name: "",
      accountNumber: "",
      branch: "",
      ifsc: ""
    },
    items: [
      {
        description: '',
        hsnSac: '',
        gstRate: '',
        quantity: 0,
        rate: 0,
        unit: 'KG',
        amount: 0
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [fetchingDefaults, setFetchingDefaults] = useState(false);

  const getDefaultDateRange = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonth = nextMonthDate.toLocaleString('en', { month: 'long' });
    const nextMonthYear = nextMonthDate.getFullYear();
    
    return `${currentMonth} ${currentYear} - ${nextMonth} ${nextMonthYear}`;
  };

  const getSafeValue = (value, defaultValue = '') => {
    return value ?? defaultValue;
  };

  useEffect(() => {
    const fetchLocationDefaults = async () => {
      if (!bill && location) {
        setFetchingDefaults(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${API_BASE_URL}/api/location-defaults/${location}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const defaults = response.data;
          
          setFormData(prev => ({
            ...prev,
            supplier: {
              name: getSafeValue(defaults.supplier?.name),
              address: getSafeValue(defaults.supplier?.address),
              gstin: getSafeValue(defaults.supplier?.gstin)
            },
            buyer: {
              name: getSafeValue(defaults.buyer?.name),
              address: getSafeValue(defaults.buyer?.address),
              pan: getSafeValue(defaults.buyer?.pan)
            },
            bankDetails: {
              name: getSafeValue(defaults.bankDetails?.name),
              accountNumber: getSafeValue(defaults.bankDetails?.accountNumber),
              branch: getSafeValue(defaults.bankDetails?.branch),
              ifsc: getSafeValue(defaults.bankDetails?.ifsc)
            },
            destination: getSafeValue(defaults.destination),
            modeOfPayment: getSafeValue(defaults.modeOfPayment, "BANK Transaction"),
            location: getSafeValue(location)
          }));
        } catch (error) {
          console.error('Error fetching location defaults:', error);
          setError('Error loading location defaults');
        } finally {
          setFetchingDefaults(false);
        }
      }
    };

    fetchLocationDefaults();
  }, [location, bill]);

  useEffect(() => {
    if (bill) {
      setFormData({
        billNumber: getSafeValue(bill.billNumber),
        date: bill.date ? bill.date.split('T')[0] : new Date().toISOString().split('T')[0],
        location: getSafeValue(bill.location, location),
        supplier: {
          name: getSafeValue(bill.supplier?.name),
          address: getSafeValue(bill.supplier?.address),
          gstin: getSafeValue(bill.supplier?.gstin)
        },
        buyer: {
          name: getSafeValue(bill.buyer?.name),
          address: getSafeValue(bill.buyer?.address),
          pan: getSafeValue(bill.buyer?.pan)
        },
        deliveryNote: getSafeValue(bill.deliveryNote),
        modeOfPayment: getSafeValue(bill.modeOfPayment, "BANK Transaction"),
        dispatchedThrough: getSafeValue(bill.dispatchedThrough),
        destination: getSafeValue(bill.destination),
        bankDetails: {
          name: getSafeValue(bill.bankDetails?.name),
          accountNumber: getSafeValue(bill.bankDetails?.accountNumber),
          branch: getSafeValue(bill.bankDetails?.branch),
          ifsc: getSafeValue(bill.bankDetails?.ifsc)
        },
        items: Array.isArray(bill.items) && bill.items.length > 0 
          ? bill.items.map(item => ({
              description: getSafeValue(item.description),
              hsnSac: getSafeValue(item.hsnSac),
              gstRate: getSafeValue(item.gstRate),
              quantity: getSafeValue(item.quantity, 0),
              rate: getSafeValue(item.rate, 0),
              unit: getSafeValue(item.unit, 'KG'),
              amount: getSafeValue(item.amount, 0)
            }))
          : [{
              description: '',
              hsnSac: '',
              gstRate: '',
              quantity: 0,
              rate: 0,
              unit: 'KG',
              amount: 0
            }]
      });
    } else {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        billNumber: `${year}/${randomNum}`
      }));
    }
  }, [bill, location]);

  const calculateAmount = (quantity, rate) => {
    return parseFloat((quantity * rate).toFixed(2));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      const rate = field === 'rate' ? parseFloat(value) || 0 : newItems[index].rate;
      newItems[index].amount = calculateAmount(quantity, rate);
    }

    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleSupplierChange = (field, value) => {
    setFormData({
      ...formData,
      supplier: {
        ...formData.supplier,
        [field]: getSafeValue(value)
      }
    });
  };

  const handleBuyerChange = (field, value) => {
    setFormData({
      ...formData,
      buyer: {
        ...formData.buyer,
        [field]: getSafeValue(value)
      }
    });
  };

  const handleBankDetailsChange = (field, value) => {
    setFormData({
      ...formData,
      bankDetails: {
        ...formData.bankDetails,
        [field]: getSafeValue(value)
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: getSafeValue(value)
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: '',
          hsnSac: '',
          gstRate: '',
          quantity: 0,
          rate: 0,
          unit: 'KG',
          amount: 0
        }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: newItems
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (getSafeValue(item.amount, 0)), 0);
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalAmount: parseFloat(subtotal.toFixed(2))
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const totals = calculateTotals();
      
      const submitData = {
        billNumber: getSafeValue(formData.billNumber),
        date: getSafeValue(formData.date),
        location: getSafeValue(formData.location),
        supplier: {
          name: getSafeValue(formData.supplier.name),
          address: getSafeValue(formData.supplier.address),
          gstin: getSafeValue(formData.supplier.gstin)
        },
        buyer: {
          name: getSafeValue(formData.buyer.name),
          address: getSafeValue(formData.buyer.address),
          pan: getSafeValue(formData.buyer.pan)
        },
        deliveryNote: getSafeValue(formData.deliveryNote),
        modeOfPayment: getSafeValue(formData.modeOfPayment),
        dispatchedThrough: getSafeValue(formData.dispatchedThrough),
        destination: getSafeValue(formData.destination),
        bankDetails: {
          name: getSafeValue(formData.bankDetails.name),
          accountNumber: getSafeValue(formData.bankDetails.accountNumber),
          branch: getSafeValue(formData.bankDetails.branch),
          ifsc: getSafeValue(formData.bankDetails.ifsc)
        },
        items: formData.items.map(item => ({
          description: getSafeValue(item.description),
          hsnSac: getSafeValue(item.hsnSac),
          gstRate: getSafeValue(item.gstRate),
          quantity: getSafeValue(item.quantity, 0),
          rate: getSafeValue(item.rate, 0),
          unit: getSafeValue(item.unit, 'KG'),
          amount: getSafeValue(item.amount, 0)
        })),
        ...totals
      };

      if (bill && bill._id) {
        await axios.put(
          `${API_BASE_URL}/api/bills/${bill._id}`,
          submitData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/bills`,
          submitData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      onSubmit();
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || 'Error saving bill');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  // ... (numberToWords, formatDate, BillPreview, and handlePrint functions remain the same)
  // Keep all the existing helper functions as they are

  if (showPreview) {
    return (
      <div className="preview-container">
        <div className="preview-actions">
          <button className="btn btn-outline" onClick={() => setShowPreview(false)}>
            <X size={18} className="mr-2" />
            Back to Edit
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={18} className="mr-2" />
            Print Bill
          </button>
        </div>
        <BillPreview />
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="header-content">
          <div className="header-title">
            <FileText className="header-icon" />
            <div>
              <h1>{bill ? 'Edit Bill' : 'Create New Bill'}</h1>
              <p>Fill in the details below to generate an invoice</p>
              {fetchingDefaults && (
                <p className="loading-text">Loading {location} defaults...</p>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowPreview(true)}
            >
              <Eye size={18} className="mr-2" />
              Preview
            </button>
            <button 
              className="btn btn-outline"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        {/* Form sections remain the same */}
        {/* ... (all the form sections from your original code) */}
      </form>
    </div>
  );
};

export default BillForm;
