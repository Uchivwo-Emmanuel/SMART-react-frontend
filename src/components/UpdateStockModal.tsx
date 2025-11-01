// src/components/UpdateStockModal.tsx
import { useEffect, useState } from "react";
import { stockApi } from "../api/stock";
import { itemsApi } from "../api/items";
import toast from "react-hot-toast";
import type { StockResponse, UpdateStockRequest } from "../api/types.ts";

interface Props {
  record: StockResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateStockModal({
  record,
  onClose,
  onSuccess,
}: Props) {
  const [packType, setPackType] = useState(record.packType);
  const [packsToAdd, setPacksToAdd] = useState(record.packsAdded);
  const [supplySource, setSupplySource] = useState(record.supplySource ?? "");
  const [notes, setNotes] = useState(record.notes ?? "");
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);

  // Fetch item image when modal opens
  useEffect(() => {
    const fetchItemImage = async () => {
      try {
        const item = await itemsApi.get(record.itemId);
        setItemImage(item.imageUrl);
      } catch (err) {
        console.warn("Failed to load item image", err);
        setItemImage(null);
      } finally {
        setLoadingItem(false);
      }
    };
    fetchItemImage();
  }, [record.itemId]);

  const handleSave = async () => {
    const body: UpdateStockRequest = {
      packType,
      packsToAdd,
      supplySource,
      notes,
    };
    try {
      await stockApi.update(record.id, body);
      toast.success("Stock record updated");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Update failed");
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* ✅ Show item image */}
      {loadingItem ? (
        <div className="flex justify-center py-2">Loading image...</div>
      ) : itemImage ? (
        <div className="flex justify-center mb-4">
          <img
            src={itemImage}
            alt={record.itemName}
            className="h-24 w-24 object-contain rounded border"
          />
        </div>
      ) : null}

      <div>
        <label className="block font-medium mb-1">Pack type</label>
        <input
          value={packType}
          onChange={(e) => setPackType(e.target.value)}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Packs added</label>
        <input
          type="number"
          min="1"
          value={packsToAdd}
          onChange={(e) => setPacksToAdd(Number(e.target.value))}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">
          Supply source (optional)
        </label>
        <input
          value={supplySource}
          onChange={(e) => setSupplySource(e.target.value)}
          placeholder="e.g. Supplier-X"
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
