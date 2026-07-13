import { useState, useEffect } from 'react';
import { Home, Users, Award, MessageSquare, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'leads', icon: Users, label: 'Leads' },
  { id: 'properties', icon: Award, label: 'Properties' },
  { id: 'contacts', icon: MessageSquare, label: 'Contacts' },
  { id: 'more', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden justify-around items-center safe-bottom"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-light)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Primary Mobile Navigation"
    >
      {TABS.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 flex flex-col items-center py-1.5 min-touch relative"
            style={{ color: isActive ? 'var(--color-accent)' : 'var(--text-muted)' }}
            aria-label={`Navigate to ${label}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={18} />
            <span className="text-[9px] uppercase font-bold mt-0.5 tracking-tight">{label}</span>
            {isActive && !prefersReduced && (
              <div
                className="absolute -bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                style={{
                  width: '20px',
                  background: 'var(--color-accent)',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
