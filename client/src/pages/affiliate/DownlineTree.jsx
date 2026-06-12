import { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DownlineTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    fetchDownlineTree();
  }, []);

  const fetchDownlineTree = async () => {
    try {
      const response = await api.get('/affiliate/downline');
      setTreeData(response.data);
      // Auto-expand first level
      if (response.data?.children) {
        const initialExpanded = {};
        response.data.children.forEach(child => {
          initialExpanded[child.userId?._id] = true;
        });
        setExpandedNodes(initialExpanded);
      }
    } catch (error) {
      toast.error('Failed to load downline tree');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (userId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const TreeNode = ({ node, level = 1 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.userId?._id];
    const user = node.userId;

    if (!user) return null;

    return (
      <div className="ml-6" style={{ marginLeft: level > 1 ? '24px' : '0' }}>
        <div className="flex items-center py-2 hover:bg-gray-50 rounded-lg px-2">
          <div className="flex items-center flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleNode(user._id)}
                className="mr-2 text-gray-500 hover:text-primary"
              >
                {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              <FiUsers className="text-primary text-sm" />
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">Level {level} • {user.email}</p>
            </div>
          </div>
          <div className="flex space-x-4 text-xs text-gray-500">
            <span>Team: {node.totalDownline || 0}</span>
            <span>Earned: ₹{node.totalCommission || 0}</span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-4 pl-2">
            {node.children.map((child) => (
              <TreeNode key={child.userId?._id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No downline members yet</p>
      </div>
    );
  }

  const user = treeData.userId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MLM Downline Tree</h1>
        <p className="text-gray-600">View your network structure up to 5 levels</p>
      </div>

      {/* Root User Card */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <FiUserPlus className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="opacity-90">Your Position • Level 1</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Total Team</p>
            <p className="text-2xl font-bold">{treeData.totalDownline || 0}</p>
          </div>
        </div>
      </div>

      {/* Tree Structure */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Your Downline Network</h3>
        
        {treeData.children?.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No downline members yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Share your referral link to start building your team
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {treeData.children.map((child) => (
              <TreeNode key={child.userId?._id} node={child} level={2} />
            ))}
          </div>
        )}
      </div>

      {/* Level Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Level-wise Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((level) => {
            const count = treeData.downlineSummary?.[`level${level}`] || 0;
            return (
              <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-sm text-gray-600">Level {level}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DownlineTree;