import { useState } from 'react';
import { Clock, Menu, X } from 'lucide-react';
import useLondonTime from '../hooks/useLondonTime';
import TextRollButton from './TextRollButton';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'leads', label: 'Leads' },
  { id: 'properties', label: 'Properties' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'more', label: 'More' },
];

interface MobileSlideMenuProps {
  onNavigate: (tab: string) => void;
}

export default function MobileSlideMenu({ onNavigate }: MobileSlideMenuProps) {
  const [open, setOpen] = useState(false);
  const londonTime = useLondonTime();

  return (
    <>
      <button onClick={() => setOpen(!open)} className="md:hidden bg-gray-900 rounded-full p-2 text-white cursor-pointer">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      <div className={`fixed inset-0 z-50 md:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-card rounded-2xl mx-3 mb-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="p-5 space-y-6">
            <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
              <Clock size={14} />
              <span>{londonTime} in London</span>
            </div>
            <div className="space-y-4">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { onNavigate(tab.id); setOpen(false); }}
                  className="block w-full text-left text-[28px] font-medium text-primary cursor-pointer"
                  style={{ lineHeight: '32px' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <TextRollButton text="Start a project" />
          </div>
        </div>
      </div>
    </>
  );
}
