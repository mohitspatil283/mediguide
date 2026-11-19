import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-mint-soft/60 border-b border-border-subtle px-4 py-2 text-xs text-charcoal-secondary flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-accent shrink-0" />
          <p className="truncate">
            <span className="font-semibold text-charcoal-dark">Informational Notice:</span> Facility data and costs are for guidance only. Confirm availability and rates directly with the facility.
          </p>
          <Link to="/disclaimer" className="underline font-medium hover:text-teal-deep shrink-0 ml-1">
            Policy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-mint-soft/40 border border-border-subtle rounded-2xl p-4 sm:p-5 my-4">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-white text-emerald-accent rounded-xl shrink-0 border border-border-subtle shadow-subtle">
          <ShieldAlert className="w-4 h-4 text-emerald-accent" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-teal-deep uppercase tracking-wider">
            Healthcare Information &amp; Navigation Scope
          </h4>
          <p className="text-xs text-charcoal-secondary leading-relaxed max-w-4xl">
            Information shown on MediGuide is compiled for navigation and preliminary cost transparency.
            Tariffs and operating hours may vary. Always confirm details and charges directly with the healthcare provider.
            MediGuide does not provide clinical diagnoses, emergency triage, or hospital billing processing.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-secondary">
            <span>&bull; Non-diagnostic reference tool</span>
            <span>&bull; Not for emergency medical services</span>
            <Link to="/disclaimer" className="text-teal-deep font-semibold hover:underline">
              Read complete disclaimer &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
