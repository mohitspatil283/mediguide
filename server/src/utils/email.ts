// ============================================================
// MediGuide Email Utility — Simulated Email Dispatch
// No SMTP configured. All emails are logged to console with
// rich formatted previews for demonstration purposes.
// ============================================================

export function sendAppointmentConfirmationEmail(
  to: string,
  patientName: string,
  facilityName: string,
  date: string,
  timeSlot: string,
  appointmentId: number
) {
  const preview = `
📧 ═══════════════════════════════════════════════════════════
   MediGuide — Appointment Request Confirmation
═══════════════════════════════════════════════════════════════
   To: ${to}
   Subject: Appointment Confirmation — ${facilityName}

   Dear ${patientName},

   Your appointment request has been successfully submitted.
   Below are your booking details:

   🏥  Healthcare Facility : ${facilityName}
   📅  Date                : ${date}
   🕐  Time Slot           : ${timeSlot}
   🆔  Booking Reference   : #MG-${appointmentId}

   The facility will review and confirm your appointment.
   You will receive another notification upon confirmation.

   Stay healthy,
   The MediGuide Team
═══════════════════════════════════════════════════════════════`

  console.log(preview)

  return {
    success: true,
    channel: 'email',
    recipient: to,
    status: 'SIMULATED_SENT',
    preview: `Appointment confirmation email sent to ${to} for #MG-${appointmentId}`,
  }
}

export function sendAppointmentStatusEmail(
  to: string,
  patientName: string,
  facilityName: string,
  date: string,
  timeSlot: string,
  appointmentId: number,
  status: string,
  reason?: string
) {
  const statusEmoji: Record<string, string> = {
    CONFIRMED: '✅',
    REJECTED: '❌',
    COMPLETED: '🎉',
    CANCELLED: '🚫',
    RESCHEDULED: '🔄',
  }

  const emoji = statusEmoji[status] || 'ℹ️'

  const preview = `
📧 ═══════════════════════════════════════════════════════════
   MediGuide — Appointment Status Update
═══════════════════════════════════════════════════════════════
   To: ${to}
   Subject: Appointment ${status} — ${facilityName}

   Dear ${patientName},

   Your appointment status has been updated.

   ${emoji}  Status             : ${status}
   🏥  Healthcare Facility : ${facilityName}
   📅  Date                : ${date}
   🕐  Time Slot           : ${timeSlot}
   🆔  Booking Reference   : #MG-${appointmentId}
   ${reason ? `\n   📝  Reason / Note      : ${reason}\n` : ''}
   If you have questions, please contact the facility directly.

   Stay healthy,
   The MediGuide Team
═══════════════════════════════════════════════════════════════`

  console.log(preview)

  return {
    success: true,
    channel: 'email',
    recipient: to,
    status: 'SIMULATED_SENT',
    preview: `Status update email (${status}) sent to ${to} for #MG-${appointmentId}`,
  }
}

export function sendFacilityRepEmail(
  to: string,
  repName: string,
  patientName: string,
  facilityName: string,
  date: string,
  timeSlot: string,
  appointmentId: number
) {
  const preview = `
📧 ═══════════════════════════════════════════════════════════
   MediGuide — New Appointment Booked at Your Facility
═══════════════════════════════════════════════════════════════
   To: ${to}
   Subject: New Appointment Request — Action Required

   Dear ${repName},

   A new appointment has been booked at ${facilityName}.

   👤  Patient Name        : ${patientName}
   📅  Requested Date      : ${date}
   🕐  Requested Slot      : ${timeSlot}
   🆔  Booking Reference   : #MG-${appointmentId}

   Please log in to MediGuide to confirm or manage this request.
   Prompt responses improve patient trust and facility ratings.

   MediGuide Facility Representative Portal
═══════════════════════════════════════════════════════════════`

  console.log(preview)

  return {
    success: true,
    channel: 'email',
    recipient: to,
    status: 'SIMULATED_SENT',
    preview: `Facility rep notification email sent to ${to} for appointment #MG-${appointmentId}`,
  }
}

export function sendAdminNotificationEmail(
  adminEmail: string,
  facilityName: string,
  repName: string,
  repEmail: string
) {
  const preview = `
📧 ═══════════════════════════════════════════════════════════
   MediGuide — New Facility Registration Request
═══════════════════════════════════════════════════════════════
   To: ${adminEmail}
   Subject: 🏥 New Facility Registration Awaiting Approval

   Dear Administrator,

   A new healthcare facility has registered on MediGuide
   and is awaiting your verification and approval.

   🏥  Facility Name       : ${facilityName}
   👤  Representative      : ${repName}
   📧  Rep Email           : ${repEmail}

   Please visit the Admin Verification Queue to review
   and approve or reject this registration.

   MediGuide Platform Administration
═══════════════════════════════════════════════════════════════`

  console.log(preview)

  return {
    success: true,
    channel: 'email',
    recipient: adminEmail,
    status: 'SIMULATED_SENT',
    preview: `Admin notification email sent to ${adminEmail} for facility "${facilityName}"`,
  }
}

export function sendFacilityRegistrationDecisionEmail(
  to: string,
  repName: string,
  facilityName: string,
  status: string,
  reason?: string
) {
  const isApproved = status === 'VERIFIED' || status === 'APPROVE'
  const emoji = isApproved ? '✅' : '❌'
  const statusLabel = isApproved ? 'APPROVED' : 'REJECTED'

  const preview = `
📧 ═══════════════════════════════════════════════════════════
   MediGuide — Facility Registration Decision
═══════════════════════════════════════════════════════════════
   To: ${to}
   Subject: ${emoji} Facility Registration ${statusLabel} — ${facilityName}

   Dear ${repName},

   Your facility registration application has been reviewed
   by the MediGuide administrative team.

   🏥  Facility Name       : ${facilityName}
   ${emoji}  Decision           : ${statusLabel}
   ${reason ? `📝  Reason / Note      : ${reason}\n` : ''}
   ${
     isApproved
       ? `Your facility profile is now active on MediGuide.
   Patients can now discover and book appointments with you.
   Please log in to complete your facility profile.`
       : `Unfortunately your registration has not been approved.
   If you believe this is in error, please contact MediGuide
   support with your application details.`
   }

   MediGuide Platform Administration
═══════════════════════════════════════════════════════════════`

  console.log(preview)

  return {
    success: true,
    channel: 'email',
    recipient: to,
    status: 'SIMULATED_SENT',
    preview: `Registration decision email (${statusLabel}) sent to ${to} for "${facilityName}"`,
  }
}
