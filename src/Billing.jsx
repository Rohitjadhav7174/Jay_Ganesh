import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillForm from './BillForm';
import { Plus, Edit, Trash2, Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE_URL = 'https://jay-ganesh-backend.vercel.app';

const Billing = () => {
  const [selectedLocation, setSelectedLocation] = useState('Ratanagiri');
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [previewBill, setPreviewBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
    setPreviewBill(null);
    setShowForm(true);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setPreviewBill(null);
    setShowForm(true);
  };

  const handlePreviewBill = (bill) => {
    setPreviewBill(bill);
    setEditingBill(null);
    setShowForm(true);
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/bills/${billId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Remove the bill from local state for immediate UI update
        setBills(bills.filter(bill => bill._id !== billId));
        
        // Also refresh from server to ensure consistency
        fetchBills();
        
      } catch (error) {
        console.error('Error deleting bill:', error);
        setError(error.response?.data?.message || 'Error deleting bill');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBill(null);
    setPreviewBill(null);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingBill(null);
    setPreviewBill(null);
    fetchBills();
  };

  const generateHighQualityPDF = async (bill) => {
    setGeneratingPDF(true);
    try {
      // Create a temporary preview container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.padding = '20px';
      tempContainer.style.boxSizing = 'border-box';
      tempContainer.style.background = 'white';
      
      // Generate the bill preview HTML
      const billPreviewHTML = generateBillPreviewHTML(bill);
      tempContainer.innerHTML = billPreviewHTML;
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Clean up
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add new pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Download PDF
      const fileName = `invoice-${bill.billNumber}.pdf`;
      pdf.save(fileName);
      return true;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      return false;
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async (bill) => {
    await generateHighQualityPDF(bill);
  };

  const handleRefresh = () => {
    fetchBills();
  };

  // Helper function to generate bill preview HTML for PDF
  const generateBillPreviewHTML = (bill) => {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const day = date.getDate();
      const month = date.toLocaleString('en', { month: 'long' });
      const year = date.getFullYear();
      
      const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
      };
      
      return `${getOrdinal(day)} ${month} ${year}`;
    };

    const numberToWords = (num) => {
      // Simplified number to words function for PDF
      const integerPart = Math.floor(num);
      if (integerPart === 0) return 'Zero rupees only';
      
      // Basic implementation - you can enhance this as needed
      return `${integerPart.toLocaleString('en-IN')} rupees only`;
    };

    return `
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 15px;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        .bill-preview {
          width: 100%;
          max-width: 100%;
        }
        .preview-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        .preview-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          border: 1px solid #000;
          font-size: 10px;
        }
        .preview-table th,
        .preview-table td {
          border: 1px solid #000;
          padding: 6px 8px;
          text-align: left;
        }
        .preview-table th {
          background: #f0f0f0;
          font-weight: bold;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .amount-words {
          margin: 15px 0;
          padding: 10px;
          background: #f8f8f8;
          border: 1px solid #ccc;
          font-size: 11px;
        }
        .bank-details {
          margin: 15px 0;
          padding: 12px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          font-size: 11px;
        }
        .signatory {
          text-align: right;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #000;
          font-size: 11px;
        }
      </style>
      <div class="bill-preview">
        <div class="preview-header">
          <h1>TAX INVOICE</h1>
        </div>
        
        <table class="preview-table header-table">
          <tbody>
            <tr>
              <td width="50%" class="supplier-info">
                <strong>${bill.supplier?.name || ''}</strong><br/>
                ${(bill.supplier?.address || '').split('\n').map(line => line).join('<br/>')}
                ${bill.supplier?.gstin ? `<br/>GSTIN: ${bill.supplier.gstin}` : ''}
              </td>
              <td width="25%">
                <strong>Invoice No. : ${bill.billNumber || ''}</strong><br/>
              </td>
              <td width="25%">
                <strong>Dated: ${formatDate(bill.date)}</strong>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>Supplier's Ref.</td>
              <td>Mode/Terms of Payment: ${bill.modeOfPayment || 'BANK Transaction'}</td>
            </tr>
            <tr>
              <td class="buyer-info">
                <label><b>Buyer</b></label>
                <br />
                <strong>${bill.buyer?.name || ''}</strong><br/>
                ${(bill.buyer?.address || '').split('\n').map(line => line).join('<br/>')}
                <br/>PAN: ${bill.buyer?.pan || ''}
              </td>
              <td>Buyer's Order No.</td>
              <td>Dated: ${bill.dateRange || ''}</td>
            </tr>
            <tr>
              <td></td>
              <td>
                Despatched through: <strong>Goods Vehicle</strong>
                ${bill.dispatchedThrough ? ` - ${bill.dispatchedThrough}` : ''}
              </td>         
              <td>Destination: ${bill.destination || ''}</td>
            </tr>
            <tr>
              <td></td>
              <td>Terms of Delivery: <strong>Direct To School</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <table class="preview-table items-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Particulars</th>
              <th>HSN/SAC</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>per</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(bill.items || []).map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.description || ''}</td>
                <td class="text-center">${item.hsnSac || '-'}</td>
                <td class="text-right">${(item.quantity || 0).toLocaleString()}</td>
                <td class="text-right">${(item.rate || 0).toFixed(2)}</td>
                <td class="text-center">${item.unit || 'KG'}</td>
                <td class="text-right">₹ ${(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
            <tr>
              <td colSpan="6" class="text-right"><strong>Sub Total</strong></td>
              <td class="text-right"><strong>₹ ${(bill.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
            </tr>
            <tr>
              <td colSpan="6" class="text-right">Total CGST Amount</td>
              <td class="text-right"></td>
            </tr>
            <tr>
              <td colSpan="6" class="text-right">TOTAL SGST Amount</td>
              <td class="text-right"></td>
            </tr>
            <tr>
              <td colSpan="6" class="text-right">Round up</td>
              <td class="text-right"></td>
            </tr>
            <tr>
              <td colSpan="6" class="text-right"><strong>Invoice Total</strong></td>
              <td class="text-right"><strong>₹ ${(bill.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} E & O.E</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="amount-words">
          <strong>Amount Chargeable (in words)</strong><br/>
          ${numberToWords(bill.totalAmount || 0)}
        </div>

        <div class="bank-details">
          <strong>Bank Name: ${bill.bankDetails?.name || ''}</strong><br/>
          <strong>A/c No.: ${bill.bankDetails?.accountNumber || ''}</strong><br/>
          <strong>Branch & IFS Code: ${bill.bankDetails?.branch || ''}</strong><br/>
          ${bill.bankDetails?.ifsc ? `<strong>IFSC: ${bill.bankDetails.ifsc}</strong>` : ''}
          <br/>
          for ${bill.buyer?.name || ''}
        </div>

        <div class="signatory">
          Authorised Signatory<br/>
          This is a Computer Generated Invoice
        </div>
      </div>
    `;
  };

  if (showForm) {
    return (
      <BillForm
        bill={editingBill || previewBill}
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
                <button 
                  className="error-close" 
                  onClick={() => setError('')}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="header-actions">
        
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
          className={`tab ${selectedLocation === 'sindhudurg' ? 'active' : ''}`}
          onClick={() => setSelectedLocation('sindhudurg')}
        >
          sindhudurg
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
                  <div 
                    key={bill._id} 
                    className="bill-card"
                    onClick={() => handlePreviewBill(bill)}
                    style={{ cursor: 'pointer' }}
                  >
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
                      <div className="bill-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-sm btn-edit"
                          onClick={() => handleEditBill(bill)}
                          title="Edit Bill"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-print"
                          onClick={() => handleDownloadPDF(bill)}
                          disabled={generatingPDF}
                          title="Download PDF"
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
