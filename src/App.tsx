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
import ClickSpark from './components/ClickSpark';

export default function App() {
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
  const [activeOrgId, setActiveOrgId] = useState<string>('org-estateflow-1');
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
      alert('Your browser does not support Speech Recognition. Please type your query in the input field!');
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
      const response = await fetch('/api/ai/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          userId: currentUser?.id,
          organizationId: activeOrgId // Isolates copilot updates!
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Append copilot response
        setCopilotMessages(prev => [...prev, {
          sender: 'copilot',
          text: result.explanation || "Action matched and incorporated successfully into CRM pipeline.",
          timestamp: new Date(),
          action: result.action
        }]);

        // Refresh all elements
        await refreshCRMData();
      } else {
        const error = await response.json();
        setCopilotMessages(prev => [...prev, {
          sender: 'copilot',
          text: `Oops, I encountered an error: ${error.error || "Please try again."}`,
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

  // Poll database inputs periodically to ensure simulated bridges sync
  useEffect(() => {
    refreshCRMData();
    const interval = setInterval(() => {
      refreshCRMData();
    }, 4500); // 4.5 seconds poll
    return () => clearInterval(interval);
  }, []);

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
      alert('Candidate full name and phone number is required.');
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

      alert('Success: Lead added!');
      
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
      alert(`Error: ${err.message || err}`);
      console.error(err);
    }
  };

  // Lead update action
  const handleUpdateLeadParameters = async (leadId: string, updates: Partial<Lead>) => {
    try {
      await api.updateLead(leadId, updates);
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

  // Manual Twilio bridge command (needs Edge Function)
  const handleManualCallBridge = (leadId: string) => {
    fetch('/api/calls/bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId })
    })
    .then(() => refreshCRMData())
    .catch(e => console.error('Bridge call failed:', e));
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

  if (!isAuthed && !authLoading && authUser) {
    // Auto-login when InsForge auth is ready
    const autoLogin = async () => {
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
      localStorage.setItem('estateflow_is_authed', 'true');
      localStorage.setItem('estateflow_authed_user', JSON.stringify(userProfile));
      refreshCRMData();
    };
    autoLogin();
  }

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
    <ClickSpark sparkColor="#ff5f03" sparkSize={8} sparkRadius={12} sparkCount={6} duration={350}>
    <div className={`min-h-[100dvh] w-full max-w-[100dvw] flex flex-col font-sans overflow-x-hidden relative ${themeClass}`} id="crm-app-shell" data-agency={activeOrg?.id} style={{ '--agency-primary': activeOrg?.primaryColor || '#10B981', '--agency-secondary': activeOrg?.secondaryColor || '#1E293B' } as React.CSSProperties}>
        {/* 1. AXION-STYLE NAVBAR */}
      <nav className="sticky top-0 z-40 w-full max-w-[1440px] mx-auto p-2 sm:p-3">
        <div className="bg-white rounded-full p-[5px] flex items-center justify-between shadow-sm">
          {/* LEFT: Logo + Desktop nav links */}
          <div className="flex items-center gap-6">
            {activeOrg?.logoUrl ? (
              <img src={activeOrg.logoUrl} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0" alt={activeOrg.name} referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold tracking-tight" style={{ fontSize: '10px' }}>{activeOrg?.appName?.substring(0, 2).toUpperCase() || 'EF'}</span>
              </div>
            )}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab('dashboard')} className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300 cursor-pointer">Dashboard</button>
              <button onClick={() => setActiveTab('leads')} className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300 cursor-pointer">Leads</button>
              <button onClick={() => setActiveTab('properties')} className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300 cursor-pointer">Properties</button>
              <button onClick={() => setActiveTab('contacts')} className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300 cursor-pointer">Contacts</button>
              <button onClick={() => setActiveTab('more')} className="text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300 cursor-pointer">More</button>
            </div>
          </div>

          {/* RIGHT: Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* SaaS Toggle */}
            <button onClick={() => setIsSuperAdminMode(prev => !prev)} className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition cursor-pointer ${isSuperAdminMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {isSuperAdminMode ? '👑 Admin' : '🏢 SaaS'}
            </button>

            {/* User select */}
            <select value={currentUser.id} onChange={e => { const t = users.find(u => u.id === e.target.value); if (t) { setCurrentUser(t); alert(`Identity changed to ${t.name}`); } }} className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-1.5 rounded-full focus:outline-none cursor-pointer appearance-none">
              {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
            </select>

            {/* Lang */}
            <select value={lang} onChange={e => handleUpdateLocalization({ languagePreference: e.target.value as LanguageCode })} className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-1.5 rounded-full focus:outline-none cursor-pointer appearance-none">
              <option value="en">EN</option>
              <option value="ur">UR</option>
              <option value="roman-urdu">ROM</option>
            </select>

            {/* Currency */}
            <select value={currency} onChange={e => handleUpdateLocalization({ currencyPreference: e.target.value as CurrencyCode })} className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-1.5 rounded-full focus:outline-none cursor-pointer appearance-none">
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="PKR">PKR</option>
            </select>

            {/* Unit */}
            <button onClick={() => handleUpdateLocalization({ propertyUnitSystem: propScheme === 'global' ? 'regional' : 'global' })} className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 transition">
              {propScheme === 'regional' ? '🌾 Regional' : '🌐 Global'}
            </button>

            {/* Notifications */}
            <button onClick={() => setShowNotifDrawer(true)} className="relative p-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition cursor-pointer">
              <Bell size={14} />
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>

            {/* Sign Out */}
            <button onClick={async () => { await signOut(); setIsAuthed(false); setCurrentUser(null); localStorage.removeItem('estateflow_is_authed'); localStorage.removeItem('estateflow_authed_user'); }} className="text-[11px] font-medium text-gray-500 hover:text-rose-500 px-2 py-1.5 transition cursor-pointer">
              Sign Out
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setShowNotifDrawer(true)} className="relative p-1.5 bg-gray-100 rounded-full text-gray-600 cursor-pointer">
              <Bell size={14} />
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={() => setIsSuperAdminMode(prev => !prev)} className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-1.5 rounded-full cursor-pointer">
              {isSuperAdminMode ? '👑' : '🏢'}
            </button>
            <MobileSlideMenu navLinks={[
              { label: 'Dashboard', href: '#' },
              { label: 'Leads', href: '#' },
              { label: 'Properties', href: '#' },
              { label: 'Contacts', href: '#' },
              { label: 'More', href: '#' },
            ]} />
          </div>
        </div>
      </nav>

      {/* 2. CORE WORKSPACE CONTENT PANEL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 pb-24" id="crm-workspace">
        {activeOrg?.status === 'Suspended' && !isSuperAdminMode ? (
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-rose-100 shadow-xl max-w-lg mx-auto text-center space-y-4 my-10 animate-slideUp" id="agency-suspended-blocker">
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="text-rose-600" size={32} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Workspace Suspended</h2>
            <p className="text-xs text-slate-505 leading-normal">
              Access to this white-label agency platform (<strong>{activeOrg.appName || activeOrg.name}</strong>) has been restricted by the system administrator due to billing issues.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-600 border border-solid border-slate-100 space-y-2">
              <strong className="block text-slate-800 font-bold uppercase tracking-wider text-[10px]">Payment Required:</strong>
              <p>Under the <strong>{activeOrg.subscriptionPlan} Plan</strong>, automatic renewal failed on the registered payment method.</p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                💡 <strong>Tester Tip:</strong> Click the <strong>👑 Super Admin Console</strong> button in the top navigation strip bar, select another agency or toggle London Head Office to active, or adjust this agency's status back to Active.
              </div>
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
                        alert(`Billing Threshold Restriction: ${error.message || 'Check plans limits.'}`);
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
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION STRIP BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40 flex justify-around items-center text-center shadow-lg sm:max-w-md sm:mx-auto sm:border sm:rounded-full sm:bottom-4 sm:shadow-xl" id="bottom-navigation-bar" aria-label="Primary Mobile Navigation">
        <button 
          id="nav-tab-dashboard"
          onClick={() => { setActiveTab('dashboard'); setLeadsFilterRedirect(''); }}
          className={`flex-1 flex flex-col items-center py-1 transition rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${activeTab === 'dashboard' ? 'text-slate-950 scale-105 font-bold' : 'text-slate-650 text-slate-600 hover:text-slate-800'}`}
          aria-label="Navigate to Home Dashboard"
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <Home size={18} aria-hidden="true" />
          <span className="text-[10px] uppercase font-bold mt-1 tracking-tight">{t('nav.home', lang)}</span>
        </button>
 
        <button 
          id="nav-tab-leads"
          onClick={() => { setActiveTab('leads'); setLeadsFilterRedirect(''); }}
          className={`flex-1 flex flex-col items-center py-1 transition rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${activeTab === 'leads' ? 'text-slate-950 scale-105 font-bold' : 'text-slate-650 text-slate-600 hover:text-slate-800'}`}
          aria-label="Navigate to Leads CRM list"
          aria-current={activeTab === 'leads' ? 'page' : undefined}
        >
          <Users size={18} aria-hidden="true" />
          <span className="text-[10px] uppercase font-bold mt-1 tracking-tight font-sans">{t('nav.leads', lang)}</span>
        </button>
 
        <button 
          id="nav-tab-properties"
          onClick={() => { setActiveTab('properties'); setLeadsFilterRedirect(''); }}
          className={`flex-1 flex flex-col items-center py-1 transition rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${activeTab === 'properties' ? 'text-slate-950 scale-105 font-bold' : 'text-slate-650 text-slate-600 hover:text-slate-800'}`}
          aria-label="Navigate to Hot Estates property catalog"
          aria-current={activeTab === 'properties' ? 'page' : undefined}
        >
          <Award size={18} aria-hidden="true" />
          <span className="text-[10px] uppercase font-bold mt-1 tracking-tight">{t('nav.hotEstates', lang)}</span>
        </button>
 
        <button 
          id="nav-tab-followups"
          onClick={() => { setActiveTab('followups'); setLeadsFilterRedirect(''); }}
          className={`flex-1 flex flex-col items-center py-1 transition rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${activeTab === 'followups' ? 'text-slate-950 scale-105 font-bold' : 'text-slate-650 text-slate-600 hover:text-slate-800'}`}
          aria-label="Navigate to Followup schedules planner"
          aria-current={activeTab === 'followups' ? 'page' : undefined}
        >
          <Calendar size={18} aria-hidden="true" />
          <span className="text-[10px] uppercase font-bold mt-1 tracking-tight">{t('nav.schedules', lang)}</span>
        </button>
 
        <button 
          id="nav-tab-contacts"
          onClick={() => { setActiveTab('contacts'); setLeadsFilterRedirect(''); }}
          className={`flex-1 flex flex-col items-center py-1 transition rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${activeTab === 'contacts' ? 'text-slate-950 scale-105 font-bold' : 'text-slate-650 text-slate-600 hover:text-slate-800'}`}
          aria-label="Navigate to WhatsApp conversation contacts tool"
          aria-current={activeTab === 'contacts' ? 'page' : undefined}
        >
          <MessageSquare size={18} className={activeTab === 'contacts' ? 'text-emerald-700' : ''} aria-hidden="true" />
          <span className="text-[10px] uppercase font-bold mt-1 tracking-tight">{t('nav.whatsapp', lang)}</span>
        </button>
 
        <button 
          id="nav-tab-more"
          onClick={() => { setActiveTab('more'); setMoreSubview('attendance'); }}
          className={`flex-1 flex flex-col items-center py-1 transition rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${activeTab === 'more' ? 'text-slate-950 scale-105 font-bold' : 'text-slate-650 text-slate-600 hover:text-slate-800'}`}
          aria-label="Navigate to More tools and settings options"
          aria-current={activeTab === 'more' ? 'page' : undefined}
        >
          <MoreHorizontal size={18} aria-hidden="true" />
          <span className="text-[10px] uppercase font-bold mt-1 tracking-tight">{t('nav.more', lang)}</span>
        </button>
      </nav>

      {/* 4. NOTIFICATION FEED SIDE DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-end" id="notif-drawer-overlay">
          <div className="bg-white max-w-sm w-full h-[100dvh] p-5 flex flex-col shadow-2xl relative" id="notif-drawer">
            <div className="flex justify-between items-center border-b border-solid border-slate-100 pb-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800">Notifications Feed ({notifications.length})</h3>
              <button 
                onClick={() => setShowNotifDrawer(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification Cards list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 rounded-xl border border-solid text-xs text-slate-650 ${n.isRead ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50/40 border-indigo-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-[9px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{n.description}</p>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  Zero notifications received.
                </div>
              )}
            </div>

            <button 
              id="clear-all-notifs-btn"
              onClick={handleClearNotifications}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Mark all notifications read
            </button>
          </div>
        </div>
      )}

      {/* 5. ADD MANUAL LEAD BOTTOM DRAWER OR MODAL */}
      {showAddLead && (
        <div className="fixed inset-0 bg-slate-900/65 z-50 flex items-center justify-center p-4" id="add-lead-modal-overlay">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full max-h-[85dvh] overflow-y-auto space-y-4 shadow-xl border border-slate-100" id="add-lead-form-modal">
            <div className="flex justify-between items-center border-b border-solid border-slate-100 pb-2">
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <Plus size={16} className="text-emerald-500" /> {t('action.createLead', lang)}
              </h3>
              <button onClick={() => setShowAddLead(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateLeadManual} className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.fullName', lang)}</label>
                <input 
                  id="add-lead-name"
                  type="text" 
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  placeholder="Zain Malik"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.phone', lang)}</label>
                <input 
                  id="add-lead-phone"
                  type="text" 
                  value={leadPhone}
                  onChange={e => setLeadPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.email', lang)}</label>
                <input 
                  id="add-lead-email"
                  type="email" 
                  value={leadEmail}
                  onChange={e => setLeadEmail(e.target.value)}
                  placeholder="sharma@example.com"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.source', lang)}</label>
                <select 
                  id="add-lead-source"
                  value={leadSource}
                  onChange={e => setLeadSource(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                >
                  <option value="36 Acre">36 Acre Campaign</option>
                  <option value="MagicBricks">MagicBricks</option>
                  <option value="Housing.com">Housing.com</option>
                  <option value="Facebook Ads">Facebook Promo</option>
                  <option value="Manual Referral">Referral</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.propertyType', lang)}</label>
                <select 
                  id="add-lead-type"
                  value={leadProp}
                  onChange={e => setLeadProp(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                >
                  <option value="Apartment">{getLocalizedPropertyType('Apartment', propScheme, lang)}</option>
                  <option value="Villa">{getLocalizedPropertyType('Villa', propScheme, lang)}</option>
                  <option value="Plot">{getLocalizedPropertyType('Plot', propScheme, lang)}</option>
                  <option value="Commercial">{getLocalizedPropertyType('Commercial', propScheme, lang)}</option>
                  <option value="Rental">{getLocalizedPropertyType('Rental', propScheme, lang)}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.location', lang)}</label>
                <input 
                  id="add-lead-location"
                  type="text" 
                  value={leadLocation}
                  onChange={e => setLeadLocation(e.target.value)}
                  placeholder="DHA Phase 6, Lahore, Pakistan"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.budgetMax', lang)} ({currency})</label>
                <input 
                  id="add-lead-budget-max"
                  type="number" 
                  value={leadBudgetMax}
                  onChange={e => setLeadBudgetMax(e.target.value)}
                  placeholder="e.g. 7500000"
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">{t('field.temperature', lang)}</label>
                <select 
                  id="add-lead-temp"
                  value={leadTemp}
                  onChange={e => setLeadTemp(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                >
                  <option value="Hot">🔥 {t('temp.Hot', lang)}</option>
                  <option value="Warm">⚡ {t('temp.Warm', lang)}</option>
                  <option value="Cold">❄️ {t('temp.Cold', lang)}</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-600">{t('field.notes', lang)}</label>
                <textarea 
                  id="add-lead-notes"
                  value={leadNotes}
                  onChange={e => setLeadNotes(e.target.value)}
                  placeholder="Prefers high floor, modular developer kitchens..."
                  rows={2}
                  className="w-full bg-slate-50 border p-1 rounded-lg shrink-0 text-xs resize-none"
                />
              </div>

              <button 
                id="submit-add-lead-btn"
                type="submit"
                className="col-span-2 mt-2 bg-slate-905 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-center shadow-md transition"
              >
                Confirm Add & Allocate Agent
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. GLOBAL AI CO-PILOT FLOATING ACTION ACTION BUBBLE */}
      <button
        id="global-ai-copilot-bubble"
        onClick={() => setShowAiCopilot(true)}
        className="fixed bottom-22 right-4 sm:bottom-6 sm:right-6 bg-slate-950 border border-emerald-500/20 text-emerald-400 hover:text-white px-4 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 z-40 flex items-center gap-2 font-black text-xs cursor-pointer group hover:bg-slate-900 hover:shadow-emerald-500/10 hover:shadow-2xl hover:scale-105 active:scale-95"
      >
        <Sparkles size={16} className="animate-pulse text-emerald-400" style={{ animationDuration: '3s' }} />
        <span className="font-bold text-[11px] text-emerald-400 group-hover:text-white transition-colors">
          AI Co-Pilot
        </span>
      </button>

      {/* 7. INTRODUCED AI CO-PILOT CHATBOT SYSTEM DIALOG MODAL */}
      {showAiCopilot && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" id="ai-copter-modal-overlay">
          <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 max-w-md w-full flex flex-col h-[520px] max-h-[85dvh] shadow-2xl border border-emerald-900/30 animate-scaleIn" id="ai-copter-layout-sheet">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-solid border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-white leading-none">CRM AI Co-Pilot</h3>
                  <span className="text-[9px] text-slate-400">Powered by Gemini 3.5 Flash</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAiCopilot(false)} 
                className="text-slate-400 hover:text-slate-200 transition p-1 rounded-lg hover:bg-slate-850"
              >
                <X size={16} />
              </button>
            </div>

            {/* AI Unobtrusive Disclosure Banner */}
            <AiDisclosure className="mt-2.5 mb-1 bg-slate-900/60 border-slate-850 shrink-0" isDarkTheme={true} />

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs" style={{ scrollbarWidth: 'thin' }}>
              {copilotMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'} max-w-[88%] ${msg.sender === 'agent' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div className={`p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'agent' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}

                    {/* Integrated Action Pillar Badges */}
                    {msg.action && msg.action !== 'UNRECOGNIZED' && (
                      <div className="mt-2 flex items-center gap-1.5 select-none font-bold text-[9px] uppercase tracking-wider bg-emerald-950/80 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-lg w-fit">
                        <Check size={11} /> Successfully Integrated: {msg.action}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-500 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {copilotLoading && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold bg-slate-900/40 p-3 rounded-2xl border border-dashed border-slate-800 max-w-[70%] select-none">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                  AI agent incorporating request...
                </div>
              )}
            </div>

            {/* Micro Quick Suggestion Tabs */}
            <div className="space-y-1 mt-1 border-t border-slate-850 pt-2 pb-1.5">
              <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest block pl-1">Suggestion Shortcuts:</span>
              <div className="flex gap-1 overflow-x-auto py-0.5" style={{ scrollbarWidth: 'none' }}>
                <button 
                  onClick={() => handleSendCopilotCommand('Add quick hot lead Zain Malik, phone +923001234567')}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-800 transition shrink-0 cursor-pointer"
                >
                  + Add Lead Zain
                </button>
                <button 
                  onClick={() => handleSendCopilotCommand('Schedule site visit with Sarah Jenkins tomorrow afternoon')}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-800 transition shrink-0 cursor-pointer"
                >
                  + Visit tomorrow
                </button>
                <button 
                  onClick={() => handleSendCopilotCommand('Add a counselor note to Tariq Al-Mansoor confirming sea-view target')}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-800 transition shrink-0 cursor-pointer"
                >
                  + Note Tariq target
                </button>
              </div>
            </div>

            {/* Input Action Panel Form */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
              <div className="flex flex-col items-center shrink-0">
                <button 
                  onClick={startSpeechListening}
                  className={`p-2.5 rounded-xl transition cursor-pointer ${
                    isListening 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title={isListening ? "Listening... Click to stop" : "Talk to AI Chatbot (Voice Activation)"}
                >
                  <Mic size={15} className={isListening ? 'animate-bounce' : ''} />
                </button>
                <button 
                  onClick={() => setCopilotSpeechLang(prev => prev === 'en-US' ? 'ur-PK' : 'en-US')}
                  className="text-[8px] font-black uppercase text-emerald-400 mt-1 hover:text-emerald-300 transition select-none"
                  title="Toggle voice language: English (en-US) / Urdu (ur-PK)"
                >
                  {copilotSpeechLang === 'en-US' ? 'EN' : 'اردو'}
                </button>
              </div>
              
              <input 
                id="ai-copilot-text-input"
                type="text"
                placeholder={isListening ? `Listening (${copilotSpeechLang === 'en-US' ? 'English' : 'Urdu'})...` : "Speak in English/Urdu or type..."}
                value={copilotPrompt}
                onChange={e => setCopilotPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSendCopilotCommand();
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              
              <button 
                onClick={() => handleSendCopilotCommand()}
                disabled={copilotLoading || !copilotPrompt.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-2.5 rounded-xl transition duration-150 disabled:opacity-50 disabled:hover:bg-emerald-500 shrink-0 cursor-pointer"
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
