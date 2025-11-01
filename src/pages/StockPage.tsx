// src/pages/StockPage.tsx
import { useEffect, useState } from "react";
import { itemsApi } from "../api/items";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import ItemInfoModal from "../components/ItemInfoModal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import { FiPlus, FiInfo, FiEdit, FiTrash } from "react-icons/fi";
import type { ItemResponse } from "../api/types";

export default function StockPage() {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [infoItem, setInfoItem] = useState<ItemResponse | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [delId, setDelId] = useState<number | null>(null);

  const load = () =>
    itemsApi
      .list()
      .then(setItems)
      .catch((e) =>
        toast.error(e.response?.data?.message ?? "Failed to load stock"),
      );

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Inventory Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your stock, packs, and item details
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <FiPlus className="w-4 h-4" /> Add New Item
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-slate-500 mb-2">No items in stock</div>
            <button
              onClick={() => setAddOpen(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Item Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Total Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Pack Types
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.map((it) => (
                  <tr
                    key={it.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {it.name}
                      </div>
                      {it.imageUrl && (
                        <div className="mt-1 w-8 h-8 rounded border border-slate-200 bg-slate-100 overflow-hidden">
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </td>

                    {/* Total Quantity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                        {it.totalQuantity} pcs
                      </span>
                    </td>

                    {/* Pack Types */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {it.packs.map((pack, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700"
                          >
                            {pack.type}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          it.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {it.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditId(it.id)}
                          className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded-full hover:bg-emerald-50 transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setInfoItem(it)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                          title="Details"
                        >
                          <FiInfo className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDelId(it.id)}
                          className="text-rose-600 hover:text-rose-900 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <FiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals — each uses its own open state */}

      <AddItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={load}
      />

      {infoItem && (
        <ItemInfoModal
          open={!!infoItem} // ✅ Fixed: was addOpen
          item={infoItem}
          onClose={() => setInfoItem(null)}
        />
      )}

      {editId && (
        <EditItemModal
          open={!!editId} // ✅ Fixed: was addOpen
          itemId={editId}
          onClose={() => setEditId(null)}
          onSuccess={() => {
            load();
            setEditId(null);
          }}
        />
      )}

      {delId && (
        <ConfirmModal
          open={!!delId} // Optional: but clearer
          onClose={() => setDelId(null)}
          onConfirm={async () => {
            try {
              await itemsApi.delete(delId);
              toast.success("Item deleted");
              load();
              setDelId(null);
            } catch (e: any) {
              toast.error(e.response?.data?.message ?? "Delete failed");
            }
          }}
          title="Confirm Deletion"
        >
          Are you sure you want to delete this item? The record will be kept but
          marked inactive.
        </ConfirmModal>
      )}
    </div>
  );
}
