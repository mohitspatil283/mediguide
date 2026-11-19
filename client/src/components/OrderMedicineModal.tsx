import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Pill,
  MapPin,
  Phone,
  User,
  Truck,
  Building,
  X,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Check,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: {
    facility_id: number;
    facility_name: string;
    phone: string;
    address: string;
    locality?: string;
    city: string;
  };
}

export const OrderMedicineModal: React.FC<OrderMedicineModalProps> = ({
  isOpen,
  onClose,
  pharmacy,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP'>('HOME_DELIVERY');
  const [patientName, setPatientName] = useState<string>(user?.name || '');
  const [patientPhone, setPatientPhone] = useState<string>(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [medicinesText, setMedicinesText] = useState<string>('');
  const [prescriptionNote, setPrescriptionNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!medicinesText.trim()) {
      setError('Please list the required medicines or prescription items.');
      return;
    }

    if (deliveryType === 'HOME_DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      setError('Please enter your full delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createPharmacyOrder({
        facility_id: pharmacy.facility_id,
        patient_name: patientName,
        patient_phone: patientPhone,
        delivery_address: deliveryType === 'HOME_DELIVERY' ? deliveryAddress : 'Store Pickup Counter',
        delivery_type: deliveryType,
        medicines_text: medicinesText,
        prescription_note: prescriptionNote,
      });

      if (res.success) {
        setOrderSuccess(res);
        toast('Medicine order submitted! Pharmacy notified.', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit medicine order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                Order Medicines / Home Delivery
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {pharmacy.facility_name} • {pharmacy.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {orderSuccess ? (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Order ID: <strong className="text-brand-700 font-mono">#ORD-{orderSuccess.data.order_id}</strong> queued with {pharmacy.facility_name}.
              </p>
            </div>

            {/* Notification preview */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Smartphone className="w-3.5 h-3.5" />
                <span>WhatsApp Notification Sent</span>
              </div>
              <p className="text-[11px] text-emerald-800 italic leading-relaxed">
                {orderSuccess.notification?.whatsapp}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Link
                to="/patient/dashboard"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                View in Dashboard
              </Link>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Delivery Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('HOME_DELIVERY')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                  deliveryType === 'HOME_DELIVERY'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-xs text-slate-900">Home Delivery</p>
                  <p className="text-[10px] text-slate-500">Delivered to your address</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('STORE_PICKUP')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                  deliveryType === 'STORE_PICKUP'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Building className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-xs text-slate-900">Store Pickup</p>
                  <p className="text-[10px] text-slate-500">Pack and keep ready</p>
                </div>
              </button>
            </div>

            {/* Medicines List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Required Medicines / Prescription
              </label>
              <textarea
                rows={3}
                required
                value={medicinesText}
                onChange={(e) => setMedicinesText(e.target.value)}
                placeholder="List medicine names, dosage, quantity (e.g., Paracetamol 500mg - 1 strip, Cetirizine 10mg - 10 tabs)..."
                className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Patient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Name
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
                  WhatsApp Contact Phone
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

            {/* Delivery Address (only for HOME_DELIVERY) */}
            {deliveryType === 'HOME_DELIVERY' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Home Delivery Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat / House no, Building name, Street, Locality, Pincode..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}

            {/* Action buttons */}
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
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{submitting ? 'Placing Order...' : 'Place Medicine Order'}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
