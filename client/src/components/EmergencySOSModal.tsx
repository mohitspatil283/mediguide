import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import {
  AlertOctagon,
  PhoneCall,
  MapPin,
  ExternalLink,
  X,
  Compass,
  Clock,
  ShieldAlert,
  Loader2,
  ChevronRight,
  Info,
} from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'confirm' | 'active'>('confirm');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState('');
  const [emergencyFacilities, setEmergencyFacilities] = useState<any[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Available localities for manual fallback in Pune region
  const puneLocalities = [
    'All Localities',
    'Shivajinagar',
    'Baner',
    'Kothrud',
    'Hadapsar',
    'Viman Nagar',
    'Deccan Gymkhana',
    'Camp / Pune Station',
    'Kalyani Nagar',
    'Aundh',
  ];

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('confirm');
      setLocationError(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load emergency-capable facilities (Hospitals with 24/7 or emergency support)
  useEffect(() => {
    if (isOpen && step === 'active') {
      loadNearbyEmergencyFacilities();
    }
  }, [isOpen, step, userLocation, selectedLocality]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadNearbyEmergencyFacilities = async () => {
    setLoadingFacilities(true);
    try {
      const params: Record<string, any> = {
        category: 'HOSPITAL',
      };
      if (selectedLocality && selectedLocality !== 'All Localities') {
        params.locality = selectedLocality;
      }
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius_km = 15;
      }

      const res = await api.searchFacilities(params);
      if (res.success && res.data) {
        // Prioritize 24/7 or verified hospital facilities
        const sorted = (res.data.facilities || []).sort((a: any, b: any) => {
          const a247 = a.operating_hours?.toLowerCase().includes('24') ? 1 : 0;
          const b247 = b.operating_hours?.toLowerCase().includes('24') ? 1 : 0;
          return b247 - a247;
        });
        setEmergencyFacilities(sorted.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load emergency facilities:', err);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please select your locality below.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === 1
            ? 'Location access was declined. Select your area manually from the dropdown.'
            : 'Unable to detect accurate location. Please select your locality manually.'
        );
      },
      { timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden text-slate-900 my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-rose-200">
                MediGuide Emergency Guidance
              </span>
              <h2 id="sos-modal-title" className="text-xl sm:text-2xl font-black tracking-tight">
                Emergency Assistance & Helplines
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close Emergency Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Two-step confirmation */}
        {step === 'confirm' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-rose-950 space-y-1">
                <p className="font-bold text-rose-900">Immediate Professional Care Notice</p>
                <p className="leading-relaxed">
                  If someone is unconscious, has severe chest pain, breathing difficulty, uncontrollable
                  bleeding, or another life-threatening emergency, call national emergency services immediately.
                </p>
              </div>
            </div>

            <div className="text-center py-4 space-y-2">
              <p className="text-base sm:text-lg font-bold text-slate-900">
                Do you need immediate emergency contact numbers and 24/7 emergency facilities?
              </p>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                MediGuide provides verified emergency phone numbers and nearby 24/7 trauma care locations.
                This prevents accidental telephone calls.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                No, Return to Dashboard
              </button>
              <button
                type="button"
                onClick={() => setStep('active')}
                className="flex-1 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Yes, Show Emergency Help</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Active Emergency Guide */}
        {step === 'active' && (
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Strict Regulatory Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Important:</strong> MediGuide is an informational healthcare directory and navigation
                platform, <u>not an emergency dispatch or ambulance service</u>. MediGuide cannot send emergency
                personnel. Call the verified numbers below directly.
              </p>
            </div>

            {/* Official Indian Emergency Helplines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span>Verified National Emergency Helplines (India)</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Toll-Free 24x7
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 112 ERSS */}
                <a
                  href="tel:112"
                  className="p-4 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-between shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                      All-in-One ERSS
                    </span>
                    <p className="text-2xl font-black tracking-tight">112</p>
                    <p className="text-xs text-rose-100 font-medium">National Emergency Helpline</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                </a>

                {/* 108 Ambulance */}
                <a
                  href="tel:108"
                  className="p-4 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-between shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                      Emergency Ambulance
                    </span>
                    <p className="text-2xl font-black tracking-tight">108</p>
                    <p className="text-xs text-emerald-100 font-medium">
                      Medical Ambulance (Free 24x7)
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                </a>

                {/* 102 Mother & Child */}
                <a
                  href="tel:102"
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <p className="text-base font-extrabold text-slate-900">102</p>
                    <p className="text-xs text-slate-500">Free Maternity & Neonatal Transport</p>
                  </div>
                  <span className="text-xs font-bold text-brand-700 group-hover:underline flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" /> Call
                  </span>
                </a>

                {/* National Health Helpline */}
                <a
                  href="tel:18001801104"
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <p className="text-base font-extrabold text-slate-900">1800-180-1104</p>
                    <p className="text-xs text-slate-500">National Health Helpline (Govt)</p>
                  </div>
                  <span className="text-xs font-bold text-brand-700 group-hover:underline flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" /> Call
                  </span>
                </a>
              </div>
            </div>

            {/* Nearby 24/7 Emergency Facilities */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Nearby 24/7 Emergency Care Facilities</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={requestBrowserLocation}
                    disabled={locating}
                    className="px-2.5 py-1 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold hover:bg-brand-100 flex items-center gap-1 transition-colors"
                  >
                    {locating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Compass className="w-3.5 h-3.5 text-brand-600" />
                    )}
                    <span>{userLocation ? 'GPS Active' : 'Use My Location'}</span>
                  </button>

                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    aria-label="Filter emergency facilities by locality"
                  >
                    {puneLocalities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {locationError && (
                <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  {locationError}
                </p>
              )}

              {loadingFacilities ? (
                <div className="py-8 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
                  <p className="text-xs">Locating nearest 24/7 trauma & emergency centers...</p>
                </div>
              ) : emergencyFacilities.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No 24/7 facilities found for this area. Please select another locality or dial 112/108 directly.
                </div>
              ) : (
                <div className="space-y-2">
                  {emergencyFacilities.map((fac) => (
                    <div
                      key={fac.facility_id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">
                            {fac.facility_name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                            24/7 Emergency
                          </span>
                          {fac.distance_km !== undefined && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {fac.distance_km} km away
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {fac.locality}, {fac.city}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {fac.phone && (
                          <a
                            href={`tel:${fac.phone}`}
                            className="px-3 py-1.5 rounded-xl bg-forest-deep hover:bg-forest-dark text-white font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call {fac.phone}</span>
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${fac.facility_name} ${fac.locality} ${fac.city}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          title="Get Directions on Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close / Return Button */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close Emergency Guidance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
