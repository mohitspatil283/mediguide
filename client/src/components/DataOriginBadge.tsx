import React from 'react';
import { FlaskConical, ShieldCheck, HelpCircle } from 'lucide-react';

interface Props {
  origin?: string;
  size?: 'sm' | 'md';
}

export const DataOriginBadge: React.FC<Props> = ({ origin = 'DEMONSTRATION_SAMPLE', size = 'sm' }) => {
  if (origin === 'VERIFIED_PARTNER') {
    return (
      <span
        title="Verified provider data submitted by authorized representative."
        className={`inline-flex items-center gap-1 rounded-md font-bold bg-mint-soft text-teal-deep border border-border-subtle ${
          size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
        }`}
      >
        <ShieldCheck className="w-3 h-3 text-emerald-accent" />
        <span>Verified Partner</span>
      </span>
    );
  }

  if (origin === 'UNVERIFIED_CROWDSOURCED') {
    return (
      <span
        title="Crowdsourced submission awaiting administrative moderation."
        className={`inline-flex items-center gap-1 rounded-md font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 ${
          size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
        }`}
      >
        <HelpCircle className="w-3 h-3 text-amber-600" />
        <span>Crowdsourced</span>
      </span>
    );
  }

  // Default: DEMONSTRATION_SAMPLE
  return (
    <span
      title="Academic demonstration sample data. For prototype preview and navigation testing."
      className={`inline-flex items-center gap-1 rounded-md font-semibold bg-sage-pale text-teal-deep border border-border-subtle ${
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
      }`}
    >
      <FlaskConical className="w-3 h-3 text-emerald-accent" />
      <span>Demo Sample</span>
    </span>
  );
};
