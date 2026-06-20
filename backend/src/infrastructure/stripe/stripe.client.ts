import Stripe from 'stripe';
import { env } from '../config/env.js';

export const stripe = new Stripe(env.stripeSecretKey);

if (env.stripeSecretKey === 'sk_test_mock') {
  stripe.paymentIntents.create = async (params: any) => {
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_secret_${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
    } as any;
  };
}
