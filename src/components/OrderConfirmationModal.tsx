// src/components/OrderConfirmationModal.tsx
import { Dialog } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import type { PaymentMethodDto } from "../api/transactions";

export interface CartItem {
  item: {
    id: number;
    name: string;
  };
  packType: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod: PaymentMethodDto;
  notes?: string;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  total: number;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  paymentMethod,
  notes,
  cart,
  subtotal,
  discount,
  discountAmount,
  total,
}: OrderConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-emerald-900 p-6 text-white">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-xl font-bold">
                Confirm Order
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <p className="mt-1 text-slate-300">
              Review details before finalizing
            </p>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Customer */}
            <div className="mb-5">
              <h3 className="font-semibold text-slate-800 mb-2">Customer</h3>
              <p className="text-slate-700">
                <span className="font-medium">Name:</span> {customerName}
              </p>
              {customerPhone && (
                <p className="text-slate-700">
                  <span className="font-medium">Phone:</span> {customerPhone}
                </p>
              )}
              {customerEmail && (
                <p className="text-slate-700">
                  <span className="font-medium">Email:</span> {customerEmail}
                </p>
              )}
              {customerAddress && (
                <p className="text-slate-700">
                  <span className="font-medium">Address:</span>{" "}
                  {customerAddress}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="mb-5">
              <h3 className="font-semibold text-slate-800 mb-2">Items</h3>
              <ul className="space-y-2">
                {cart.map((c, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between text-sm text-slate-700"
                  >
                    <span>
                      {c.item.name} • {c.packType} × {c.qty}
                    </span>
                    <span>₦{c.lineTotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment & Summary */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm text-slate-700">
                <span>Payment Method</span>
                <span>{paymentMethod.replace(/_/g, " ")}</span>
              </div>
              {notes && (
                <div className="mt-2">
                  <span className="font-medium text-slate-800">Notes:</span>{" "}
                  {notes}
                </div>
              )}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({discount}%)</span>
                    <span>-₦{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-emerald-600">₦{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition-colors"
            >
              Confirm & Place Order
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
