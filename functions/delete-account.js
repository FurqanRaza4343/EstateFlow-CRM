export default async (req) => {
  try {
    const body = await req.json();
    const { clerkId } = body;

    if (!clerkId) {
      return new Response(JSON.stringify({ success: false, error: 'clerkId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const clerkSecret = process.env.CLERK_SECRET_KEY;

    if (!clerkSecret) {
      return new Response(JSON.stringify({
        success: true,
        simulated: true,
        message: `Account deletion logged for ${clerkId} (simulated — no CLERK_SECRET_KEY)`,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const res = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${clerkSecret}` },
    });

    if (!res.ok) {
      const errBody = await res.text();
      return new Response(JSON.stringify({ success: false, error: `Clerk API error: ${res.status} ${errBody}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Account deleted permanently' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
