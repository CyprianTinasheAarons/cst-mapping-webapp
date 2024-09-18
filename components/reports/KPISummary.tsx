import React from 'react';
import { FaUsers, FaChartBar, FaClock, FaCheckCircle } from 'react-icons/fa';

const KPISummary = () => {
  // Replace with actual data from your backend
  const kpis = [
    { label: 'Total Mapped Customers', value: 1250, icon: FaUsers },
    { label: 'Mapping Success Rate', value: '92%', icon: FaChartBar },
    { label: 'Avg. Sync Time', value: '2.5s', icon: FaClock },
    { label: 'Data Quality Score', value: '95%', icon: FaCheckCircle },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{kpi.label}</h3>
            <span className="text-[#0C797D] text-2xl">
              {React.createElement(kpi.icon)}
            </span>
          </div>
          <p className="text-3xl font-bold text-[#0C797D]">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
};

export default KPISummary;