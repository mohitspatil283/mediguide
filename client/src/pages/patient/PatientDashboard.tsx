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
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Pill,
  Microscope,
  Droplet,
  AlertOctagon,
  PhoneCall,
  Search,
  ExternalLink,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [savedFacilities, setSavedFacilities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  useEffect(() => {
    async function loadPatientData() {
      try {
        const [savedRes, reportsRes, apptsRes, ordersRes] = await Promise.all([
          api.getSavedFacilities().catch(() => ({ success: false, data: [] })),
          api.getMyReports().catch(() => ({ success: false, data: [] })),
          api.getMyAppointments().catch(() => ({ success: false, data: [] })),
          api.getMyPharmacyOrders().catch(() => ({ success: false, data: [] })),
        ]);
        if (savedRes.success && savedRes.data) {
          setSavedFacilities(savedRes.data);
        }
        if (reportsRes.success && reportsRes.data) {
          setReports(reportsRes.data);
        }
        if (apptsRes.success && apptsRes.data) {
          setAppointments(apptsRes.data);
        }
        if (ordersRes.success && ordersRes.data) {
          setMedicineOrders(ordersRes.data);
        }
      } catch (err) {
        console.error('Failed to load patient dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientData();
  }, []);

  const handleCancelAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment request?')) return;
    try {
      await api.cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.appointment_id === id ? { ...a, status: 'CANCELLED' } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const categories = [
    { label: 'Hospitals', category: 'HOSPITAL', icon: Building2, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Clinics', category: 'CLINIC', icon: Stethoscope, color: 'text-teal-700 bg-teal-50' },
    { label: 'Pharmacies', category: 'PHARMACY', icon: Pill, color: 'text-sky-700 bg-sky-50' },
    { label: 'Diagnostic', category: 'DIAGNOSTIC', icon: Microscope, color: 'text-indigo-700 bg-indigo-50' },
    { label: 'Blood Centres', category: 'BLOOD_BANK', icon: Droplet, color: 'text-rose-700 bg-rose-50' },
    { label: 'Pathology Labs', category: 'PATHOLOGY', icon: Microscope, color: 'text-amber-700 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Compact Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-forest-deep uppercase tracking-wider">
            Patient Portal · Healthcare Navigator
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Patient'}
          </h2>
          <p className="text-xs text-slate-500">
            Discover verified healthcare providers, review published procedure tariffs, and track bookmarks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
            <span>Emergency SOS Help</span>
          </button>
          <Link
            to="/search"
            className="px-4 py-2 rounded-xl bg-forest-deep hover:bg-forest-dark text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Find Facilities</span>
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
              Saved Facilities
            </span>
            <Bookmark className="w-4 h-4 text-forest-deep" />
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-forest-deep transition-colors">
            {savedFacilities.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Bookmarked providers</p>
        </Link>

        <Link
          to="/user/reports"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:shadow-2xs transition-all space-y-1 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reports Filed
            </span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
            {reports.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Data accuracy submissions</p>
        </Link>

        <Link
          to="/compare"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-2xs transition-all space-y-1 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cost Matrix
            </span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
            Compare
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Standard tariffs tool</p>
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
          <p className="text-[11px] text-rose-700 font-medium">Verified 24/7 helplines</p>
        </button>
      </div>

      {/* 3. Fast Healthcare Category Exploration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Explore Healthcare Categories
          </h3>
          <Link to="/search" className="text-xs font-bold text-forest-deep hover:underline">
            View All Directory &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.category}
                to={`/search?category=${c.category}`}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-forest-deep hover:bg-slate-50/50 transition-all flex flex-col items-center text-center space-y-2 group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-forest-deep">
                  {c.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Booked Hospital Appointments Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Your Hospital Appointments ({appointments.length})
            </h3>
          </div>
          <Link to="/compare" className="text-xs font-bold text-brand-700 hover:underline">
            + Book Appointment &rarr;
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <Calendar className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No appointments scheduled</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Book OPD consultations and diagnostic tests directly with verified partner hospitals.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const isConfirmed = appt.status === 'CONFIRMED';
              const isPending = appt.status === 'PENDING';
              const isCancelled = appt.status === 'CANCELLED';

              const dateStr = new Date(appt.appointment_date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={appt.appointment_id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                    isConfirmed
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : isCancelled
                      ? 'border-slate-200 bg-slate-50/50 opacity-70'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/facility/${appt.facility?.facility_id}`}
                        className="font-extrabold text-slate-900 hover:text-brand-700 text-sm"
                      >
                        {appt.facility?.facility_name}
                      </Link>
                      <span className="text-[10px] text-slate-400">
                        ({appt.facility?.locality ? `${appt.facility.locality}, ` : ''}{appt.facility?.city})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 flex-wrap">
                      <span className="font-semibold text-brand-800">
                        📅 {dateStr} at {appt.time_slot}
                      </span>
                      {appt.service?.name && (
                        <span>• Service: {appt.service.name}</span>
                      )}
                      {appt.doctor_name && <span>• Dr: {appt.doctor_name}</span>}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Patient: <strong className="text-slate-700">{appt.patient_name}</strong> • Phone: {appt.patient_phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wide uppercase ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {appt.status}
                    </span>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelAppointment(appt.appointment_id)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold border border-rose-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3b. Pharmacy Medicine Orders Section */}
      {medicineOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Pharmacy Medicine Delivery Orders ({medicineOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {medicineOrders.map((ord) => (
              <div
                key={ord.order_id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-extrabold text-slate-900">
                    Order #ORD-{ord.order_id} • {ord.facility?.facility_name}
                  </p>
                  <p className="text-slate-600 mt-0.5 line-clamp-1 italic">
                    "{ord.medicines_text}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Mode: {ord.delivery_type === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'} • Address: {ord.delivery_address}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-center">
                  {ord.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Saved Facilities Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-forest-deep" />
            <span>Your Saved Facilities</span>
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
              Save clinics and hospitals while browsing to quickly revisit contact details and tariffs.
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

      {/* 5. Submitted Data Reports Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Submitted Accuracy Reports</span>
          </h3>
          <Link to="/user/reports" className="text-xs font-bold text-forest-deep hover:underline">
            View Reports &rarr;
          </Link>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            You haven't submitted any inaccurate data reports yet.
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
