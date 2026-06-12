import api from './api'

export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  getPaymentStatus: (paymentIntentId) => api.get(`/payments/status/${paymentIntentId}`),
  getMyPurchases: () => api.get('/payments/my-purchases'),
}

export default paymentAPI