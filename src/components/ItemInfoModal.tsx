// src/components/ItemInfoModal.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import type { ItemResponse } from "../api/types";

interface Props {
  open: boolean;
  item: ItemResponse;
  onClose: () => void;
}

export default function ItemInfoModal({ open, item, onClose }: Props) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* header */}
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold tracking-wide">
                      Item Details: {item.name}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-full p-1 text-slate-300 hover:bg-white/10 transition"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Total quantity: {item.totalQuantity}
                  </p>
                </div>

                {/* body */}
                <div className="p-6 space-y-4 text-sm">
                  {item.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-40 w-40 object-contain rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-slate-700">
                        Name:
                      </span>{" "}
                      {item.name}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Total quantity:
                      </span>{" "}
                      {item.totalQuantity}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Created by:
                      </span>{" "}
                      {item.createdBy || "—"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Updated by:
                      </span>{" "}
                      {item.updatedBy || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-700 mb-2">
                      Packages
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border border-slate-200 rounded-lg">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Items / pack</th>
                            <th className="px-3 py-2">Cost price</th>
                            <th className="px-3 py-2">Selling price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.packs.map((p) => (
                            <tr key={p.id} className="border-t">
                              <td className="px-3 py-2">{p.type}</td>
                              <td className="px-3 py-2">
                                {p.itemQuantityInPack}
                              </td>
                              <td className="px-3 py-2">₦{p.costPrice}</td>
                              <td className="px-3 py-2">₦{p.sellingPrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
