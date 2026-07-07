// Seed data from the existing JSON structure into InsForge
import { createAdminClient } from '@insforge/sdk';

const admin = createAdminClient({
  baseUrl: 'https://b9qgdai5.us-east.insforge.app',
  apiKey: 'ik_ae649ceb2189efbcf8922509d64f5934',
});

async function seed() {
  console.log('Seeding agencies...');

  const agencies = [
    {
      name: 'EstateFlow Premium Realty',
      domain: 'estateflow.in',
      app_name: 'EstateFlow Premium',
      primary_color: '#0f765e',
      secondary_color: '#0f172a',
      accent_color: 'emerald',
      login_headline: 'EstateFlow Enterprise CRM Workspace',
      dashboard_headline: 'Welcome to EstateFlow Premium Dashboard',
      subscription_plan: 'Business',
      status: 'Active',
      max_leads_limit: 1000,
      max_properties_limit: 500,
      max_users_limit: 30,
      language_preference: 'roman-urdu',
      currency_preference: 'PKR',
      property_unit_system: 'regional',
    },
    {
      name: 'Apex Global Realty Group',
      domain: 'apexrealty.com',
      app_name: 'Apex International',
      primary_color: '#1d4ed8',
      secondary_color: '#1e1b4b',
      accent_color: 'indigo',
      login_headline: 'Apex Global White Label Portal',
      dashboard_headline: 'Welcome to Apex Global Realty Central',
      subscription_plan: 'Enterprise',
      status: 'Active',
      max_leads_limit: 99999,
      max_properties_limit: 99999,
      max_users_limit: 99999,
      language_preference: 'en',
      currency_preference: 'USD',
      property_unit_system: 'global',
    },
    {
      name: 'Star Homes Boutique',
      domain: 'starhomes.net',
      app_name: 'Star CRM Lite',
      primary_color: '#ea580c',
      secondary_color: '#1c1917',
      accent_color: 'orange',
      login_headline: 'Star Homes - Small Team Big Deeds',
      dashboard_headline: "Let's close some boutique deeds today!",
      subscription_plan: 'Free',
      status: 'Active',
      max_leads_limit: 8,
      max_properties_limit: 4,
      max_users_limit: 3,
      language_preference: 'ur',
      currency_preference: 'AED',
      property_unit_system: 'regional',
    },
    {
      name: 'Suspended Capital Real Estate',
      domain: 'suspendedrealty.org',
      app_name: 'Suspended Realty Portal',
      primary_color: '#be123c',
      secondary_color: '#3f0712',
      accent_color: 'rose',
      login_headline: 'Account Suspended - Contact Billing Support',
      dashboard_headline: 'This workspace is Suspended.',
      subscription_plan: 'Pro',
      status: 'Suspended',
      max_leads_limit: 200,
      max_properties_limit: 100,
      max_users_limit: 8,
      language_preference: 'en',
      currency_preference: 'USD',
      property_unit_system: 'global',
    },
  ];

  for (const agency of agencies) {
    const { data, error } = await admin.database
      .from('agencies')
      .insert([agency])
      .select();
    if (error) {
      console.error(`Failed to insert agency ${agency.name}:`, error);
    } else {
      console.log(`Created agency: ${agency.name} (${data[0].id})`);
    }
  }

  console.log('Done seeding!');
}

seed().catch(console.error);
