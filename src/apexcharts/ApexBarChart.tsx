// components/RevenueChart.tsx
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

// ---- fake data ---- replace with API later ----
const TOP_ITEMS = [
  { name: "Wireless Mouse", qty: 234, revenue: 11700 },
  { name: "USB-C Cable", qty: 198, revenue: 3960 },
  { name: "Mechanical Keyboard", qty: 167, revenue: 25050 },
  { name: "Webcam HD", qty: 145, revenue: 14500 },
  { name: "Monitor 27”", qty: 89, revenue: 44500 },
];

export default function ApexBarChart() {
  const options: ApexOptions = {
    chart: { type: "bar", background: "transparent", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    grid: { borderColor: "rgba(255,255,255,0.1)" },
    xaxis: {
      categories: TOP_ITEMS.map((i) => i.name),
      labels: { style: { colors: "#9ca3af" } },
    },
    yaxis: { labels: { style: { colors: "#9ca3af" } } },
    colors: ["#10b981"],
    tooltip: { theme: "dark" },
  };

  const series = [{ name: "Revenue", data: TOP_ITEMS.map((i) => i.revenue) }];

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-6 ring-1 ring-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">
        Revenue by Product
      </h2>
      <Chart options={options} series={series} type="bar" height={250} />
    </div>
  );
}
