export default async (req) => {
  try {
    const body = await req.json();
    const { leadId, templateContext } = body;
    const context = templateContext || 'default';

    const mistralKey = process.env.MISTRAL_API_KEY;
    if (!mistralKey) {
      const fallbacks = {
        'default': 'Hi! We have a few new exclusive apartments matching your requirements. When can we coordinate a visit?',
        'follow-up': 'Just checking in! We have new inventory that matches your search criteria. Would you like a preview?',
        'price-drop': 'Great news! The property you viewed has a new reduced price. Let me know if you want to discuss.',
      };
      return new Response(JSON.stringify({ draftedText: fallbacks[context] || fallbacks.default }), {
        headers: { 'Content-Type': 'application/json' },
      });
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
          { role: 'system', content: 'You are a real estate sales assistant. Draft a short, professional message to a potential buyer.' },
          { role: 'user', content: `Draft a message for lead follow-up. Context: ${context}` },
        ],
        max_tokens: 200,
      }),
    });

    const data = await resp.json();
    const draftedText = data.choices?.[0]?.message?.content || 'Hi! We have new property listings that may interest you.';

    return new Response(JSON.stringify({ draftedText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ draftedText: 'Hi! We have a few new exclusive apartments matching your requirements.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
