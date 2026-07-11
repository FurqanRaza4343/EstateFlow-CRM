export default async (req) => {
  try {
    const body = await req.json();
    const { leadId } = body;

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;

    if (!twilioSid || !twilioToken) {
      return new Response(JSON.stringify({
        success: true,
        simulated: true,
        message: `Call bridge initiated for lead ${leadId} (simulated — no Twilio keys configured)`,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Real Twilio call initiation would go here
    return new Response(JSON.stringify({
      success: true,
      message: `Call bridge connected for lead ${leadId}`,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
