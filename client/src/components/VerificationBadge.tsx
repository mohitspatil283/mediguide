import React from 'react';
import { CheckCircle2, Clock, XCircle, Archive } from 'lucide-react';

interface Props {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const VerificationBadge: React.FC<Props> = ({
  status,
  size = 'md',
  showTooltip = false,
}) => {
  const norm = status?.toUpperCase() || 'UNVERIFIED';

  let config = {
    label: 'Unverified',
    bg: 'bg-sage-pale text-charcoal-secondary border-border-subtle',
    icon: <Clock className="w-3 h-3 text-charcoal-secondary" />,
    tooltip: 'Facility listing has not undergone administrative verification.',
  };

  if (norm === 'VERIFIED') {
    config = {
      label: 'Verified',
      bg: 'bg-mint-soft text-teal-deep border-border-subtle',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-accent" />,
      tooltip: 'Listing documentation verified by MediGuide administrators.',
    };
  } else if (norm === 'PENDING') {
    config = {
      label: 'In Review',
      bg: 'bg-amber-50 text-amber-900 border-amber-200/80',
      icon: <Clock className="w-3 h-3 text-amber-600" />,
      tooltip: 'Submitted updates in verification moderation queue.',
    };
  } else if (norm === 'REJECTED') {
    config = {
      label: 'Rejected',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <XCircle className="w-3 h-3 text-rose-600" />,
      tooltip: 'Documentation could not be verified by platform administrators.',
    };
  } else if (norm === 'ARCHIVED') {
    config = {
      label: 'Archived',
      bg: 'bg-warm-200 text-charcoal-secondary border-border-subtle',
      icon: <Archive className="w-3 h-3 text-charcoal-secondary" />,
      tooltip: 'Facility is currently inactive in the directory.',
    };
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-xs px-3 py-1 gap-1.5'
      : 'text-xs px-2.5 py-0.5 gap-1 font-semibold';

  return (
    <span
      title={showTooltip ? config.tooltip : undefined}
      className={`inline-flex items-center rounded-md border select-none transition-colors ${config.bg} ${sizeClasses}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
