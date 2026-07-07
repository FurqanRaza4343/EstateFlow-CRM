import { useState } from 'react';
import { Clock, Menu, X } from 'lucide-react';
import useLondonTime from '../hooks/useLondonTime';
import TextRollButton from './TextRollButton';

interface MobileSlideMenuProps {
  navLinks: { label: string; href: string }[];
}

export default function MobileSlideMenu({ navLinks }: MobileSlideMenuProps) {
  const [open, setOpen] = useState(false);
  const londonTime = useLondonTime();

  return (
    <>
      <button onClick={() => setOpen(!open)} className="md:hidden bg-gray-900 rounded-full p-2 text-white cursor-pointer">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      <div className={`fixed inset-0 z-50 md:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-2xl mx-3 mb-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="p-5 space-y-6">
            <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
              <Clock size={14} />
              <span>{londonTime} in London</span>
            </div>
            <div className="space-y-4">
              {navLinks.map(link => (
                <a key={link.href} href={link.href} className="block text-[28px] font-medium text-gray-900" style={{ lineHeight: '32px' }}>{link.label}</a>
              ))}
            </div>
            <TextRollButton text="Start a project" />
          </div>
        </div>
      </div>
    </>
  );
}
