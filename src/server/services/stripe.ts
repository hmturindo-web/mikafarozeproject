// ============================================
// MIKAFAROZE — Stripe Subscription Service
// ============================================

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
  typescript: true,
});

// ---- Price Map (IDR) ----
// These are synced from admin-managed service_packages table.
// Stripe Price IDs stored alongside each ServicePackage.
export const TIER_PRICES: Record<string, { name: string; price: number; priceId?: string }> = {
  STARTER: {
    name: 'Starter',
    price: 299_000,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  PRO: {
    name: 'Pro',
    price: 599_000,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 1_499_000,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
};

// ---- Create or Get Stripe Customer ----
export async function getOrCreateStripeCustomer(params: {
  email: string;
  name: string;
  userId: string;
}): Promise<string> {
  // Check if customer already exists (stored in our DB subscription record)
  // If not, create new Stripe customer
  const customers = await stripe.customers.list({ email: params.email, limit: 1 });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: { userId: params.userId },
  });

  return customer.id;
}

// ---- Create Subscription Checkout Session ----
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  userId: string;
  packageId: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    payment_method_types: ['card'],
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&package=${params.packageId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
    metadata: {
      userId: params.userId,
      packageId: params.packageId,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
        packageId: params.packageId,
      },
    },
  });

  return session.url!;
}

// ---- Cancel Subscription ----
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// ---- Resume Subscription ----
export async function resumeSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// ---- Get Subscription ----
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId);
}
