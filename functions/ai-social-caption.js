export default async (req) => {
  try {
    const body = await req.json();
    const { postType, propertyId, customNotes } = body;
    const notes = customNotes || '';

    const mistralKey = process.env.MISTRAL_API_KEY;
    if (!mistralKey) {
      return new Response(JSON.stringify({ caption: `✨ New listing alert! 🏡\n\nLuxury property now available.\nDM for details! #RealEstate #LuxuryLiving` }), {
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
          { role: 'system', content: 'You are a social media manager for a real estate agency. Write engaging captions.' },
          { role: 'user', content: `Write a ${postType || 'listing'} caption for social media. Notes: ${notes}` },
        ],
        max_tokens: 200,
      }),
    });

    const data = await resp.json();
    const caption = data.choices?.[0]?.message?.content || '✨ New listing available! Contact us for details.';

    return new Response(JSON.stringify({ caption }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ caption: '✨ New property listing! 🏡\nContact us for more details.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
