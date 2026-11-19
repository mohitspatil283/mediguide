import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Smartphone,
  Check,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: {
    facility_id: number;
    facility_name: string;
    facility_type: string;
    phone: string;
    address: string;
    locality?: string;
    city: string;
    has_active_account?: boolean;
    services?: Array<{ service_id: number; name: string }>;
  };
  initialServiceId?: number;
  initialServiceName?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  facility,
  initialServiceId,
  initialServiceName,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [serviceId, setServiceId] = useState<string>(
    initialServiceId ? String(initialServiceId) : ''
  );
  const [doctorName, setDoctorName] = useState<string>('');
  
  // Default date: tomorrow
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [appointmentDate, setAppointmentDate] = useState<string>(getTomorrowDate());
  const [timeSlot, setTimeSlot] = useState<string>('10:30 AM');
  const [patientName, setPatientName] = useState<string>(user?.name || '');
  const [patientPhone, setPatientPhone] = useState<string>(user?.phone || '');
  const [patientEmail, setPatientEmail] = useState<string>(user?.email || '');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Success state with notification dispatch previews
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  if (!isOpen) return null;

  const timeSlots = [
    { label: 'Morning', slots: ['09:30 AM', '10:30 AM', '11:30 AM'] },
    { label: 'Afternoon', slots: ['02:00 PM', '03:30 PM', '04:30 PM'] },
    { label: 'Evening', slots: ['05:30 PM', '06:30 PM', '07:30 PM'] },
  ];

  // Active account check: Only allow direct booking if hospital has active account/verified
  const canBookDirectly = facility.has_active_account !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName.trim() || !patientPhone.trim()) {
      setError('Please provide patient name and contact phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.bookAppointment({
        facility_id: facility.facility_id,
        service_id: serviceId ? parseInt(serviceId, 10) : undefined,
        doctor_name: doctorName ? doctorName.trim() : undefined,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_email: patientEmail,
        notes,
      });

      if (res.success) {
        setBookingSuccess(res);
        toast('Appointment requested successfully! SMS & WhatsApp alerts dispatched.', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                Book Hospital Appointment
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {facility.facility_name} • {facility.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SUCCESS CONFIRMATION & NOTIFICATION DISPATCH PREVIEW             */}
        {/* ========================================================================= */}
        {bookingSuccess ? (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Appointment Requested!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your request has been queued directly with <strong className="text-slate-800 font-semibold">{facility.facility_name}</strong>.
                Booking ID: <strong className="text-brand-700 font-mono">#MG-{bookingSuccess.data.appointment_id}</strong>
              </p>
            </div>

            {/* Simulated Live Multi-Channel Notification Badges */}
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Multi-Channel Alerts Dispatched:</span>
              </span>

              {/* WhatsApp Alert */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px]">
                  <span>💬 WhatsApp Notification</span>
                  <span className="bg-emerald-200/80 px-2 py-0.5 rounded text-[10px]">Delivered</span>
                </div>
                <p className="text-[11px] text-emerald-900 italic font-medium leading-relaxed">
                  {bookingSuccess.notifications?.whatsapp?.preview}
                </p>
              </div>

              {/* SMS Alert */}
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-blue-800 font-bold text-[11px]">
                  <span>📱 SMS Alert</span>
                  <span className="bg-blue-200/80 px-2 py-0.5 rounded text-[10px]">Delivered</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-snug">
                  {bookingSuccess.notifications?.sms?.preview}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link
                to="/patient/dashboard"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>View My Appointments</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : !canBookDirectly ? (
          /* ========================================================================= */
          /* VIEW 2: HOSPITAL DOES NOT HAVE ACTIVE REPRESENTATIVE ACCOUNT             */
          /* ========================================================================= */
          <div className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-slate-900">
                Direct Telephone Booking Available
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">{facility.facility_name}</strong> currently processes OPD bookings via their direct front desk reception rather than automated in-app requests.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Direct Hospital Reception:
              </span>
              <p className="text-xl font-black text-slate-900 tracking-wide font-mono">
                {facility.phone}
              </p>
              <a
                href={`tel:${facility.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Front Desk Now</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Hospital representatives can activate direct digital appointment booking via the MediGuide Partner Portal.
            </p>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 3: ACTIVE BOOKING FORM                                              */
          /* ========================================================================= */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Active Partner Badge */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Hospital Partner</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700">
                Direct Confirmation Supported
              </span>
            </div>

            {/* Procedure / Department & Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department / Service
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">General OPD Consultation</option>
                  {facility.services?.map((svc) => (
                    <option key={svc.service_id} value={svc.service_id}>
                      {svc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor / Specialty (Optional)
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Cardiologist or Dr. Name"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                >
                  {timeSlots.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.slots.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Patient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp / SMS Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Notes / Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Visit / Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe symptoms, follow-up status, or notes for the doctor..."
                className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{submitting ? 'Confirming...' : 'Request Appointment'}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
