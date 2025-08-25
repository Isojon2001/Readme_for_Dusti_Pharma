import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Users,  User,  MoreVertical } from 'lucide-react';
import SidebarItem from '../components/SidebarItem';
import { useAuth } from '../context/AuthContext';
import '../index.css';

function Dashboard() {
    const { logout } = useAuth();
  const { token, setToken, user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [amiEvents, setAmiEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [socketError, setSocketError] = useState(false);
  const itemsPerPage = 7;
  const navigate = useNavigate();

  const formatNumber = (num) =>
    typeof num === 'number' ? num.toLocaleString('ru-RU') : '—';

  const calculateAmiStats = (events) => {
    let totalCalls = 0;
    let answered = 0;
    let missed = 0;
    let totalDuration = 0;

    events.forEach((e) => {
      if (e.phone && /^\d{7,}$/.test(e.phone)) totalCalls++;

      if (e.Event === 'Hangup') {
        if (e.cause.includes('normal clearing')) answered++;
        else missed++;
        if (!isNaN(e.duration)) totalDuration += e.duration;
      }
    });

    return { totalCalls, answered, missed, totalDuration };
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!token) return;

    fetch('http://api.dustipharma.tj:1212/api/v1/app/profile/users', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        const payload = data.payload;
        if (Array.isArray(payload)) {
          setProfile(payload[0] || null);
        } else if (typeof payload === 'object') {
          setProfile(payload);
        } else {
          console.warn('Неподдерживаемый формат профиля:', payload);
        }
      })
      .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetch('http://api.dustipharma.tj:1212/api/v1/app/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(data => {
        const usersList = Array.isArray(data) ? data : data?.payload || [];

        const adminUsers = usersList.filter(user =>
          ['admin', 'moderator'].includes(user['Роль']?.toLowerCase()) ||
          ['admin', 'moderator'].includes(user['ВидКонтрагента']?.toLowerCase())
        );

        setUsers(adminUsers);
      })
      .catch(error => {
        console.error('Ошибка при загрузке пользователей:', error);
      });
  }, [token]);

  useEffect(() => {
    const savedEvents = localStorage.getItem('amiEvents');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        setAmiEvents(parsed);
      } catch (err) {
        console.error('Ошибка загрузки amiEvents из localStorage:', err);
      }
    }

    const socket = new WebSocket('ws://10.10.10.21:8081');

    socket.onopen = () => console.log('WebSocket открыт');

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const incoming = Array.isArray(payload.data) ? payload.data : [payload.data];

        const enriched = incoming
          .filter(e => e && e.Event)
          .map(e => {
            const phone = (e.CallerIDNum || e.Source || e.ConnectedLineNum || '').toString().trim();
            const duration = parseInt(e.Duration || '0', 10);
            const cause = (e.Cause || '').toLowerCase();

            return {
              ...e,
              timestamp: e.timestamp || new Date().toISOString(),
              phone,
              duration,
              cause
            };
          });

        setAmiEvents(prev => {
          const updated = [...enriched, ...prev].slice(0, 500);
          localStorage.setItem('amiEvents', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Ошибка обработки WebSocket-сообщения:', err);
      }
    };

    socket.onerror = () => setSocketError(true);
    socket.onclose = () => setSocketError(true);

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (!token) return;

    axios.get('http://api.dustipharma.tj:1212/api/v1/app/admin/statistics', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setStats(res.data.payload))
      .catch(error => {
        console.error('Ошибка при получении статистики:', error.response?.data || error.message);
      });
  }, [token]);

  const amiStats = calculateAmiStats(amiEvents);

  const items = [
    { key: 'order_total', label: 'Всего заказов', value: stats?.order_total },
    { key: 'order_prev_month', label: 'Заказы в прошлом месяце', value: stats?.order_prev_month },
    { key: 'order_current_month', label: 'Заказы в этом месяце', value: stats?.order_current_month },
    { key: 'users_total', label: 'Всего пользователей', value: stats?.users_total },
    { key: 'products_total', label: 'Всего продуктов', value: stats?.products_total },
    { key: 'ami_calls_total', label: 'AMI: Всего звонков (Live)', value: amiStats.totalCalls },
    { key: 'ami_missed', label: 'AMI: Пропущенные звонки', value: amiStats.missed },
  ];

  const filteredItems = searchTerm.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="sidebar_logo">
            <img src="./Dusti_pharma.png" width="40" height="40" alt="logo" />
            <h2>Дусти фарма</h2>
          </div>
          <div className="sidebar-menu">
            <SidebarItem icon={LayoutGrid} label="Статистика" to="/dashboard" />
            <SidebarItem icon={() => <img src="./Icons-3.svg" alt="Роли и права" />} label="Роли и права" to="/RoleAndRoot" />
            <SidebarItem icon={Users} label="Partner" to="/Partner" />
            <SidebarItem icon={() => <img src="./Icons-4.svg" alt="MobileApp" />} label="Панель MobileApp" to="/mobile" />
            <SidebarItem icon={() => <img src="./call.svg" width={20} height={20} alt="Звонки" />} label="Журнал звонков" to="/calls" />
          </div>
        </div>

        <div className="sidebar_block">
          <p>Служба поддержки</p>
          <div className="sidebar_user">
            <div className="logo_flex">
              <div className="logo_user"><User className="user-icon"/></div>
              <div className="logo_profile">
                <h3>{profile?.['Наименование']?.trim() || 'Менеджер не найден'}</h3>
                <p>{profile?.['ВидКонтрагента']?.trim() || 'Филиал не указан'}</p>
              </div>
                <button onClick={handleLogout} className="logout-btn">Выйти</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="statistics">
        <div className="statistics_paragraph">
          <h1>Статистика</h1>
          <input
            placeholder="Найти"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                    />
      </div>

      <div className="statistics_info">
        <div className="stat_cards">
          {paginatedItems.length === 0 ? (
            <p>Нет данных для отображения</p>
          ) : (
            paginatedItems.map((item, index) => (
              <div
                className="stat_card"
                key={index}
                onClick={() => navigate(`/statistics/${item.key}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat_Header">
                  {item.label}
                  <MoreVertical />
                </div>
                <p>{formatNumber(item.value)}</p>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  </div>
);
}

export default Dashboard;
