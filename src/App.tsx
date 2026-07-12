/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Users, 
  Clock, 
  Calendar, 
  MoreHorizontal, 
  Plus, 
  Bell, 
  Check, 
  X, 
  Sparkles, 
  PhoneCall, 
  Award,
  BookOpen,
  Mic,
  Send,
  Phone,
  MessageSquare,
  Layers,
  ShieldAlert
} from 'lucide-react';

import { Lead, Property, UserProfile, DashboardStats, Activity, Notification, FollowUp, Organization, LeadSource, PropertyInterestedType, LeadTemperature } from './types';
import { t, formatCurrency, getLocalizedPropertyType, LanguageCode, CurrencyCode, PropertySchemeType } from './lib/i18n';
import { Globe, DollarSign as DollarIcon } from 'lucide-react';
import { useAuth } from './lib/AuthContext';
import { api } from './lib/api';
import { AnimatePresence, motion } from 'motion/react';
import insforge from './lib/insforge';
import Dashboard from './components/Dashboard';
import LeadsModule from './components/LeadsModule';
import PropertiesModule from './components/PropertiesModule';
import FollowUpsModule from './components/FollowUpsModule';
import MoreModule from './components/MoreModule';
import ContactsModule from './components/ContactsModule';
import SuperAdminPanel from './components/SuperAdminPanel';
import LegalModule from './components/LegalModule';
import ConsentBanner from './components/ConsentBanner';
import AiDisclosure from './components/AiDisclosure';
import OnboardingAuth from './components/OnboardingAuth';
import ShaderBackground from './components/ShaderBackground';
import TextRollButton from './components/TextRollButton';
import MobileSlideMenu from './components/MobileSlideMenu';
import BottomNav from './components/BottomNav';
import ClickSpark from './components/ClickSpark';
import { ToastProvider, useToast } from './components/ToastProvider';

function AppInner() {
  const toast = useToast();

  // Global tab levels
  const [activeTab, setActiveTab] = useState('dashboard');
  const [moreSubview, setMoreSubview] = useState('attendance');
  const [leadsFilterRedirect, setLeadsFilterRedirect] = useState('');

  // InsForge Authentication
  const { user: authUser, profile, loading: authLoading, signOut } = useAuth();
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  // Legal documentation overlay modal states
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  // Multi-tenant Dynamic SaaS States
  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSuperAdminMode, setIsSuperAdminMode] = useState<boolean>(false);

  // Global Outdoor-Legibility Theme Switch state
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>(() => {
    return (localStorage.getItem('estateflow_theme') as 'dark' | 'light' | 'high-contrast') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('estateflow_theme', theme);
  }, [theme]);

  // i18n and localization states
  const [lang, setLang] = useState<LanguageCode>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [propScheme, setPropScheme] = useState<PropertySchemeType>('global');

  // Domain state layers
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    newLeadsToday: 0,
    callsToday: 0,
    followupsDueToday: 0,
    hotLeadsCount: 0,
    siteVisitsScheduledCount: 0,
    availableInventoryCount: 0,
    presentAgentsCount: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);

  // Testing user simulation switch state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Notification drawer state
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Add manual lead modal state
  const [showAddLead, setShowAddLead] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSource, setLeadSource] = useState('36 Acre');
  const [leadProp, setLeadProp] = useState('Apartment');
  const [leadBudgetMin, setLeadBudgetMin] = useState('3500000');
  const [leadBudgetMax, setLeadBudgetMax] = useState('8500000');
  const [leadLocation, setLeadLocation] = useState('DHA Phase 6, Lahore, Pakistan');
  const [leadTemp, setLeadTemp] = useState('Hot');
  const [leadNotes, setLeadNotes] = useState('');

  // Floating AI Co-Pilot state
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copilotSpeechLang, setCopilotSpeechLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const recognitionRef = useRef<any>(null);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'agent' | 'copilot'; text: string; timestamp: Date; action?: string }>>([
    {
      sender: 'copilot',
      text: 'Hello! I am your AI CRM Co-Pilot. Tell me or type what you would like to do. (e.g. "Create a hot lead Zain Malik phone +923001234567" or "Schedule site visit with Sarah Jenkins next Monday" or "Add a note to Tariq Al-Mansoor regarding current quote")',
      timestamp: new Date()
    }
  ]);

  const startSpeechListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.warning('Your browser does not support Speech Recognition. Please type your query in the input field.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = copilotSpeechLang;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    let accumulatedTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalSpeech = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript + ' ';
        }
      }
      if (finalSpeech.trim()) {
        accumulatedTranscript += finalSpeech;
        setCopilotPrompt(prev => {
          const currentText = prev ? (prev + ' ' + finalSpeech.trim()) : finalSpeech.trim();
          return currentText;
        });
      }
    };

    recognition.onerror = (event: any) => {
      const errorType = event.error || 'unknown';
      console.error("Speech recognition error:", errorType);
      setIsListening(false);
      
      let friendlyMessage = "Voice search did not complete successfully.";
      if (errorType === 'not-allowed') {
        friendlyMessage = "Microphone access is denied or blocked by browser settings. Please allow mic permissions in the address bar or preview settings.";
      } else if (errorType === 'no-speech') {
        friendlyMessage = "No speech was detected. Please make sure your microphone is connected and speak clearly.";
      } else if (errorType === 'network') {
        friendlyMessage = "Network error occurred during speech processing.";
      } else if (errorType === 'aborted') {
        friendlyMessage = "Voice recognition was stopped or aborted.";
      } else {
        friendlyMessage = `Speech Recognition error: ${errorType}. Please make sure you are in a supported browser (e.g. Chrome, Edge, Safari) and have allowed microphone permissions.`;
      }

      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: `🎙️ ${friendlyMessage}`,
          timestamp: new Date()
        }
      ]);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalVal = accumulatedTranscript.trim();
      if (finalVal) {
        handleSendCopilotCommand(finalVal);
      }
    };

    recognition.start();
  };

  const handleSendCopilotCommand = async (customText?: string) => {
    const textToSend = customText || copilotPrompt;
    if (!textToSend.trim()) return;

    // Append agent message
    const userMsg = {
      sender: 'agent' as const,
      text: textToSend,
      timestamp: new Date()
    };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotPrompt('');
    setCopilotLoading(true);

    try {
      const { data: result, error: apiError } = await insforge.functions.invoke('ai-process-command', {
        body: {
          prompt: textToSend,
          userId: currentUser?.id,
          organizationId: activeOrgId
        }
      });

      if (!apiError && result) {
        setCopilotMessages(prev => [...prev, {
          sender: 'copilot',
          text: result.explanation || "Action matched and incorporated successfully into CRM pipeline.",
          timestamp: new Date(),
          action: result.action
        }]);

        await refreshCRMData();
      } else {
        setCopilotMessages(prev => [...prev, {
          sender: 'copilot',
          text: `Oops, I encountered an error: ${apiError?.message || "Please try again."}`,
          timestamp: new Date()
        }]);
      }
    } catch (err: any) {
      console.error(err);
      setCopilotMessages(prev => [...prev, {
        sender: 'copilot',
        text: `Network failure while executing your request: ${err.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Fetch all domain elements from InsForge DB isolating by activeOrgId
  const refreshCRMData = async () => {
    try {
      const [rLeads, rProps, rActs, rNotifs, rFups, rOrgs, rUsersData, rStatsData] = await Promise.all([
        api.getLeads(activeOrgId).catch(() => []),
        api.getProperties(activeOrgId).catch(() => []),
        api.getActivities(activeOrgId).catch(() => []),
        api.getNotifications(activeOrgId).catch(() => []),
        api.getFollowups(activeOrgId).catch(() => []),
        api.getAgencies().catch(() => []),
        api.getOrgMembers(activeOrgId).catch(() => []),
        api.getStats(activeOrgId).catch(() => ({} as DashboardStats))
      ]);

      setLeads(rLeads);
      setUsers(rUsersData);
      setProperties(rProps);
      setStats(rStatsData);
      setActivities(rActs);
      setNotifications(rNotifs);
      setFollowups(rFups);
      setOrganizations(rOrgs);

      // Autofill default active current user if not configured or matches another org
      if (rUsersData && rUsersData.length > 0) {
        const hasMatchingActiveUser = currentUser && rUsersData.some((u: any) => u.id === currentUser.id);
        if (!hasMatchingActiveUser) {
          const adminUser = rUsersData.find((u: any) => u.role.includes('Owner') || u.role.includes('Admin')) || rUsersData[0];
          setCurrentUser(adminUser);
        }
      }
    } catch (e) {
      console.error('API Sync Error:', e);
    }
  };

  // Sync activeOrgId from auth profile
  useEffect(() => {
    if (profile?.agency_id) {
      setActiveOrgId(profile.agency_id);
    }
  }, [profile]);

  // Poll database inputs periodically to ensure simulated bridges sync
  useEffect(() => {
    if (!activeOrgId) return;
    refreshCRMData();
    const interval = setInterval(() => {
      refreshCRMData();
    }, 4500);
    return () => clearInterval(interval);
  }, [activeOrgId]);

  // Sync localization states from the loaded active organization profile
  useEffect(() => {
    const activeOrg = organizations.find(o => o.id === activeOrgId);
    if (activeOrg) {
      if (activeOrg.languagePreference) setLang(activeOrg.languagePreference);
      if (activeOrg.currencyPreference) setCurrency(activeOrg.currencyPreference);
      if (activeOrg.propertyUnitSystem) setPropScheme(activeOrg.propertyUnitSystem);
    }
  }, [activeOrgId, organizations]);

  // Handle live localization configuration changes
  const handleUpdateLocalization = async (updates: { languagePreference?: LanguageCode; currencyPreference?: CurrencyCode; propertyUnitSystem?: PropertySchemeType }) => {
    if (updates.languagePreference) setLang(updates.languagePreference);
    if (updates.currencyPreference) setCurrency(updates.currencyPreference);
    if (updates.propertyUnitSystem) setPropScheme(updates.propertyUnitSystem);

    try {
      await api.updateAgency(activeOrgId, updates);
      await refreshCRMData();
    } catch (e) {
      console.error('Failed to save agency localization settings:', e);
    }
  };

  // Handle manual lead creations
  const handleCreateLeadManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      toast.warning('Full name and phone number are required.');
      return;
    }

    try {
      await api.createLead({
        fullName: leadName,
        phone: leadPhone,
        email: leadEmail,
        source: leadSource as LeadSource,
        propertyType: leadProp as PropertyInterestedType,
        budgetMin: Number(leadBudgetMin),
        budgetMax: Number(leadBudgetMax),
        preferredLocation: leadLocation,
        temperature: leadTemp as LeadTemperature,
        notes: leadNotes,
        organizationId: activeOrgId,
      });

      toast.success('Lead added successfully.');
      
      // Reset states
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
      setLeadNotes('');
      setShowAddLead(false);
      
      await refreshCRMData();
      // Redirect to leads tab to see allocation
      setActiveTab('leads');
      setLeadsFilterRedirect('New');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
      console.error(err);
    }
  };

  // Lead update action
  const handleUpdateLeadParameters = async (leadId: string, updates: Partial<Lead>) => {
    try {
      await api.updateLead(leadId, updates);

      if (updates.status === 'Won') {
        const lead = leads.find(l => l.id === leadId);
        if (lead && activeOrgId) {
          const dealValue = Math.max(lead.budgetMax, lead.budgetMin, 1);
          const commissionPct = 2.5;
          await api.createCommission({
            agency_id: activeOrgId,
            agent_user_id: lead.assignedAgentId || currentUser?.id || '',
            lead_id: leadId,
            property_id: properties[0]?.id || '',
            commission_percentage: commissionPct,
            deal_value: dealValue,
            commission_amount: dealValue * commissionPct / 100,
            status: 'pending',
          });
        }
      }

      await refreshCRMData();
    } catch (e) {
      console.error('Lead update failed:', e);
    }
  };

  // Note addition action
  const handleAddTimelineNote = async (leadId: string, text: string) => {
    try {
      await api.createActivity({
        organizationId: activeOrgId,
        leadId,
        userId: currentUser?.id,
        type: 'Note',
        title: 'Note Added',
        description: text,
      });
      await refreshCRMData();
    } catch (e) {
      console.error('Note add failed:', e);
    }
  };

  const handleManualCallBridge = async (leadId: string) => {
    const { error } = await insforge.functions.invoke('calls-bridge', {
      body: { leadId }
    });
    if (error) console.error('Bridge call failed:', error);
    await refreshCRMData();
  };

  // Property dispatch action (needs Edge Function for WhatsApp/SMS)
  const handleSharePropertyBypass = async (leadId: string, propertyId: string, sentVia: 'WhatsApp' | 'SMS' | 'Email') => {
    await api.createShare({
      organizationId: activeOrgId,
      leadId,
      propertyId,
      agentId: currentUser?.id || '',
      sentVia
    });
    await refreshCRMData();
  };

  // Schedule followup tasks
  const handleScheduleFollowup = async (data: { leadId: string; datetime: string; type: string; notes: string }) => {
    try {
      await api.createFollowup({
        organizationId: activeOrgId,
        leadId: data.leadId,
        agentId: currentUser?.id,
        datetime: data.datetime,
        type: data.type as any,
        notes: data.notes,
      });
      await refreshCRMData();
    } catch (e) {
      console.error('Followup schedule failed:', e);
    }
  };

  // Team Invite action callback
  const handleInviteUserCallback = async (userObj: any) => {
    try {
      await insforge.database.from('profiles').insert([{
        agency_id: activeOrgId,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        phone: userObj.phone,
        avatar_seed: userObj.name?.toLowerCase().split(' ')[0] || 'user',
      }]);
      await refreshCRMData();
    } catch (e) {
      console.error('Invite user failed:', e);
    }
  };

  // Complete touchpoint
  const handleCompleteFollowupMet = async (id: string) => {
    try {
      await api.completeFollowup(id);
      await refreshCRMData();
    } catch (e) {
      console.error('Followup complete failed:', e);
    }
  };

  // Snooze touchpoint
  const handleSnoozeFollowupMet = async (id: string, newTime: string) => {
    try {
      await api.snoozeFollowup(id, newTime);
      await refreshCRMData();
    } catch (e) {
      console.error('Followup snooze failed:', e);
    }
  };

  // Mark all notifications read
  const handleClearNotifications = async () => {
    try {
      await api.markNotificationsRead(activeOrgId);
      await refreshCRMData();
      setShowNotifDrawer(false);
    } catch (e) {
      console.error('Clear notifications failed:', e);
    }
  };

  // Deep Link tab navigation redirects
  const handleDashboardNavigateRedirect = (tab: string, subFilters?: string) => {
    setActiveTab(tab);
    if (tab === 'leads' && subFilters) {
      setLeadsFilterRedirect(subFilters);
    } else if (tab === 'more' && subFilters) {
      setMoreSubview(subFilters);
    }
  };

  useEffect(() => {
    if (!isAuthed && !authLoading && authUser) {
      const userProfile: UserProfile = {
        id: profile?.id || authUser.id,
        organizationId: profile?.agency_id || 'org-estateflow-1',
        name: profile?.name || authUser.profile?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: profile?.role || 'Admin / Business Owner',
        phone: profile?.phone || '',
        avatarSeed: profile?.avatar_seed || 'user',
      };
      setCurrentUser(userProfile);
      setActiveOrgId(userProfile.organizationId);
      setIsAuthed(true);
      refreshCRMData();
    }
  }, [isAuthed, authLoading, authUser, profile]);

  if (!isAuthed || !currentUser) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen w-full flex items-center justify-center">
        <ClickSpark sparkColor="#ff5f03" sparkSize={8} sparkRadius={12} sparkCount={6} duration={350}>
          <OnboardingAuth 
          lang={lang}
          onCompleteAuth={(user) => {
            setCurrentUser(user);
            setActiveOrgId(user.organizationId);
            setIsAuthed(true);
            localStorage.setItem('estateflow_is_authed', 'true');
            localStorage.setItem('estateflow_authed_user', JSON.stringify(user));
            refreshCRMData();
          }}
        />
        </ClickSpark>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const activeOrg = organizations.find(o => o.id === activeOrgId);

  const themeClass = theme === 'light' ? 'theme-light' : theme === 'high-contrast' ? 'theme-high-contrast' : '';

  return (
    <ClickSpark sparkColor="#3b82f6" sparkSize={8} sparkRadius={12} sparkCount={6} duration={350}>
    <div className={`min-h-[100dvh] w-full max-w-[100dvw] flex flex-col font-sans overflow-x-hidden relative ${themeClass}`} id="crm-app-shell" data-agency={activeOrg?.id} style={{ '--agency-primary': activeOrg?.primaryColor || '#3B82F6', '--agency-secondary': activeOrg?.secondaryColor || '#0a0e1a' } as React.CSSProperties}>
        {/* 1. MOBILE-OPTIMIZED NAVBAR */}
      <nav className="sticky top-0 z-40 w-full safe-top" style={{ background: 'var(--bg-surface)' }}>
        <div className="border-b border-[var(--border-light)] px-3 py-2.5 flex items-center justify-between" style={{ background: 'var(--bg-surface)' }}>
          {/* LEFT: Logo + Desktop nav links */}
          <div className="flex items-center gap-3">
            {activeOrg?.logoUrl ? (
              <img src={activeOrg.logoUrl} className="w-8 h-8 rounded-full object-cover shrink-0" alt={activeOrg.name} referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent)' }}>
                <span className="text-white font-bold tracking-tight text-[9px]">{activeOrg?.appName?.substring(0, 2).toUpperCase() || 'EF'}</span>
              </div>
            )}
            <span className="text-[var(--text-primary)] text-xs font-bold tracking-tight hidden sm:block">{activeOrg?.appName || 'EstateFlow'}</span>
            <div className="hidden md:flex items-center gap-1">
              {['dashboard','leads','properties','contacts','more'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition cursor-pointer ${activeTab === tab ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} style={activeTab === tab ? { background: 'var(--color-accent)' } : {}}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-1.5">
            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-1.5">
              <button onClick={() => setIsSuperAdminMode(prev => !prev)} className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition cursor-pointer ${isSuperAdminMode ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} style={isSuperAdminMode ? { background: 'var(--color-accent)' } : { background: 'var(--border-light)' }}>
                {isSuperAdminMode ? 'Admin' : 'SaaS'}
              </button>
              <select value={currentUser.id} onChange={e => { const t = users.find(u => u.id === e.target.value); if (t) { setCurrentUser(t); } }} className="text-[var(--text-secondary)] text-[10px] font-medium px-2 py-1.5 rounded-lg focus:outline-none cursor-pointer appearance-none border-0" style={{ background: 'var(--border-light)' }}>
                {users.map(u => (<option key={u.id} value={u.id} style={{ background: 'var(--bg-surface)' }}>{u.name}</option>))}
              </select>
              <select value={lang} onChange={e => handleUpdateLocalization({ languagePreference: e.target.value as LanguageCode })} className="text-[var(--text-secondary)] text-[10px] font-medium px-2 py-1.5 rounded-lg focus:outline-none cursor-pointer appearance-none border-0" style={{ background: 'var(--border-light)' }}>
                <option value="en" style={{ background: 'var(--bg-surface)' }}>EN</option>
                <option value="ur" style={{ background: 'var(--bg-surface)' }}>UR</option>
                <option value="roman-urdu" style={{ background: 'var(--bg-surface)' }}>ROM</option>
              </select>
              <select value={currency} onChange={e => handleUpdateLocalization({ currencyPreference: e.target.value as CurrencyCode })} className="text-[var(--text-secondary)] text-[10px] font-medium px-2 py-1.5 rounded-lg focus:outline-none cursor-pointer appearance-none border-0" style={{ background: 'var(--border-light)' }}>
                <option value="USD" style={{ background: 'var(--bg-surface)' }}>USD</option>
                <option value="AED" style={{ background: 'var(--bg-surface)' }}>AED</option>
                <option value="PKR" style={{ background: 'var(--bg-surface)' }}>PKR</option>
              </select>
              <button onClick={() => handleUpdateLocalization({ propertyUnitSystem: propScheme === 'global' ? 'regional' : 'global' })} className="text-[var(--text-secondary)] text-[10px] font-medium px-2.5 py-1.5 rounded-lg cursor-pointer hover:text-[var(--text-primary)] transition" style={{ background: 'var(--border-light)' }}>
                {propScheme === 'regional' ? 'Regional' : 'Global'}
              </button>
            </div>

            {/* Notifications bell */}
            <button onClick={() => setShowNotifDrawer(true)} className="relative p-2 min-touch rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-light)] transition cursor-pointer">
              <Bell size={16} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>{unreadCount}</span>}
            </button>

            {/* Mobile slide menu */}
            <div className="md:hidden">
              <MobileSlideMenu
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  setLeadsFilterRedirect('');
                  if (tab === 'more') setMoreSubview('attendance');
                }}
              />
            </div>

            {/* Sign Out */}
            <button onClick={async () => { await signOut(); setIsAuthed(false); setCurrentUser(null); localStorage.removeItem('estateflow_is_authed'); localStorage.removeItem('estateflow_authed_user'); }} className="hidden md:inline-flex text-[10px] font-medium text-[var(--text-muted)] hover:text-rose-400 px-2 py-1.5 transition cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* 2. CORE WORKSPACE CONTENT PANEL */}
      <main className="flex-1 w-full mx-auto px-3 pb-24 safe-bottom" id="crm-workspace">
        {activeOrg?.status === 'Suspended' && !isSuperAdminMode ? (
          <div className="p-5 rounded-2xl border max-w-lg mx-auto text-center space-y-4 my-8 animate-fadeIn" id="agency-suspended-blocker" style={{ background: 'var(--bg-card)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>
              <ShieldAlert className="text-rose-400" size={28} />
            </div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Workspace Suspended</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Access to <strong style={{ color: 'var(--text-primary)' }}>{activeOrg.appName || activeOrg.name}</strong> has been restricted due to billing issues.
            </p>
            <div className="p-4 rounded-xl text-left text-xs space-y-2" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
              <strong className="block font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-primary)' }}>Payment Required</strong>
              <p>Under the <strong style={{ color: 'var(--text-primary)' }}>{activeOrg.subscriptionPlan}</strong> plan, automatic renewal failed.</p>
            </div>
          </div>
        ) : isSuperAdminMode ? (
          <SuperAdminPanel 
            onRefreshAllData={refreshCRMData}
            activeOrgId={activeOrgId}
            onSelectOrg={(orgId) => {
              setActiveOrgId(orgId);
              // auto refresh
              setTimeout(() => refreshCRMData(), 200);
            }}
          />
        ) : (
          <>
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <Dashboard 
                    stats={stats}
                    activities={activities}
                    currentUser={currentUser}
                    leads={leads}
                    onNavigate={handleDashboardNavigateRedirect}
                    onOpenAddLead={() => setShowAddLead(true)}
                    onTriggerAiAssistant={() => setShowAiCopilot(true)}
                    onOpenLegal={(tab) => {
                      setLegalTab(tab);
                      setShowLegalModal(true);
                    }}
                    lang={lang}
                    currency={currency}
                    propScheme={propScheme}
                  />
                </motion.div>
              )}

              {activeTab === 'leads' && (
                <motion.div key="leads" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <LeadsModule 
                    leads={leads}
                    users={users}
                    properties={properties}
                    currentUser={currentUser}
                    onUpdateLead={handleUpdateLeadParameters}
                    onAddNote={handleAddTimelineNote}
                    onTriggerCallBridge={handleManualCallBridge}
                    onShareProperty={handleSharePropertyBypass}
                    onScheduleFollowup={handleScheduleFollowup}
                    onOpenAddLead={() => setShowAddLead(true)}
                    initialFilter={leadsFilterRedirect}
                    lang={lang}
                    currency={currency}
                    propScheme={propScheme}
                  />
                </motion.div>
              )}

              {activeTab === 'properties' && (
                <motion.div key="properties" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <PropertiesModule 
                    properties={properties}
                    leads={leads}
                    currentUser={currentUser}
                    onAddProperty={async (prop) => {
                      const { error } = await api.createProperty({ ...prop, organizationId: activeOrgId });
                      if (!error) {
                        refreshCRMData();
                      } else {
                        toast.error(`Billing Threshold Restriction: ${error.message || 'Check plans limits.'}`);
                      }
                    }}
                    onShareProperty={handleSharePropertyBypass}
                    lang={lang}
                    currency={currency}
                    propScheme={propScheme}
                  />
                </motion.div>
              )}

              {activeTab === 'followups' && (
                <motion.div key="followups" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <FollowUpsModule 
                    followups={followups}
                    leads={leads}
                    users={users}
                    onCompleteFollowup={handleCompleteFollowupMet}
                    onSnoozeFollowup={handleSnoozeFollowupMet}
                    lang={lang}
                    currency={currency}
                    propScheme={propScheme}
                  />
                </motion.div>
              )}

              {activeTab === 'contacts' && (
                <motion.div key="contacts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <ContactsModule 
                    currentUser={currentUser}
                    onRefreshActivities={refreshCRMData}
                    lang={lang}
                    currency={currency}
                    propScheme={propScheme}
                  />
                </motion.div>
              )}

              {activeTab === 'more' && (
                <motion.div key="more" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <MoreModule
                    properties={properties}
                    users={users}
                    currentUser={currentUser!}
                    subview={moreSubview}
                    onSetSubview={setMoreSubview}
                    activeOrg={activeOrg!}
                    organizations={organizations}
                    onRefreshAllData={refreshCRMData}
                    leads={leads}
                    onInviteUser={handleInviteUserCallback}
                    lang={lang}
                    currency={currency}
                    propScheme={propScheme}
                    onUpdateLocalization={handleUpdateLocalization}
                    theme={theme}
                    onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : prev === 'light' ? 'high-contrast' : 'dark')}
                    onSignOut={signOut}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION STRIP BAR */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'more') setMoreSubview('attendance');
          setLeadsFilterRedirect('');
        }}
      />

      {/* 4. NOTIFICATION FEED SIDE DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn" id="notif-drawer-overlay" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full sm:max-w-sm h-[100dvh] p-4 flex flex-col" id="notif-drawer" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="text-xs uppercase font-extrabold tracking-wider" style={{ color: 'var(--text-primary)' }}>Notifications ({notifications.length})</h3>
              <button 
                onClick={() => setShowNotifDrawer(false)}
                className="p-1.5 min-touch rounded-lg" style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification Cards list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {notifications.map(n => (
                <div key={n.id} className="p-3 rounded-xl border text-xs" style={{ background: n.isRead ? 'var(--bg-card)' : 'var(--border-light)', borderColor: n.isRead ? 'var(--border-light)' : 'var(--color-accent)' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{n.title}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>{n.description}</p>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-12 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                  Zero notifications received.
                </div>
              )}
            </div>

            <button 
              id="clear-all-notifs-btn"
              onClick={handleClearNotifications}
              className="w-full font-bold py-2.5 rounded-xl text-xs transition min-touch" style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              Mark all notifications read
            </button>
          </div>
        </div>
      )}

      {/* 5. ADD MANUAL LEAD BOTTOM DRAWER OR MODAL */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn" id="add-lead-modal-overlay" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md max-h-[90dvh] overflow-y-auto space-y-4" id="add-lead-form-modal" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Plus size={16} style={{ color: 'var(--color-accent)' }} /> {t('action.createLead', lang)}
              </h3>
              <button onClick={() => setShowAddLead(false)} className="p-1.5 min-touch rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateLeadManual} className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.fullName', lang)}</label>
                <input type="text" value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Zain Malik" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.phone', lang)}</label>
                <input type="text" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} placeholder="+92 300 1234567" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.email', lang)}</label>
                <input type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} placeholder="sharma@example.com" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.source', lang)}</label>
                <select value={leadSource} onChange={e => setLeadSource(e.target.value)} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none cursor-pointer">
                  <option className="bg-[var(--bg-surface)]">36 Acre Campaign</option>
                  <option className="bg-[var(--bg-surface)]">MagicBricks</option>
                  <option className="bg-[var(--bg-surface)]">Housing.com</option>
                  <option className="bg-[var(--bg-surface)]">Facebook Promo</option>
                  <option className="bg-[var(--bg-surface)]">Referral</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.propertyType', lang)}</label>
                <select value={leadProp} onChange={e => setLeadProp(e.target.value)} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none cursor-pointer">
                  <option className="bg-[var(--bg-surface)]">{getLocalizedPropertyType('Apartment', propScheme, lang)}</option>
                  <option className="bg-[var(--bg-surface)]">{getLocalizedPropertyType('Villa', propScheme, lang)}</option>
                  <option className="bg-[var(--bg-surface)]">{getLocalizedPropertyType('Plot', propScheme, lang)}</option>
                  <option className="bg-[var(--bg-surface)]">{getLocalizedPropertyType('Commercial', propScheme, lang)}</option>
                  <option className="bg-[var(--bg-surface)]">{getLocalizedPropertyType('Rental', propScheme, lang)}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.location', lang)}</label>
                <input type="text" value={leadLocation} onChange={e => setLeadLocation(e.target.value)} placeholder="DHA Phase 6, Lahore" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.budgetMax', lang)} ({currency})</label>
                <input type="number" value={leadBudgetMax} onChange={e => setLeadBudgetMax(e.target.value)} placeholder="e.g. 7500000" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.temperature', lang)}</label>
                <select value={leadTemp} onChange={e => setLeadTemp(e.target.value)} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2.5 rounded-lg text-xs focus:outline-none cursor-pointer">
                  <option className="bg-[var(--bg-surface)]">🔥 {t('temp.Hot', lang)}</option>
                  <option className="bg-[var(--bg-surface)]">⚡ {t('temp.Warm', lang)}</option>
                  <option className="bg-[var(--bg-surface)]">❄️ {t('temp.Cold', lang)}</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('field.notes', lang)}</label>
                <textarea value={leadNotes} onChange={e => setLeadNotes(e.target.value)} placeholder="Prefers high floor, modular developer kitchens..." rows={2} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} className="w-full p-2 rounded-lg text-xs resize-none focus:outline-none" />
              </div>
              <button id="submit-add-lead-btn" type="submit" className="col-span-2 min-touch font-bold py-2.5 rounded-xl text-center transition text-xs" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                Confirm Add & Allocate Agent
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. GLOBAL AI CO-PILOT FLOATING BUTTON */}
      <button
        id="global-ai-copilot-bubble"
        onClick={() => setShowAiCopilot(true)}
        className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 font-black text-xs cursor-pointer min-touch px-4 py-3 rounded-2xl shadow-2xl active:scale-95 transition-transform"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--color-accent)' }}
      >
        <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
        <span className="font-bold text-[11px]">AI Co-Pilot</span>
      </button>

      {/* 7. AI CO-PILOT CHAT MODAL */}
      {showAiCopilot && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn" id="ai-copter-modal-overlay" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-t-2xl sm:rounded-2xl p-4 w-full sm:max-w-md flex flex-col h-[85dvh] sm:max-h-[600px]" id="ai-copter-layout-sheet" style={{ background: 'var(--bg-surface)' }}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 shrink-0" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <h3 className="font-bold text-xs tracking-wider" style={{ color: 'var(--text-primary)' }}>AI Co-Pilot</h3>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Gemini 3.5 Flash</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAiCopilot(false)} 
                className="min-touch rounded-lg" style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* AI Disclosure */}
            <AiDisclosure className="mt-2 mb-1 shrink-0" isDarkTheme={true} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }} />

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs" style={{ scrollbarWidth: 'thin' }}>
              {copilotMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'} max-w-[88%] ${msg.sender === 'agent' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div className="p-3 rounded-2xl leading-relaxed" style={{
                    background: msg.sender === 'agent' ? 'var(--color-accent)' : 'var(--bg-card)',
                    color: msg.sender === 'agent' ? '#fff' : 'var(--text-primary)',
                    border: msg.sender === 'agent' ? 'none' : '1px solid var(--border-light)',
                    borderRadius: msg.sender === 'agent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                  }}>
                    {msg.text}
                    {msg.action && msg.action !== 'UNRECOGNIZED' && (
                      <div className="mt-1.5 flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg w-fit" style={{ background: 'var(--border-light)', color: 'var(--color-accent)' }}>
                        <Check size={10} /> {msg.action}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {copilotLoading && (
                <div className="flex items-center gap-2 text-[11px] font-bold p-3 rounded-2xl border border-dashed max-w-[70%]" style={{ color: 'var(--color-accent)', background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                  AI agent incorporating request...
                </div>
              )}
            </div>

            {/* Suggestion Shortcuts */}
            <div className="space-y-1 mt-1 shrink-0 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
              <span className="text-[9px] uppercase font-bold tracking-widest block pl-1" style={{ color: 'var(--text-muted)' }}>Shortcuts:</span>
              <div className="flex gap-1 overflow-x-auto py-0.5 no-scrollbar">
                {[
                  { label: '+ Add Lead Zain', cmd: 'Add quick hot lead Zain Malik, phone +923001234567' },
                  { label: '+ Visit tomorrow', cmd: 'Schedule site visit with Sarah Jenkins tomorrow afternoon' },
                  { label: '+ Note Tariq target', cmd: 'Add a counselor note to Tariq Al-Mansoor confirming sea-view target' },
                ].map(s => (
                  <button key={s.label} onClick={() => handleSendCopilotCommand(s.cmd)} className="min-touch text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 cursor-pointer" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-2 shrink-0" style={{ borderTop: '1px solid var(--border-light)' }}>
              <div className="flex flex-col items-center shrink-0">
                <button 
                  onClick={startSpeechListening}
                  className="min-touch p-2.5 rounded-xl transition cursor-pointer" style={{
                    background: isListening ? '#e11d48' : 'var(--bg-card)',
                    color: isListening ? '#fff' : 'var(--text-secondary)',
                    border: isListening ? 'none' : '1px solid var(--border-light)'
                  }}
                >
                  <Mic size={15} />
                </button>
                <button onClick={() => setCopilotSpeechLang(prev => prev === 'en-US' ? 'ur-PK' : 'en-US')} className="text-[8px] font-bold uppercase mt-1" style={{ color: 'var(--color-accent)' }}>
                  {copilotSpeechLang === 'en-US' ? 'EN' : 'اردو'}
                </button>
              </div>
              <input 
                type="text"
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                value={copilotPrompt}
                onChange={e => setCopilotPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendCopilotCommand(); }}
                className="flex-1 rounded-xl px-3 py-2.5 text-xs focus:outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
              />
              <button 
                onClick={() => handleSendCopilotCommand()}
                disabled={copilotLoading || !copilotPrompt.trim()}
                className="min-touch p-2.5 rounded-xl transition disabled:opacity-50 shrink-0 cursor-pointer" style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <Send size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. LEGAL ACCESSIBLE DOCUMENT OVERLAY MODAL */}
      <LegalModule 
        isOpen={showLegalModal} 
        onClose={() => setShowLegalModal(false)} 
        defaultTab={legalTab} 
      />

      {/* 9. GDPR-COMPLIANT EXPLICIT PRIVACY CONSENT BANNER */}
      <ConsentBanner 
        onOpenPrivacy={() => {
          setLegalTab('privacy');
          setShowLegalModal(true);
        }}
      />
    </div>
    </ClickSpark>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
