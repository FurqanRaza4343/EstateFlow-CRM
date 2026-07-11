import insforge from './insforge';
import type {
  Lead, UserProfile, Organization, Property, LeadPropertyShare,
  Activity, CallLog, MessageLog, FollowUp, Attendance, SocialPost,
  IntegrationSettings, Notification, ContactPerson, DashboardStats,
  LeadSource, PropertyInterestedType, LeadStatus, LeadTemperature,
  Commission
} from '../types';

function mapRow<T>(row: any, mapping: Record<string, string>): T {
  const result: any = {};
  for (const [key, value] of Object.entries(row)) {
    const tsKey = mapping[key] || key;
    result[tsKey] = value;
  }
  return result as T;
}

function mapRows<T>(rows: any[], mapping: Record<string, string>): T[] {
  return rows.map(r => mapRow<T>(r, mapping));
}

const leadMapping: Record<string, string> = {
  agency_id: 'organizationId', full_name: 'fullName',
  property_type: 'propertyType', budget_min: 'budgetMin',
  budget_max: 'budgetMax', preferred_location: 'preferredLocation',
  assigned_agent_id: 'assignedAgentId', is_hot: 'isHot',
  last_contacted_at: 'lastContactedAt',
};

const orgMapping: Record<string, string> = {
  app_name: 'appName', logo_url: 'logoUrl',
  primary_color: 'primaryColor', secondary_color: 'secondaryColor',
  accent_color: 'accentColor', login_headline: 'loginHeadline',
  dashboard_headline: 'dashboardHeadline', subscription_plan: 'subscriptionPlan',
  max_leads_limit: 'maxLeadsLimit', max_properties_limit: 'maxPropertiesLimit',
  max_users_limit: 'maxUsersLimit', language_preference: 'languagePreference',
  currency_preference: 'currencyPreference',
  property_unit_system: 'propertyUnitSystem',
};

const profileMapping: Record<string, string> = {
  agency_id: 'organizationId', user_id: 'userId',
  avatar_seed: 'avatarSeed',
};

const propMapping: Record<string, string> = {
  agency_id: 'organizationId', property_type: 'propertyType',
  furnishing_status: 'furnishingStatus',
  availability_status: 'availabilityStatus', owner_info: 'ownerInfo',
};

const activityMapping: Record<string, string> = {
  agency_id: 'organizationId', lead_id: 'leadId', user_id: 'userId',
};

const callLogMapping: Record<string, string> = {
  agency_id: 'organizationId', lead_id: 'leadId', agent_id: 'agentId',
};

const messageLogMapping: Record<string, string> = {
  agency_id: 'organizationId', lead_id: 'leadId', agent_id: 'agentId',
};

const followupMapping: Record<string, string> = {
  agency_id: 'organizationId', lead_id: 'leadId', agent_id: 'agentId',
  completed_at: 'completedAt',
};

const attendanceMapping: Record<string, string> = {
  agency_id: 'organizationId', user_id: 'userId',
  check_in_time: 'checkInTime', check_out_time: 'checkOutTime',
  check_in_latitude: 'checkInLatitude', check_in_longitude: 'checkInLongitude',
  check_out_latitude: 'checkOutLatitude', check_out_longitude: 'checkOutLongitude',
  field_visit_notes: 'fieldVisitNotes',
};

const socialPostMapping: Record<string, string> = {
  agency_id: 'organizationId', post_type: 'postType',
  media_url: 'mediaUrl', scheduled_time: 'scheduledTime',
  assigned_user_id: 'assignedUserId',
};

const contactMapping: Record<string, string> = {
  agency_id: 'organizationId', first_name: 'firstName',
  last_name: 'lastName', avatar_seed: 'avatarSeed',
};

const notificationMapping: Record<string, string> = {
  agency_id: 'organizationId', user_id: 'userId',
  is_read: 'isRead',
};

const shareMapping: Record<string, string> = {
  agency_id: 'organizationId', lead_id: 'leadId',
  property_id: 'propertyId', agent_id: 'agentId',
  sent_via: 'sentVia', sent_at: 'sentAt',
  message_preview: 'messagePreview',
};

export const api = {
  async getAgencies(): Promise<Organization[]> {
    const { data, error } = await insforge.database.from('agencies').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return mapRows<Organization>(data || [], orgMapping);
  },

  async getAgencyById(id: string): Promise<Organization | null> {
    const { data, error } = await insforge.database.from('agencies').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapRow<Organization>(data, orgMapping) : null;
  },

  async createAgency(data: Partial<Organization>): Promise<Organization> {
    const row: any = {
      name: data.name, domain: data.domain,
      app_name: data.appName, logo_url: data.logoUrl,
      primary_color: data.primaryColor, secondary_color: data.secondaryColor,
      accent_color: data.accentColor, login_headline: data.loginHeadline,
      dashboard_headline: data.dashboardHeadline,
      subscription_plan: data.subscriptionPlan || 'Free',
      status: data.status || 'Active',
      max_leads_limit: data.maxLeadsLimit || 15,
      max_properties_limit: data.maxPropertiesLimit || 10,
      max_users_limit: data.maxUsersLimit || 3,
      language_preference: data.languagePreference || 'en',
      currency_preference: data.currencyPreference || 'USD',
      property_unit_system: data.propertyUnitSystem || 'global',
    };
    const { data: result, error } = await insforge.database.from('agencies').insert([row]).select().single();
    if (error) throw error;
    return mapRow<Organization>(result, orgMapping);
  },

  async updateAgency(id: string, updates: Partial<Organization>): Promise<Organization> {
    const row: any = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.appName !== undefined) row.app_name = updates.appName;
    if (updates.primaryColor !== undefined) row.primary_color = updates.primaryColor;
    if (updates.secondaryColor !== undefined) row.secondary_color = updates.secondaryColor;
    if (updates.accentColor !== undefined) row.accent_color = updates.accentColor;
    if (updates.loginHeadline !== undefined) row.login_headline = updates.loginHeadline;
    if (updates.dashboardHeadline !== undefined) row.dashboard_headline = updates.dashboardHeadline;
    if (updates.subscriptionPlan !== undefined) row.subscription_plan = updates.subscriptionPlan;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.maxLeadsLimit !== undefined) row.max_leads_limit = updates.maxLeadsLimit;
    if (updates.maxPropertiesLimit !== undefined) row.max_properties_limit = updates.maxPropertiesLimit;
    if (updates.maxUsersLimit !== undefined) row.max_users_limit = updates.maxUsersLimit;
    if (updates.languagePreference !== undefined) row.language_preference = updates.languagePreference;
    if (updates.currencyPreference !== undefined) row.currency_preference = updates.currencyPreference;
    if (updates.propertyUnitSystem !== undefined) row.property_unit_system = updates.propertyUnitSystem;
    if (updates.logoUrl !== undefined) row.logo_url = updates.logoUrl;
    const { data: result, error } = await insforge.database.from('agencies').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapRow<Organization>(result, orgMapping);
  },

  async deleteAgency(id: string): Promise<void> {
    const { error } = await insforge.database.from('agencies').delete().eq('id', id);
    if (error) throw error;
  },

  async getOrgMembers(agencyId: string): Promise<UserProfile[]> {
    const { data, error } = await insforge.database.from('profiles').select('*').eq('agency_id', agencyId);
    if (error) throw error;
    return mapRows<UserProfile>(data || [], profileMapping);
  },

  async getLeads(agencyId?: string): Promise<Lead[]> {
    let query = insforge.database.from('leads').select('*').order('created_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<Lead>(data || [], leadMapping);
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const row: any = {
      agency_id: data.organizationId,
      full_name: data.fullName, phone: data.phone,
      email: data.email || '', source: data.source || 'Manual',
      property_type: data.propertyType || 'Apartment',
      budget_min: data.budgetMin || 1000000,
      budget_max: data.budgetMax || 10000000,
      preferred_location: data.preferredLocation || '',
      status: data.status || 'New', temperature: data.temperature || 'Warm',
      assigned_agent_id: data.assignedAgentId || null,
      notes: data.notes || '', is_hot: data.temperature === 'Hot',
    };
    const { data: result, error } = await insforge.database.from('leads').insert([row]).select().single();
    if (error) throw error;
    return mapRow<Lead>(result, leadMapping);
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const row: any = {};
    if (updates.fullName !== undefined) row.full_name = updates.fullName;
    if (updates.phone !== undefined) row.phone = updates.phone;
    if (updates.email !== undefined) row.email = updates.email;
    if (updates.source !== undefined) row.source = updates.source;
    if (updates.propertyType !== undefined) row.property_type = updates.propertyType;
    if (updates.budgetMin !== undefined) row.budget_min = updates.budgetMin;
    if (updates.budgetMax !== undefined) row.budget_max = updates.budgetMax;
    if (updates.preferredLocation !== undefined) row.preferred_location = updates.preferredLocation;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.temperature !== undefined) row.temperature = updates.temperature;
    if (updates.assignedAgentId !== undefined) row.assigned_agent_id = updates.assignedAgentId;
    if (updates.notes !== undefined) row.notes = updates.notes;
    if (updates.isHot !== undefined) row.is_hot = updates.isHot;
    row.updated_at = new Date().toISOString();
    const { data: result, error } = await insforge.database.from('leads').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapRow<Lead>(result, leadMapping);
  },

  async deleteLead(id: string): Promise<void> {
    const { error } = await insforge.database.from('leads').delete().eq('id', id);
    if (error) throw error;
  },

  async getProperties(agencyId?: string): Promise<Property[]> {
    let query = insforge.database.from('properties').select('*').order('created_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<Property>(data || [], propMapping);
  },

  async createProperty(data: Partial<Property>): Promise<Property> {
    const row: any = {
      agency_id: data.organizationId,
      title: data.title, location: data.location,
      address: data.address || data.location,
      property_type: data.propertyType,
      price: data.price, size: data.size || 'Super Built up',
      bedrooms: data.bedrooms || 0, bathrooms: data.bathrooms || 0,
      floor: data.floor || 0,
      furnishing_status: data.furnishingStatus || 'Semi-Furnished',
      availability_status: 'Available',
      description: data.description || '',
      amenities: data.amenities || ['Gated community'],
      images: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c'],
      documents: ['Brochure.pdf'],
      owner_info: data.ownerInfo || { name: 'Agency Rep', phone: '+919999900001', role: 'In-house' },
      tags: data.tags || ['Exclusive'],
    };
    const { data: result, error } = await insforge.database.from('properties').insert([row]).select().single();
    if (error) throw error;
    return mapRow<Property>(result, propMapping);
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const row: any = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.price !== undefined) row.price = updates.price;
    if (updates.status !== undefined) row.availability_status = updates.status;
    if (updates.description !== undefined) row.description = updates.description;
    const { data: result, error } = await insforge.database.from('properties').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapRow<Property>(result, propMapping);
  },

  async getActivities(agencyId?: string): Promise<Activity[]> {
    let query = insforge.database.from('activities').select('*').order('timestamp', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<Activity>(data || [], activityMapping);
  },

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const row: any = {
      agency_id: data.organizationId, lead_id: data.leadId,
      user_id: data.userId, type: data.type,
      title: data.title, description: data.description,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    const { data: result, error } = await insforge.database.from('activities').insert([row]).select().single();
    if (error) throw error;
    return mapRow<Activity>(result, activityMapping);
  },

  async getFollowups(agencyId?: string): Promise<FollowUp[]> {
    let query = insforge.database.from('followups').select('*').order('datetime', { ascending: true });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<FollowUp>(data || [], followupMapping);
  },

  async createFollowup(data: Partial<FollowUp>): Promise<FollowUp> {
    const row: any = {
      agency_id: data.organizationId, lead_id: data.leadId,
      agent_id: data.agentId, datetime: data.datetime,
      notes: data.notes || '', completed: false, type: data.type,
    };
    const { data: result, error } = await insforge.database.from('followups').insert([row]).select().single();
    if (error) throw error;
    return mapRow<FollowUp>(result, followupMapping);
  },

  async completeFollowup(id: string): Promise<void> {
    const { error } = await insforge.database.from('followups').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  async snoozeFollowup(id: string, newTime: string): Promise<void> {
    const { error } = await insforge.database.from('followups').update({ datetime: newTime }).eq('id', id);
    if (error) throw error;
  },

  async getCallLogs(agencyId?: string): Promise<CallLog[]> {
    let query = insforge.database.from('call_logs').select('*').order('started_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<CallLog>(data || [], callLogMapping);
  },

  async getMessages(agencyId?: string): Promise<MessageLog[]> {
    let query = insforge.database.from('message_logs').select('*').order('sent_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<MessageLog>(data || [], messageLogMapping);
  },

  async getAttendance(agencyId?: string): Promise<Attendance[]> {
    let query = insforge.database.from('attendance').select('*').order('check_in_time', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<Attendance>(data || [], attendanceMapping);
  },

  async checkIn(data: Partial<Attendance>): Promise<Attendance> {
    const row: any = {
      agency_id: data.organizationId, user_id: data.userId,
      check_in_time: new Date().toISOString(),
      status: data.status || 'Present',
      notes: data.notes || 'Check-in.',
      check_in_latitude: data.checkInLatitude,
      check_in_longitude: data.checkInLongitude,
    };
    const { data: result, error } = await insforge.database.from('attendance').insert([row]).select().single();
    if (error) throw error;
    return mapRow<Attendance>(result, attendanceMapping);
  },

  async checkOut(userId: string, latitude?: number, longitude?: number, fieldVisitNotes?: string): Promise<void> {
    const now = new Date().toISOString();
    const updates: any = { check_out_time: now };
    if (latitude !== undefined) updates.check_out_latitude = latitude;
    if (longitude !== undefined) updates.check_out_longitude = longitude;
    if (fieldVisitNotes !== undefined) updates.field_visit_notes = fieldVisitNotes;
    const { error } = await insforge.database.from('attendance').update(updates).eq('user_id', userId).is('check_out_time', null);
    if (error) throw error;
  },

  async getSocialPosts(agencyId?: string): Promise<SocialPost[]> {
    let query = insforge.database.from('social_posts').select('*').order('created_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<SocialPost>(data || [], socialPostMapping);
  },

  async createSocialPost(data: Partial<SocialPost>): Promise<SocialPost> {
    const row: any = {
      agency_id: data.organizationId, post_type: data.postType,
      caption: data.caption, status: data.status || 'Draft',
      scheduled_time: data.scheduledTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      assigned_user_id: data.assignedUserId,
      notes: data.notes || '',
    };
    const { data: result, error } = await insforge.database.from('social_posts').insert([row]).select().single();
    if (error) throw error;
    return mapRow<SocialPost>(result, socialPostMapping);
  },

  async updateSocialPost(id: string, updates: Partial<SocialPost>): Promise<void> {
    const row: any = {};
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.caption !== undefined) row.caption = updates.caption;
    const { error } = await insforge.database.from('social_posts').update(row).eq('id', id);
    if (error) throw error;
  },

  async getContacts(agencyId?: string): Promise<ContactPerson[]> {
    let query = insforge.database.from('contacts').select('*').order('created_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<ContactPerson>(data || [], contactMapping);
  },

  async createContact(data: Partial<ContactPerson>): Promise<ContactPerson> {
    const row: any = {
      agency_id: data.organizationId, first_name: data.firstName,
      last_name: data.lastName || '', phone: data.phone,
      email: data.email || '', company: data.company || '',
      notes: data.notes || '', avatar_seed: data.avatarSeed || 'user',
    };
    const { data: result, error } = await insforge.database.from('contacts').insert([row]).select().single();
    if (error) throw error;
    return mapRow<ContactPerson>(result, contactMapping);
  },

  async getNotifications(agencyId?: string): Promise<Notification[]> {
    let query = insforge.database.from('notifications').select('*').order('created_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<Notification>(data || [], notificationMapping);
  },

  async markNotificationsRead(agencyId?: string): Promise<void> {
    let query = insforge.database.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { error } = await query;
    if (error) throw error;
  },

  async createShare(data: Partial<LeadPropertyShare>): Promise<LeadPropertyShare> {
    const row: any = {
      agency_id: data.organizationId, lead_id: data.leadId,
      property_id: data.propertyId, agent_id: data.agentId,
      sent_via: data.sentVia || 'WhatsApp',
      sent_at: new Date().toISOString(),
      message_preview: data.messagePreview || '',
    };
    const { data: result, error } = await insforge.database.from('shares').insert([row]).select().single();
    if (error) throw error;
    return mapRow<LeadPropertyShare>(result, shareMapping);
  },

  async getShares(agencyId?: string): Promise<LeadPropertyShare[]> {
    let query = insforge.database.from('shares').select('*').order('sent_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return mapRows<LeadPropertyShare>(data || [], shareMapping);
  },

  async getCommissions(agencyId?: string): Promise<Commission[]> {
    let query = insforge.database.from('commissions').select('*').order('created_at', { ascending: false });
    if (agencyId) query = query.eq('agency_id', agencyId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Commission[];
  },

  async createCommission(row: Partial<Commission>): Promise<Commission> {
    const { data, error } = await insforge.database.from('commissions').insert([row]).select().single();
    if (error) throw error;
    return data as Commission;
  },

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const { data, error } = await insforge.database.from('commissions').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Commission;
  },

  async getStats(agencyId: string): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const [leads, calls, followups, props, attendance] = await Promise.all([
      this.getLeads(agencyId),
      this.getCallLogs(agencyId),
      this.getFollowups(agencyId),
      this.getProperties(agencyId),
      this.getAttendance(agencyId),
    ]);
    return {
      newLeadsToday: leads.filter(l => l.createdAt >= todayStart).length,
      callsToday: calls.filter(c => c.status === 'Completed' && c.startedAt >= todayStart).length,
      followupsDueToday: followups.filter(f => !f.completed && f.datetime >= todayStart && f.datetime <= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()).length,
      hotLeadsCount: leads.filter(l => l.temperature === 'Hot' && l.status !== 'Won' && l.status !== 'Lost').length,
      siteVisitsScheduledCount: followups.filter(f => !f.completed && f.type === 'Site Visit').length,
      availableInventoryCount: props.filter(p => p.availabilityStatus === 'Available').length,
      presentAgentsCount: attendance.filter(a => !a.checkOutTime).length,
    };
  },
};
