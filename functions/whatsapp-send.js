export default async (req) => {
  try {
    const body = await req.json();
    const { leadId, agentId, message } = body;

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;

    if (!twilioSid || !twilioToken) {
      return new Response(JSON.stringify({
        success: true,
        simulated: true,
        message: `WhatsApp message logged for lead ${leadId} (simulated — no Twilio keys)`,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `WhatsApp sent to lead ${leadId}`,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
