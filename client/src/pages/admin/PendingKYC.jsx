import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiEye, FiCheck, FiX, FiDownload } from 'react-icons/fi';

const PendingKYC = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async (page = 1) => {
    try {
      const response = await api.get('/admin/kyc/pending', { params: { page, limit: 20 } });
      setKycRequests(response.data.kycs);
      setPagination({
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      });
    } catch (error) {
      toast.error('Failed to load KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId) => {
    try {
      await api.put(`/admin/kyc/${kycId}/approve`, { comments: 'Approved' });
      toast.success('KYC approved successfully');
      fetchPendingKYC();
      setSelectedKYC(null);
    } catch (error) {
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (kycId) => {
    const reason = prompt('Please provide rejection reason:');
    if (!reason) return;
    
    try {
      await api.put(`/admin/kyc/${kycId}/reject`, { reason });
      toast.success('KYC rejected');
      fetchPendingKYC();
      setSelectedKYC(null);
    } catch (error) {
      toast.error('Failed to reject KYC');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending KYC Requests</h1>
          <p className="text-gray-600">Review and verify user KYC documents</p>
        </div>
        <button className="flex items-center space-x-2 text-primary hover:text-primary/90">
          <FiDownload />
          <span>Export Report</span>
        </button>
      </div>

      {/* KYC Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kycRequests.map((kyc) => (
          <div key={kyc._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{kyc.userId?.name}</h3>
                  <p className="text-sm text-gray-500">{kyc.userId?.email}</p>
                  <p className="text-sm text-gray-500">{kyc.userId?.phone}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Pending
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Aadhaar Number</p>
                  <p className="text-sm font-medium">XXXX-XXXX-{kyc.aadhaarNumber.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted On</p>
                  <p className="text-sm">{new Date(kyc.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => setSelectedKYC(kyc)}
                  className="flex-1 flex items-center justify-center space-x-2 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition"
                >
                  <FiEye />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => handleApprove(kyc._id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <FiCheck />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReject(kyc._id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  <FiX />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {kycRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No pending KYC requests</p>
        </div>
      )}

      {/* KYC Detail Modal */}
      {selectedKYC && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">KYC Details</h2>
              <button onClick={() => setSelectedKYC(null)} className="text-gray-500">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedKYC.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aadhaar Number</p>
                  <p className="font-medium">{selectedKYC.aadhaarNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{new Date(selectedKYC.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{selectedKYC.gender}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedKYC.address}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Aadhaar Card Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Front Side</p>
                    <img src={selectedKYC.frontImageUrl} alt="Aadhaar Front" className="rounded-lg border" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Back Side</p>
                    <img src={selectedKYC.backImageUrl} alt="Aadhaar Back" className="rounded-lg border" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Holder</p>
                    <p className="font-medium">{selectedKYC.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium">{selectedKYC.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium">{selectedKYC.bankAccountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="font-medium">{selectedKYC.ifscCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingKYC;