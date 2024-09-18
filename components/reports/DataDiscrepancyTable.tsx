import React from 'react';

const DataDiscrepancyTable = () => {
  // Replace with actual data from your backend
  const discrepancies = [
    { id: 1, service: 'Bitdefender', type: 'Missing Customer', count: 5 },
    { id: 2, service: 'SentinelOne', type: 'Mismatched Email', count: 3 },
    { id: 3, service: 'Duo', type: 'Duplicate Entry', count: 2 },
    { id: 4, service: 'Ingram', type: 'Invalid Data Format', count: 4 },
    { id: 5, service: 'Gamma', type: 'Outdated Information', count: 1 },
  ];

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {discrepancies.map((item) => (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap">{item.service}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataDiscrepancyTable;