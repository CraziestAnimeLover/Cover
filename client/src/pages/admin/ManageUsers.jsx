import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiDownload, FiClock, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManagePayouts = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({
    pending: { count: 0, amount: 0 },
    processing: { count: 0, amount: 0 },
    completed: { count: 0, amount: 0 }
  });

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await api.get('/admin/withdrawals/pending');
      setWithdrawals(response.data.withdrawals);
    } catch (error) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/withdrawals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === withdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(withdrawals.map(w => w._id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('No withdrawals selected');
      return;
    }
    if (!window.confirm(`Approve ${selectedIds.length} withdrawal(s)?`)) return;

    try {
      const res = await api.post('/admin/withdrawals/bulk-process', {
        withdrawalIds: selectedIds,
        status: 'completed',
        transactionIdPrefix: 'BULK'
      });
      toast.success(`Approved ${res.data.results.filter(r => r.success).length} withdrawals`);
      setSelectedIds([]);
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      toast.error('Bulk approval failed');
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get('/admin/withdrawals/export', {
        params: { status: 'pending' },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `withdrawals_${new Date().toISOString().slice(0,19)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      toast.error('Export failed');
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
          <h1 className="text-2xl font-bold">Manage Payouts</h1>
          <p className="text-gray-600">Review and process withdrawal requests</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportCSV} className="flex items-center space-x-2 btn-secondary">
            <FiDownload /> <span>Export CSV</span>
          </button>
          {selectedIds.length > 0 && (
            <button onClick={handleBulkApprove} className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg">
              <FiCheck /> <span>Approve Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-sm">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending.count}</p>
              <p className="text-sm text-yellow-600">₹{stats.pending.amount.toLocaleString()}</p>
            </div>
            <FiClock className="text-3xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm">Processing</p>
              <p className="text-2xl font-bold text-blue-800">{stats.processing.count}</p>
              <p className="text-sm text-blue-600">₹{stats.processing.amount.toLocaleString()}</p>
            </div>
            <FiClock className="text-3xl text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-800">{stats.completed.count}</p>
              <p className="text-sm text-green-600">₹{stats.completed.amount.toLocaleString()}</p>
            </div>
            <FiCheckCircle className="text-3xl text-green-500" />
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === withdrawals.length && withdrawals.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(withdrawal._id)}
                      onChange={() => handleSelect(withdrawal._id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{withdrawal.userId?.name}</p>
                      <p className="text-xs text-gray-500">{withdrawal.userId?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-primary">₹{withdrawal.amount}</td>
                  <td className="px-6 py-4 text-sm capitalize">{withdrawal.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p>{withdrawal.bankDetails?.accountNumber}</p>
                      <p className="text-xs text-gray-500">{withdrawal.bankDetails?.bankName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/admin/withdrawals/${withdrawal._id}/process`, {
                            action: 'approve',
                            transactionId: `MANUAL_${Date.now()}`
                          });
                          toast.success('Approved');
                          fetchWithdrawals();
                          fetchStats();
                        } catch {
                          toast.error('Failed');
                        }
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No pending withdrawal requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePayouts;