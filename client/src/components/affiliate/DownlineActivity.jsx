import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';

const DownlineActivity = () => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/affiliate/downline-activity');
        setActivity(res.data);
      } catch (error) {
        console.error('Failed to fetch downline activity', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (loading) return <div className="text-center py-4">Loading activity...</div>;
  if (!activity) return null;

  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <FiUsers className="mr-2" /> Downline Activity (Active in last 30 days)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Level</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Active</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Inactive</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {levels.map(level => {
              const data = activity[`level${level}`] || { active: 0, inactive: 0 };
              const total = data.active + data.inactive;
              return (
                <tr key={level} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium">Level {level}</td>
                  <td className="px-4 py-2 text-sm text-green-600 flex items-center">
                    <FiUserCheck className="mr-1" /> {data.active}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 flex items-center">
                    <FiUserX className="mr-1" /> {data.inactive}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        * Active = made a course purchase in the last 30 days.
      </p>
    </div>
  );
};

export default DownlineActivity;