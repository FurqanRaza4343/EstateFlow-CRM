import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-03-31' as any });
}

export const paymentService = {
  async createCheckoutSession(params: {
    priceId: string;
    customerId?: string;
    customerEmail?: string;
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>;
  }) {
    const stripe = getStripeClient();
    if (!stripe) {
      return {
        simulated: true,
        url: `${APP_URL}/billing?sim_checkout=success&plan=${params.priceId}`,
        sessionId: `sim_cs_${Date.now()}`,
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: params.priceId, quantity: 1 }],
      customer: params.customerId,
      customer_email: params.customerEmail,
      success_url: params.successUrl || `${APP_URL}/billing?checkout=success`,
      cancel_url: params.cancelUrl || `${APP_URL}/billing?checkout=cancel`,
      metadata: params.metadata,
    });

    return { url: session.url, sessionId: session.id };
  },

  async createCustomerPortalSession(customerId: string, returnUrl?: string) {
    const stripe = getStripeClient();
    if (!stripe) {
      return {
        simulated: true,
        url: `${APP_URL}/billing?sim_portal=true`,
      };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${APP_URL}/billing`,
    });

    return { url: session.url };
  },

  async createProduct(plan: { name: string; description: string; monthlyPrice: number; yearlyPrice: number }) {
    const stripe = getStripeClient();
    if (!stripe) {
      return { simulated: true, productId: `sim_prod_${plan.name.toLowerCase()}` };
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { plan: plan.name.toLowerCase() },
    });

    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.monthlyPrice * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.yearlyPrice * 100),
      currency: 'usd',
      recurring: { interval: 'year' },
    });

    return {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id,
    };
  },

  async handleWebhook(body: string, signature: string) {
    const stripe = getStripeClient();
    if (!stripe) return null;

    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    return event;
  },

  async listPrices() {
    const stripe = getStripeClient();
    if (!stripe) {
      return this.getDefaultPrices();
    }

    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 20,
    });

    return prices.data.map(p => ({
      id: p.id,
      productId: typeof p.product === 'string' ? p.product : p.product.id,
      productName: typeof p.product === 'string' ? '' : (p.product as any).name,
      currency: p.currency,
      unitAmount: p.unit_amount,
      interval: p.recurring?.interval || 'month',
    }));
  },

  getDefaultPrices() {
    return [
      { id: 'price_free', productId: 'prod_free', productName: 'Free', currency: 'usd', unitAmount: 0, interval: 'month' },
      { id: 'price_plus_monthly', productId: 'prod_plus', productName: 'Plus', currency: 'usd', unitAmount: 1900, interval: 'month' },
      { id: 'price_plus_yearly', productId: 'prod_plus', productName: 'Plus', currency: 'usd', unitAmount: 15000, interval: 'year' },
      { id: 'price_pro_monthly', productId: 'prod_pro', productName: 'Pro', currency: 'usd', unitAmount: 4900, interval: 'month' },
      { id: 'price_pro_yearly', productId: 'prod_pro', productName: 'Pro', currency: 'usd', unitAmount: 39000, interval: 'year' },
      { id: 'price_business_monthly', productId: 'prod_business', productName: 'Business', currency: 'usd', unitAmount: 9900, interval: 'month' },
      { id: 'price_business_yearly', productId: 'prod_business', productName: 'Business', currency: 'usd', unitAmount: 79000, interval: 'year' },
      { id: 'price_platinum_monthly', productId: 'prod_platinum', productName: 'Platinum', currency: 'usd', unitAmount: 19900, interval: 'month' },
      { id: 'price_platinum_yearly', productId: 'prod_platinum', productName: 'Platinum', currency: 'usd', unitAmount: 159000, interval: 'year' },
    ];
  },
};
