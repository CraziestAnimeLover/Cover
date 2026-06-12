import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import courseReducer from '../features/course/courseSlice'
import referralReducer from '../features/referral/referralSlice'
import paymentReducer from '../features/payment/paymentSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  courses: courseReducer,
  referrals: referralReducer,
  payments: paymentReducer,
})

export default rootReducer