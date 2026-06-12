import { useState } from 'react';
import { FiX, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const KYCModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    panCard: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: ''
  });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'front') {
        setFrontImage(file);
        setFrontPreview(URL.createObjectURL(file));
      } else {
        setBackImage(file);
        setBackPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!frontImage || !backImage) {
      toast.error('Please upload both sides of Aadhaar card');
      return;
    }

    setLoading(true);

    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        formDataObj.append(key, formData[key]);
      }
    });
    formDataObj.append('frontImage', frontImage);
    formDataObj.append('backImage', backImage);

    try {
      await api.post('/affiliate/kyc', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('KYC submitted successfully! Waiting for approval.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">KYC Verification</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <p className="text-xs mt-1">Personal Details</p>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <p className="text-xs mt-1">Aadhaar Upload</p>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <p className="text-xs mt-1">Bank Details</p>
            </div>
          </div>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name (as per Aadhaar) *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Aadhaar Number *</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    required
                    pattern="[0-9]{12}"
                    maxLength="12"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1234 5678 9012"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gender *</label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PAN Card (Optional)</label>
                  <input
                    type="text"
                    name="panCard"
                    value={formData.panCard}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address (as per Aadhaar) *</label>
                <textarea
                  name="address"
                  required
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your complete address"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                disabled={!formData.fullName || !formData.aadhaarNumber || !formData.dateOfBirth || !formData.address}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Aadhaar Upload */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Aadhaar Front Side *</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'front')}
                      className="hidden"
                      id="frontImage"
                    />
                    <label htmlFor="frontImage" className="cursor-pointer block">
                      {frontPreview ? (
                        <img src={frontPreview} alt="Front Side" className="mx-auto max-h-32 rounded" />
                      ) : (
                        <>
                          <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload front side</p>
                          <p className="text-xs text-gray-400">JPG, PNG or PDF (max 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Aadhaar Back Side *</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'back')}
                      className="hidden"
                      id="backImage"
                    />
                    <label htmlFor="backImage" className="cursor-pointer block">
                      {backPreview ? (
                        <img src={backPreview} alt="Back Side" className="mx-auto max-h-32 rounded" />
                      ) : (
                        <>
                          <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload back side</p>
                          <p className="text-xs text-gray-400">JPG, PNG or PDF (max 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                  disabled={!frontImage || !backImage}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Bank Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  name="accountHolderName"
                  required
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Name as per bank account"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    required
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., State Bank of India"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number *</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    required
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter account number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">IFSC Code *</label>
                <input
                  type="text"
                  name="ifscCode"
                  required
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., SBIN0001234"
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 flex items-start space-x-2">
                <FiAlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  Please ensure your bank details are correct. Incorrect details may delay your payouts.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Back
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiCheck className="mr-2" /> Submit KYC
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default KYCModal;