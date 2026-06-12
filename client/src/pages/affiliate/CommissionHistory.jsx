import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiSearch } from 'react-icons/fi';

const CommissionHistory = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    level: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });

  useEffect(() => {
    fetchCommissions();
  }, [filters]);

  const fetchCommissions = async () => {
    try {
      const response = await api.get('/affiliate/commissions', { params: filters });
      setCommissions(response.data.commissions);
      setPagination({
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      });
    } catch (error) {
      toast.error('Failed to load commission history');
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      1: 'bg-purple-100 text-purple-700',
      2: 'bg-blue-100 text-blue-700',
      3: 'bg-green-100 text-green-700',
      4: 'bg-yellow-100 text-yellow-700',
      5: 'bg-red-100 text-red-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold text-gray-900">Commission History</h1>
          <p className="text-gray-600">Track all your earnings from referrals</p>
        </div>
        <button className="flex items-center space-x-2 text-primary hover:text-primary/90">
          <FiDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
            className="input"
          >
            <option value="">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="input"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by source user..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(commission.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{commission.sourceUserId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{commission.sourceUserId?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{commission.courseId?.title || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadge(commission.level)}`}>
                      Level {commission.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{commission.amount}</td>
                  <td className="px-6 py-4 text-sm">{commission.percentage}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(commission.status)}`}>
                      {commission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{commission.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {commissions.length} of {pagination.total} entries
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {filters.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionHistory;