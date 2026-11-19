import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../utils/audit';

const router = Router();

// 1. Place Medicine Order (Home Delivery or Store Pickup)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      facility_id,
      patient_name,
      patient_phone,
      patient_email,
      delivery_address,
      delivery_type = 'HOME_DELIVERY',
      medicines_text,
      prescription_note,
    } = req.body;

    if (!facility_id || !patient_name || !patient_phone || !medicines_text) {
      res.status(400).json({
        success: false,
        error: 'Please provide pharmacy, patient name, contact phone, and medicine list.',
      });
      return;
    }

    const facId = parseInt(String(facility_id), 10);
    const pharmacy = await prisma.facility.findUnique({
      where: { facility_id: facId },
    });

    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found.' });
      return;
    }

    if (delivery_type === 'HOME_DELIVERY' && (!delivery_address || delivery_address.trim().length < 5)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid home delivery address.',
      });
      return;
    }

    const order = await prisma.medicineOrder.create({
      data: {
        user_id: req.user!.user_id,
        facility_id: facId,
        patient_name: patient_name.trim(),
        patient_phone: patient_phone.trim(),
        patient_email: patient_email ? patient_email.trim() : req.user!.email,
        delivery_address: delivery_address ? delivery_address.trim() : 'In-Store Pickup',
        delivery_type,
        medicines_text: medicines_text.trim(),
        prescription_note: prescription_note ? prescription_note.trim() : null,
        status: 'PENDING',
      },
      include: {
        facility: {
          select: {
            facility_id: true,
            facility_name: true,
            address: true,
            locality: true,
            city: true,
            phone: true,
          },
        },
      },
    });

    await logAuditEvent(req.user!.user_id, 'MEDICINE_ORDER_CREATE', 'MedicineOrder', order.order_id, {
      facility_id: facId,
      delivery_type,
    });

    // Simulated WhatsApp / SMS Alert
    const notification = {
      whatsapp: `💬 [WhatsApp from MediGuide] Hello ${patient_name}, your medicine order #ORD-${order.order_id} has been queued with ${pharmacy.facility_name}. Delivery type: ${delivery_type === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'}. The pharmacy will contact you at ${patient_phone} to confirm availability and dispatch!`,
      sms: `📱 [SMS] MediGuide: Medicine order #ORD-${order.order_id} placed at ${pharmacy.facility_name}. Tracking available in your dashboard.`,
    };

    res.status(201).json({
      success: true,
      message: 'Medicine order placed successfully! Confirmation dispatched to your phone.',
      data: order,
      notification,
    });
  } catch (error: any) {
    console.error('Medicine order error:', error);
    res.status(500).json({ success: false, error: 'Failed to place medicine order.' });
  }
});

// 2. Get User's Medicine Orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.medicineOrder.findMany({
      where: { user_id: req.user!.user_id },
      orderBy: { created_at: 'desc' },
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
      },
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch medicine orders.' });
  }
});

// 3. Update Order Status (Pharmacy Rep / Admin)
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, estimated_amount, notes } = req.body;

    const existing = await prisma.medicineOrder.findUnique({
      where: { order_id: orderId },
      include: { facility: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    const updated = await prisma.medicineOrder.update({
      where: { order_id: orderId },
      data: {
        status,
        estimated_amount: estimated_amount !== undefined ? parseFloat(String(estimated_amount)) : undefined,
        notes: notes ? notes.trim() : undefined,
      },
      include: { facility: true },
    });

    await logAuditEvent(req.user!.user_id, 'MEDICINE_ORDER_STATUS', 'MedicineOrder', orderId, { status });

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update order status.' });
  }
});

export default router;
