/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ConsentBannerProps {
  onOpenPrivacy: () => void;
}

export default function ConsentBanner({ onOpenPrivacy }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // GDPR-compliant checkboxes: NONE can be pre-checked
  const [consentAnalytics, setConsentAnalytics] = useState(false);
  const [consentOperational, setConsentOperational] = useState(false);

  // Policy version control (GDPR requirement: bump version to clear old consent on update)
  const CONSENT_VERSION = 'estate_flow_consent_v1';

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(CONSENT_VERSION);
      if (!storedConsent) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage is blocked or unavailable in this container wrapper.', e);
    }
  }, []);

  const handleDeclineAll = () => {
    const preferences = {
      essential: true,
      analytics: false,
      operational: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    try {
      localStorage.setItem(CONSENT_VERSION, JSON.stringify(preferences));
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const preferences = {
      essential: true,
      analytics: consentAnalytics,
      operational: consentOperational,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    try {
      localStorage.setItem(CONSENT_VERSION, JSON.stringify(preferences));
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const preferences = {
      essential: true,
      analytics: true,
      operational: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    try {
      localStorage.setItem(CONSENT_VERSION, JSON.stringify(preferences));
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[120] p-4 bg-slate-900 border-t border-slate-800 text-slate-150 animate-slideUp select-none shadow-2xl flex flex-col items-center justify-center"
      id="gdpr-consent-toast-panel"
      role="complementary"
      aria-label="Privacy and cookies consent banner"
    >
      <div className="w-full max-w-2xl bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
        
        {/* Banner Top Info Header */}
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck size={20} className="animate-pulse" />
          </div>
          <div className="flex-1 space-y-1 text-left">
            <h3 className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              Strict GDPR Privacy Consent
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              We value absolute business data sovereignty. We utilize standard browser cookies and data indexers to ensure safe routing and premium performance. Explore how we utilize these registries by reviewing our online <button onClick={onOpenPrivacy} className="text-indigo-400 hover:underline font-bold inline hover:text-indigo-300">Privacy Policy</button>.
            </p>
          </div>
        </div>

        {/* Detailed choices (Accordion toggle for GDPR absolute granularity) */}
        {showDetails ? (
          <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/60 text-[10px] space-y-3 animate-fadeIn" id="consent-details">
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
              <div className="text-left pr-4">
                <span className="font-bold text-slate-200 block">1. Essential Infrastructure State (Permanent)</span>
                <span className="text-slate-350 block mt-0.5">Required to preserve session logins, multi-tenant workspace choices, and active plan parameters. Cannot be opted-out.</span>
              </div>
              <span className="bg-slate-800 text-slate-300 font-extrabold uppercase px-1.5 py-0.5 rounded text-[8px] tracking-wider select-none pr-1">
                Required
              </span>
            </div>

            <div 
              className="flex items-start justify-between border-b border-slate-800/80 pb-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1" 
              onClick={() => setConsentAnalytics(!consentAnalytics)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setConsentAnalytics(!consentAnalytics);
                }
              }}
              tabIndex={0}
              role="checkbox"
              aria-checked={consentAnalytics}
              aria-label="Enable cookies option: Performance and analytical indexing"
            >
              <div className="text-left pr-4">
                <span className="font-bold text-slate-200 block">2. Performance & Analytical Indexing (Optional)</span>
                <span className="text-slate-350 block mt-0.5 font-medium">Allows our systems to log task latency metrics to prevent service bottlenecks. No real-personal identities are stored.</span>
              </div>
              <div className="flex items-center pt-1" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  id="consent-analytics" 
                  checked={consentAnalytics} 
                  onChange={(e) => setConsentAnalytics(e.target.checked)}
                  tabIndex={-1}
                  className="w-4 h-4 rounded border-slate-750 bg-slate-950 text-indigo-500 cursor-pointer h-5 w-5 focus:ring-0"
                  aria-label="Toggle cookie choice for Performance and Analytics tracking"
                />
              </div>
            </div>

            <div 
              className="flex items-start justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1" 
              onClick={() => setConsentOperational(!consentOperational)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setConsentOperational(!consentOperational);
                }
              }}
              tabIndex={0}
              role="checkbox"
              aria-checked={consentOperational}
              aria-label="Enable cookies option: Personalization and agency branding"
            >
              <div className="text-left pr-4">
                <span className="font-bold text-slate-200 block">3. Personalization & Agency Branding (Optional)</span>
                <span className="text-slate-350 block mt-0.5 font-medium flex-wrap">Remembers selected customizable CSS primary color indicators, corporate white-label banners, and active font choices.</span>
              </div>
              <div className="flex items-center pt-1" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  id="consent-operational" 
                  checked={consentOperational} 
                  onChange={(e) => setConsentOperational(e.target.checked)}
                  tabIndex={-1}
                  className="w-4 h-4 rounded border-slate-750 bg-slate-950 text-indigo-500 cursor-pointer h-5 w-5 focus:ring-0"
                  aria-label="Toggle cookie choice for Personalization and agency white-label styling"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Controls for Selection / Quick Decline / Accept All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] select-none pt-1" id="consent-actions-row">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] text-slate-300 font-extrabold hover:text-white transition flex items-center gap-1 py-1 px-2.5 rounded-lg border border-slate-800 bg-slate-900/40 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Customize granularity of cookie permissions"
            style={{ touchAction: 'manipulation' }}
          >
            <Info size={12} className="text-slate-300" aria-hidden="true" />
            {showDetails ? 'Collapse Specific Settings' : 'Customize Permissions Granularity'}
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDeclineAll}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl transition text-center shrink-0 cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-slate-700"
              aria-label="Decline all performance, personalization, and marketing cookies"
              style={{ touchAction: 'manipulation' }}
            >
              Decline All
            </button>
            {showDetails ? (
              <button 
                onClick={handleAcceptSelected}
                className="bg-indigo-650 hover:bg-indigo-600 font-black text-white py-2.5 px-4 rounded-xl transition text-center shrink-0 cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Accept only your manually selected cookie capabilities"
                style={{ touchAction: 'manipulation' }}
              >
                Accept Selection
              </button>
            ) : (
              <button 
                onClick={handleAcceptAll}
                className="bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white py-2.5 px-6.5 rounded-xl transition text-center shrink-0 cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Accept all essential and optional analytics cookies under GDPR"
                style={{ touchAction: 'manipulation' }}
              >
                Accept All (SaaS Flow)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
