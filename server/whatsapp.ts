import { Database, generateId } from "./database";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+15005550006';

function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN);
}

function logMessage(leadId: string, agentId: string, channel: 'WhatsApp' | 'SMS', content: string, status: string) {
  const store = Database.get();
  const now = new Date().toISOString();
  const messageLog = {
    id: generateId('msg'),
    organizationId: store.organization.id,
    leadId,
    agentId,
    type: channel as any,
    content,
    status,
    createdAt: now,
    deliveredAt: status === 'delivered' ? now : undefined,
  };
  store.messages.unshift(messageLog as any);

  store.activities.unshift({
    id: generateId('act'),
    organizationId: store.organization.id,
    leadId,
    userId: agentId,
    type: 'Message',
    title: `${channel} Message ${status === 'delivered' ? 'Sent' : 'Failed'}`,
    description: content.substring(0, 100),
    timestamp: now,
  });
  Database.save();
  return messageLog;
}

export const whatsappService = {
  async send(leadId: string, agentId: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!isTwilioConfigured()) {
      logMessage(leadId, agentId, 'WhatsApp', message, 'delivered');
      return { success: true, messageId: `sim_${generateId('msg')}` };
    }

    try {
      const accountSid = TWILIO_ACCOUNT_SID;
      const authToken = TWILIO_AUTH_TOKEN;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const store = Database.get();
      const lead = store.leads.find(l => l.id === leadId);
      if (!lead?.phone) {
        return { success: false, error: 'Lead phone number not found' };
      }

      const to = `whatsapp:${lead.phone.replace(/[^0-9]/g, '')}`;
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_WHATSAPP_NUMBER,
          Body: message,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        logMessage(leadId, agentId, 'WhatsApp', message, 'failed');
        return { success: false, error: result.message || 'Twilio API error' };
      }

      logMessage(leadId, agentId, 'WhatsApp', message, 'delivered');
      return { success: true, messageId: result.sid };
    } catch (err: any) {
      logMessage(leadId, agentId, 'WhatsApp', message, 'failed');
      return { success: false, error: err.message };
    }
  },

  async sendSMS(leadId: string, agentId: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!isTwilioConfigured()) {
      logMessage(leadId, agentId, 'SMS', message, 'delivered');
      return { success: true, messageId: `sim_sms_${generateId('msg')}` };
    }

    try {
      const accountSid = TWILIO_ACCOUNT_SID;
      const authToken = TWILIO_AUTH_TOKEN;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const store = Database.get();
      const lead = store.leads.find(l => l.id === leadId);
      if (!lead?.phone) {
        return { success: false, error: 'Lead phone number not found' };
      }

      const to = lead.phone.replace(/[^0-9]/g, '');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+${to}`,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        logMessage(leadId, agentId, 'SMS', message, 'failed');
        return { success: false, error: result.message || 'Twilio API error' };
      }

      logMessage(leadId, agentId, 'SMS', message, 'delivered');
      return { success: true, messageId: result.sid };
    } catch (err: any) {
      logMessage(leadId, agentId, 'SMS', message, 'failed');
      return { success: false, error: err.message };
    }
  },
};
