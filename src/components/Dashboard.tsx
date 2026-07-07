/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Phone, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Home, 
  Users, 
  TrendingUp, 
  Activity,
  Plus,
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { Lead, Activity as CRMActivity, DashboardStats, UserProfile } from '../types';
import { t, formatCurrency, getLocalizedPropertyType, LanguageCode, CurrencyCode, PropertySchemeType } from '../lib/i18n';

interface DashboardProps {
  stats: DashboardStats;
  activities: CRMActivity[];
  currentUser: UserProfile;
  leads: Lead[];
  onNavigate: (tab: string, subview?: string) => void;
  onOpenAddLead: () => void;
  onTriggerAiAssistant: () => void;
  onOpenLegal?: (tab: 'privacy' | 'terms') => void;
  lang?: LanguageCode;
  currency?: CurrencyCode;
  propScheme?: PropertySchemeType;
}

export default function Dashboard({ 
  stats, 
  activities, 
  currentUser, 
  leads,
  onNavigate,
  onOpenAddLead,
  onTriggerAiAssistant,
  onOpenLegal,
  lang = 'en',
  currency = 'USD',
  propScheme = 'global'
}: DashboardProps) {
  
  const hotLeads = leads.filter(l => l.temperature === 'Hot' && l.status !== 'Won' && l.status !== 'Lost');
  const greeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6" id="dashboard-module">
      {/* Personalized Greeting banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden" id="dashboard-hero">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <TrendingUp size={200} aria-hidden="true" />
        </div>
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-450 text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full">
            EstateFlow CRM Live
          </span>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mt-3 tracking-tight text-white leading-tight">
            {greeting()}, {currentUser.name}!
          </h1>
          <p className="text-sm text-slate-200 mt-1 max-w-md">
            Managed role: <strong className="text-emerald-300 font-bold">{currentUser.role}</strong>. Here is your team's real-time productivity overview.
          </p>
          
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button 
              id="quick-add-lead-btn"
              onClick={onOpenAddLead}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 outline-none cursor-pointer"
              aria-label="Add new manual CRM lead"
              style={{ touchAction: 'manipulation' }}
            >
              <Plus size={14} aria-hidden="true" /> {t('action.createLead', lang)}
            </button>
            <button 
              id="quick-attendance-btn"
              onClick={() => onNavigate('more', 'attendance')}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 outline-none cursor-pointer"
              aria-label="Mark attendance register and check-in"
              style={{ touchAction: 'manipulation' }}
            >
              <MapPin size={14} aria-hidden="true" /> Attendance Login
            </button>
          </div>
        </div>
      </div>

      {/* AI command co-pilot dashboard block */}
      <div 
        id="dashboard-ai-pilot-widget"
        onClick={onTriggerAiAssistant}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTriggerAiAssistant();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Launch voice and text CRM AI co-pilot assistant"
        className="bg-slate-950 p-5 rounded-2xl border border-slate-850 shadow-xl relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition duration-150 group focus:outline-none focus:ring-2 focus:ring-emerald-500/80"
      >
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-3 translate-x-3">
          <Sparkles size={110} className="text-emerald-400 animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit select-none">
              <Sparkles size={11} className="animate-spin text-emerald-400" aria-hidden="true" style={{ animationDuration: '3s' }} /> Co-Pilot Automation Active
            </span>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white mt-1.5">Voice & Text CRM Assistant</h3>
            <p className="text-[11px] text-slate-350 leading-normal max-w-2xl text-left">
              Tap here to quickly tell the custom Gemini model to map candidate profiles, write notes, schedule site visit tasks, and draft planner events directly from chat or spoken voice commands.
            </p>
          </div>
          <button 
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl transition font-black text-xs flex items-center gap-1.5 group-hover:scale-105 select-none shrink-0"
            aria-label="Launch voice and text CRM AI co-pilot assistant dialog"
            style={{ touchAction: 'manipulation' }}
          >
            Launch Co-Pilot
          </button>
        </div>
      </div>

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="dashboard-metrics">
        <div 
          onClick={() => onNavigate('leads', 'New')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('leads', 'New');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${stats.newLeadsToday} new leads registered today`}
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-650 text-slate-600 text-xs font-bold">{t('dash.leadsToday', lang)}</span>
            <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg" aria-hidden="true">
              <Plus size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-black text-slate-900">{stats.newLeadsToday}</span>
            <span className="text-[10px] text-slate-550 font-bold block mt-0.5">Auto-assigned</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('followups')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('followups');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${stats.followupsDueToday} followups due today`}
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-650 text-slate-600 text-xs font-bold">{t('dash.followupsDue', lang)}</span>
            <span className="bg-blue-50 text-blue-600 p-1.5 rounded-lg" aria-hidden="true">
              <Clock size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-black text-slate-900">{stats.followupsDueToday}</span>
            <span className="text-[10px] text-slate-550 font-bold block mt-0.5">Pending action</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('leads', 'Hot')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('leads', 'Hot');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${stats.hotLeadsCount} hot high temperature leads`}
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-650 text-slate-600 text-xs font-bold">{t('dash.hotLeads', lang)}</span>
            <span className="bg-amber-50 text-amber-600 p-1.5 rounded-lg animate-pulse" aria-hidden="true">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-bold text-slate-900">{stats.hotLeadsCount}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">High conversion</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('more', 'attendance')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('more', 'attendance');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${stats.presentAgentsCount} active staff members in the field`}
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-650 text-slate-600 text-xs font-bold">{t('dash.activeAgents', lang)}</span>
            <span className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg" aria-hidden="true">
              <Users size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-black text-slate-900">{stats.presentAgentsCount}</span>
            <span className="text-[10px] text-slate-550 font-bold block mt-0.5">Currently in field</span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Overview Bento bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Inventory & Visits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 select-none">
            <Home size={16} className="text-indigo-500" aria-hidden="true" />
            Active Properties Summary
          </h2>
          <div className="grid grid-cols-2 gap-3" id="active-properties-grid">
            <div 
              onClick={() => onNavigate('properties')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate('properties');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View available property inventory: ${stats.availableInventoryCount} available`}
              className="bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200/50 active:scale-[0.98] p-4 rounded-xl text-center cursor-pointer transition-all duration-150 border border-transparent active:border-slate-300 flex flex-col justify-between h-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-xs text-slate-600 block font-bold">Available Inventory</span>
              <span className="text-2xl font-extrabold text-slate-800 block my-1">{stats.availableInventoryCount}</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-1 uppercase tracking-wider select-none">
                View Catalog →
              </span>
            </div>
            
            <div 
              onClick={() => onNavigate('followups')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate('followups');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View scheduled site visits: ${stats.siteVisitsScheduledCount} scheduled`}
              className="bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200/50 active:scale-[0.98] p-4 rounded-xl text-center cursor-pointer transition-all duration-150 border border-transparent active:border-slate-300 flex flex-col justify-between h-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-xs text-slate-600 block font-bold">Site Visits Scheduled</span>
              <span className="text-2xl font-extrabold text-slate-800 block my-1">{stats.siteVisitsScheduledCount}</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-1 uppercase tracking-wider select-none">
                Schedule Log →
              </span>
            </div>
          </div>
        </div>

        {/* Hot Leads Mini Strip List */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" aria-hidden="true" />
              Hot Leads Awaiting Action
            </h2>
            <button 
              onClick={() => onNavigate('leads', 'Hot')}
              className="text-xs text-indigo-600 hover:underline active:text-indigo-800 font-bold px-3 py-1.5 -mr-2 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="See all hot leads"
            >
              See All
            </button>
          </div>
          
          <div className="space-y-2">
            {hotLeads.slice(0, 3).map(lead => (
              <div 
                key={lead.id} 
                onClick={() => onNavigate('leads')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('leads');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Lead ${lead.fullName}, ${lead.preferredLocation} budget details`}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/40 hover:bg-amber-50/70 active:bg-amber-100/50 active:scale-[0.99] border border-amber-100/30 active:border-amber-200/50 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{ touchAction: 'manipulation' }}
              >
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-800">{lead.fullName}</h4>
                  <p className="text-[10px] text-slate-600 font-medium mt-0.5">{lead.preferredLocation} • {lead.propertyType}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md select-none shrink-0 border border-amber-300/40">
                  {lead.status}
                </span>
               </div>
            ))}
            {hotLeads.length === 0 && (
              <div className="text-center py-8 text-slate-550 text-xs italic">
                Zero active Hot Leads today. Excellent performance!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent CRM Activities timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Activity size={16} className="text-emerald-500" />
            Live CRM Activity Feed
          </h2>
          <span className="text-xs text-slate-400 uppercase tracking-widest text-[9px] font-bold">
            Realtime Active
          </span>
        </div>

        <div className="relative pl-3 border-l-2 border-slate-100 space-y-4" id="activities-timeline">
          {activities.slice(0, 6).map((act, index) => (
            <div key={act.id || index} className="relative space-y-1">
              {/* Dot marker */}
              <span className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                act.type === 'Call' ? 'bg-indigo-500' :
                act.type === 'Message' ? 'bg-emerald-500' :
                act.type === 'Assignment' ? 'bg-pink-500' :
                act.type === 'StatusChange' ? 'bg-blue-500' : 'bg-slate-400'
              }`} />
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-800">{act.title}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-500 mr-2 leading-relaxed">{act.description}</p>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent CRM activities logged yet.
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPLIANCE & ACCESSIBLE FOOTER AREA */}
      <footer id="dashboard-compliance-footer" className="bg-slate-100/80 border border-slate-200/40 rounded-2xl p-4 text-center space-y-3 transition duration-150 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-500 font-medium">
          <p className="text-[11px] text-slate-400 text-left sm:text-left">
            &copy; 2026 Estate Flow CRM. All rights reserved. Registered Agency B2B compliance.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 active:text-indigo-900 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 active:bg-slate-200 transition cursor-pointer border border-transparent focus:border-indigo-405 focus:outline-none"
              aria-label="Read our Privacy Policy statement"
              style={{ touchAction: 'manipulation' }}
            >
              <ShieldCheck size={14} className="text-emerald-600" />
              Privacy Policy
            </button>
            <span className="w-1 h-3 bg-slate-200 rounded-full" />
            <button
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 active:text-indigo-900 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 active:bg-slate-200 transition cursor-pointer border border-transparent focus:border-indigo-405 focus:outline-none"
              aria-label="Read our Terms of Service user agreement"
              style={{ touchAction: 'manipulation' }}
            >
              <Scale size={14} className="text-amber-500" />
              Terms of Service
            </button>
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-mono tracking-tight text-left sm:text-left leading-relaxed">
          Datastore Core: Google Firebase Firestore • SaaS Merchant Gateway: Stripe API Secure Integration
        </p>
      </footer>
    </div>
  );
}
