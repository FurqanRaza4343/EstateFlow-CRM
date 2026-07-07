/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AiDisclosureProps {
  className?: string;
  isDarkTheme?: boolean;
}

export default function AiDisclosure({ className = '', isDarkTheme = true }: AiDisclosureProps) {
  return (
    <div 
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] leading-relaxed transition-all select-none border border-solid ${
        isDarkTheme 
          ? 'bg-slate-900/40 border-slate-800/60 text-slate-400' 
          : 'bg-slate-50 border-slate-100 text-slate-600'
      } ${className}`}
      id="ai-content-disclosure-panel"
      role="note"
      aria-label="AI generation notice"
    >
      <AlertCircle 
        size={13} 
        className={isDarkTheme ? 'text-indigo-400 shrink-0' : 'text-indigo-600 shrink-0'} 
        aria-hidden="true" 
      />
      <span className="font-medium">
        This content is AI-generated and should be reviewed by a human for accuracy.
      </span>
    </div>
  );
}
