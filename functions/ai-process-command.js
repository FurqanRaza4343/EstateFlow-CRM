const p = (s) => s.toLowerCase();

const COMMANDS = [
  { keywords: ['show', 'list', 'view', 'all', 'get'], match: (prompt, lowered) => {
    if (/how many|count|total|number of/.test(lowered)) {
      return { action: 'count', explanation: `Counting records matching "${prompt}"...` };
    }
    if (/lead|client|customer/.test(lowered)) {
      return { action: 'list_leads', explanation: 'Fetching your leads...' };
    }
    if (/agent|team|staff|employee|user/.test(lowered)) {
      return { action: 'list_agents', explanation: 'Fetching team members...' };
    }
    if (/property|listing|inventory/.test(lowered)) {
      return { action: 'list_properties', explanation: 'Fetching property listings...' };
    }
    return null;
  }},
  { keywords: ['add', 'create', 'new', 'insert'], match: (prompt, lowered) => {
    if (/lead|client/.test(lowered)) {
      return { action: 'add_lead', explanation: 'Opening the Add Lead form...' };
    }
    if (/property/.test(lowered)) {
      return { action: 'add_property', explanation: 'Opening the Add Property form...' };
    }
    if (/agent|user|member/.test(lowered)) {
      return { action: 'invite_user', explanation: 'Opening the Invite Team Member form...' };
    }
    return null;
  }},
  { keywords: ['delete', 'remove', 'archive'], match: (prompt, lowered) => {
    return { action: 'confirm_delete', explanation: 'Please confirm which record you want to delete.' };
  }},
  { keywords: ['update', 'edit', 'change', 'modify'], match: (prompt, lowered) => {
    return { action: 'edit_record', explanation: 'Opening the edit form...' };
  }},
  { keywords: ['follow', 'followup', 'remind', 'schedule'], match: (prompt, lowered) => {
    return { action: 'schedule_followup', explanation: 'Opening the follow-up scheduler...' };
  }},
  { keywords: ['report', 'stats', 'dashboard', 'summary', 'analytics'], match: (prompt, lowered) => {
    return { action: 'view_report', explanation: 'Generating your report...' };
  }},
  { keywords: ['call', 'phone', 'dial'], match: (prompt, lowered) => {
    return { action: 'bridge_call', explanation: 'Initiating a call...' };
  }},
  { keywords: ['message', 'sms', 'text', 'whatsapp'], match: (prompt, lowered) => {
    return { action: 'send_message', explanation: 'Opening the message composer...' };
  }},
  { keywords: ['email', 'mail'], match: (prompt, lowered) => {
    return { action: 'send_email', explanation: 'Opening the email composer...' };
  }},
  { keywords: ['attendance', 'checkin', 'check-in', 'check out', 'checkout'], match: (prompt, lowered) => {
    return { action: 'attendance', explanation: 'Opening attendance...' };
  }},
];

function localParse(prompt) {
  const lowered = p(prompt);
  for (const cmd of COMMANDS) {
    if (cmd.keywords.some(k => lowered.includes(k))) {
      const result = cmd.match(prompt, lowered);
      if (result) return result;
    }
  }
  return { action: 'acknowledged', explanation: `Understood. I'll process your request: "${prompt.substring(0, 100)}"` };
}

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
    if (mistralKey) {
      try {
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

        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return new Response(JSON.stringify({ explanation: text, action: 'ai_response' }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (fetchErr) {
        console.error('Mistral fetch failed, falling back to local parser:', fetchErr.message);
      }
    }

    const result = localParse(prompt);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ai-process-command error:', err);
    return new Response(JSON.stringify({ explanation: 'AI service temporarily unavailable. Please try again.', action: 'error' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
