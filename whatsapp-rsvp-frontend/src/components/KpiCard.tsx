
import React from 'react';
import { KpiData } from '../types';

interface KpiCardProps {
  kpi: KpiData;
}

const KpiCard: React.FC<KpiCardProps> = ({ kpi }) => {
  return (
    <div className="bg-white p-5 shadow rounded-lg flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 truncate">{kpi.title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{kpi.value}</p>
      </div>
      <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${kpi.color} text-white`}>
        {React.cloneElement(kpi.icon, { className: "h-6 w-6" })}
      </div>
    </div>
  );
};

export default KpiCard;
