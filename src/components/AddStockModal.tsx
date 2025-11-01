// src/components/AddStockModal.tsx
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiPlus, FiX, FiPackage, FiTrendingUp } from "react-icons/fi";
import { stockApi } from "../api/stock";
import { itemsApi } from "../api/items";
import toast from "react-hot-toast";
import type { ItemResponse } from "../api/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ open, onClose, onSuccess }: Props) {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [itemId, setItemId] = useState<number | "">("");
  const [packType, setPackType] = useState("");
  const [packsToAdd, setPacksToAdd] = useState(1);
  const [supplySource, setSupplySource] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    itemsApi
      .list()
      .then(setItems)
      .catch(() => toast.error("Failed to load items"));
  }, []);

  const selectedItem = items.find((i) => i.id === itemId);
  const selectedPack = selectedItem?.packs?.find((p) => p.type === packType);

  const handleSave = async () => {
    if (!itemId || !packType) return toast.error("Item and pack type required");
    try {
      await stockApi.add(itemId, { packType, packsToAdd, supplySource, notes });
      toast.success("Stock added");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Add failed");
    }
  };

  const totalQty = packsToAdd * (selectedPack?.itemQuantityInPack || 0);
  const totalCost = packsToAdd * Number(selectedPack?.costPrice || 0);
  const totalValue = packsToAdd * Number(selectedPack?.sellingPrice || 0);

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
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold tracking-wide">
                      Add Stock
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-full p-1 text-slate-300 hover:bg-white/10 transition"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Receive new inventory into the system
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-6 text-xs">
                    <span className="flex items-center gap-1">
                      <FiPackage className="h-4 w-4" />
                      Total Qty:{" "}
                      <span className="font-semibold">{totalQty}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FiTrendingUp className="h-4 w-4" />
                      Value:{" "}
                      <span className="font-semibold">
                        ₦{totalValue.toFixed(2)}
                      </span>
                    </span>
                    <span>
                      Cost:{" "}
                      <span className="font-semibold">
                        ₦{totalCost.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Item
                    </label>
                    <select
                      value={itemId}
                      onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : "";
                        setItemId(id);
                        setPackType(
                          items.find((i) => i.id === id)?.packs?.[0]?.type ??
                            "",
                        );
                      }}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="">-- choose item --</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>

                    {selectedItem && (
                      <div className="mt-3 flex items-center gap-4 rounded-xl border border-slate-200 p-3">
                        {selectedItem.imageUrl && (
                          <img
                            src={selectedItem.imageUrl}
                            alt={selectedItem.name}
                            className="h-16 w-16 object-contain rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">
                            {selectedItem.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {selectedItem.packs?.length || 0} pack types
                            available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pack Type
                    </label>
                    <select
                      value={packType}
                      onChange={(e) => setPackType(e.target.value)}
                      disabled={!selectedItem}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                    >
                      <option value="">-- choose pack --</option>
                      {selectedItem?.packs?.map((p) => (
                        <option key={p.id} value={p.type}>
                          {p.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Packs to Add
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPacksToAdd((n) => Math.max(1, n - 1))}
                        className="h-10 w-10 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={packsToAdd}
                        onChange={(e) =>
                          setPacksToAdd(Math.max(1, Number(e.target.value)))
                        }
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={() => setPacksToAdd((n) => n + 1)}
                        className="h-10 w-10 rounded-lg border border-slate-300 hover:bg-slate-100 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Supply Source (optional)
                    </label>
                    <input
                      value={supplySource}
                      onChange={(e) => setSupplySource(e.target.value)}
                      placeholder="e.g. Supplier-X"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any extra info"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition inline-flex items-center gap-2"
                  >
                    <FiPlus /> Add Stock
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
