import Stripe from 'stripe';

export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
  };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;