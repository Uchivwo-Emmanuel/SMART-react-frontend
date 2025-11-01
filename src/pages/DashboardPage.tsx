// src/components/DashboardPage.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchIncomeByPaymentMethod,
  type PaymentMethodIncome,
  PaymentMethodDto,
} from "../api/transactions";
import { dashboardApi } from "../api/dashboard"; // ← your API for top/bottom items
import SalesBarChart from "../apexcharts/SalesBarChart.tsx";

const cardColors: Record<PaymentMethodDto, string> = {
  CASH: "bg-amber-500",
  POS: "bg-indigo-500",
  BANK_TRANSFER: "bg-sky-500",
  MOBILE_MONEY: "bg-violet-500",
  CREDIT_ACCOUNT: "bg-rose-500",
};

export default function DashboardPage() {
  // Income data
  const [incomeData, setIncomeData] = useState<PaymentMethodIncome[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  // Chart data
  const [topItems, setTopItems] = useState<{ name: string; value: number }[]>(
    [],
  );
  const [bottomItems, setBottomItems] = useState<
    { name: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Date range (shared across all data)
  const [period, setPeriod] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  // Helper: convert YYYY-MM-DD to ISO datetime (start/end of day)
  const toStartOfDay = (dateStr: string) => `${dateStr}T00:00:00`;
  const toEndOfDay = (dateStr: string) => `${dateStr}T23:59:59`;

  // Fetch all data when period changes
  useEffect(() => {
    setLoading(true);
    const startIso = toStartOfDay(period.start);
    const endIso = toEndOfDay(period.end);

    // Parallel requests
    Promise.allSettled([
      fetchIncomeByPaymentMethod(period.start, period.end),
      dashboardApi.getTopItems(startIso, endIso),
      dashboardApi.getBottomItems(startIso, endIso),
    ])
      .then(([incomeRes, topRes, bottomRes]) => {
        if (incomeRes.status === "fulfilled") {
          setIncomeData(incomeRes.value.data.data);
          setGrandTotal(incomeRes.value.data.grandTotal);
        } else {
          toast.error("Failed to load income data");
        }

        if (topRes.status === "fulfilled") {
          setTopItems(
            topRes.value.map((item) => ({
              name: item.itemName,
              value: item.totalQuantitySold,
            })),
          );
        } else {
          toast.error("Failed to load top items");
        }

        if (bottomRes.status === "fulfilled") {
          setBottomItems(
            bottomRes.value.map((item) => ({
              name: item.itemName,
              value: item.totalQuantitySold,
            })),
          );
        } else {
          toast.error("Failed to load bottom items");
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header + Date Picker */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-teal-700">Dashboard</h2>
        <div className="flex gap-2">
          <input
            type="date"
            value={period.start}
            onChange={(e) =>
              setPeriod((p) => ({ ...p, start: e.target.value }))
            }
            className="border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
          <input
            type="date"
            value={period.end}
            onChange={(e) => setPeriod((p) => ({ ...p, end: e.target.value }))}
            className="border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Income Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {incomeData.map((it) => (
          <div
            key={it.paymentMethod}
            className={`${cardColors[it.paymentMethod]} text-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl sm:text-2xl">₦</span>
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wide">
                {it.paymentMethod.replace("_", " ")}
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">
                {it.income.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm opacity-80">NGN</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grand Total */}
      <div className="bg-teal-600 text-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide">
            Total Income
          </div>
          <div className="text-3xl sm:text-4xl font-bold">
            {grandTotal.toLocaleString()} NGN
          </div>
        </div>
        <span className="text-3xl sm:text-4xl mt-2 sm:mt-0">₦</span>
      </div>

      {/* Charts - only show when loaded */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading sales charts...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesBarChart
            title="Top 5 Best-Selling Items"
            items={topItems}
            color="#0d9488" // teal-600
          />
          <SalesBarChart
            title="Bottom 5 Least-Selling Items"
            items={bottomItems}
            color="#dc2626" // rose-600
          />
        </div>
      )}
    </div>
  );
}
