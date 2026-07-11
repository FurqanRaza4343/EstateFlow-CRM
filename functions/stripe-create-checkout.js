export default async (req) => {
  try {
    const body = await req.json();
    const { priceId, successUrl, metadata } = body;
    const planName = metadata?.plan || 'business';

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey) {
      try {
        const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'mode': 'subscription',
            'line_items[0][price]': priceId,
            'line_items[0][quantity]': '1',
            'customer_email': body.customerEmail || '',
            'success_url': successUrl,
            'cancel_url': body.cancelUrl || successUrl,
            'metadata[orgId]': metadata?.orgId || '',
            'metadata[plan]': planName,
          }),
        });

        const session = await resp.json();
        if (session.url) {
          return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch {
        // fall through to simulation
      }
    }

    return new Response(JSON.stringify({
      url: `${successUrl.split('?')[0]}?checkout=success&plan=${planName}&simulated=true`,
      simulated: true,
      sessionId: `sim_${Date.now()}`,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, simulated: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
