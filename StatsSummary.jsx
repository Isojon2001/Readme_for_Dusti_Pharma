import React from 'react';
import '../index.css';

function StatsSummary({ stats }) {
  if (!stats) return null;

  const { percentage, delta, currentMonth, previousMonth } = stats;

  return (
    <div className="stats-summary-box">
      <h4 className="stats-summary-title">Процентное соотношение</h4>

      <div className="stats-summary-percentage">
        {percentage}% <span className="stats-summary-arrow">↑ {delta}</span>
      </div>

      <hr className="stats-summary-divider" />

      <div className="stats-summary-details">
        <div className="stats-summary-current">
          Текущий месяц: <strong>{currentMonth}</strong> <span>↑ {delta}</span>
        </div>
        <div className="stats-summary-previous">
          С предыдущим месяцем: <strong>{previousMonth}</strong>
        </div>
      </div>
    </div>
  );
}

export default StatsSummary;
