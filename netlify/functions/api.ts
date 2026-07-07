import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { Database, generateId } from '../../server/database';
import { callService, messageService, emailService, aiService } from '../../server/services';
import { whatsappService } from '../../server/whatsapp';
import { paymentService } from '../../server/payments';
import type { Lead, Property, UserProfile, SocialPost, FollowUp, Attendance } from '../../src/types';

Database.initialize();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. SaaS Super Admin routes
app.get('/api/saas/agencies', (req, res) => {
  const store = Database.get();
  res.json(store.organizations || []);
});

app.post('/api/saas/agencies', (req, res) => {
  const { name, domain, appName, primaryColor, secondaryColor, accentColor, subscriptionPlan, status, maxLeadsLimit, maxPropertiesLimit, maxUsersLimit, logoUrl, languagePreference, currencyPreference, propertyUnitSystem } = req.body;
  if (!name || !domain) {
    res.status(400).json({ error: 'Agency name and domain are required.' });
    return;
  }
  const store = Database.get();
  const id = `org-${domain.replace(/\./g, '-')}-${Math.floor(Math.random() * 100)}`;
  const newAgency = {
    id, name, domain,
    appName: appName || name,
    primaryColor: primaryColor || '#008069',
    secondaryColor: secondaryColor || '#1e293b',
    accentColor: accentColor || 'emerald',
    subscriptionPlan: subscriptionPlan || 'Free',
    status: status || 'Active',
    maxLeadsLimit: Number(maxLeadsLimit) || 15,
    maxPropertiesLimit: Number(maxPropertiesLimit) || 10,
    maxUsersLimit: Number(maxUsersLimit) || 3,
    logoUrl: logoUrl || '',
    languagePreference: languagePreference || 'en',
    currencyPreference: currencyPreference || 'USD',
    propertyUnitSystem: propertyUnitSystem || 'global',
    createdAt: new Date().toISOString()
  };
  store.organizations.push(newAgency);
  const adminName = `${name} Owner`;
  store.users.push({
    id: `user-admin-${id}`,
    organizationId: id, name: adminName,
    email: `owner@${domain}`,
    role: 'Admin / Business Owner',
    phone: '+919999900100',
    avatarSeed: 'admin'
  });
  Database.save();
  res.status(201).json(newAgency);
});

app.put('/api/saas/agencies/:id', (req, res) => {
  const { id } = req.params;
  const store = Database.get();
  const index = store.organizations.findIndex(org => org.id === id);
  if (index === -1) { res.status(404).json({ error: 'Agency not found' }); return; }
  store.organizations[index] = { ...store.organizations[index], ...req.body };
  Database.save();
  res.json(store.organizations[index]);
});

app.delete('/api/saas/agencies/:id', (req, res) => {
  const { id } = req.params;
  const store = Database.get();
  store.organizations = store.organizations.filter(org => org.id !== id);
  store.leads = store.leads.filter(l => l.organizationId !== id);
  store.properties = store.properties.filter(p => p.organizationId !== id);
  store.users = store.users.filter(u => u.organizationId !== id);
  Database.save();
  res.json({ success: true });
});

app.get('/api/saas/super-stats', (req, res) => {
  const store = Database.get();
  const totalAgencies = store.organizations.length;
  const activeAgencies = store.organizations.filter(o => o.status === 'Active').length;
  const suspendedAgencies = store.organizations.filter(o => o.status === 'Suspended').length;
  const freeCount = store.organizations.filter(o => o.subscriptionPlan === 'Free').length;
  const proCount = store.organizations.filter(o => o.subscriptionPlan === 'Pro').length;
  const bizCount = store.organizations.filter(o => o.subscriptionPlan === 'Business').length;
  const enterpriseCount = store.organizations.filter(o => o.subscriptionPlan === 'Enterprise').length;
  res.json({ totalAgencies, activeAgencies, suspendedAgencies, freeCount, proCount, bizCount, enterpriseCount, totalLeads: store.leads.length, totalProperties: store.properties.length, totalUsers: store.users.length, totalContacts: (store.contacts || []).length });
});

// 2. Users
app.get('/api/users', (req, res) => {
  const store = Database.get();
  const orgId = req.query.organizationId as string;
  res.json(orgId ? store.users.filter(u => u.organizationId === orgId) : store.users);
});

// 3. Contacts
app.get('/api/contacts', (req, res) => {
  const store = Database.get();
  const orgId = req.query.organizationId as string;
  const contactsList = store.contacts || [];
  res.json(orgId ? contactsList.filter(c => c.organizationId === orgId) : contactsList);
});

app.post('/api/contacts', (req, res) => {
  const { firstName, lastName, phone, email, company, notes, organizationId } = req.body;
  if (!firstName || !phone) { res.status(400).json({ error: 'First Name and Phone required.' }); return; }
  const store = Database.get();
  const orgId = organizationId || store.organizations[0].id;
  const newContact = {
    id: generateId('contact'), organizationId: orgId, firstName, lastName: lastName || '',
    phone, email: email || '', company: company || '', notes: notes || '',
    avatarSeed: firstName.toLowerCase() + '-' + Math.floor(Math.random() * 100),
    createdAt: new Date().toISOString()
  };
  if (!store.contacts) store.contacts = [];
  store.contacts.push(newContact);
  Database.save();
  const nowStr = new Date().toISOString();
  store.activities.unshift({ id: generateId('act'), organizationId: orgId, leadId: '', userId: `user-admin-${orgId}`, type: 'System', title: 'Manual Contact Saved', description: `Manually saved contact: ${firstName} ${lastName} (${phone})`, timestamp: nowStr });
  Database.save();
  res.status(201).json(newContact);
});

app.post('/api/users/invite', (req, res) => {
  const { name, email, role, phone, organizationId } = req.body;
  if (!name || !email || !role || !phone) { res.status(400).json({ error: 'All fields required.' }); return; }
  const store = Database.get();
  const orgId = organizationId || store.organizations[0].id;
  const targetOrg = store.organizations.find(o => o.id === orgId);
  if (targetOrg) {
    const currentUsersCount = store.users.filter(u => u.organizationId === orgId).length;
    if (currentUsersCount >= targetOrg.maxUsersLimit) {
      res.status(400).json({ error: `Subscription limit reached! Max ${targetOrg.maxUsersLimit} users.` }); return;
    }
  }
  const newUser: UserProfile = { id: generateId('user'), organizationId: orgId, name, email, role, phone, avatarSeed: name.toLowerCase().split(' ')[0] };
  store.users.push(newUser);
  Database.save();
  store.activities.unshift({ id: generateId('act'), organizationId: orgId, leadId: '', userId: `user-admin-${orgId}`, type: 'System', title: 'Staff Invited', description: `New team member [${name}] invited as [${role}].`, timestamp: new Date().toISOString() });
  Database.save();
  res.status(201).json(newUser);
});

// 4. Auth stubs
app.post('/api/auth/register', (req, res) => { res.status(410).json({ error: 'Use InsForge SDK.' }); });
app.post('/api/auth/login', (req, res) => { res.status(410).json({ error: 'Use InsForge SDK.' }); });

// 5. Leads
app.get('/api/leads', (req, res) => {
  const store = Database.get();
  const orgId = req.query.organizationId as string;
  res.json(orgId ? store.leads.filter(l => l.organizationId === orgId) : store.leads);
});

app.post('/api/leads', (req, res) => {
  const { fullName, phone, email, source, propertyType, budgetMin, budgetMax, preferredLocation, notes, temperature, organizationId } = req.body;
  if (!fullName || !phone || !source || !propertyType) { res.status(400).json({ error: 'Mandatory fields missing.' }); return; }
  const store = Database.get();
  const orgId = organizationId || store.organizations[0].id;
  const targetOrg = store.organizations.find(o => o.id === orgId);
  if (targetOrg) {
    const currentLeadsCount = store.leads.filter(l => l.organizationId === orgId).length;
    if (currentLeadsCount >= targetOrg.maxLeadsLimit) {
      res.status(400).json({ error: `Lead limit reached! Max ${targetOrg.maxLeadsLimit}.` }); return;
    }
  }
  const newLead = Database.assignLeadToAgent({ fullName, phone, email: email || '', source, propertyType, budgetMin: Number(budgetMin) || 1000000, budgetMax: Number(budgetMax) || 10000000, preferredLocation: preferredLocation || 'Gurgaon', status: 'New', temperature: temperature || 'Warm', notes: notes || '', isHot: temperature === 'Hot' }, orgId);
  callService.triggerCallBridge(newLead.id);
  res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const store = Database.get();
  const leadIndex = store.leads.findIndex(l => l.id === id);
  if (leadIndex === -1) { res.status(404).json({ error: 'Lead not found' }); return; }
  const oldLead = store.leads[leadIndex];
  store.leads[leadIndex] = { ...oldLead, ...req.body, updatedAt: new Date().toISOString() };
  const nowStr = new Date().toISOString();
  if (oldLead.status !== store.leads[leadIndex].status) {
    store.activities.unshift({ id: generateId('act'), organizationId: oldLead.organizationId, leadId: id, userId: store.leads[leadIndex].assignedAgentId || `user-admin-${oldLead.organizationId}`, type: 'StatusChange', title: 'Status Updated', description: `Status from [${oldLead.status}] to [${store.leads[leadIndex].status}].`, timestamp: nowStr });
  }
  if (oldLead.assignedAgentId !== store.leads[leadIndex].assignedAgentId) {
    const newAgent = store.users.find(u => u.id === store.leads[leadIndex].assignedAgentId);
    store.activities.unshift({ id: generateId('act'), organizationId: oldLead.organizationId, leadId: id, userId: `user-admin-${oldLead.organizationId}`, type: 'Assignment', title: 'Lead Reassigned', description: `Reassigned to [${newAgent ? newAgent.name : 'Unknown'}].`, timestamp: nowStr });
    if (store.leads[leadIndex].assignedAgentId) {
      store.notifications.unshift({ id: generateId('notif'), organizationId: oldLead.organizationId, userId: store.leads[leadIndex].assignedAgentId, title: 'Lead Reassigned', description: `Lead ${store.leads[leadIndex].fullName} reassigned to you.`, type: 'LeadAssigned', isRead: false, createdAt: nowStr });
    }
  }
  Database.save();
  res.json(store.leads[leadIndex]);
});

app.post('/api/webhooks/leads', (req, res) => {
  const store = Database.get();
  const { fullName, phone, email, source, propertyType, budgetMin, budgetMax, preferredLocation, notes } = req.body;
  if (!fullName || !phone) { res.status(400).json({ error: 'fullName and phone required.' }); return; }
  const newLead = Database.assignLeadToAgent({ fullName, phone, email: email || '', source: (source || 'Website') as any, propertyType: (propertyType || 'Apartment') as any, budgetMin: Number(budgetMin) || 1000000, budgetMax: Number(budgetMax) || 10000000, preferredLocation: preferredLocation || 'Gurgaon', status: 'New', temperature: 'Hot', notes: notes || 'Webhook lead.', isHot: true });
  callService.triggerCallBridge(newLead.id);
  res.status(201).json({ message: 'Webhook processed.', lead: newLead });
});

app.post('/api/calls/bridge', (req, res) => {
  const { leadId } = req.body;
  if (!leadId) { res.status(400).json({ error: 'leadId required' }); return; }
  callService.triggerCallBridge(leadId);
  res.json({ message: 'Bridge triggered.' });
});

// 6. Activities
app.get('/api/activities', (req, res) => {
  const store = Database.get();
  res.json(store.activities);
});

app.get('/api/leads/:leadId/timeline', (req, res) => {
  const { leadId } = req.params;
  const store = Database.get();
  res.json(store.activities.filter(a => a.leadId === leadId));
});

app.post('/api/leads/:leadId/notes', (req, res) => {
  const { leadId } = req.params;
  const { text, userId } = req.body;
  if (!text) { res.status(400).json({ error: 'Text required' }); return; }
  const store = Database.get();
  const lead = store.leads.find(l => l.id === leadId);
  if (!lead) { res.status(404).json({ error: 'Lead not found' }); return; }
  const nowStr = new Date().toISOString();
  store.activities.unshift({ id: generateId('act'), organizationId: store.organization.id, leadId, userId: userId || 'user-admin-1', type: 'Note', title: 'Note Added', description: text, timestamp: nowStr });
  lead.notes = `${lead.notes}\n[Note on ${new Date().toLocaleDateString()}]: ${text}`;
  lead.updatedAt = nowStr;
  Database.save();
  res.json({ success: true });
});

// 7. Properties
app.get('/api/properties', (req, res) => {
  const store = Database.get();
  const orgId = req.query.organizationId as string;
  res.json(orgId ? store.properties.filter(p => p.organizationId === orgId) : store.properties);
});

app.post('/api/properties', (req, res) => {
  const { title, location, address, propertyType, price, size, bedrooms, bathrooms, floor, furnishingStatus, description, amenities, images, ownerInfo, tags, organizationId } = req.body;
  if (!title || !location || !propertyType || !price) { res.status(400).json({ error: 'Missing required fields.' }); return; }
  const store = Database.get();
  const orgId = organizationId || store.organizations[0].id;
  const targetOrg = store.organizations.find(o => o.id === orgId);
  if (targetOrg) {
    const currentProps = store.properties.filter(p => p.organizationId === orgId).length;
    if (currentProps >= targetOrg.maxPropertiesLimit) {
      res.status(400).json({ error: `Property limit reached! Max ${targetOrg.maxPropertiesLimit}.` }); return;
    }
  }
  const newProperty: Property = {
    id: generateId('prop'), organizationId: orgId, title, location, address: address || location,
    propertyType, price: Number(price), size: size || 'Super Built up',
    bedrooms: Number(bedrooms) || 0, bathrooms: Number(bathrooms) || 0, floor: Number(floor) || 0,
    furnishingStatus: furnishingStatus || 'Semi-Furnished', availabilityStatus: 'Available',
    description: description || '', amenities: amenities || ['Gated community'],
    images: images?.length ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c'],
    documents: ['Brochure.pdf'], ownerInfo: ownerInfo || { name: 'Agency Rep', phone: '+919999900001', role: 'In-house' },
    tags: tags || ['Exclusive'], createdAt: new Date().toISOString()
  };
  store.properties.push(newProperty);
  Database.save();
  res.status(201).json(newProperty);
});

// 8. Property shares
app.post('/api/shares', async (req, res) => {
  const { leadId, propertyId, agentId, channel } = req.body;
  if (!leadId || !propertyId) { res.status(400).json({ error: 'leadId and propertyId required.' }); return; }
  const store = Database.get();
  const lead = store.leads.find(l => l.id === leadId);
  const property = store.properties.find(p => p.id === propertyId);
  const agent = store.users.find(u => u.id === agentId) || store.users[0];
  if (!lead || !property) { res.status(404).json({ error: 'Lead or Property not found.' }); return; }
  const shareLink = `${process.env.APP_URL || 'https://estateflow.in'}/properties/${property.id}?shareLead=${lead.id}`;
  const priceStr = `INR ${property.price.toLocaleString('en-IN')}`;
  const msg = `Hi ${lead.fullName}, check out "${property.title}" in ${property.location}. Price: ${priceStr}. ${shareLink}`;
  if (channel === 'WhatsApp') await messageService.sendWhatsApp(leadId, agent.id, msg);
  else if (channel === 'SMS') await messageService.sendSMS(leadId, agent.id, msg);
  else await emailService.sendEmail(lead.email || 'lead@example.com', `Property: ${property.title}`, msg, leadId, agent.id);
  const nowStr = new Date().toISOString();
  store.shares.unshift({ id: generateId('share'), organizationId: store.organization.id, leadId, propertyId, agentId: agent.id, sentAt: nowStr, sentVia: channel || 'WhatsApp', link: shareLink, messagePreview: msg });
  Database.save();
  res.json({ success: true });
});

// 9. Followups
app.get('/api/followups', (req, res) => {
  const store = Database.get(); const orgId = req.query.organizationId as string;
  res.json(orgId ? store.followups.filter(f => f.organizationId === orgId) : store.followups);
});

app.post('/api/followups', (req, res) => {
  const { leadId, agentId, datetime, notes, type, organizationId } = req.body;
  if (!leadId || !datetime || !type) { res.status(400).json({ error: 'leadId, datetime, type required.' }); return; }
  const store = Database.get(); const orgId = organizationId || store.organizations[0].id;
  const newFup: FollowUp = { id: generateId('fup'), organizationId: orgId, leadId, agentId: agentId || 'user-agent-1', datetime, notes: notes || '', completed: false, type };
  store.followups.unshift(newFup);
  const leadName = store.leads.find(l => l.id === leadId)?.fullName || 'Lead';
  store.activities.unshift({ id: generateId('act'), organizationId: orgId, leadId, userId: agentId || 'user-agent-1', type: 'System', title: 'Follow-up Scheduled', description: `[${type}] with ${leadName} on ${new Date(datetime).toLocaleString()}`, timestamp: new Date().toISOString() });
  Database.save();
  res.status(201).json(newFup);
});

app.post('/api/followups/:id/complete', (req, res) => {
  const { id } = req.params; const store = Database.get();
  const fUp = store.followups.find(f => f.id === id);
  if (!fUp) { res.status(404).json({ error: 'Not found' }); return; }
  fUp.completed = true; fUp.completedAt = new Date().toISOString();
  store.activities.unshift({ id: generateId('act'), organizationId: store.organization.id, leadId: fUp.leadId, userId: fUp.agentId, type: 'System', title: 'Follow-up Completed', description: `Follow-up [${fUp.type}] marked complete.`, timestamp: new Date().toISOString() });
  Database.save(); res.json({ success: true });
});

app.post('/api/followups/:id/snooze', (req, res) => {
  const { id } = req.params; const { newTime } = req.body;
  if (!newTime) { res.status(400).json({ error: 'newTime required' }); return; }
  const store = Database.get(); const fUp = store.followups.find(f => f.id === id);
  if (!fUp) { res.status(404).json({ error: 'Not found' }); return; }
  fUp.datetime = newTime; Database.save(); res.json({ success: true });
});

// 10. Attendance
app.get('/api/attendance', (req, res) => {
  const store = Database.get(); res.json(store.attendance);
});

app.post('/api/attendance/check-in', (req, res) => {
  const { userId, latitude, longitude, notes, selfiePhoto } = req.body;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  const store = Database.get();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const existing = store.attendance.find(a => a.userId === userId && new Date(a.checkInTime).getTime() >= todayStart.getTime());
  if (existing) { res.status(400).json({ error: 'Already checked in today.' }); return; }
  const now = new Date();
  const status: 'Present' | 'Late' = now.getHours() >= 10 ? 'Late' : 'Present';
  const checkIn: Attendance = { id: generateId('att'), organizationId: store.organization.id, userId, checkInTime: now.toISOString(), checkInLatitude: latitude ? Number(latitude) : undefined, checkInLongitude: longitude ? Number(longitude) : undefined, status, notes: notes || 'Check-in.' };
  store.attendance.unshift(checkIn);
  const staffName = store.users.find(u => u.id === userId)?.name || 'Staff';
  store.activities.unshift({ id: generateId('act'), organizationId: store.organization.id, leadId: '', userId, type: 'System', title: 'Attendance', description: `${staffName} checked in. Status: ${status}.`, timestamp: now.toISOString() });
  Database.save(); res.status(201).json(checkIn);
});

app.post('/api/attendance/check-out', (req, res) => {
  const { userId, latitude, longitude, fieldVisitNotes } = req.body;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  const store = Database.get();
  const checkLog = store.attendance.find(a => a.userId === userId && !a.checkOutTime);
  if (!checkLog) { res.status(404).json({ error: 'No active check-in.' }); return; }
  const now = new Date();
  checkLog.checkOutTime = now.toISOString();
  checkLog.checkOutLatitude = latitude ? Number(latitude) : undefined;
  checkLog.checkOutLongitude = longitude ? Number(longitude) : undefined;
  if (fieldVisitNotes) checkLog.fieldVisitNotes = fieldVisitNotes;
  const staffName = store.users.find(u => u.id === userId)?.name || 'Staff';
  store.activities.unshift({ id: generateId('act'), organizationId: store.organization.id, leadId: '', userId, type: 'System', title: 'Check-out', description: `${staffName} checked out.`, timestamp: now.toISOString() });
  Database.save(); res.json(checkLog);
});

// 11. Social Posts
app.get('/api/social-posts', (req, res) => {
  const store = Database.get(); res.json(store.socialPosts);
});

app.post('/api/social-posts', (req, res) => {
  const { postType, caption, scheduledTime, assignedUserId, notes } = req.body;
  if (!postType || !caption) { res.status(400).json({ error: 'Type and caption required.' }); return; }
  const store = Database.get();
  const newPost: SocialPost = { id: generateId('post'), organizationId: store.organization.id, postType, caption, status: 'Draft', scheduledTime: scheduledTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString(), assignedUserId: assignedUserId || 'user-social-1', notes: notes || '' };
  store.socialPosts.push(newPost);
  Database.save(); res.status(201).json(newPost);
});

app.post('/api/social-posts/ai-caption', async (req, res) => {
  const { postType, propertyId, customNotes } = req.body;
  if (!postType || !propertyId) { res.status(400).json({ error: 'postType and propertyId required.' }); return; }
  const store = Database.get();
  const property = store.properties.find(p => p.id === propertyId);
  if (!property) { res.status(404).json({ error: 'Property not found.' }); return; }
  const caption = await aiService.draftSocialCaption(postType, property.title, property.location, customNotes);
  res.json({ caption });
});

app.post('/api/social-posts/:id/approve', (req, res) => {
  const { id } = req.params; const store = Database.get();
  const post = store.socialPosts.find(p => p.id === id);
  if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
  post.status = 'Scheduled'; Database.save(); res.json(post);
});

app.post('/api/social-posts/:id/publish', (req, res) => {
  const { id } = req.params; const store = Database.get();
  const post = store.socialPosts.find(p => p.id === id);
  if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
  post.status = 'Published'; Database.save(); res.json(post);
});

// 12. AI
app.post('/api/ai/draft-message', async (req, res) => {
  const { leadId, templateContext } = req.body;
  if (!leadId || !templateContext) { res.status(400).json({ error: 'leadId and templateContext required.' }); return; }
  const store = Database.get(); const lead = store.leads.find(l => l.id === leadId);
  if (!lead) { res.status(404).json({ error: 'Lead not found.' }); return; }
  const text = await aiService.draftMessageFollowup(lead.fullName, lead.propertyType, lead.preferredLocation, templateContext);
  res.json({ draftedText: text });
});

app.post('/api/ai/process-command', async (req, res) => {
  const { prompt, userId } = req.body;
  if (!prompt) { res.status(400).json({ error: 'Prompt required.' }); return; }
  const store = Database.get();
  try {
    const rawResult = await aiService.processAiCRMCommand(prompt, store.leads, store.users, new Date().toISOString());
    const action = rawResult.action;
    const data = rawResult.data || {};
    let explanation = rawResult.explanation || 'Processed.';
    if (action === 'CREATE_LEAD') {
      const { fullName, phone, email, source, propertyType, budgetMin, budgetMax, preferredLocation, notes, temperature } = data;
      const newLead = Database.assignLeadToAgent({ fullName: fullName || 'Generated Lead', phone: phone || '+919999911111', email: email || '', source: source || 'Manual', propertyType: propertyType || 'Apartment', budgetMin: Number(budgetMin) || 12000000, budgetMax: Number(budgetMax) || 35000000, preferredLocation: preferredLocation || 'Gurgaon', status: 'New', temperature: temperature || 'Warm', notes: notes || 'Created via Co-Pilot.', isHot: temperature === 'Hot' });
      callService.triggerCallBridge(newLead.id);
      explanation = `Created lead "${newLead.fullName}" assigned to ${store.users.find(u => u.id === newLead.assignedAgentId)?.name || 'Agent'}.`;
    } else if (action === 'CREATE_FOLLOWUP') {
      const { leadId, datetime, notes, type } = data;
      const matchedLeadId = leadId || store.leads[0]?.id || 'lead-1';
      const activeAgentId = userId || 'user-admin-1';
      const newFollowup: FollowUp = { id: generateId('fup'), organizationId: store.organization.id, leadId: matchedLeadId, agentId: activeAgentId, datetime: datetime || new Date(Date.now() + 24 * 3600 * 1000).toISOString(), notes: notes || 'Scheduled via Co-Pilot.', completed: false, type: type || 'Call' };
      store.followups.unshift(newFollowup);
      const leadName = store.leads.find(l => l.id === matchedLeadId)?.fullName || 'Client';
      store.activities.unshift({ id: generateId('act'), organizationId: store.organization.id, leadId: matchedLeadId, userId: activeAgentId, type: 'System', title: 'Follow-up Scheduled', description: `[${newFollowup.type}] with ${leadName} via Co-Pilot.`, timestamp: new Date().toISOString() });
      Database.save();
      explanation = `Scheduled [${newFollowup.type}] with ${leadName}.`;
    } else if (action === 'CREATE_NOTE') {
      const { leadId, text } = data;
      const matchedLeadId = leadId || store.leads[0]?.id || 'lead-1';
      const lead = store.leads.find(l => l.id === matchedLeadId);
      if (lead && text) {
        const nowStr = new Date().toISOString();
        store.activities.unshift({ id: generateId('act'), organizationId: store.organization.id, leadId: matchedLeadId, userId: userId || 'user-admin-1', type: 'Note', title: 'Note Added', description: text, timestamp: nowStr });
        lead.notes = `${lead.notes}\n[Note via Co-Pilot]: ${text}`; lead.updatedAt = nowStr;
        Database.save();
        explanation = `Note added to ${lead.fullName}'s timeline.`;
      }
    } else if (action === 'CREATE_SOCIAL_POST') {
      const { postType, caption, scheduledTime, notes } = data;
      const newPost: SocialPost = { id: generateId('post'), organizationId: store.organization.id, postType: postType || 'Instagram Post', caption: caption || 'EstateFlow premium listing!', status: 'Draft', scheduledTime: scheduledTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString(), assignedUserId: userId || 'user-social-1', notes: notes || 'AI generated.' };
      store.socialPosts.push(newPost);
      Database.save();
      explanation = `Drafted social post [${newPost.postType}].`;
    }
    res.json({ success: true, action, explanation, data });
  } catch (error: any) {
    console.error('AI command error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  const { prompt, systemInstruction } = req.body;
  if (!prompt) { res.status(400).json({ error: 'Prompt required.' }); return; }
  try {
    const result = await aiService.generateContent(prompt, systemInstruction, 'mistral');
    res.json({ result });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 13. Settings
app.get('/api/settings', (req, res) => {
  const store = Database.get(); res.json(store.settings);
});
app.post('/api/settings', (req, res) => {
  const store = Database.get(); store.settings = { ...store.settings, ...req.body }; Database.save(); res.json(store.settings);
});

// 14. Notifications
app.get('/api/notifications', (req, res) => {
  const store = Database.get(); const orgId = req.query.organizationId as string;
  res.json(orgId ? store.notifications.filter(n => n.organizationId === orgId) : store.notifications);
});
app.post('/api/notifications/read', (req, res) => {
  const store = Database.get(); const orgId = req.query.organizationId as string;
  if (orgId) store.notifications.filter(n => n.organizationId === orgId).forEach(n => n.isRead = true);
  else store.notifications.forEach(n => n.isRead = true);
  Database.save(); res.json({ success: true });
});

// 15. WhatsApp
app.post('/api/whatsapp/send', async (req, res) => {
  const { leadId, agentId, message } = req.body;
  if (!leadId || !message) { res.status(400).json({ error: 'leadId and message required.' }); return; }
  try {
    const result = await whatsappService.send(leadId, agentId || 'user-admin-1', message);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sms/send', async (req, res) => {
  const { leadId, agentId, message } = req.body;
  if (!leadId || !message) { res.status(400).json({ error: 'leadId and message required.' }); return; }
  try {
    const result = await whatsappService.sendSMS(leadId, agentId || 'user-admin-1', message);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 16. Stripe Payments
app.post('/api/payments/create-checkout', async (req, res) => {
  const { priceId, customerEmail, successUrl, cancelUrl, metadata } = req.body;
  try {
    const result = await paymentService.createCheckoutSession({
      priceId, customerEmail,
      successUrl: successUrl || `${process.env.APP_URL || 'http://localhost:3000'}/billing?checkout=success`,
      cancelUrl: cancelUrl || `${process.env.APP_URL || 'http://localhost:3000'}/billing?checkout=cancel`,
      metadata,
    });
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/payments/create-portal', async (req, res) => {
  const { customerId, returnUrl } = req.body;
  if (!customerId) { res.status(400).json({ error: 'customerId required' }); return; }
  try {
    const result = await paymentService.createCustomerPortalSession(customerId, returnUrl);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/payments/prices', async (_req, res) => {
  try {
    const prices = await paymentService.listPrices();
    res.json(prices);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// 17. Stats
app.get('/api/stats', (req, res) => {
  const store = Database.get();
  const orgId = (req.query.organizationId as string) || 'org-estateflow-1';
  const now = new Date(); const todayStr = now.toLocaleDateString();
  const orgLeads = store.leads.filter(l => l.organizationId === orgId);
  const orgCalls = store.calls.filter(c => c.organizationId === orgId);
  const orgFollowups = store.followups.filter(f => f.organizationId === orgId);
  const orgProps = store.properties.filter(p => p.organizationId === orgId);
  const orgAttendance = store.attendance.filter(a => a.organizationId === orgId);
  res.json({
    newLeadsToday: orgLeads.filter(l => new Date(l.createdAt).toLocaleDateString() === todayStr).length,
    callsToday: orgCalls.filter(c => new Date(c.startedAt).toLocaleDateString() === todayStr && c.status === 'Completed').length,
    followupsDueToday: orgFollowups.filter(f => !f.completed && new Date(f.datetime).toLocaleDateString() === todayStr).length,
    hotLeadsCount: orgLeads.filter(l => l.temperature === 'Hot' && l.status !== 'Won' && l.status !== 'Lost').length,
    siteVisitsScheduledCount: orgFollowups.filter(f => !f.completed && f.type === 'Site Visit').length,
    availableInventoryCount: orgProps.filter(p => p.availabilityStatus === 'Available').length,
    presentAgentsCount: orgAttendance.filter(a => !a.checkOutTime).length
  });
});

export const handler = serverless(app);
