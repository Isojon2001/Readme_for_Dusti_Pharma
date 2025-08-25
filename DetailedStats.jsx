import React from 'react';
import { useParams } from 'react-router-dom';
import StatsBarChart from '../components/StatsBarChart';
import Breadcrumb from '../components/Breadcrumb';

function DetailedStats() {
  const { type } = useParams();
  const label = type.replace(/_/g, ' ');

  const breadcrumbItems = [
    { label: 'Статистика', to: '/dashboard' },
    { label: 'Подробная статистика' },  
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <Breadcrumb items={breadcrumbItems} />
      <StatsBarChart type={type} />
    </div>
  );
}

export default DetailedStats;
