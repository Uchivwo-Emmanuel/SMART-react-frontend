// src/components/SalesBarChart.tsx
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface Props {
  title: string;
  items: { name: string; value: number }[];
  color?: string;
}

export default function SalesBarChart({
  title,
  items,
  color = "#0d9488", // teal-600
}: Props) {
  const options: ApexOptions = {
    chart: {
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      } as any, // 👈 suppress TS error
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
        distributed: false, // Use single color
        colors: {
          ranges: [],
          backgroundBarColors: [],
          backgroundBarRadius: 0,
        },
      },
    },
    grid: {
      borderColor: "#e5e7eb", // subtle light gray border
      strokeDashArray: 3,
      position: "back",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: items.map((i) => i.name),
      labels: {
        style: {
          colors: "#1f2937", // slate-800
          fontSize: "12px",
          fontWeight: "500",
        },
        rotate: -30,
        rotateAlways: true,
        minHeight: 60,
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#4b5563", // slate-600
          fontSize: "12px",
        },
        formatter: (val) => val.toFixed(0),
      },
      title: {
        text: "Quantity Sold",
        style: {
          color: "#374151", // slate-700
          fontSize: "12px",
          fontWeight: "600",
        },
      },
      min: 0,
    },
    colors: [color],
    tooltip: {
      theme: "light",
      style: { fontSize: "14px" },
      x: { show: true },
      y: {
        formatter: (val) => `${val.toLocaleString()} individual items`,
        title: { formatter: () => "Sold: " },
      },
      marker: { show: false },
    },
    dataLabels: { enabled: false },
    states: {
      hover: {
        filter: {
          type: "lighten",
          value: 0.15,
        } as any, // 👈 suppress TS error
      },
    },
  };

  const series = [{ name: "Units Sold", data: items.map((i) => i.value) }];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
      <div
        className="px-6 py-4"
        style={{ backgroundColor: color, color: "#ffffff" }}
      >
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">
        {items.length > 0 ? (
          <Chart options={options} series={series} type="bar" height={320} />
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-500 italic">
            No sales data in this period
          </div>
        )}
      </div>
    </div>
  );
}
