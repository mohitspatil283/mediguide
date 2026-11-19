import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
  COMPLETED: 'bg-slate-50 text-slate-700 border-slate-200',
  CANCELLED: 'bg-gray-50 text-gray-600 border-gray-200',
  RESCHEDULED: 'bg-sky-50 text-sky-800 border-sky-200',
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']

export const RepAppointmentsPage: React.FC = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients'>('appointments')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Inline form states
  const [declineForm, setDeclineForm] = useState<{ id: number; reason: string } | null>(null)
  const [rescheduleForm, setRescheduleForm] = useState<{ id: number; date: string; slot: string } | null>(null)

  const facilityId = (user as any)?.assigned_facility_id

  async function loadAppointments() {
    if (!facilityId) {
      setError('No facility assigned to your account.')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await api.getFacilityAppointmentsForRep(facilityId)
      if (res.success) {
        setAppointments(res.data || [])
      } else {
        setError(res.error || 'Failed to load appointments.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [facilityId])

  async function handleStatusUpdate(id: number, body: any) {
    setActionLoading(id)
    try {
      await api.updateAppointmentStatus(id, body)
      await loadAppointments()
      setDeclineForm(null)
      setRescheduleForm(null)
    } catch (err: any) {
      alert(err.message || 'Action failed.')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = statusFilter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === statusFilter)

  // Deduplicate patients
  const patientsMap = new Map<string, any>()
  for (const appt of appointments) {
    const key = appt.patient_email || appt.patient_phone
    if (!patientsMap.has(key)) {
      patientsMap.set(key, {
        name: appt.patient_name,
        phone: appt.patient_phone,
        email: appt.patient_email,
        count: 0,
        lastDate: appt.appointment_date,
      })
    }
    const p = patientsMap.get(key)!
    p.count += 1
    if (new Date(appt.appointment_date) > new Date(p.lastDate)) {
      p.lastDate = appt.appointment_date
    }
  }
  const patients = Array.from(patientsMap.values())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin mr-2 text-forest-deep" />
        <span className="text-sm">Loading appointments...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <p className="text-sm text-slate-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-forest-deep" />
            Appointment Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming patient appointment requests for your facility.
          </p>
        </div>
        <button
          onClick={loadAppointments}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'appointments'
              ? 'border-forest-deep text-forest-deep'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
          Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'patients'
              ? 'border-forest-deep text-forest-deep'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 inline mr-1.5" />
          Patient List ({patients.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  statusFilter === s
                    ? 'bg-forest-deep text-white border-forest-deep'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No appointments found for this filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((appt: any) => (
                <div
                  key={appt.appointment_id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Patient Info */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-900">{appt.patient_name}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${STATUS_COLORS[appt.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {appt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{appt.patient_phone}</span>
                      </div>
                      {appt.patient_email && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{appt.patient_email}</span>
                        </div>
                      )}
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-1 text-xs text-slate-500 sm:text-right">
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-semibold text-slate-700">
                          {new Date(appt.appointment_date).toLocaleDateString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{appt.time_slot}</span>
                      </div>
                      {appt.service && (
                        <p className="text-[11px] text-slate-400">{appt.service.name}</p>
                      )}
                      {appt.doctor_name && (
                        <p className="text-[11px] text-slate-400">Dr. {appt.doctor_name}</p>
                      )}
                      <p className="text-[11px] text-slate-400">Booking #MG-{appt.appointment_id}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {appt.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                      📝 {appt.notes}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    {appt.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appt.appointment_id, { status: 'CONFIRMED' })}
                          disabled={actionLoading === appt.appointment_id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === appt.appointment_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Confirm
                        </button>

                        {/* Decline with reason */}
                        {declineForm?.id === appt.appointment_id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="text"
                              placeholder="Rejection reason..."
                              value={declineForm.reason}
                              onChange={e => setDeclineForm({ ...declineForm, reason: e.target.value })}
                              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-rose-400 outline-none w-52"
                            />
                            <button
                              onClick={() => handleStatusUpdate(appt.appointment_id, { status: 'REJECTED', rejection_reason: declineForm.reason })}
                              disabled={actionLoading === appt.appointment_id}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Confirm Decline
                            </button>
                            <button onClick={() => setDeclineForm(null)} className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeclineForm({ id: appt.appointment_id, reason: '' })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        )}

                        {/* Reschedule */}
                        {rescheduleForm?.id === appt.appointment_id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="date"
                              value={rescheduleForm.date}
                              onChange={e => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-sky-400 outline-none"
                            />
                            <input
                              type="text"
                              placeholder="e.g. 10:30 AM"
                              value={rescheduleForm.slot}
                              onChange={e => setRescheduleForm({ ...rescheduleForm, slot: e.target.value })}
                              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-sky-400 outline-none w-32"
                            />
                            <button
                              onClick={() => handleStatusUpdate(appt.appointment_id, {
                                status: 'RESCHEDULED',
                                reschedule_date: rescheduleForm.date,
                                reschedule_slot: rescheduleForm.slot,
                              })}
                              disabled={actionLoading === appt.appointment_id || !rescheduleForm.date || !rescheduleForm.slot}
                              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Confirm Reschedule
                            </button>
                            <button onClick={() => setRescheduleForm(null)} className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRescheduleForm({ id: appt.appointment_id, date: '', slot: '' })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reschedule
                          </button>
                        )}
                      </>
                    )}

                    {appt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusUpdate(appt.appointment_id, { status: 'COMPLETED' })}
                        disabled={actionLoading === appt.appointment_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {actionLoading === appt.appointment_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patient List Tab */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {patients.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No patients found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-left">Patient Name</th>
                    <th className="py-3 px-4 text-left">Phone</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-center">Appointments</th>
                    <th className="py-3 px-4 text-left">Last Appointment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-forest-deep text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <span className="font-semibold text-slate-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {p.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {p.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {p.email}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          {p.count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(p.lastDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RepAppointmentsPage
