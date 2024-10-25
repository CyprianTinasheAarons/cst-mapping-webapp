"use client";

import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import Header from "@/components/Header";
import KPISummary from "@/components/reports/KPISummary";
import DataDiscrepancyTable from "@/components/reports/DataDiscrepancyTable";
import CustomReportForm from "@/components/reports/CustomReportForm";

ChartJS.register(...registerables);

const HomePage = () => {
  // Sample data - replace with actual data from your backend
  const mappingData = {
    labels: ["Bitdefender", "SentinelOne", "Duo", "Ingram", "Gamma", "Hudu"],
    datasets: [
      {
        label: "Percentage of Customers Mapped",
        data: [85, 92, 78, 88, 95, 100],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  };

  const syncPerformanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Success Rate",
        data: [95, 96, 94, 98, 97, 99],
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
      {
        label: "Failure Rate",
        data: [5, 4, 6, 2, 3, 1],
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
    ],
  };

  const dataQualityData = {
    labels: ["Clean", "Minor Issues", "Major Issues"],
    datasets: [
      {
        data: [70, 25, 5],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <Header />
      <h1 className="text-2xl font-bold mb-6">Reports and Analytics</h1>

      <KPISummary />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mapping Statistics</h2>
          <Bar data={mappingData} options={{ responsive: true }} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Synchronization Performance
          </h2>
          <Line data={syncPerformanceData} options={{ responsive: true }} />
        </div>{" "}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Data Discrepancies</h2>
        <DataDiscrepancyTable />
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Custom Report Generation</h2>
        <CustomReportForm />
      </div>
    </main>
  );
};

export default HomePage;
