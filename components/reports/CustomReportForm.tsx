import React, { useState } from "react";

interface ReportConfig {
  startDate: string;
  endDate: string;
  services: string[];
  metrics: string[];
}

const CustomReportForm: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    startDate: "",
    endDate: "",
    services: [],
    metrics: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReportConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setReportConfig((prev) => ({
      ...prev,
      [name]: checked
        ? [...(prev[name as keyof ReportConfig] as string[]), value]
        : (prev[name as keyof ReportConfig] as string[]).filter(
            (item) => item !== value
          ),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement report generation logic here
    console.log("Generating report with config:", reportConfig);
  };

  const services = [
    "Bitdefender",
    "SentinelOne",
    "Duo",
    "Ingram",
    "Gamma",
    "Hudu",
  ];
  const metrics = [
    "Mapping Rate",
    "Sync Performance",
    "Data Quality",
    "Discrepancies",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={reportConfig.startDate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={reportConfig.endDate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {services.map((service) => (
            <label key={service} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="services"
                value={service}
                onChange={handleCheckboxChange}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{service}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Metrics
        </label>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <label key={metric} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="metrics"
                value={metric}
                onChange={handleCheckboxChange}
                className="rounded text-[#0C797D] focus:ring-[#0C797D]"
              />
              <span className="text-sm text-gray-700">{metric}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-[#0C797D] text-white px-4 py-2 rounded-md hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C797D] transition duration-150 ease-in-out"
      >
        Generate Report
      </button>
    </form>
  );
};

export default CustomReportForm;
