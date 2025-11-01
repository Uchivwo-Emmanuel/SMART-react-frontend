// src/components/AddItemModal.tsx
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiPlus, FiX, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { itemsApi } from "../api/items";
import type { ItemCreateRequest } from "../api/types";
import toast from "react-hot-toast";

type PackForm = {
  type: string;
  itemQuantityInPack: number;
  costPrice: string;
  sellingPrice: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddItemModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [packs, setPacks] = useState<PackForm[]>([]);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addPackRow = () =>
    setPacks((p) => [
      ...p,
      { type: "", itemQuantityInPack: 1, costPrice: "", sellingPrice: "" },
    ]);

  const updatePack = <K extends keyof PackForm>(
    idx: number,
    field: K,
    value: PackForm[K],
  ) =>
    setPacks((p) =>
      p.map((pack, i) => (i === idx ? { ...pack, [field]: value } : pack)),
    );

  const removePack = (idx: number) =>
    setPacks((p) => p.filter((_, i) => i !== idx));

  const onImagePick = (file?: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onImagePick(e.target.files?.[0]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onImagePick(e.dataTransfer.files?.[0]);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Item name required");
    try {
      const request: ItemCreateRequest = {
        name,
        packs: packs.map((p) => ({
          type: p.type,
          itemQuantityInPack: p.itemQuantityInPack,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
        })),
      };
      await itemsApi.create(request, imageFile);
      toast.success("Item created");
      onSuccess();
      onClose();
      setName("");
      setPacks([]);
      onImagePick(undefined);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Save failed");
    }
  };

  const totalCost = packs.reduce(
    (sum, p) => sum + Number(p.costPrice || 0) * p.itemQuantityInPack,
    0,
  );
  const totalSelling = packs.reduce(
    (sum, p) => sum + Number(p.sellingPrice || 0) * p.itemQuantityInPack,
    0,
  );

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
              <Dialog.Panel className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold tracking-wide">
                      Add New Item
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-full p-1 text-slate-300 hover:bg-white/10 transition"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Fill in the details below to create an item
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-6 text-xs">
                    <span>
                      Total cost:{" "}
                      <span className="font-semibold">
                        ₦{totalCost.toFixed(2)}
                      </span>
                    </span>
                    <span>
                      Total selling:{" "}
                      <span className="font-semibold">
                        ₦{totalSelling.toFixed(2)}
                      </span>
                    </span>
                    <span>
                      Packs:{" "}
                      <span className="font-semibold">{packs.length}</span>
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Item name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="e.g. Coca-Cola 330ml"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Item Image (optional)
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`group relative flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-emerald-400"}`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-full w-full object-contain rounded-lg"
                        />
                      ) : (
                        <>
                          <FiUploadCloud className="h-10 w-10 text-slate-400 group-hover:text-emerald-500" />
                          <span className="mt-2 text-sm text-slate-600">
                            Drop an image or click to browse
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Packages
                      </span>
                      <button
                        type="button"
                        onClick={addPackRow}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <FiPlus className="h-4 w-4" /> Add pack
                      </button>
                    </div>

                    <div className="space-y-3">
                      {packs.map((pack, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-5"
                        >
                          <input
                            value={pack.type}
                            onChange={(e) =>
                              updatePack(i, "type", e.target.value)
                            }
                            placeholder="Type (e.g. CARTON)"
                            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:col-span-1"
                          />
                          <input
                            type="number"
                            min={1}
                            value={pack.itemQuantityInPack}
                            onChange={(e) =>
                              updatePack(
                                i,
                                "itemQuantityInPack",
                                Number(e.target.value),
                              )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={pack.costPrice}
                            onChange={(e) =>
                              updatePack(i, "costPrice", e.target.value)
                            }
                            placeholder="Cost"
                            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={pack.sellingPrice}
                            onChange={(e) =>
                              updatePack(i, "sellingPrice", e.target.value)
                            }
                            placeholder="Selling"
                            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => removePack(i)}
                            className="flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition"
                  >
                    Save Item
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
