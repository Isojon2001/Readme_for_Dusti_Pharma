import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import axios from 'axios';
import StatsSummary from './StatsSummary';
import '../index.css';

function StatsBarChart({ onStatsExtract }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchChart = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`http://api.dustipharma.tj:1212/api/v1/app/admin/statistics/`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const payload = res.data.payload;

      const formattedData = [
        {
          name: 'Прошлый месяц',
          Заявки: payload.order_prev_month,
          Пользователи: payload.users_prev_month,
          Продукты: payload.products_prev_month,
        },
        {
          name: 'Текущий месяц',
          Заявки: payload.order_current_month,
          Пользователи: payload.users_current_month,
          Продукты: payload.products_current_month,
        },
      ];

      setData(formattedData);

      const calculatedStats = {
        percentage: Math.round((payload.order_current_month / (payload.order_prev_month || 1)) * 100),
        delta: payload.order_current_month - payload.order_prev_month,
        currentMonth: payload.order_current_month,
        previousMonth: payload.order_prev_month,
      };

      setStats(calculatedStats);
      if (onStatsExtract) onStatsExtract(calculatedStats);

    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить данные графика');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
  }, []);

  const handleDateChange = () => {
    if (startDate && endDate) {
      fetchChart({ start_date: startDate, end_date: endDate });
    }
  };

  if (loading) return <p className="chart-status">Загрузка графика...</p>;
  if (error) return <p className="chart-status error">{error}</p>;
  if (data.length === 0) return <p className="chart-status">Нет данных для графика.</p>;

  return (
    <div className="stats-chart-wrapper">
      <div className="left-section">
        <StatsSummary stats={stats} />

        <div className="date-filter">
          <label className="date-filter-label">Фильтр по дате</label>
          <div className="date-inputs">
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="arrow">→</span>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleDateChange}
            />
          </div>
        </div>
      </div>

      <div className="line-chart-container">
        <h2 className="line-chart-title">📊 Сравнительная статистика по месяцам</h2>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 14 }} />
            <YAxis tick={{ fontSize: 14 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #ddd' }}
              labelStyle={{ fontWeight: 'bold', color: '#2c3e50' }}
              itemStyle={{ fontSize: 14 }}
            />
            <Legend wrapperStyle={{ fontSize: 14, marginTop: 20 }} />
            <Bar dataKey="Заявки" fill="#3498db" barSize={40} />
            <Bar dataKey="Пользователи" fill="#2ecc71" barSize={40} />
            <Bar dataKey="Продукты" fill="#e67e22" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StatsBarChart;
