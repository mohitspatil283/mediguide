import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { FacilityCard } from '../../components/FacilityCard';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { EmergencySOSModal } from '../../components/EmergencySOSModal';
import {
  Compass,
  Bookmark,
  FileText,
  Scale,
  MapPin,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Search,
  AlertOctagon,
  PhoneCall,
  History,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [savedFacilities, setSavedFacilities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [savedRes, reportsRes] = await Promise.all([
          api.getSavedFacilities().catch(() => ({ success: false, data: [] })),
          api.getMyReports().catch(() => ({ success: false, data: [] })),
        ]);
        if (savedRes.success && savedRes.data) {
          setSavedFacilities(savedRes.data);
        }
        if (reportsRes.success && reportsRes.data) {
          setReports(reportsRes.data);
        }
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    // Load recently viewed facilities from localStorage
    try {
      const raw = localStorage.getItem('mediguide_recently_viewed');
      if (raw) {
        setRecentlyViewed(JSON.parse(raw));
      }
    } catch (e) {
      // Ignore
    }

    loadDashboard();
  }, []);

  const clearRecentlyViewed = () => {
    localStorage.removeItem('mediguide_recently_viewed');
    setRecentlyViewed([]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Compact Header Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-teal-deep uppercase tracking-wider">
            Healthcare Discovery & Account Overview
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Member'}
          </h2>
          <p className="text-xs text-slate-500">
            Access transparent healthcare pricing, review saved facilities, and inspect data submissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
            <span>SOS Help</span>
          </button>
          <Link
            to="/search"
            className="px-4 py-2 rounded-xl bg-forest-deep hover:bg-forest-dark text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Facilities</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner compact={true} />

      {/* 2. Key Role Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/user/saved"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-forest-deep hover:shadow-2xs transition-all space-y-1 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saved Bookmarks
            </span>
            <Bookmark className="w-4 h-4 text-forest-deep" />
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-forest-deep transition-colors">
            {savedFacilities.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Bookmarked facilities</p>
        </Link>

        <Link
          to="/user/reports"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:shadow-2xs transition-all space-y-1 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Accuracy Reports
            </span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
            {reports.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Submissions tracked</p>
        </Link>

        <Link
          to="/compare"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-2xs transition-all space-y-1 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tariff Compare
            </span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
            Matrix
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Side-by-side rates</p>
        </Link>

        <button
          type="button"
          onClick={() => setSosModalOpen(true)}
          className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-300 hover:bg-rose-50 transition-all space-y-1 text-left block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Emergency
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-rose-900">112 / 108</p>
          <p className="text-[11px] text-rose-700 font-medium">Toll-free emergency</p>
        </button>
      </div>

      {/* 3. Recently Viewed Facilities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-forest-deep" />
            <span>Recently Viewed Facilities</span>
          </h3>
          {recentlyViewed.length > 0 && (
            <button
              onClick={clearRecentlyViewed}
              className="text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {recentlyViewed.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-2xl bg-white border border-slate-200 p-6 space-y-1">
            <History className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No recently viewed facilities</p>
            <p className="text-[11px] text-slate-400">
              Healthcare providers you inspect will appear here for fast access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentlyViewed.slice(0, 4).map((fac) => (
              <Link
                key={fac.facility_id}
                to={`/facility/${fac.facility_id}`}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-forest-deep transition-all space-y-1.5 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>{fac.facility_type}</span>
                    {fac.verification_status === 'VERIFIED' && (
                      <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">Verified</span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs group-hover:text-forest-deep line-clamp-1 mt-0.5">
                    {fac.facility_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{fac.locality}, {fac.city}</p>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-forest-deep font-bold">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 4. Saved Facilities Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-forest-deep" />
            <span>Saved Bookmarks</span>
          </h3>
          {savedFacilities.length > 0 && (
            <Link to="/user/saved" className="text-xs font-bold text-forest-deep hover:underline">
              View all ({savedFacilities.length})
            </Link>
          )}
        </div>

        {savedFacilities.length === 0 ? (
          <div className="py-10 px-4 text-center rounded-2xl bg-white border border-slate-200 p-6 space-y-2">
            <Bookmark className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No saved facilities yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Save facilities to easily consult their addresses, contact details, and price tariffs.
            </p>
            <Link
              to="/search"
              className="inline-block mt-1 px-4 py-1.5 rounded-xl bg-forest-deep text-white font-bold text-xs"
            >
              Browse Directory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedFacilities.slice(0, 3).map((item) => (
              <FacilityCard
                key={item.saved_id}
                facility={{ ...item.facility, is_saved: true }}
                onBookmarkChange={() => {
                  setSavedFacilities((prev) =>
                    prev.filter((f) => f.facility.facility_id !== item.facility.facility_id)
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Accuracy Reports Submission Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Your Submitted Accuracy Reports</span>
          </h3>
          <Link to="/user/reports" className="text-xs font-bold text-forest-deep hover:underline">
            View All &rarr;
          </Link>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            You haven't submitted any data correction reports yet.
          </p>
        ) : (
          <div className="space-y-2">
            {reports.slice(0, 3).map((rep) => (
              <div
                key={rep.report_id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{rep.facility?.facility_name}</p>
                  <p className="text-slate-500 font-medium">Category: {rep.category.replace(/_/g, ' ')}</p>
                  <p className="text-slate-600 line-clamp-1 italic">"{rep.description}"</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-200 text-slate-800 shrink-0 self-start sm:self-center">
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency SOS Modal Portal */}
      <EmergencySOSModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </div>
  );
};
