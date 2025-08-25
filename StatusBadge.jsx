import React from 'react';

const statusStyles = {
  'Входящий': {
    backgroundColor: '#D9D9F2',
    color: '#262673',
    borderRadius: '8px',
    padding: '10px 8px',
  },
  'Исходящий': {
    backgroundColor: '#D2F9E2',
    color: '#138643',
    borderRadius: '6px',
    padding: '10px 8px',
    fontWeight: 'bold',
  },
  'Пропущенный': {
    backgroundColor: '#FFE5E5',
    color: 'red',
    borderRadius: '6px',
    padding: '10px 8px',
  },
  'Занято': {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
    borderRadius: '6px',
    padding: '4px 8px',
    fontWeight: 'bold',
  },
  'Ошибка': {
    backgroundColor: '#f3e5f5',
    color: '#6a1b9a',
    borderRadius: '6px',
    padding: '4px 8px',
    fontWeight: 'bold',
  },
  'Сброшен': {
    backgroundColor: '#eceff1',
    color: '#37474f',
    borderRadius: '6px',
    padding: '4px 8px',
    fontWeight: 'bold',
  },
  'Набирает': {
    backgroundColor: '#e8eaf6',
    color: '#3f51b5',
    borderRadius: '6px',
    padding: '4px 8px',
    fontWeight: 'bold',
  },
};

const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || {
    backgroundColor: '#f5f5f5',
    color: '#616161',
    borderRadius: '6px',
    padding: '4px 8px',
    fontWeight: 'bold',
  };

  return <span style={style}>{status}</span>;
};

export default StatusBadge;