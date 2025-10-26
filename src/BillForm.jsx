import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Eye, Printer, Plus, Trash2, Building, User, Truck, CreditCard, Banknote, FileText } from 'lucide-react';

const BillForm = ({ bill, location, onClose, onSubmit }) => {
  // Initialize with proper default values to avoid undefined
  const [formData, setFormData] = useState({
    billNumber: '',
    date: new Date().toISOString().split('T')[0],
    location: location || '',
    dateRange: '',
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

  // Function to generate default date range
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

  // Safe value getter to prevent undefined values
  const getSafeValue = (value, defaultValue = '') => {
    return value ?? defaultValue;
  };

  // Fetch location defaults when location changes or for new bills
  useEffect(() => {
    const fetchLocationDefaults = async () => {
      if (!bill) {
        setFetchingDefaults(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:5001/api/location-defaults/${location}`,
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
            location: getSafeValue(location),
            dateRange: getDefaultDateRange()
          }));
        } catch (error) {
          console.error('Error fetching location defaults:', error);
          setError('Error loading location defaults');
        } finally {
          setFetchingDefaults(false);
        }
      }
    };

    if (location) {
      fetchLocationDefaults();
    }
  }, [location, bill]);

  useEffect(() => {
    if (bill) {
      // For editing, use the bill data directly with safe values
      setFormData({
        billNumber: getSafeValue(bill.billNumber),
        date: bill.date ? bill.date.split('T')[0] : new Date().toISOString().split('T')[0],
        location: getSafeValue(bill.location, location),
        dateRange: getSafeValue(bill.dateRange, getDefaultDateRange()),
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
      // For new bills, generate bill number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        billNumber: `${year}/${randomNum}`,
        dateRange: getDefaultDateRange(),
        location: getSafeValue(location)
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

  const handleDateRangeChange = (value) => {
    setFormData({
      ...formData,
      dateRange: getSafeValue(value)
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
        dateRange: getSafeValue(formData.dateRange),
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

      console.log('Submitting bill data:', submitData);

      if (bill) {
        await axios.put(
          `http://localhost:5001/api/bills/${bill._id}`,
          submitData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          'http://localhost:5001/api/bills',
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

  const numberToWords = (num) => {
    if (num === 0) return 'zero rupees only';
    
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    let words = '';
    
    if (num >= 100000) {
      const lakhs = Math.floor(num / 100000);
      if (lakhs > 0) {
        words += numberToWords(lakhs) + ' lakh ';
      }
      num %= 100000;
    }
    
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      if (thousands > 0) {
        words += numberToWords(thousands) + ' thousand ';
      }
      num %= 1000;
    }
    
    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + ' hundred ';
      num %= 100;
    }
    
    if (num > 0) {
      if (num < 10) {
        words += ones[num] + ' ';
      } else if (num < 20) {
        words += teens[num - 10] + ' ';
      } else {
        words += tens[Math.floor(num / 10)] + ' ';
        if (num % 10 > 0) {
          words += ones[num % 10] + ' ';
        }
      }
    }
    
    return words.trim() + ' rupees only';
  };

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

  // Fixed Print Function
  const handlePrint = () => {
    const printContent = document.getElementById('bill-preview');
    
    if (!printContent) {
      alert('Print content not found!');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups for printing');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${getSafeValue(formData.billNumber)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
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
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .preview-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .preview-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 1px solid #000;
            }
            .preview-table th,
            .preview-table td {
              border: 1px solid #000;
              padding: 8px 12px;
              text-align: left;
              font-size: 12px;
            }
            .preview-table th {
              background: #f0f0f0;
              font-weight: bold;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .supplier-info, .buyer-info {
              font-size: 12px;
              line-height: 1.3;
            }
            .amount-words {
              margin: 20px 0;
              padding: 12px;
              background: #f8f8f8;
              border: 1px solid #ccc;
              font-size: 12px;
            }
            .bank-details {
              margin: 20px 0;
              padding: 16px;
              background: #f0f0f0;
              border: 1px solid #ccc;
              font-size: 12px;
            }
            .signatory {
              text-align: right;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #000;
              font-size: 12px;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
              .preview-table {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

 const ResponsiveStyles = () => (
    <style>
      {`
        /* Responsive Bill Form Styles */
        @media (max-width: 1200px) {
          .form-container-responsive {
            width: 95% !important;
            margin: 0 auto;
            padding: 1rem;
          }
        }
        
        @media (max-width: 1024px) {
          .form-container-responsive {
            width: 98% !important;
            padding: 0.5rem;
          }
          
          .form-header-responsive {
            padding: 1.5rem !important;
          }
          
          .header-content-responsive {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start !important;
          }
          
          .header-actions-responsive {
            width: 100%;
            justify-content: space-between;
          }
        }
        
        @media (max-width: 768px) {
          .form-container-responsive {
            width: 100% !important;
            padding: 0.25rem;
          }
          
          .form-header-responsive {
            padding: 1rem !important;
          }
          
          .header-title-responsive h1 {
            font-size: 1.5rem !important;
          }
          
          .form-section-responsive {
            padding: 1rem !important;
          }
          
          .section-header-responsive {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .form-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1rem;
          }
          
          .item-grid-responsive {
            grid-template-columns: 1fr !important;
          }
          
          .item-header-responsive {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .item-header-responsive .btn {
            align-self: flex-end;
          }
          
          .form-actions-responsive {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .form-actions-responsive .btn {
            width: 100%;
          }
          
          .summary-grid-responsive {
            max-width: 100% !important;
          }
        }
        
        @media (max-width: 480px) {
          .form-header-responsive {
            padding: 0.75rem !important;
          }
          
          .header-title-responsive h1 {
            font-size: 1.25rem !important;
          }
          
          .form-section-responsive {
            padding: 0.75rem !important;
          }
          
          .section-header-responsive h2 {
            font-size: 1.1rem !important;
          }
          
          .item-card-responsive {
            padding: 0.75rem !important;
          }
          
          .form-input-responsive {
            padding: 0.75rem !important;
            font-size: 14px;
          }
          
          .btn-responsive {
            padding: 0.75rem 1rem !important;
            font-size: 14px;
          }
        }
        
        /* Preview Responsive Styles */
        @media (max-width: 768px) {
          .preview-container-responsive {
            padding: 1rem !important;
          }
          
          .preview-actions-responsive {
            flex-direction: column;
            gap: 1rem;
          }
          
          .preview-actions-responsive .btn {
            width: 100%;
          }
          
          .preview-table-responsive {
            font-size: 10px;
          }
          
          .preview-table-responsive th,
          .preview-table-responsive td {
            padding: 4px 6px;
          }
          
          .bank-details-responsive,
          .amount-words-responsive {
            font-size: 10px;
            padding: 0.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .preview-container-responsive {
            padding: 0.5rem !important;
          }
          
          .preview-table-responsive {
            font-size: 8px;
          }
          
          .preview-table-responsive th,
          .preview-table-responsive td {
            padding: 2px 4px;
          }
          
          .preview-header-responsive h1 {
            font-size: 18px !important;
          }
        }
        
        /* Touch-friendly improvements */
        @media (max-width: 768px) {
          .btn-responsive,
          .form-input-responsive,
          .tab-responsive {
            min-height: 44px;
          }
        }
        
        /* Print optimization */
        @media print {
          .form-container-responsive,
          .preview-actions-responsive {
            display: none !important;
          }
        }
      `}
    </style>
  );

  // Preview Component with responsive classes
  const BillPreview = () => (
    <div id="bill-preview" className="bill-preview">
      <div className="preview-header preview-header-responsive">
        <h1>TAX INVOICE</h1>
      </div>
      
      <table className="preview-table header-table preview-table-responsive">
        <tbody>
          <tr>
            <td width="50%" className="supplier-info">
              <strong>{getSafeValue(formData.supplier.name)}</strong><br/>
              {getSafeValue(formData.supplier.address).split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < getSafeValue(formData.supplier.address).split('\n').length - 1 && <br/>}
                </React.Fragment>
              ))}
              {getSafeValue(formData.supplier.gstin) && <><br/>GSTIN: {getSafeValue(formData.supplier.gstin)}</>}
            </td>
            <td width="25%">
              <strong>Invoice No. : {getSafeValue(formData.billNumber)}</strong><br/>
            </td>
            <td width="25%">
              <strong>Dated: {formatDate(getSafeValue(formData.date))}</strong>
            </td>
          </tr>
          <tr>
            <td ></td>
            <td>Supplier's Ref.</td>
            <td>Mode/Terms of Payment: {getSafeValue(formData.modeOfPayment)}</td>
          </tr>
          <tr>
            <td className="buyer-info">
              <label><b>Buyer</b></label>
              <br />
              <strong>{getSafeValue(formData.buyer.name)}</strong><br/>
              {getSafeValue(formData.buyer.address).split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < getSafeValue(formData.buyer.address).split('\n').length - 1 && <br/>}
                </React.Fragment>
              ))}
              <br/>PAN: {getSafeValue(formData.buyer.pan)}
            </td>
            <td>Buyer's Order No.</td>
            <td>Dated: {getSafeValue(formData.dateRange)}</td>
          </tr>
          <tr>
            <td></td>
            <td>Despatched through: {getSafeValue(formData.dispatchedThrough, 'N/A')}</td>
            <td>Destination: {getSafeValue(formData.destination)}</td>
          </tr>
          <tr>
            <td></td>
            <td>Terms of Delivery</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <table className="preview-table items-table preview-table-responsive">
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
          {formData.items?.map((item, index) => (
            <tr key={index}>
              <td className="text-center">{index + 1}</td>
              <td>{getSafeValue(item.description)}</td>
              <td className="text-center">{getSafeValue(item.hsnSac, '-')}</td>
              <td className="text-right">{(getSafeValue(item.quantity, 0)).toLocaleString()}</td>
              <td className="text-right">{(getSafeValue(item.rate, 0)).toFixed(2)}</td>
              <td className="text-center">{getSafeValue(item.unit, 'KG')}</td>
              <td className="text-right">₹ {(getSafeValue(item.amount, 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="6" className="text-right"><strong>Sub Total</strong></td>
            <td className="text-right"><strong>₹ {totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
          </tr>
          <tr>
            <td colSpan="6" className="text-right">Total CGST Amount</td>
            <td className="text-right"></td>
          </tr>
          <tr>
            <td colSpan="6" className="text-right">TOTAL SGST Amount</td>
            <td className="text-right"></td>
          </tr>
          <tr>
            <td colSpan="6" className="text-right">Round up</td>
            <td className="text-right"></td>
          </tr>
          <tr>
            <td colSpan="6" className="text-right"><strong>Invoice Total</strong></td>
            <td className="text-right"><strong>₹ {totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} E & O.E</strong></td>
          </tr>
        </tbody>
      </table>

      <div className="amount-words amount-words-responsive">
        <strong>Amount Chargeable (in words)</strong><br/>
        {numberToWords(totals.totalAmount)}
      </div>

      <div className="bank-details bank-details-responsive">
        <strong>Bank Name: {getSafeValue(formData.bankDetails.name)}</strong><br/>
        <strong>A/c No.: {getSafeValue(formData.bankDetails.accountNumber)}</strong><br/>
        <strong>Branch & IFS Code: {getSafeValue(formData.bankDetails.branch)}</strong><br/>
        {getSafeValue(formData.bankDetails.ifsc) && <strong>IFSC: {getSafeValue(formData.bankDetails.ifsc)}</strong>}
        <br/>
        for {getSafeValue(formData.buyer.name)}
      </div>

      <div className="signatory">
        Authorised Signatory<br/>
        This is a Computer Generated Invoice
      </div>
    </div>
  );

  if (showPreview) {
    return (
      <>
        <ResponsiveStyles />
        <div className="preview-container preview-container-responsive">
          <div className="preview-actions preview-actions-responsive">
            <button className="btn btn-outline btn-responsive" onClick={() => setShowPreview(false)}>
              <X size={18} className="mr-2" />
              Back to Edit
            </button>
            <button className="btn btn-primary btn-responsive" onClick={handlePrint}>
              <Printer size={18} className="mr-2" />
              Print Bill
            </button>
          </div>
          <BillPreview />
        </div>
      </>
    );
  }

  return (
    <>
      <ResponsiveStyles />
      <div className="form-container form-container-responsive" style={{width: 1100}}>
        <div className="form-header form-header-responsive">
          <div className="header-content header-content-responsive">
            <div className="header-title header-title-responsive">
              <FileText className="header-icon" />
              <div>
                <h1>{bill ? 'Edit Bill' : 'Create New Bill'}</h1>
                <p>Fill in the details below to generate an invoice</p>
                {fetchingDefaults && (
                  <p style={{color: '#666', fontSize: '14px'}}>Loading {location} defaults...</p>
                )}
              </div>
            </div>
            <div className="header-actions header-actions-responsive">
              <button 
                className="btn btn-secondary btn-responsive"
                onClick={() => setShowPreview(true)}
              >
                <Eye size={18} className="mr-2" />
                Preview
              </button>
              <button 
                className="btn btn-outline btn-responsive"
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
          {/* Basic Information */}
          <div className="form-section form-section-responsive">
            <div className="section-header section-header-responsive">
              <Building className="section-icon" />
              <h2>Basic Information</h2>
            </div>
            <div className="form-grid form-grid-responsive">
              <div className="form-group">
                <label>Bill Number *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.billNumber)}
                  onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={getSafeValue(formData.date)}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>Date Range *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.dateRange)}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  placeholder="e.g., July 2025 - August 2025"
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={getSafeValue(formData.location)} 
                  disabled 
                  className="form-input disabled form-input-responsive"
                />
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="form-section form-section-responsive">
            <div className="section-header section-header-responsive">
              <Building className="section-icon" />
              <h2>Supplier Information</h2>
            </div>
            <div className="form-grid form-grid-responsive">
              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.supplier.name)}
                  onChange={(e) => handleSupplierChange('name', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group full-width">
                <label>Supplier Address *</label>
                <textarea
                  value={getSafeValue(formData.supplier.address)}
                  onChange={(e) => handleSupplierChange('address', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>
              <div className="form-group">
                <label>Supplier GSTIN</label>
                <input
                  type="text"
                  value={getSafeValue(formData.supplier.gstin)}
                  onChange={(e) => handleSupplierChange('gstin', e.target.value)}
                  className="form-input form-input-responsive"
                />
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="form-section form-section-responsive">
            <div className="section-header section-header-responsive">
              <User className="section-icon" />
              <h2>Buyer Information</h2>
            </div>
            <div className="form-grid form-grid-responsive">
              <div className="form-group">
                <label>Buyer Name *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.buyer.name)}
                  onChange={(e) => handleBuyerChange('name', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group full-width">
                <label>Buyer Address *</label>
                <textarea
                  value={getSafeValue(formData.buyer.address)}
                  onChange={(e) => handleBuyerChange('address', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>
              <div className="form-group">
                <label>PAN Number *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.buyer.pan)}
                  onChange={(e) => handleBuyerChange('pan', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section form-section-responsive">
            <div className="section-header section-header-responsive">
              <Truck className="section-icon" />
              <h2>Additional Information</h2>
            </div>
            <div className="form-grid form-grid-responsive">
              <div className="form-group">
                <label>Mode of Payment *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.modeOfPayment)}
                  onChange={(e) => handleInputChange('modeOfPayment', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>Dispatched Through</label>
                <input
                  type="text"
                  value={getSafeValue(formData.dispatchedThrough)}
                  onChange={(e) => handleInputChange('dispatchedThrough', e.target.value)}
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>Destination *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.destination)}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="form-section form-section-responsive">
            <div className="section-header section-header-responsive">
              <FileText className="section-icon" />
              <h2>Line Items</h2>
            </div>
            <div className="items-container">
              {formData.items.map((item, index) => (
                <div key={index} className="item-card item-card-responsive">
                  <div className="item-header item-header-responsive">
                    <h3>Item {index + 1}</h3>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm btn-responsive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="item-grid item-grid-responsive">
                    <div className="form-group">
                      <label>Description *</label>
                      <input
                        type="text"
                        value={getSafeValue(item.description)}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                        className="form-input form-input-responsive"
                      />
                    </div>
                    <div className="form-group">
                      <label>HSN/SAC</label>
                      <input
                        type="text"
                        value={getSafeValue(item.hsnSac)}
                        onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                        className="form-input form-input-responsive"
                      />
                    </div>
                    <div className="form-group">
                      <label>GST Rate</label>
                      <input
                        type="text"
                        value={getSafeValue(item.gstRate)}
                        onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                        className="form-input form-input-responsive"
                      />
                    </div>
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={getSafeValue(item.quantity, 0)}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        required
                        className="form-input form-input-responsive"
                      />
                    </div>
                    <div className="form-group">
                      <label>Rate (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={getSafeValue(item.rate, 0)}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        required
                        className="form-input form-input-responsive"
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <select
                        value={getSafeValue(item.unit, 'KG')}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="form-input form-input-responsive"
                      >
                        <option value="KG">KG</option>
                        <option value="BAG">BAG</option>
                        <option value="PIECE">PIECE</option>
                        <option value="LITRE">LITRE</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <div className="amount-display">
                        ₹{getSafeValue(item.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline full-width btn-responsive"
                onClick={addItem}
              >
                <Plus size={18} className="mr-2" />
                Add New Item
              </button>
            </div>
          </div>

          {/* Bank Details */}
          <div className="form-section form-section-responsive">
            <div className="section-header section-header-responsive">
              <CreditCard className="section-icon" />
              <h2>Bank Details</h2>
            </div>
            <div className="form-grid form-grid-responsive">
              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.bankDetails.name)}
                  onChange={(e) => handleBankDetailsChange('name', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.bankDetails.accountNumber)}
                  onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>Branch *</label>
                <input
                  type="text"
                  value={getSafeValue(formData.bankDetails.branch)}
                  onChange={(e) => handleBankDetailsChange('branch', e.target.value)}
                  required
                  className="form-input form-input-responsive"
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  value={getSafeValue(formData.bankDetails.ifsc)}
                  onChange={(e) => handleBankDetailsChange('ifsc', e.target.value)}
                  className="form-input form-input-responsive"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="form-section summary-section form-section-responsive">
            <div className="section-header section-header-responsive">
              <Banknote className="section-icon" />
              <h2>Summary</h2>
            </div>
            <div className="summary-grid summary-grid-responsive">
              <div className="summary-item">
                <span className="summary-label">Subtotal:</span>
                <span className="summary-value">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-item total">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value">₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions form-actions-responsive">
            <button type="button" className="btn btn-outline btn-responsive" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-responsive" disabled={loading || fetchingDefaults}>
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : (fetchingDefaults ? 'Loading...' : 'Save Bill')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BillForm;