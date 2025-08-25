import React, { useEffect, useState } from 'react';
import { LayoutGrid, Users, User, TrendingUp } from 'lucide-react';
import SidebarItem from './SidebarItem';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

function CallLogViewer() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const normalize = (val) => (!val || val === 'unknown') ? 'Неизвестный' : val;

  const translateStatus = (val) => {
    const translations = {
      'answered': 'Входящий',
      'no answer': 'Пропущенный',
      'busy': 'Занято',
      'failed': 'Ошибка',
      'ringing': 'Исходящий',
      'ring': 'Входящий',
      'up': 'Входящий',
      'dialing': 'Набирает',
      'hangup': 'Сброшен',
      'Down': 'Пропущенный',
      'waiting': 'Исходящий',
    };
    return translations[val?.toLowerCase()] || normalize(val);
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
          setProfile(null);
        }
      })
      .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
        setProfile(null);
      });
  }, [token]);

  useEffect(() => {
    const saved = localStorage.getItem('callEvents');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        console.error('Ошибка при загрузке звонков из localStorage:', e);
      }
    }

    const socket = new WebSocket('ws://10.10.10.21:8081');

    socket.onopen = () => console.log('Подключено к WebSocket');

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const incomingEvents = Array.isArray(payload.data) ? payload.data : [payload];

      const enrichedEvents = incomingEvents
        .filter(e =>
          !['NewConnectedLine', 'ExtensionStatus', 'Down'].includes(e.Event) &&
          /^\d{7,}$/.test((e.CallerIDNum || e.Source || e.ConnectedLineNum || '').toString().trim())
        )
        .map(e => ({
          ...e,
          timestamp: e.timestamp || new Date().toISOString(),
          phone: (e.CallerIDNum || e.Source || e.ConnectedLineNum || '').toString().trim()
        }));

      setEvents(prevEvents => {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        const merged = [...enrichedEvents, ...prevEvents].filter(ev => {
          const time = new Date(ev.timestamp).getTime();
          return time >= oneHourAgo;
        });

        const uniqueByPhone = {};
        const deduplicated = merged.filter(ev => {
          if (uniqueByPhone[ev.phone]) return false;
          uniqueByPhone[ev.phone] = true;
          return true;
        });

        localStorage.setItem('callEvents', JSON.stringify(deduplicated));

        return deduplicated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
    };

    socket.onerror = (err) => console.error('WebSocket ошибка:', err);
    socket.onclose = () => console.warn('WebSocket отключен');

    return () => socket.close();
  }, []);

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const paginatedEvents = events.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="sidebar_logo">
            <img src="./Dusti_pharma.png" width="40" height="40" alt="Логотип" />
            <h2>Дусти фарма</h2>
          </div>
          <div className="sidebar-menu">
            <SidebarItem icon={LayoutGrid} label="Статистика" to="/dashboard" />
            <SidebarItem icon={() => <img src="./Icons-3.svg" alt="Роли и права" />} label="Роли и права" to="/RoleAndRoot" />
            <SidebarItem icon={Users} label="Партнёр" to="/Partner" />
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
                <h3>{profile?.['Наименование']?.trim() || 'Имя не указано'}</h3>
                <p>{profile?.['ВидКонтрагента']?.trim() || 'Филиал не указан'}</p>
              </div>
                <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">
                Выйти
                </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="panel_content">
          <h2>Журнал звонков</h2>
          <div className='calls_position'>
            <div className='buttons_calls'>
              <button onClick={() => navigate('/Dashboard')}>Посмотреть статистику</button>
              <TrendingUp />
            </div>
            <table className="bd_calls">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Время звонка</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((e, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td>{normalize(e.phone)}</td>
                    <td>{new Date(e.timestamp).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={translateStatus(e.Disposition || e.ChannelStateDesc || 'waiting')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination_controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                ◀ Пред
              </button>

              <span>Страница {currentPage} из {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                След ▶
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CallLogViewer;
