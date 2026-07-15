function generateMockLeads(query, location, limit) {
  const mockNames = [
    'Ali Khan', 'Sara Ahmed', 'Omar Hassan', 'Fatima Zaidi', 'Bilal Sheikh',
    'Ayesha Malik', 'Zain Abbas', 'Noor Hussain', 'Tariq Mehmood', 'Hina Raza',
    'Usman Chaudhry', 'Zara Iqbal', 'Kamran Ali', 'Samina Tariq', 'Faisal Javed',
    'Rabia Anwar', 'Imran Hashmi', 'Sana Mirza', 'Naveed Akram', 'Mariam Aslam',
  ];
  const mockPhones = [
    '+1 555 0100', '+1 555 0101', '+1 555 0102', '+1 555 0103', '+1 555 0104',
    '+92 300 1111111', '+92 300 2222222', '+92 300 3333333', '+92 300 4444444', '+92 300 5555555',
    '+91 98765 43210', '+91 98765 43211', '+91 98765 43212', '+91 98765 43213', '+91 98765 43214',
    '+971 55 1234567', '+971 55 2345678', '+971 55 3456789', '+971 55 4567890', '+971 55 5678901',
  ];
  const agencies = [
    'Prestige Realty', 'Elite Properties', 'Prime Estates', 'Apex Real Estate', 'Crown Realtors',
    'Royal Homes', 'Golden Key Realty', 'Legacy Estates', 'Pinnacle Properties', 'Vanguard Real Estate',
  ];
  const addresses = location
    ? [`${location} - Main Street`, `${location} - Phase 2`, `${location} - Commercial Zone`, `${location} - Sector A`, `${location} - Downtown`]
    : ['DHA Phase 5, Lahore', 'Clifton, Karachi', 'Sector G-11, Islamabad', 'Blue Area, Islamabad', 'Gulberg, Lahore',
       'PECHS, Karachi', 'F-6, Islamabad', 'Cavalry Ground, Lahore', 'Saddar, Karachi', 'Bahria Town, Rawalpindi'];

  const leads = [];
  for (let i = 0; i < Math.min(limit, mockNames.length); i++) {
    leads.push({
      id: `mock-${i + 1}`,
      fullName: mockNames[i],
      phone: mockPhones[i % mockPhones.length],
      email: `${mockNames[i].toLowerCase().replace(/\s+/g, '.')}@example.com`,
      source: 'Lead Scout',
      propertyType: ['Apartment', 'Villa', 'Plot', 'Commercial', 'Rental'][i % 5],
      budgetMin: 5000000 + i * 1000000,
      budgetMax: 10000000 + i * 2000000,
      preferredLocation: addresses[i % addresses.length],
      status: 'New',
      temperature: ['Hot', 'Warm', 'Cold'][i % 3],
      assignedAgentId: '',
      notes: `Interested in ${query}`,
      rating: (3.5 + i * 0.2).toFixed(1),
      reviews: Math.floor(10 + i * 3),
      website: null,
      latitude: null,
      longitude: null,
    });
  }
  return leads;
}

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

    const apifyKey = process.env.APIFY_API_KEY || process.env.APIFY_API_KEY_2;
    if (!apifyKey) {
      const leads = generateMockLeads(query, location, 10);
      return new Response(JSON.stringify({ leads, total: leads.length, mock: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchQuery = location ? `${query} in ${location}` : query;
    const limit = Math.min(Math.max(maxResults || 10, 1), 50);

    const actorResp = await fetch(
      `https://api.apify.com/v2/acts/drobnikj~google-maps-scraper/runs?token=${apifyKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStringsArray: [searchQuery],
          maxCrawledPlaces: limit,
          language: 'en',
        }),
      }
    );

    if (!actorResp.ok) {
      const errText = await actorResp.text();
      console.error(`Apify API error: ${actorResp.status} ${errText}`);
      const leads = generateMockLeads(query, location, limit);
      return new Response(JSON.stringify({ leads, total: leads.length, mock: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: runData } = await actorResp.json();
    const runId = runData?.id;
    if (!runId) {
      const leads = generateMockLeads(query, location, limit);
      return new Response(JSON.stringify({ leads, total: leads.length, mock: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let datasetId = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise(r => setTimeout(r, 1500));
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
        console.error(`Scrape job ${status}`);
        const leads = generateMockLeads(query, location, limit);
        return new Response(JSON.stringify({ leads, total: leads.length, mock: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (!datasetId) {
      const leads = generateMockLeads(query, location, limit);
      return new Response(JSON.stringify({ leads, total: leads.length, mock: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const datasetResp = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyKey}&format=json`
    );
    const items = await datasetResp.json();
    const leads = (items || []).slice(0, limit).map((item, idx) => ({
      id: `scraped-${idx + 1}`,
      fullName: item.name || item.title || `Lead ${idx + 1}`,
      phone: item.phone || item.phoneNumber || '',
      email: item.email || (item.website ? item.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : ''),
      source: 'Lead Scout',
      propertyType: 'Apartment',
      budgetMin: 0,
      budgetMax: 0,
      preferredLocation: item.address || item.location?.address || item.city || location || '',
      status: 'New',
      temperature: 'Warm',
      assignedAgentId: '',
      notes: item.website ? `Website: ${item.website}` : '',
      rating: item.rating || item.averageRating || null,
      reviews: item.totalReviews || null,
      website: item.website || null,
      latitude: item.latitude || item.location?.lat || null,
      longitude: item.longitude || item.location?.lng || null,
    }));

    return new Response(JSON.stringify({ leads, total: leads.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('scrape-leads error:', err);
    let body, query;
    try {
      body = await req.json();
      query = body.query;
    } catch {}
    const leads = generateMockLeads(query || 'real estate', body?.location, Math.min(Math.max((body?.maxResults) || 10, 1), 50));
    return new Response(JSON.stringify({ leads, total: leads.length, mock: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
