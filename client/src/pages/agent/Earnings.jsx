import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const Earnings = () => {
  const { user } = useSelector((state) => state.auth);
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    pending: 0,
    paid: 0,
    thisMonth: 0,
    commissions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await api.get('/agent/earnings');
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to fetch earnings', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: FiDollarSign, label: 'Total Earned', value: `₹${earnings.totalEarned.toLocaleString()}`, color: 'bg-green-500' },
    { icon: FiClock, label: 'Pending', value: `₹${earnings.pending.toLocaleString()}`, color: 'bg-yellow-500' },
    { icon: FiCheckCircle, label: 'Paid', value: `₹${earnings.paid.toLocaleString()}`, color: 'bg-blue-500' },
    { icon: FiTrendingUp, label: 'This Month', value: `₹${earnings.thisMonth.toLocaleString()}`, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings Overview</h1>
        <p className="text-gray-600">Track your revenue and commission earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Commission History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Commission History</h2>
        <div className="space-y-3">
          {earnings.commissions?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No commission records yet</p>
          ) : (
            earnings.commissions?.map((commission) => (
              <div key={commission._id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{commission.description}</p>
                  <p className="text-sm text-gray-500">{new Date(commission.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+₹{commission.amount}</p>
                  <p className={`text-xs ${commission.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {commission.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;