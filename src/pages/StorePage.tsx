// src/pages/StorePage.tsx
import { useEffect, useState } from "react";
import { stockApi } from "../api/stock";
import Modal from "../components/Modal";
import AddStockModal from "../components/AddStockModal";
import UpdateStockModal from "../components/UpdateStockModal";
import toast from "react-hot-toast";
import { FiPlus, FiEdit, FiClock, FiUser, FiPackage } from "react-icons/fi";
import type { StockResponse } from "../api/types";

export default function StorePage() {
  const [records, setRecords] = useState<StockResponse[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    stockApi
      .list()
      .then(setRecords)
      .catch((e) =>
        toast.error(
          e.response?.data?.message ?? "Failed to load stock records",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Format date to Nigerian locale
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Store Ledger</h1>
          <p className="text-slate-600 mt-1">
            Track all stock inflows and adjustments
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <FiPlus className="w-4 h-4" /> Add Stock Entry
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">
              No stock records
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add your first stock entry to get started.
            </p>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Add Stock Now
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
                    Item & Pack
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Quantity Added
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Cost (₦)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Added By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Date
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
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    {/* Item & Pack */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {r.itemName}
                      </div>
                      <div className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                        <FiPackage className="w-3 h-3" />
                        {r.packType}
                      </div>
                      {r.supplySource && (
                        <div className="text-xs text-slate-500 mt-1">
                          From: {r.supplySource}
                        </div>
                      )}
                    </td>

                    {/* Quantity Added */}
                    <td className="px-6 py-4">
                      <div className="font-medium">{r.packsAdded} packs</div>
                      <div className="text-sm text-slate-600">
                        ({r.totalItemsAdded} pcs)
                      </div>
                    </td>

                    {/* Cost */}
                    <td className="px-6 py-4">
                      <div>
                        ₦
                        {(parseFloat(r.costPriceAtTime) * r.packsAdded).toFixed(
                          2,
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        ₦{parseFloat(r.costPriceAtTime).toFixed(2)}/pack
                      </div>
                    </td>

                    {/* Added By */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-900">{r.createdBy}</span>
                      </div>
                      {r.updatedBy && r.updatedOn && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <FiEdit className="w-3 h-3" />
                          Updated by {r.updatedBy}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-900">
                        <FiClock className="w-4 h-4 text-slate-500" />
                        {formatDate(r.createdOn)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditRecord(r)}
                        className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded-full hover:bg-emerald-50 transition-colors"
                        title="Update Record"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddStockModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          load();
          setAddOpen(false);
        }}
      />

      {editRecord && (
        <Modal
          open
          onClose={() => setEditRecord(null)}
          title="Update Stock Record"
        >
          <UpdateStockModal
            record={editRecord}
            onClose={() => setEditRecord(null)}
            onSuccess={() => {
              load();
              setEditRecord(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
