import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CommissionConfig = () => {
  const [config, setConfig] = useState({
    level1: { percentage: 25, description: 'Direct Referral Commission' },
    level2: { percentage: 15, description: '2nd Level Commission' },
    level3: { percentage: 10, description: '3rd Level Commission' },
    level4: { percentage: 5, description: '4th Level Commission' },
    level5: { percentage: 3, description: '5th Level Commission' },
    payoutSettings: {
      minimumWithdrawal: 500,
      withdrawalFee: 0,
      processingDays: 7,
      kycRequired: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/admin/commission-config');
      setConfig(response.data);
    } catch (error) {
      toast.error('Failed to load commission configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (level, value) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    if (numValue < 0 || numValue > 50) {
      toast.error('Percentage must be between 0 and 50');
      return;
    }
    
    setConfig({
      ...config,
      [level]: { ...config[level], percentage: numValue }
    });
  };

  const handlePayoutSettingChange = (key, value) => {
    setConfig({
      ...config,
      payoutSettings: {
        ...config.payoutSettings,
        [key]: key === 'kycRequired' ? value : parseInt(value) || 0
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/commission-config', config);
      toast.success('Commission configuration saved successfully');
    } finally {
      setSaving(false);
    }
  };

  const totalCommission = config.level1.percentage + 
    config.level2.percentage + 
    config.level3.percentage + 
    config.level4.percentage + 
    config.level5.percentage;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Commission Configuration</h1>
          <p className="text-slate-400">Configure MLM commission percentages for 5 levels</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchConfig} 
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
          >
            <FiRefreshCw />
            <span>Reset</span>
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex items-center space-x-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Commission Distribution Summary - Gradient Card */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Commission Distribution Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{config.level1.percentage}%</p>
            <p className="text-sm opacity-90">Level 1</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{config.level2.percentage}%</p>
            <p className="text-sm opacity-90">Level 2</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{config.level3.percentage}%</p>
            <p className="text-sm opacity-90">Level 3</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{config.level4.percentage}%</p>
            <p className="text-sm opacity-90">Level 4</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{config.level5.percentage}%</p>
            <p className="text-sm opacity-90">Level 5</p>
          </div>
          <div className="text-center border-l border-white/30 pl-4">
            <p className="text-2xl font-bold">{totalCommission}%</p>
            <p className="text-sm opacity-90">Total Distributed</p>
          </div>
        </div>
        <div className="mt-4 text-sm opacity-80 bg-black/20 rounded-lg p-2 text-center">
          Platform retains: {100 - totalCommission}% of each sale
        </div>
      </div>

      {/* Level Configuration Cards - Dark Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 hover:border-orange-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Level {level}</h3>
                <p className="text-sm text-slate-400">{config[`level${level}`]?.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={config[`level${level}`]?.percentage || 0}
                  onChange={(e) => handleLevelChange(`level${level}`, e.target.value)}
                  className="w-20 bg-slate-700 border-slate-600 text-white text-center text-lg font-bold rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                  max="50"
                  step="1"
                />
                <span className="text-lg font-bold text-white">%</span>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-sm text-slate-300">
                Commission earned from {level === 1 ? 'direct' : `${level}nd`} level referrals
              </p>
              <div className="mt-2 h-2 bg-slate-600 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${(config[`level${level}`]?.percentage || 0) / 50 * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payout Settings */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-white mb-4">Payout Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Minimum Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              value={config.payoutSettings.minimumWithdrawal}
              onChange={(e) => handlePayoutSettingChange('minimumWithdrawal', e.target.value)}
              className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-orange-500 focus:border-orange-500"
              min="100"
              step="100"
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum amount users can request for withdrawal
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Withdrawal Fee (%)
            </label>
            <input
              type="number"
              value={config.payoutSettings.withdrawalFee}
              onChange={(e) => handlePayoutSettingChange('withdrawalFee', e.target.value)}
              className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-orange-500 focus:border-orange-500"
              min="0"
              max="10"
              step="0.5"
            />
            <p className="text-xs text-slate-500 mt-1">
              Fee deducted from withdrawal amount
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Processing Days
            </label>
            <input
              type="number"
              value={config.payoutSettings.processingDays}
              onChange={(e) => handlePayoutSettingChange('processingDays', e.target.value)}
              className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-orange-500 focus:border-orange-500"
              min="1"
              max="30"
            />
            <p className="text-xs text-slate-500 mt-1">
              Days required to process withdrawal requests
            </p>
          </div>
          
          <div>
            <label className="flex items-center space-x-3 mt-6">
              <input
                type="checkbox"
                checked={config.payoutSettings.kycRequired}
                onChange={(e) => handlePayoutSettingChange('kycRequired', e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded border-slate-600 focus:ring-orange-500 bg-slate-700"
              />
              <span className="text-sm font-medium text-slate-300">
                Require KYC verification before withdrawal
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-8">
              Users must complete KYC to request withdrawals
            </p>
          </div>
        </div>
      </div>

      {/* Info Card - Dark Theme */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start space-x-3">
        <FiInfo className="text-orange-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-orange-300 font-medium">Important Notes:</p>
          <ul className="text-xs text-slate-400 mt-1 space-y-1">
            <li>• Total commission cannot exceed 70% to maintain platform profitability</li>
            <li>• Changes apply to all future referrals immediately</li>
            <li>• Existing commissions are not affected by percentage changes</li>
            <li>• Minimum withdrawal amount should be reasonable for bank transfer fees</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommissionConfig;