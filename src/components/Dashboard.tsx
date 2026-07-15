/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { motion } from 'motion/react';
import { Lead, Activity as CRMActivity, DashboardStats, UserProfile } from '../types';
import SkeletonLoader from './SkeletonLoader';
import TiltCard from './TiltCard';
import GradientAvatar from './GradientAvatar';
import SpecularButton from './SpecularButton';
import { useCountUp } from '../hooks/useCountUp';
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

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const newLeadsDisplay = useCountUp(stats.newLeadsToday);
  const followupsDisplay = useCountUp(stats.followupsDueToday);
  const hotLeadsDisplay = useCountUp(stats.hotLeadsCount);
  const presentAgentsDisplay = useCountUp(stats.presentAgentsCount);

  useEffect(() => {
    if (stats.newLeadsToday > 0 || stats.hotLeadsCount > 0 || stats.followupsDueToday > 0 || stats.presentAgentsCount > 0) {
      setIsFirstLoad(false);
    }
  }, [stats]);

  useEffect(() => {
    const timer = setTimeout(() => setIsFirstLoad(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const prefersReduced = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : true;

  return (
    <div className="space-y-6" id="dashboard-module">
      {/* Personalized Greeting banner */}
      <div className="rounded-2xl p-5 relative overflow-hidden hero-animated-gradient" id="dashboard-hero" style={{ color: 'var(--text-primary)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)', transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-6 translate-x-6">
          <TrendingUp size={200} aria-hidden="true" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <GradientAvatar name={currentUser.name} size={48} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: 'var(--color-accent)', background: 'var(--border-light)' }}>
                EstateFlow CRM
              </span>
              <h1 className="text-lg sm:text-xl font-black mt-3 tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                {greeting()}, {currentUser.name}!
              </h1>
              <p className="text-xs mt-1 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Role: <strong style={{ color: 'var(--color-accent)' }}>{currentUser.role}</strong>
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <SpecularButton
              size="md"
              onClick={onOpenAddLead}
              baseColor="#3B82F6"
              lineColor="#ffffff"
              intensity={1.2}
              followMouse={true}
              proximity={200}
            >
              <Plus size={14} /> {t('action.createLead', lang)}
            </SpecularButton>
            <SpecularButton
              size="md"
              onClick={() => onNavigate('more', 'attendance')}
              baseColor="#64748B"
              lineColor="#ffffff"
              intensity={1}
              followMouse={true}
              proximity={200}
            >
              <MapPin size={14} /> Attendance Login
            </SpecularButton>
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
        className="p-4 rounded-2xl border relative overflow-hidden cursor-pointer transition active:scale-[0.98] focus:outline-none"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-light)' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 w-fit" style={{ color: 'var(--color-accent)', background: 'var(--border-light)' }}>
              <Sparkles size={11} /> AI Co-Pilot
            </span>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Voice & Text CRM Assistant</h3>
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Tell the AI to create leads, schedule visits, draft notes, or manage tasks using voice or text.
            </p>
          </div>
          <button 
            className="min-touch px-4 py-2 rounded-xl font-bold text-xs shrink-0"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Launch Co-Pilot
          </button>
        </div>
      </div>

      {/* Metric Cards Bento Grid */}
      {isFirstLoad ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SkeletonLoader height="120px" />
          <SkeletonLoader height="120px" />
          <SkeletonLoader height="120px" />
          <SkeletonLoader height="120px" />
        </div>
      ) : (
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        id="dashboard-metrics"
        initial="hidden"
        animate="visible"
        variants={prefersReduced ? {} : {
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } }
        }}
      >
        <TiltCard>
        <motion.div
          variants={prefersReduced ? {} : {
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.25 }}
          onClick={() => onNavigate('leads', 'New')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('leads', 'New');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${newLeadsDisplay} new leads registered today`}
          className="bg-card p-4 rounded-2xl border border-default hover:border-default hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t('dash.leadsToday', lang)}</span>
            <span className="p-1.5 rounded-lg" style={{ background: 'var(--border-light)', color: 'var(--color-emerald)' }} aria-hidden="true">
              <Plus size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{newLeadsDisplay}</span>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: 'var(--text-muted)' }}>Auto-assigned</span>
          </div>
        </motion.div>
        </TiltCard>

        <TiltCard>
        <motion.div
          variants={prefersReduced ? {} : {
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.25 }}
          onClick={() => onNavigate('followups')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('followups');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${followupsDisplay} followups due today`}
          className="bg-card p-4 rounded-2xl border border-default hover:border-default hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t('dash.followupsDue', lang)}</span>
            <span className="p-1.5 rounded-lg" style={{ background: 'var(--border-light)', color: 'var(--color-accent)' }} aria-hidden="true">
              <Clock size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{followupsDisplay}</span>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: 'var(--text-muted)' }}>Pending action</span>
          </div>
        </motion.div>
        </TiltCard>

        <TiltCard>
        <motion.div
          variants={prefersReduced ? {} : {
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.25 }}
          onClick={() => onNavigate('leads', 'Hot')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('leads', 'Hot');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${hotLeadsDisplay} hot high temperature leads`}
          className="bg-card p-4 rounded-2xl border border-default hover:border-default hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t('dash.hotLeads', lang)}</span>
            <span className="p-1.5 rounded-lg animate-pulse" style={{ background: 'var(--border-light)', color: 'var(--color-gold)' }} aria-hidden="true">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{hotLeadsDisplay}</span>
            <span className="text-[10px] block mt-0.5" style={{ color: 'var(--color-gold)' }}>High conversion</span>
          </div>
        </motion.div>
        </TiltCard>

        <TiltCard>
        <motion.div
          variants={prefersReduced ? {} : {
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.25 }}
          onClick={() => onNavigate('more', 'attendance')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('more', 'attendance');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${presentAgentsDisplay} active staff members in the field`}
          className="bg-card p-4 rounded-2xl border border-default hover:border-default hover:shadow-md transition cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t('dash.activeAgents', lang)}</span>
            <span className="p-1.5 rounded-lg" style={{ background: 'var(--border-light)', color: 'var(--color-accent)' }} aria-hidden="true">
              <Users size={16} />
            </span>
          </div>
          <div className="mt-3 text-left">
            <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{presentAgentsDisplay}</span>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: 'var(--text-muted)' }}>Currently in field</span>
          </div>
        </motion.div>
        </TiltCard>
      </motion.div>
      )}

      {/* Secondary Quick Overview Bento bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Inventory & Visits */}
        <div className="bg-card p-4 rounded-2xl border border-default shadow-xs space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-1.5 select-none" style={{ color: 'var(--text-primary)' }}>
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
              className="bg-surface hover:bg-surface-alt active:scale-[0.98] p-4 rounded-xl text-center cursor-pointer transition-all duration-150 border border-transparent active:border-default flex flex-col justify-between h-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-xs block font-bold" style={{ color: 'var(--text-secondary)' }}>Available Inventory</span>
              <span className="text-2xl font-extrabold block my-1" style={{ color: 'var(--text-primary)' }}>{stats.availableInventoryCount}</span>
              <span className="text-[10px] font-bold block mt-1 uppercase tracking-wider select-none" style={{ color: 'var(--color-accent)' }}>
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
              className="bg-surface hover:bg-surface-alt active:scale-[0.98] p-4 rounded-xl text-center cursor-pointer transition-all duration-150 border border-transparent active:border-default flex flex-col justify-between h-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-xs block font-bold" style={{ color: 'var(--text-secondary)' }}>Site Visits Scheduled</span>
              <span className="text-2xl font-extrabold block my-1" style={{ color: 'var(--text-primary)' }}>{stats.siteVisitsScheduledCount}</span>
              <span className="text-[10px] font-bold block mt-1 uppercase tracking-wider select-none" style={{ color: 'var(--color-accent)' }}>
                Schedule Log →
              </span>
            </div>
          </div>
        </div>

        {/* Hot Leads Mini Strip List */}
        <div className="bg-card p-4 rounded-2xl border border-default shadow-xs space-y-3">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Sparkles size={16} className="text-amber-500" aria-hidden="true" />
              Hot Leads Awaiting Action
            </h2>
            <button 
              onClick={() => onNavigate('leads', 'Hot')}
              className="text-xs font-bold px-3 py-1.5 -mr-2 rounded-lg hover:bg-surface-alt focus:outline-none focus:ring-1 focus:ring-indigo-500"
              style={{ color: 'var(--color-accent)' }}
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
                className="flex items-center justify-between p-3 rounded-xl active:scale-[0.99] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{ 
                  background: 'rgba(245, 158, 11, 0.08)', 
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(245, 158, 11, 0.2)',
                  touchAction: 'manipulation'
                }}
              >
                <div className="text-left">
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{lead.fullName}</h4>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{lead.preferredLocation} • {lead.propertyType}</p>
                </div>
                <span 
                  className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md select-none shrink-0"
                  style={{ 
                    background: 'rgba(245, 158, 11, 0.2)', 
                    color: 'var(--color-gold)', 
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {lead.status}
                </span>
               </div>
            ))}
            {hotLeads.length === 0 && (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs font-bold">No hot leads right now</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>All clear — take a breather</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent CRM Activities timeline */}
      <div className="bg-card p-5 rounded-2xl border border-default shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <Activity size={16} className="text-emerald-500" />
            Live CRM Activity Feed
          </h2>
          <span className="text-xs uppercase tracking-widest text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
            Realtime Active
          </span>
        </div>

        <div className="relative pl-3 border-l-2 border-default space-y-4" id="activities-timeline">
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
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{act.title}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs mr-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{act.description}</p>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <Activity size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs font-bold">No activity yet</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Activities will appear here as you work</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPLIANCE & ACCESSIBLE FOOTER AREA */}
      <footer 
        id="dashboard-compliance-footer" 
        className="rounded-2xl p-4 text-center space-y-3 transition duration-150 select-none"
        style={{ background: 'var(--bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-light)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-[11px] text-left sm:text-left" style={{ color: 'var(--text-muted)' }}>
            &copy; 2026 Estate Flow CRM. All rights reserved. Registered Agency B2B compliance.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              className="text-[11px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-alt transition cursor-pointer border border-transparent focus:outline-none"
              style={{ color: 'var(--color-accent)', touchAction: 'manipulation' }}
              aria-label="Read our Privacy Policy statement"
            >
              <ShieldCheck size={14} className="text-emerald-600" />
              Privacy Policy
            </button>
            <span className="w-1 h-3 rounded-full" style={{ background: 'var(--border-color)' }} />
            <button
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              className="text-[11px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-alt transition cursor-pointer border border-transparent focus:outline-none"
              style={{ color: 'var(--color-accent)', touchAction: 'manipulation' }}
              aria-label="Read our Terms of Service user agreement"
            >
              <Scale size={14} className="text-amber-500" />
              Terms of Service
            </button>
          </div>
        </div>
        <p className="text-[9px] font-mono tracking-tight text-left sm:text-left leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Datastore Core: Google Firebase Firestore • SaaS Merchant Gateway: Stripe API Secure Integration
        </p>
      </footer>
    </div>
  );
}
