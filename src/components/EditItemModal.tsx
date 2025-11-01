// src/components/EditItemModal.tsx
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiTrash, FiPlus, FiEyeOff, FiX } from "react-icons/fi";
import { itemsApi } from "../api/items";
import toast from "react-hot-toast";
import type { ItemResponse, UpdateItemRequest } from "../api/types";

interface PackForm {
  id: number;
  type: string;
  itemQuantityInPack: number;
  costPrice: string;
  sellingPrice: string;
  deleted: boolean;
}

interface Props {
  open: boolean;
  itemId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditItemModal({
  open,
  itemId,
  onClose,
  onSuccess,
}: Props) {
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [packs, setPacks] = useState<PackForm[]>([]);

  useEffect(() => {
    itemsApi
      .get(itemId)
      .then((d) => {
        setItem(d);
        setName(d.name);
        setImageUrl(d.imageUrl);
        setPreviewUrl(d.imageUrl);
        setPacks(
          d.packs.map((p) => ({
            id: p.id,
            type: p.type,
            itemQuantityInPack: p.itemQuantityInPack,
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            deleted: false,
          })),
        );
      })
      .catch((e) => toast.error(e.response?.data?.message ?? "Load failed"));
  }, [itemId]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== imageUrl)
        URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, imageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(imageUrl);
    }
  };

  const updatePack = <K extends keyof PackForm>(
    idx: number,
    field: K,
    value: PackForm[K],
  ) =>
    setPacks((prev) =>
      prev.map((pack, i) => (i === idx ? { ...pack, [field]: value } : pack)),
    );

  const addPack = () =>
    setPacks((p) => [
      ...p,
      {
        id: 0,
        type: "",
        itemQuantityInPack: 1,
        costPrice: "",
        sellingPrice: "",
        deleted: false,
      },
    ]);

  const removePack = (idx: number) =>
    setPacks((prev) =>
      prev.map((pack, i) => (i === idx ? { ...pack, deleted: true } : pack)),
    );

  const restorePack = (idx: number) =>
    setPacks((prev) =>
      prev.map((pack, i) => (i === idx ? { ...pack, deleted: false } : pack)),
    );

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name required");
    if (
      packs.some(
        (p) =>
          !p.deleted && (!p.type.trim() || !p.costPrice || !p.sellingPrice),
      )
    ) {
      return toast.error("All active packs must have type and prices");
    }

    const body: UpdateItemRequest = {
      name,
      imageUrl: imageUrl,
      packs: packs.map((pk) => ({
        id: pk.id,
        type: pk.type,
        itemQuantityInPack: pk.itemQuantityInPack,
        costPrice: pk.costPrice,
        sellingPrice: pk.sellingPrice,
        deleted: pk.deleted,
      })),
    };

    try {
      await itemsApi.update(itemId, body);
      if (imageFile) await itemsApi.uploadImage(itemId, imageFile);
      toast.success("Item updated");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Update failed");
    }
  };

  if (!item) return null; // Headless-UI will keep the backdrop

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
                {/* glass header */}
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold tracking-wide">
                      Edit Item
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-full p-1 text-slate-300 hover:bg-white/10 transition"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Update item details below
                  </p>
                </div>

                {/* body */}
                <div className="p-6 space-y-6 text-sm">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Item name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Item Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                    />
                    {previewUrl && (
                      <div className="mt-3 flex justify-center">
                        <img
                          src={previewUrl}
                          alt="Item preview"
                          className="h-32 w-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Packages
                      </span>
                      <button
                        type="button"
                        onClick={addPack}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <FiPlus className="h-4 w-4" /> Add pack
                      </button>
                    </div>

                    <div className="space-y-3">
                      {packs.map((pack, i) => (
                        <div
                          key={i}
                          className={`grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-6 items-center transition-opacity ${
                            pack.deleted ? "opacity-50" : ""
                          }`}
                        >
                          <input
                            value={pack.type}
                            onChange={(e) =>
                              updatePack(i, "type", e.target.value)
                            }
                            placeholder="Type"
                            disabled={pack.deleted}
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
                            disabled={pack.deleted}
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
                            disabled={pack.deleted}
                            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={pack.sellingPrice}
                            onChange={(e) =>
                              updatePack(i, "sellingPrice", e.target.value)
                            }
                            placeholder="Sell"
                            disabled={pack.deleted}
                            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <div className="col-span-2 flex gap-2 justify-end">
                            {pack.deleted ? (
                              <button
                                type="button"
                                onClick={() => restorePack(i)}
                                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                <FiEyeOff /> Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removePack(i)}
                                className="text-red-600 hover:underline inline-flex items-center gap-1"
                              >
                                <FiTrash /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* footer */}
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
                    Save changes
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
