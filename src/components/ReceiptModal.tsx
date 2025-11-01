// src/components/ReceiptModal.tsx
import { Dialog, DialogBackdrop } from "@headlessui/react";
import { FiX, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import type { TransactionResponse } from "../api/transactions";
import ReceiptTemplate from "./ReceiptTemplate";
import { generateAndDownloadReceiptPng } from "../utils/generateReceiptsPng";

interface Props {
  tx: TransactionResponse | null;
  open: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ tx, open, onClose }: Props) {
  if (!open || !tx) return null;

  const handleDownloadReceipt = async () => {
    try {
      const receiptElement = (
        <ReceiptTemplate
          customerName={tx.customerName || "Walk-in Customer"}
          customerPhone={undefined}
          customerEmail={tx.customerEmail || undefined}
          customerAddress={tx.customerAddress || undefined}
          paymentMethod={tx.paymentMethod}
          notes={tx.notes || undefined}
          items={tx.items.map((item) => ({
            name: item.itemName,
            packType: item.packType,
            qty: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          }))}
          subtotal={tx.subtotal}
          discount={
            tx.discountAmount > 0 ? (tx.discountAmount / tx.subtotal) * 100 : 0
          }
          discountAmount={tx.discountAmount}
          total={tx.totalAmount}
          transactionReference={tx.transactionReference}
          timestamp={tx.createdOn}
        />
      );

      await generateAndDownloadReceiptPng(
        receiptElement,
        `receipt-${tx.transactionReference}`,
      );
    } catch (err) {
      console.error("Failed to download receipt:", err);
      toast.error("Failed to generate receipt. Please try again.");
    }
  };

  return (
    <Dialog as="div" className="relative z-50" open={open} onClose={onClose}>
      {/* backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* gradient header */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-900 p-6 text-white">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-xl font-bold">
                Receipt {tx.transactionReference}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <p className="mt-1 text-slate-300">
              {new Date(tx.createdOn).toLocaleString()}
            </p>
          </div>

          {/* body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
            {/* meta block */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Sales Person:</span>{" "}
                  {tx.salesPersonEmail}
                </p>
                <p>
                  <span className="font-medium">Customer:</span>{" "}
                  {tx.customerName ?? "-"}
                </p>
                <p>
                  <span className="font-medium">Payment:</span>{" "}
                  {tx.paymentMethod.replace(/_/g, " ")}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {tx.status}
                </p>
                {tx.notes && (
                  <p className="sm:col-span-2">
                    <span className="font-medium">Notes:</span> {tx.notes}
                  </p>
                )}
              </div>
            </div>

            {/* items block */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Items</h3>
              <ul className="space-y-2">
                {tx.items.length === 0 ? (
                  <li className="text-sm text-slate-500">No items</li>
                ) : (
                  tx.items.map((it) => (
                    <li
                      key={`${it.id}-${it.packType}`}
                      className="flex justify-between text-sm text-slate-700"
                    >
                      <span>
                        {it.itemName} • {it.packType} × {it.quantity}
                      </span>
                      <span>₦{it.lineTotal.toFixed(2)}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* totals block */}
            <div className="border-t border-slate-200 pt-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{tx.subtotal.toFixed(2)}</span>
                </div>
                {tx.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-₦{tx.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-emerald-600">
                    ₦{tx.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* footer buttons */}
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none"
            >
              <FiDownload className="w-4 h-4" />
              Download Receipt
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
