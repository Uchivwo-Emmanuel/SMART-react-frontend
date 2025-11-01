// src/pages/TransactionsList.tsx
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiClock,
  FiUser,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchTransactions,
  type TransactionResponse,
  type PaginatedTransactionResponse,
  PaymentMethodDto,
} from "../api/transactions";
import ReceiptModal from "./ReceiptModal";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// Helper: Format currency in Naira
const formatNaira = (amount: number): string => {
  return `₦${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

// Helper: Format date for Nigeria
const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Payment method icons
const PaymentIcon = ({ method }: { method: PaymentMethodDto }) => {
  switch (method) {
    case "POS":
      return <FiCreditCard className="w-4 h-4 text-emerald-600" />;
    case "BANK_TRANSFER":
      return <FiCreditCard className="w-4 h-4 text-blue-600" />;
    case "MOBILE_MONEY":
      return <FiCreditCard className="w-4 h-4 text-purple-600" />;
    case "CREDIT_ACCOUNT":
      return <FiCreditCard className="w-4 h-4 text-amber-600" />;
    default:
      return <FiCreditCard className="w-4 h-4 text-gray-600" />;
  }
};

// Status badge
const StatusBadge = ({ status }: { status: TransactionResponse["status"] }) => {
  const styles = {
    COMPLETED: "bg-green-100 text-green-800",
    PENDING: "bg-amber-100 text-amber-800",
    CANCELLED: "bg-rose-100 text-rose-800",
  };
  const icon =
    status === "COMPLETED" ? (
      <FiCheckCircle className="w-3 h-3 mr-1" />
    ) : status === "CANCELLED" ? (
      <FiXCircle className="w-3 h-3 mr-1" />
    ) : null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

export default function TransactionsList() {
  const [data, setData] = useState<PaginatedTransactionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [salesPerson, setSalesPerson] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDto | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(
    null,
  );

  /* ---------- data fetching ---------- */
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions({
        page,
        size,
        salesPersonEmail: salesPerson || undefined,
        customerEmail: customerEmail || undefined,
        paymentMethod: paymentMethod || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(res.data);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [
    page,
    size,
    salesPerson,
    customerEmail,
    paymentMethod,
    startDate,
    endDate,
  ]);

  /* ---------- helpers ---------- */
  const resetFilters = () => {
    setSalesPerson("");
    setCustomerEmail("");
    setPaymentMethod("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  const exportCSV = () => {
    if (!data || data.content.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const headers = [
      "Reference",
      "Date",
      "Customer",
      "Sales Person",
      "Payment Method",
      "Subtotal (₦)",
      "Discount (₦)",
      "Total (₦)",
      "Status",
    ];
    const rows = data.content.map((t) => [
      t.transactionReference,
      `"${new Date(t.createdOn).toISOString()}"`,
      `"${t.customerName || ""}"`,
      t.salesPersonEmail,
      t.paymentMethod,
      t.subtotal.toFixed(2),
      t.discountAmount.toFixed(2),
      t.totalAmount.toFixed(2),
      t.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const salesPeople = Array.from(
    new Set(data?.content.map((t) => t.salesPersonEmail) ?? []),
  );

  /* ---------- render ---------- */
  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Sales Transactions
            </h1>
            <p className="text-slate-600 mt-1">
              Track all sales, payments, and customer orders
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <FiDownload className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <FiFilter className="w-4 h-4" /> Reset Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sales Person
              </label>
              <select
                value={salesPerson}
                onChange={(e) => {
                  setSalesPerson(e.target.value);
                  setPage(0);
                }}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2 px-3"
              >
                <option value="">All</option>
                {salesPeople.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Customer Email
              </label>
              <input
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  setPage(0);
                }}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value as PaymentMethodDto);
                  setPage(0);
                }}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2 px-3"
              >
                <option value="">All</option>
                {Object.values(PaymentMethodDto).map((pm) => (
                  <option key={pm} value={pm}>
                    {pm.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm py-2 px-3"
              />
            </div>

            <div className="flex items-end">
              <div className="text-xs text-slate-500">
                {data ? `${data.totalElements} total records` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : !data || data.content.length === 0 ? (
            <div className="py-12 text-center">
              <FiCreditCard className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">
                No transactions found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your filters.
              </p>
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
                      Date & Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Sales Person
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Payment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Subtotal
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Discount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.content.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                    >
                      {/* Date & Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-slate-900">
                              {formatDate(tx.createdOn)}
                            </div>
                            <div className="text-sm text-slate-600">
                              {tx.customerName || "Walk-in Customer"}
                            </div>
                            {tx.customerEmail && (
                              <div className="text-xs text-slate-500">
                                {tx.customerEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sales Person */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-900">
                            {tx.salesPersonEmail}
                          </span>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PaymentIcon method={tx.paymentMethod} />
                          <span>{tx.paymentMethod.replace("_", " ")}</span>
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {formatNaira(tx.subtotal)}
                      </td>

                      {/* Discount */}
                      <td className="px-6 py-4 text-right text-slate-600">
                        {tx.discountAmount > 0
                          ? `- ${formatNaira(tx.discountAmount)}`
                          : "—"}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-right font-bold text-emerald-700">
                        {formatNaira(tx.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && data && data.content.length > 0 && (
            <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{page * size + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min((page + 1) * size, data.totalElements)}
                </span>{" "}
                of <span className="font-medium">{data.totalElements}</span>{" "}
                results
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700">Rows per page:</span>
                <Menu as="div" className="relative">
                  <Menu.Button className="inline-flex justify-center items-center w-16 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {size}
                    <FiChevronDown className="ml-1 w-3 h-3" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-1 w-24 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {PAGE_SIZE_OPTIONS.map((s) => (
                        <Menu.Item key={s}>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                setSize(s);
                                setPage(0);
                              }}
                              className={`block w-full px-3 py-2 text-left text-sm ${
                                active ? "bg-slate-100" : ""
                              }`}
                            >
                              {s}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>

                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={data.first}
                    className="px-3 py-1.5 text-sm rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={data.last}
                    className="px-3 py-1.5 text-sm rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        open={!!selectedTx}
        tx={selectedTx!}
        onClose={() => setSelectedTx(null)}
      />
    </>
  );
}
