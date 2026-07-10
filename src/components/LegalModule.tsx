/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Scale, 
  Database, 
  Lock, 
  CreditCard, 
  UserCheck, 
  FileText,
  AlertOctagon,
  Trash2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface LegalModuleProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export default function LegalModule({ isOpen, onClose, defaultTab = 'privacy' }: LegalModuleProps) {
  const [activeTab, setActiveTab] = React.useState<'privacy' | 'terms'>(defaultTab);

  // Sync tab with defaultTab prop when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Accessibility: close on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keep body scroll contained if modal is open (WebView optimization)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn" 
      id="legal-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      {/* Container Card */}
      <div 
        className="bg-card rounded-3xl w-full max-w-2xl h-[85dvh] flex flex-col shadow-2xl border border-default overflow-hidden animate-slideUp relative" 
        id="legal-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            {activeTab === 'privacy' ? (
              <ShieldCheck className="text-emerald-400" size={20} />
            ) : (
              <Scale className="text-amber-400" size={20} />
            )}
            <div>
              <h2 id="legal-modal-title" className="text-sm font-extrabold tracking-wide uppercase text-white">
                {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <p className="text-[10px] text-slate-350 font-mono mt-0.5">Last updated: June 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-full p-2 text-slate-300 hover:text-white transition duration-150 cursor-pointer"
            aria-label="Close legal documents"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={16} />
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="bg-surface border-b border-default p-2 flex shrink-0 select-none" id="legal-tabs-wrapper">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'privacy' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-secondary hover:bg-slate-200/50 active:bg-slate-200'
            }`}
            aria-selected={activeTab === 'privacy'}
            role="tab"
            style={{ touchAction: 'manipulation' }}
          >
            <ShieldCheck size={15} />
            Privacy Policy
          </button>
          
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'terms' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-secondary hover:bg-slate-200/50 active:bg-slate-200'
            }`}
            aria-selected={activeTab === 'terms'}
            role="tab"
            style={{ touchAction: 'manipulation' }}
          >
            <Scale size={15} />
            Terms of Service
          </button>
        </div>

        {/* Scrollable Document Area (Optimized high performance WebView container) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-705 text-slate-700 text-xs leading-relaxed text-left" id="legal-document-scroller">
          
          {activeTab === 'privacy' ? (
            /* PRIVACY POLICY CONTENT */
            <article className="space-y-6">
              
              {/* Concept Intro */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex gap-3 text-indigo-950">
                <Lock className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="font-extrabold text-xs text-indigo-900">Your Data Security is Our Absolute Priority</h3>
                  <p className="text-[11px] text-secondary mt-1">
                    At **Estate Flow CRM**, we protect administrative listings and customer interactions using advanced cryptographic measures. This document outlines how we collect, process, and safeguard your data.
                  </p>
                </div>
              </div>

              {/* 1. Data Collection List */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <Database size={15} className="text-secondary" />
                  1. Information We Collect
                </h3>
                <p>We only ingest data essential to delivering high-efficiency real-estate workflows and communication tools. This is limited to:</p>
                <ul className="list-disc pl-4 space-y-2 text-[11px] text-secondary">
                  <li>
                    <strong className="text-slate-800">Account Credentials:</strong> Full name, verified business email, telephone numbers, and secure passwords.
                  </li>
                  <li>
                    <strong className="text-slate-800">Lead Registry Data & Profiles:</strong> Client budgets, preferred property locations, home specs, client temperature scores (Hot/Cold), and active deal records.
                  </li>
                  <li>
                    <strong className="text-slate-800">Property Listings:</strong> Property addresses, pricing catalogs, photographic metadata, interior spacing stats, and listing active statuses.
                  </li>
                  <li>
                    <strong className="text-slate-800">Operational Records:</strong> Interaction times, outbound call-bridge logs, SMS dispatch logs, and system login timelines.
                  </li>
                  <li>
                    <strong className="text-slate-800">Transactions & Billing Info:</strong> Subscription billing details, company seat numbers, and white-label theme settings.
                  </li>
                </ul>
              </section>

              {/* 2. Purpose of Collection */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <FileText size={15} className="text-secondary" />
                  2. Purpose & Use of Collected Information
                </h3>
                <p>All data acquired is utilized strictly for executing core business logistics. We process data to:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-surface p-3 rounded-xl border border-default">
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Optimize CRM Flows</span>
                    <span className="text-[10px] text-slate-500 block">Deliver intelligent sorting of hot leads, fast calendar events tracking, and agent location stats.</span>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-default">
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Maintain Call Logs</span>
                    <span className="text-[10px] text-slate-500 block">Provide quick-dial verification metrics and instant Twilio outbound dispatch queues.</span>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-default">
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Enable Custom Branding</span>
                    <span className="text-[10px] text-slate-500 block">Provide white-label agency panels matching applied corporate background swatches and banners.</span>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-default">
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Prevent System Exploits</span>
                    <span className="text-[10px] text-slate-500 block">Enforce standard seat limits, API utilization thresholds, and detect payment delinquencies.</span>
                  </div>
                </div>
              </section>

              {/* 3. Third-Party Disclosures */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <CreditCard size={15} className="text-secondary" />
                  3. Critical Third-Party Integrations & Datastores
                </h3>
                <p>We do not lease or sell agency customer listings. Information is shared strictly with secure service-level operators to facilitate the platform:</p>
                <div className="space-y-2">
                  <div className="flex gap-2 p-2 bg-surface rounded-xl border border-default">
                    <span className="text-xs font-bold py-1 px-2.5 bg-blue-100 text-blue-800 rounded-lg h-fit">Firebase</span>
                    <p className="text-[10px] text-slate-650 pt-0.5">
                      All structured records, activities timeline, notifications and leads are stored using secured cloud instances of <strong className="text-slate-800">Google Firestore</strong> databases. Backups are encrypted at-rest.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 p-2 bg-surface rounded-xl border border-default">
                    <span className="text-xs font-bold py-1 px-3 bg-purple-100 text-purple-800 rounded-lg h-fit">Stripe</span>
                    <p className="text-[10px] text-slate-650 pt-0.5">
                      SaaS billing subscriptions, invoices, card inputs, and tier upgrades are transmitted directly over HTTPS to <strong className="text-slate-800">Stripe Payments</strong>. No payment keys or CVV info is held locally.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. User Rights */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <UserCheck size={15} className="text-secondary" />
                  4. Your Clear Legal Rights & Purging Rules
                </h3>
                <p>We guarantee full sovereign rights over your real estate business records. At any point, users can:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-start gap-2 p-2 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-100">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-emerald-900 font-bold">Edit & Update Records</strong>
                      <span>Instantly correct inaccurate lead details, phone numbers, active status tiers, and property prices through standard menu boards.</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 bg-rose-50 text-rose-950 rounded-xl border border-rose-100">
                    <Trash2 size={15} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-rose-900 font-bold">Permanent Purge / Delete</strong>
                      <span>Request a permanent wipe of listings, interaction histories, or close the workspace entirely. The action deletes relative Firestore indexes within 14 days.</span>
                    </div>
                  </div>
                </div>
              </section>

            </article>
          ) : (
            /* TERMS OF SERVICE CONTENT */
            <article className="space-y-6">

              {/* Concept Intro */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-950">
                <AlertOctagon className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="font-extrabold text-xs text-amber-900">Important Advisory Notice</h3>
                  <p className="text-[11px] text-secondary mt-1">
                    By creating an active seat, registering listings, or applying styling parameters on this portal (collectively the "Service"), you agree to these legal Terms of Service in full.
                  </p>
                </div>
              </div>

              {/* 1. Liability Disclaimer */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <AlertOctagon size={15} className="text-secondary" />
                  1. absolute Liability Disclaimers ("As-Is" Standard)
                </h3>
                <p className="text-slate-705 leading-relaxed font-medium">
                  The Service is provided under industry benchmark <strong className="text-slate-900">"AS-IS" and "AS-AVAILABLE"</strong> models. Estate Flow CRM explicitly, and to the maximum extent permitted by applicable law, declares that:
                </p>
                <div className="bg-surface border-l-4 border-slate-600 p-3 rounded-r-xl space-y-1.5 font-mono text-[10px] text-slate-500">
                  <p>• OPERATORS ARE NOT liable for lost real-estate agency sales commissions, dropped hot leads, or buyer negotiation failures resulting from software downtime.</p>
                  <p>• TELECOM & outbound call dispatch logs rely on Twilio gateways; call performance delays do not form ground for service-level penalty claims.</p>
                  <p>• REAL ESTATE valuation approximations or catalog analytics calculations do not represent binding investment certifications.</p>
                </div>
              </section>

              {/* 2. Account Termination Rules */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <X size={15} className="text-secondary" />
                  2. Account Terminations & Deactivation Clauses
                </h3>
                <p>We respect the independence of real estate agency networks but require adherence to compliance parameters. These include:</p>
                <ul className="list-disc pl-4 space-y-2 text-[11px] text-secondary text-left">
                  <li>
                    <strong className="text-slate-800">Voluntary Exit:</strong> Agencies can cancel their SaaS billing renewals instantly through the Billing Console. System access continues cleanly until the active invoice period ends.
                  </li>
                  <li>
                    <strong className="text-slate-800">Administrator Suspension:</strong> Platform directors hold complete rights to freeze or permanently terminate active organizations at any moment without prior notice due to:
                    <ol className="list-decimal pl-4.5 pt-1 space-y-1">
                      <li>Spamming phone numbers or SMS dispatch lists with fraudulent broker schemes.</li>
                      <li>Payment delinquencies lasting past the 7-day grace period under the registered subscription tier.</li>
                      <li>Uploading obscene, illegal, or malicious site banners, listing images, or white-label logos.</li>
                    </ol>
                  </li>
                </ul>
              </section>

              {/* 3. User Content Ownership */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                  <UserCheck size={15} className="text-secondary" />
                  3. 100% User Database Ownership & Listing Assets
                </h3>
                <p className="leading-relaxed">
                  We champion data transparency and claim zero intellectual property over the content submitted to your local white-label ecosystem.
                </p>
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                  <HelpCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
                  <div className="text-[11px]">
                    <strong className="block text-blue-900 font-bold mb-0.5">We Only Act as Custodians:</strong>
                    All CRM logs, property records, customized client notes, agent performance lists, and assets uploaded by subscribers belong solely to the registered workspace owner. At no point will Estate Flow CRM lock you out of exporting lead records or using listings information outside the ecosystem.
                  </div>
                </div>
              </section>

            </article>
          )}

        </div>

        {/* Footer actions for compliance confirmation */}
        <footer className="p-4 bg-surface border-t border-default flex items-center justify-between shrink-0 select-none">
          <div className="text-[10px] text-slate-400 font-medium">
            🔒 Fully encrypted B2B portal compliance
          </div>
          <button 
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold py-2 px-5 rounded-xl text-xs transition cursor-pointer"
            style={{ touchAction: 'manipulation' }}
          >
            I Acknowledge
          </button>
        </footer>

      </div>
    </div>
  );
}
