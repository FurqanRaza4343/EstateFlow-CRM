import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Import, Loader2, MapPin, User, Phone, Star, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import insforge from '../lib/insforge';
import GradientAvatar from './GradientAvatar';
import SpecularButton from './SpecularButton';

interface ScrapedLead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  source: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocation: string;
  status: string;
  temperature: string;
  assignedAgentId: string;
  notes: string;
  rating?: number | null;
  reviews?: number | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface LeadScoutProps {
  organizationId: string;
  agents: { id: string; name: string }[];
  onImportLeads: (leads: ScrapedLead[]) => Promise<void>;
}

export default function LeadScout({ organizationId, agents, onImportLeads }: LeadScoutProps) {
  const [query, setQuery] = useState('real estate agents');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [scraping, setScraping] = useState(false);
  const [results, setResults] = useState<ScrapedLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [assignedAgent, setAssignedAgent] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScrape = async () => {
    if (!query.trim()) return;
    setScraping(true);
    setError(null);
    setResults([]);
    setImportSuccess(null);

    try {
      const { data, error: fnError } = await insforge.functions.invoke('scrape-leads', {
        method: 'POST',
        body: { query: query.trim(), location: location.trim(), maxResults },
      });

      if (fnError) throw new Error(fnError.message || 'Scraping failed');
      if (data?.error) throw new Error(data.error);
      if (!data?.leads?.length) {
        setError('No leads found. Try a different search term or location.');
        return;
      }

      setResults(data.leads);
      setSelectedIds(new Set(data.leads.map(l => l.id)));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      setError(err.message || 'Scraping failed. Please try again.');
    } finally {
      setScraping(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(l => l.id)));
    }
  };

  const downloadCSV = () => {
    const selected = results.filter(l => selectedIds.has(l.id));
    if (!selected.length) return;

    const headers = ['Name', 'Phone', 'Email', 'Location', 'Rating', 'Reviews', 'Website', 'Notes'];
    const rows = selected.map(l => [
      l.fullName, l.phone, l.email, l.preferredLocation,
      l.rating?.toString() || '', l.reviews?.toString() || '',
      l.website || '', l.notes
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const selected = results.filter(l => selectedIds.has(l.id));
    if (!selected.length) return;
    setImporting(true);
    setError(null);
    try {
      const enhanced = selected.map(l => ({
        ...l,
        assignedAgentId: assignedAgent,
      }));
      await onImportLeads(enhanced);
      setImportSuccess(`${selected.length} lead(s) imported successfully!`);
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Search size={16} style={{ color: 'var(--color-accent)' }} />
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Lead Scout</h3>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--color-accent)' }}>
          Apify
        </span>
      </div>

      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Search Query</label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. real estate agents, property dealers"
              className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Dubai, Karachi"
              className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Max Leads:</span>
          {[5, 10, 15, 20].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setMaxResults(n)}
              className="btn-enhance px-3 py-1.5 rounded-lg text-[10px] font-bold transition"
              style={{
                background: maxResults === n ? 'var(--color-accent)' : 'var(--bg-surface)',
                color: maxResults === n ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <SpecularButton
          size="md"
          fullWidth
          disabled={scraping || !query.trim()}
          onClick={handleScrape}
          baseColor="#3B82F6"
          lineColor="#ffffff"
          intensity={1.2}
          followMouse={true}
          proximity={200}
        >
          {scraping ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Scraping...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Search size={14} />
              Find Leads
            </span>
          )}
        </SpecularButton>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl flex items-center gap-2 text-xs font-medium"
          style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)' }}
        >
          <AlertTriangle size={14} />
          {error}
        </motion.div>
      )}

      {importSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl flex items-center gap-2 text-xs font-medium"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <CheckCircle size={14} />
          {importSuccess}
        </motion.div>
      )}

      {results.length > 0 && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-5 space-y-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {results.length} Leads Found
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                ({selectedIds.size} selected)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="btn-enhance px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
              >
                {selectedIds.size === results.length ? 'Deselect All' : 'Select All'}
              </button>
              <SpecularButton
                size="sm"
                disabled={selectedIds.size === 0}
                onClick={downloadCSV}
                baseColor="#10B981"
                lineColor="#ffffff"
                intensity={1}
                followMouse={true}
                proximity={150}
              >
                <Download size={12} />
                CSV
              </SpecularButton>
              <SpecularButton
                size="sm"
                disabled={selectedIds.size === 0 || importing}
                onClick={handleImport}
                baseColor="#3B82F6"
                lineColor="#ffffff"
                intensity={1}
                followMouse={true}
                proximity={150}
              >
                {importing ? <Loader2 size={12} className="animate-spin" /> : <Import size={12} />}
                {importing ? 'Importing...' : 'Import'}
              </SpecularButton>
            </div>
          </div>

          {agents.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Assign to:</span>
              <select
                value={assignedAgent}
                onChange={e => setAssignedAgent(e.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-[10px] outline-none"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
              >
                <option value="">Unassigned</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition"
                style={{
                  background: selectedIds.has(lead.id) ? 'rgba(59,130,246,0.08)' : 'var(--bg-surface)',
                  border: selectedIds.has(lead.id) ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-light)',
                }}
                onClick={() => toggleSelect(lead.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(lead.id)}
                  onChange={() => toggleSelect(lead.id)}
                  className="mt-1 shrink-0"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <GradientAvatar name={lead.fullName} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {lead.fullName}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {lead.phone && (
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Phone size={10} /> {lead.phone}
                      </span>
                    )}
                    {lead.preferredLocation && (
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <MapPin size={10} /> {lead.preferredLocation}
                      </span>
                    )}
                    {lead.rating && (
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-gold)' }}>
                        <Star size={10} /> {lead.rating} ({lead.reviews || 0})
                      </span>
                    )}
                    {lead.website && (
                      <span className="text-[10px] flex items-center gap-1 truncate max-w-[150px]" style={{ color: 'var(--color-accent)' }}>
                        <Globe size={10} /> {lead.website}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
