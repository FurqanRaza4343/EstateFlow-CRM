export default async (req) => {
  try {
    const body = await req.json();
    const { query, location, maxResults } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apifyKey = process.env.APIFY_API_KEY;
    if (!apifyKey) {
      return new Response(JSON.stringify({ error: 'Apify API key not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchQuery = location ? `${query} in ${location}` : query;
    const limit = Math.min(Math.max(maxResults || 10, 1), 50);

    const actorResp = await fetch(
      `https://api.apify.com/v2/acts/curiouscipher~google-maps-extractor/runs?token=${apifyKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: searchQuery,
          maxResults: limit,
          language: 'en',
        }),
      }
    );

    if (!actorResp.ok) {
      const errText = await actorResp.text();
      return new Response(JSON.stringify({
        explanation: 'Lead scraping service unavailable. Please try again later.',
        action: 'error',
        debug: `Apify API error: ${actorResp.status} ${errText}`,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const { data: runData } = await actorResp.json();
    const runId = runData?.id;
    if (!runId) {
      return new Response(JSON.stringify({
        explanation: 'Failed to start scraping job.',
        action: 'error',
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    let datasetId = null;
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusResp = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyKey}`
      );
      const statusData = await statusResp.json();
      const status = statusData?.data?.status;
      if (status === 'SUCCEEDED') {
        datasetId = statusData?.data?.defaultDatasetId;
        break;
      }
      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        return new Response(JSON.stringify({
          explanation: 'Scraping job failed. Try a different search term.',
          action: 'error',
        }), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (!datasetId) {
      return new Response(JSON.stringify({
        explanation: 'Scraping timed out. Try a smaller result count.',
        action: 'error',
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const datasetResp = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyKey}&format=json`
    );
    const items = await datasetResp.json();
    const leads = (items || []).slice(0, limit).map((item, idx) => ({
      id: `scraped-${idx + 1}`,
      fullName: item.name || item.title || `Lead ${idx + 1}`,
      phone: item.phone || item.phoneNumber || '',
      email: item.email || item.website?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || '',
      source: item.source || 'Lead Scout',
      propertyType: 'Apartment',
      budgetMin: 0,
      budgetMax: 0,
      preferredLocation: item.address || item.location?.address || location || '',
      status: 'New',
      temperature: 'Warm',
      assignedAgentId: '',
      notes: item.website ? `Website: ${item.website}` : '',
      rating: item.rating || item.averageRating || null,
      reviews: item.reviews || item.totalReviews || null,
      website: item.website || null,
      latitude: item.latitude || item.location?.lat || null,
      longitude: item.longitude || item.location?.lng || null,
    }));

    return new Response(JSON.stringify({ leads, total: leads.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      explanation: 'Scraping service temporarily unavailable. Please try again.',
      action: 'error',
      debug: err.message,
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};
