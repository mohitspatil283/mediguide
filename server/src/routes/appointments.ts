import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../utils/audit';
import {
  sendAppointmentConfirmationEmail,
  sendFacilityRepEmail,
  sendAppointmentStatusEmail,
} from '../utils/email';

const router = Router();

// 1. Create / Book Appointment
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      facility_id,
      service_id,
      doctor_name,
      appointment_date,
      time_slot,
      patient_name,
      patient_phone,
      patient_email,
      notes,
    } = req.body;

    if (!facility_id || !appointment_date || !time_slot || !patient_name || !patient_phone) {
      res.status(400).json({
        success: false,
        error: 'Please fill in all required fields: facility, date, time slot, name, and phone number.',
      });
      return;
    }

    const facId = parseInt(String(facility_id), 10);

    // Fetch facility with its assigned representatives to verify active account
    const facility = await prisma.facility.findUnique({
      where: { facility_id: facId },
      include: {
        representatives: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!facility) {
      res.status(404).json({ success: false, error: 'Healthcare facility not found.' });
      return;
    }

    // Active Account Gate: Check if hospital has active account on MediGuide
    const hasActiveAccount = facility.representatives.length > 0 || facility.data_origin === 'OFFICIAL_VERIFIED' || facility.status === 'VERIFIED';
    if (!hasActiveAccount) {
      res.status(400).json({
        success: false,
        error: `${facility.facility_name} does not currently have an active representative account for direct in-app booking. Please call reception at ${facility.phone}.`,
        direct_phone: facility.phone,
      });
      return;
    }

    // Validate appointment date is in future
    const appointmentDateObj = new Date(appointment_date);
    if (isNaN(appointmentDateObj.getTime())) {
      res.status(400).json({ success: false, error: 'Invalid appointment date format.' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDateObj < today) {
      res.status(400).json({ success: false, error: 'Appointment date cannot be in the past.' });
      return;
    }

    // Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        user_id: req.user!.user_id,
        facility_id: facId,
        service_id: service_id ? parseInt(String(service_id), 10) : null,
        doctor_name: doctor_name ? doctor_name.trim() : null,
        appointment_date: appointmentDateObj,
        time_slot: time_slot.trim(),
        patient_name: patient_name.trim(),
        patient_phone: patient_phone.trim(),
        patient_email: patient_email ? patient_email.trim() : req.user!.email,
        notes: notes ? notes.trim() : null,
        status: 'PENDING',
      },
      include: {
        facility: {
          select: {
            facility_id: true,
            facility_name: true,
            facility_type: true,
            address: true,
            locality: true,
            city: true,
            phone: true,
          },
        },
        service: {
          select: {
            service_id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    await logAuditEvent(req.user!.user_id, 'APPOINTMENT_BOOK', 'Appointment', appointment.appointment_id, {
      facility_id: facId,
      time_slot,
      status: 'PENDING',
    });

    const dateStr = appointmentDateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const patientEmailAddr = patient_email ? patient_email.trim() : req.user!.email;

    // Send confirmation email to patient
    sendAppointmentConfirmationEmail(
      patientEmailAddr,
      patient_name.trim(),
      appointment.facility.facility_name,
      dateStr,
      time_slot.trim(),
      appointment.appointment_id
    );

    // Send notification email to facility rep (first active rep)
    try {
      const facilityRep = await prisma.user.findFirst({
        where: {
          assigned_facility_id: facId,
          status: 'ACTIVE',
          role: { name: 'FACILITY_REPRESENTATIVE' },
        },
        include: { role: true },
      });
      if (facilityRep) {
        sendFacilityRepEmail(
          facilityRep.email,
          facilityRep.name,
          patient_name.trim(),
          appointment.facility.facility_name,
          dateStr,
          time_slot.trim(),
          appointment.appointment_id
        );
      }
    } catch (repEmailErr) {
      // Non-blocking: log but don't fail the request
      console.error('Failed to send facility rep email:', repEmailErr);
    }

    // Simulated Multi-Channel Notification Dispatch
    const notifications = {
      whatsapp: {
        recipient: patient_phone,
        channel: 'WhatsApp Cloud API',
        status: 'DELIVERED',
        preview: `💬 [WhatsApp from MediGuide] Hello ${patient_name}, your appointment request #MG-${appointment.appointment_id} for ${appointment.facility.facility_name} on ${dateStr} at ${time_slot} has been received. You will receive an immediate confirmation update once the hospital reviews it.`,
      },
      sms: {
        recipient: patient_phone,
        channel: 'National Healthcare SMS Gateway',
        status: 'DELIVERED',
        preview: `📱 [SMS] MediGuide: Appointment #MG-${appointment.appointment_id} requested at ${appointment.facility.facility_name} (${dateStr}, ${time_slot}). We will SMS you once confirmed.`,
      },
      email: {
        recipient: patientEmailAddr,
        subject: `Appointment Request Received: ${appointment.facility.facility_name}`,
        status: 'SENT',
        preview: `✉️ [Email] MediGuide Appointment Confirmation Slip - Request #MG-${appointment.appointment_id} queued with ${appointment.facility.facility_name} (${appointment.facility.address}).`,
      },
    };

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully! Multi-channel alerts sent to your phone and email.',
      data: appointment,
      notifications,
    });
  } catch (error: any) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to book appointment. Please try again.' });
  }
});

// 2. Get User's Appointments
router.get('/my-appointments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { user_id: req.user!.user_id },
      orderBy: { appointment_date: 'desc' },
      include: {
        facility: {
          select: {
            facility_id: true,
            facility_name: true,
            facility_type: true,
            address: true,
            locality: true,
            city: true,
            phone: true,
          },
        },
        service: {
          select: {
            service_id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    res.json({ success: true, data: appointments });
  } catch (error: any) {
    console.error('Fetch my-appointments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments.' });
  }
});

// 3. Get Facility's Appointments (For Facility Rep or Admin)
router.get('/facility/:facility_id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const facId = parseInt(req.params.facility_id, 10);

    // Rep role check
    if (req.user!.role === 'FACILITY_REPRESENTATIVE') {
      if (req.user!.assigned_facility_id !== facId) {
        res.status(403).json({ success: false, error: 'Unauthorized to view appointments for this facility.' });
        return;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: { facility_id: facId },
      orderBy: { appointment_date: 'desc' },
      include: {
        service: true,
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json({ success: true, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch facility appointments.' });
  }
});

// 4. Update Status (Accept / Decline / Reschedule / Complete)
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id, 10);
    const { status, rejection_reason, reschedule_date, reschedule_slot } = req.body;

    if (!['CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status update value.' });
      return;
    }

    const existing = await prisma.appointment.findUnique({
      where: { appointment_id: appointmentId },
      include: {
        facility: true,
        service: true,
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found.' });
      return;
    }

    // Role check: Admin, Facility Rep of this facility, or the User themselves (for cancelling)
    const isOwner = existing.user_id === req.user!.user_id;
    const isRep = req.user!.role === 'FACILITY_REPRESENTATIVE' && req.user!.assigned_facility_id === existing.facility_id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isRep && !isAdmin) {
      res.status(403).json({ success: false, error: 'Unauthorized to update this appointment.' });
      return;
    }

    // If patient is updating, they can only CANCEL
    if (isOwner && !isRep && !isAdmin && status !== 'CANCELLED') {
      res.status(403).json({ success: false, error: 'Patients can only cancel their appointments.' });
      return;
    }

    // Build update data
    const updateData: any = {
      status,
      rejection_reason: rejection_reason ? rejection_reason.trim() : null,
    };

    // Handle RESCHEDULED: store rescheduled date/slot in notes
    if (status === 'RESCHEDULED' && reschedule_date && reschedule_slot) {
      const existingNotes = existing.notes || '';
      updateData.notes = `RESCHEDULED: ${reschedule_date} at ${reschedule_slot}. Original notes: ${existingNotes}`;
    }

    const updated = await prisma.appointment.update({
      where: { appointment_id: appointmentId },
      data: updateData,
      include: {
        facility: true,
        service: true,
      },
    });

    await logAuditEvent(req.user!.user_id, 'APPOINTMENT_STATUS_UPDATE', 'Appointment', appointmentId, {
      status,
      rejection_reason,
    });

    const dateStr = new Date(updated.appointment_date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // Send status email to patient
    if (updated.patient_email) {
      const emailReason = status === 'RESCHEDULED'
        ? `Rescheduled to ${reschedule_date} at ${reschedule_slot}`
        : (rejection_reason || undefined);

      sendAppointmentStatusEmail(
        updated.patient_email,
        updated.patient_name,
        updated.facility.facility_name,
        dateStr,
        updated.time_slot,
        updated.appointment_id,
        status,
        emailReason
      );
    }

    // Multi-Channel Notifications for Status Change
    let notifications: any = null;

    if (status === 'CONFIRMED') {
      notifications = {
        whatsapp: {
          recipient: updated.patient_phone,
          status: 'DELIVERED',
          preview: `💬 [WhatsApp] 🎉 Appointment CONFIRMED! Your appointment with ${updated.facility.facility_name} is confirmed for ${dateStr} at ${updated.time_slot}. Please arrive 15 minutes before your slot. Booking ID: #MG-${updated.appointment_id}.`,
        },
        sms: {
          recipient: updated.patient_phone,
          status: 'DELIVERED',
          preview: `📱 [SMS] MediGuide: Appointment CONFIRMED at ${updated.facility.facility_name} on ${dateStr} at ${updated.time_slot}. ID: #MG-${updated.appointment_id}.`,
        },
      };
    } else if (status === 'REJECTED') {
      notifications = {
        whatsapp: {
          recipient: updated.patient_phone,
          status: 'DELIVERED',
          preview: `💬 [WhatsApp] Appointment Update: Unfortunately, ${updated.facility.facility_name} was unable to confirm your appointment for ${dateStr} at ${updated.time_slot}. Reason: "${rejection_reason || 'Doctor unavailable'}". Please choose another slot or call ${updated.facility.phone}.`,
        },
        sms: {
          recipient: updated.patient_phone,
          status: 'DELIVERED',
          preview: `📱 [SMS] MediGuide: Appointment #MG-${updated.appointment_id} could not be confirmed. Reason: ${rejection_reason || 'Schedule full'}. Please rebook.`,
        },
      };
    } else if (status === 'RESCHEDULED') {
      notifications = {
        whatsapp: {
          recipient: updated.patient_phone,
          status: 'DELIVERED',
          preview: `💬 [WhatsApp] 🔄 Appointment RESCHEDULED: Your appointment at ${updated.facility.facility_name} has been rescheduled to ${reschedule_date} at ${reschedule_slot}. ID: #MG-${updated.appointment_id}.`,
        },
        sms: {
          recipient: updated.patient_phone,
          status: 'DELIVERED',
          preview: `📱 [SMS] MediGuide: Appointment #MG-${updated.appointment_id} rescheduled to ${reschedule_date} at ${reschedule_slot}.`,
        },
      };
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${status}. Notification dispatched to patient.`,
      data: updated,
      notifications,
    });
  } catch (error: any) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update appointment status.' });
  }
});

// 5. Cancel Appointment
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id, 10);
    const existing = await prisma.appointment.findUnique({
      where: { appointment_id: appointmentId },
      include: { facility: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found.' });
      return;
    }

    const isOwner = existing.user_id === req.user!.user_id;
    const isRep = req.user!.role === 'FACILITY_REPRESENTATIVE' && req.user!.assigned_facility_id === existing.facility_id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isRep && !isAdmin) {
      res.status(403).json({ success: false, error: 'Unauthorized to cancel this appointment.' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { appointment_id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    await logAuditEvent(req.user!.user_id, 'APPOINTMENT_CANCEL', 'Appointment', appointmentId);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to cancel appointment.' });
  }
});

export default router;
