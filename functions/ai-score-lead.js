export default async (req) => {
  try {
    const body = await req.json();
    const { fullName, source, budgetMin, budgetMax, preferredLocation, status, notes, temperature } = body;

    const mistralKey = process.env.MISTRAL_API_KEY;
    if (!mistralKey) {
      return new Response(JSON.stringify({
        score: 50,
        reasoning: 'AI scoring not configured (MISTRAL_API_KEY missing). Default score returned.',
        suggestedTemperature: temperature || 'Warm',
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const prompt = `You are a real estate lead scoring AI. Score this lead from 0-100 based on buying signals, engagement, and deal potential. Return ONLY valid JSON with keys: score (number 0-100), reasoning (string, 1-2 sentences), suggestedTemperature ("Cold", "Warm", or "Hot").

Lead details:
- Name: ${fullName || 'Unknown'}
- Source: ${source || 'Unknown'}
- Budget Range: ${budgetMin || '?'} - ${budgetMax || '?'}
- Preferred Location: ${preferredLocation || 'Not specified'}
- Current Status: ${status || 'New'}
- Notes: ${notes || 'None'}
- Current Temperature: ${temperature || 'Cold'}

Rules:
- "Hot" (score 75-100): Strong buying signals, high budget, interested status, engaged recently
- "Warm" (score 40-74): Some interest, moderate engagement, needs follow-up
- "Cold" (score 0-39): Low engagement, early stage, budget unclear

Return JSON only, no markdown, no code fences.`;

    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are a lead scoring AI. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 250,
        temperature: 0.3,
      }),
    });

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '{"score":50,"reasoning":"Unable to analyze.","suggestedTemperature":"Warm"}';

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const scoreMatch = text.match(/score["']?\s*:\s*(\d+)/i);
      const tempMatch = text.match(/suggestedTemperature["']?\s*:\s*["'](\w+)["']/i);
      result = {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        reasoning: text.substring(0, 200),
        suggestedTemperature: tempMatch ? tempMatch[1] : 'Warm',
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      score: 50,
      reasoning: 'AI service temporarily unavailable. Default score returned.',
      suggestedTemperature: 'Warm',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
