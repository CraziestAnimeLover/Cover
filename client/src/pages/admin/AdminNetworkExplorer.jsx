import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiSearch, FiUser, FiUsers, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TreeNode = ({ node, level = 1 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  
  if (!node.userId) return null;
  
  return (
    <div className="ml-4 mt-1">
      <div className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded px-2">
        {hasChildren && (
          <button onClick={() => setExpanded(!expanded)} className="focus:outline-none">
            {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <FiUser size={14} className="text-gray-400" />
        <span className="text-sm font-medium">{node.userId.name}</span>
        <span className="text-xs text-gray-400">({node.userId.email})</span>
        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">L{level}</span>
      </div>
      {expanded && hasChildren && (
        <div className="border-l border-gray-200 ml-3 pl-2">
          {node.children.map((child) => (
            <TreeNode key={child.userId?._id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminNetworkExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTree, setFetchingTree] = useState(false);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      const res = await api.get(`/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(res.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const fetchNetwork = async (userId) => {
    setFetchingTree(true);
    try {
      const res = await api.get(`/admin/network/${userId}`);
      setTreeData(res.data);
    } catch (error) {
      toast.error('Failed to load network tree');
    } finally {
      setFetchingTree(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchNetwork(user._id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Explorer</h1>
        <p className="text-gray-600">Search any user and view their downline tree (up to 5 levels)</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email (min 2 characters)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 border rounded-lg divide-y">
            {searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition ${
                  selectedUser?._id === user._id ? 'bg-primary/5 border-l-2 border-primary' : ''
                }`}
              >
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 capitalize">Role: {user.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tree Display */}
      {selectedUser && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 border-b pb-4 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FiUsers className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{selectedUser.name}</h2>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
          </div>

          {fetchingTree ? (
            <div className="text-center py-8">Loading network tree...</div>
          ) : treeData ? (
            <div className="overflow-auto max-h-[600px]">
              {treeData.downline?.children?.length > 0 ? (
                <div className="ml-2">
                  <TreeNode node={treeData.downline} level={1} />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No downline members found.</p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AdminNetworkExplorer;