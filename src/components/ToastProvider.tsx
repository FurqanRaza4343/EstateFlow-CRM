/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const COLOR_MAP = {
  success: 'var(--color-emerald)',
  error: '#ef4444',
  info: 'var(--color-accent)',
  warning: 'var(--color-gold)',
};

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const color = COLOR_MAP[toast.type];
  const Icon = ICON_MAP[toast.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-2xl max-w-[320px] w-full"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border-color)`,
        borderLeftWidth: '4px',
        borderLeftColor: color,
      }}
    >
      <div style={{ color }} className="shrink-0 mt-0.5">
        <Icon size={15} />
      </div>
      <p className="text-xs flex-1 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
      <button onClick={onDismiss} className="shrink-0 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
        <X size={13} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => {
      const updated = [...prev, { id, type, message, timestamp: Date.now() }];
      return updated.slice(-3);
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const value: ToastContextValue = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
    warning: (msg) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: '360px', width: 'calc(100vw - 2rem)' }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
