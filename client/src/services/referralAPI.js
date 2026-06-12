import api from './api'

export const referralAPI = {
  getMyReferrals: () => api.get('/referrals/my-referrals'),
  getReferralLink: () => api.get('/referrals/link'),
  getCommissions: () => api.get('/referrals/commissions'),
  trackConversion: (referralCode, data) => api.post(`/referrals/track/${referralCode}`, data),
  requestPayout: (data) => api.post('/agent/request-payout', data),
  getPayouts: () => api.get('/agent/payouts'),
}

export default referralAPI