import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { VerificationBadge } from './VerificationBadge';
import { DataOriginBadge } from './DataOriginBadge';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  MapPin,
  Phone,
  Clock,
  Bookmark,
  Scale,
  ArrowRight,
  IndianRupee,
} from 'lucide-react';

interface FacilityCardProps {
  facility: {
    facility_id: number;
    facility_name: string;
    facility_type: string;
    address: string;
    locality?: string;
    city: string;
    state?: string;
    phone: string;
    operating_hours: string;
    status: string;
    data_origin?: string;
    distance_km?: number | null;
    distance_label?: string | null;
    is_saved?: boolean;
    services?: Array<{ service_id: number; name: string }>;
    has_cost_info?: boolean;
    cost_count?: number;
    costs?: Array<any>;
  };
  onBookmarkChange?: () => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onBookmarkChange }) => {
  const { isAuthenticated } = useAuth();
  const { isInCompare, toggleFacility } = useCompare();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSaved, setIsSaved] = useState<boolean>(facility.is_saved || false);
  const [saving, setSaving] = useState(false);

  const inCompare = isInCompare(facility.facility_id);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast('Please sign in to bookmark healthcare facilities.', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      setSaving(true);
      if (isSaved) {
        await api.removeSavedFacility(facility.facility_id);
        setIsSaved(false);
        toast('Facility removed from bookmarks.', 'info');
      } else {
        await api.saveFacility(facility.facility_id);
        setIsSaved(true);
        toast('Facility bookmarked.', 'success');
      }
      if (onBookmarkChange) onBookmarkChange();
    } catch (err: any) {
      toast(err.message || 'Unable to update bookmark.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast('Please sign in to use the cost comparison tool.', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    toggleFacility({
      facility_id: facility.facility_id,
      facility_name: facility.facility_name,
      facility_type: facility.facility_type,
      city: facility.city,
    });
  };

  const formatFacilityType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="bg-white rounded-2xl border border-border-subtle hover:border-emerald-accent/50 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Card Body */}
      <div className="p-5 sm:p-6 space-y-3.5">
        {/* Top Meta Tags */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-mint-soft text-teal-deep border border-border-subtle">
              {formatFacilityType(facility.facility_type)}
            </span>
            <VerificationBadge status={facility.status} size="sm" showTooltip={true} />
            <DataOriginBadge origin={facility.data_origin} size="sm" />
          </div>

          {facility.distance_label && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sage-pale text-teal-deep flex items-center gap-1 border border-border-subtle">
              <MapPin className="w-3 h-3 text-emerald-accent" />
              {facility.distance_label}
            </span>
          )}
        </div>

        {/* Facility Title & Locality */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-secondary mb-1">
            {facility.locality && (
              <span className="font-semibold text-charcoal-dark">
                {facility.locality},
              </span>
            )}
            <span>{facility.city}</span>
          </div>

          <h3 className="font-heading font-bold text-charcoal-dark group-hover:text-teal-deep transition-colors text-base sm:text-lg leading-snug">
            <Link to={`/facility/${facility.facility_id}`} className="hover:underline">
              {facility.facility_name}
            </Link>
          </h3>

          <p className="text-xs text-charcoal-secondary mt-1 line-clamp-2 leading-relaxed">
            {facility.address}
          </p>
        </div>

        {/* Contact and Operating Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-subtle text-xs text-charcoal-secondary">
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 text-emerald-accent shrink-0" />
            <span className="truncate">{facility.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-emerald-accent shrink-0" />
            <span className="truncate">{facility.operating_hours}</span>
          </div>
        </div>

        {/* Available Services */}
        {facility.services && facility.services.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold text-charcoal-secondary uppercase tracking-wide">
              Services ({facility.services.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {facility.services.slice(0, 3).map((svc) => (
                <span
                  key={svc.service_id}
                  className="px-2 py-0.5 bg-sage-pale border border-border-subtle text-charcoal-dark text-[11px] rounded-md font-medium"
                >
                  {svc.name}
                </span>
              ))}
              {facility.services.length > 3 && (
                <span className="px-1.5 py-0.5 bg-mint-soft text-teal-deep text-[11px] rounded-md font-bold">
                  +{facility.services.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cost Transparency Status */}
        <div className="pt-1">
          {facility.has_cost_info ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-deep bg-mint-soft px-2.5 py-1.5 rounded-lg border border-border-subtle">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-accent" />
              <span>Indicative tariff available ({facility.cost_count} services)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-charcoal-secondary bg-sage-pale px-2.5 py-1.5 rounded-lg border border-border-subtle">
              <IndianRupee className="w-3.5 h-3.5 text-charcoal-secondary/60" />
              <span>Direct confirmation required for pricing</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3.5 sm:px-6 bg-sage-pale/60 border-t border-border-subtle flex items-center justify-between gap-2">
        {/* Compare Checkbox */}
        <button
          type="button"
          onClick={handleToggleCompare}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
            inCompare
              ? 'bg-emerald-accent text-white border-emerald-accent shadow-sm'
              : 'bg-white text-charcoal-dark border-border-subtle hover:border-emerald-accent/50'
          }`}
          aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{inCompare ? 'Comparing' : 'Compare'}</span>
        </button>

        {/* Right side actions: Bookmark & Details */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={saving}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-mint-soft border-emerald-accent text-emerald-accent'
                : 'bg-white border-border-subtle text-charcoal-secondary hover:text-charcoal-dark'
            }`}
            title={isSaved ? 'Remove bookmark' : 'Bookmark facility'}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark facility'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-accent text-emerald-accent' : ''}`} />
          </button>

          <Link
            to={`/facility/${facility.facility_id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-teal-deep hover:bg-forest-dark text-white text-xs font-semibold transition-colors shadow-subtle hover:shadow-md"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
