export default async (req) => {
  try {
    const body = await req.json();
    const { prompt, organizationId } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ explanation: 'No prompt provided.' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mistralKey = process.env.MISTRAL_API_KEY;
    if (!mistralKey) {
      return new Response(JSON.stringify({
        explanation: `Processed command for "${prompt.substring(0, 50)}..." (AI not configured)`,
        action: 'acknowledged',
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are an AI assistant for a real estate CRM. Analyze commands and respond with an explanation and action type.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      }),
    });

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || 'No response from AI.';

    return new Response(JSON.stringify({ explanation: text, action: 'ai_response' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ explanation: 'AI service temporarily unavailable. Please try again.', action: 'error' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
