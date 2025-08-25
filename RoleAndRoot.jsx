import React, { useEffect, useState } from 'react';
import { LayoutGrid, Users, User, Plus, Edit, Trash2 } from 'lucide-react';
import SidebarItem from './SidebarItem';
import RoleModal from './RoleModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import '../index.css';

function RoleAndRoot() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const itemsPerPage = 6;
  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(users.length / itemsPerPage);

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

  const fetchUsers = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://api.dustipharma.tj:1212/api/v1/app/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

      const data = await response.json();
      const usersList = Array.isArray(data) ? data : data?.payload || [];

      const adminUsers = usersList.filter(u =>
        ['admin', 'moderator'].includes(u['Роль']?.toLowerCase()) ||
        ['admin', 'moderator'].includes(u['ВидКонтрагента']?.toLowerCase())
      );

      setUsers(adminUsers);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchUsers();
    }
  }, [location.state]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Удалить пользователя?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://api.dustipharma.tj:1212/api/v1/app/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);

      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      alert('Не удалось удалить пользователя.');
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const response = await fetch('http://api.dustipharma.tj:1212/api/v1/app/admin/users', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });

      if (!response.ok) throw new Error(`Ошибка обновления: ${response.status}`);

      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, Роль: newRole } : u))
      );
      setEditingUser(null);
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      alert('Не удалось обновить роль.');
    }
  };

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
              <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">
                Выйти
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="root_header">
          <div>
            <h1>Роли и права</h1>
            <p>Добавьте сотрудников с полными правами администратора, ограничьте доступ по разделам</p>
          </div>
          <div className="root_button">
            <button onClick={() => navigate('./add-employee')}>
              Добавить сотрудника <Plus />
            </button>
          </div>
        </div>

        <div className="back_color_table">
          <table className="user-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Ф.И.О</th>
                <th>Роль</th>
                <th>Телефон</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, index) => (
                <tr key={u.id || index}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{u['Наименование'] || '-'}</td>
                  <td>{u['Роль'] || u['ВидКонтрагента'] || '-'}</td>
                  <td>{u['Телефон'] || '-'}</td>
                  <td style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <Edit size={20} style={{ cursor: 'pointer' }} onClick={() => setEditingUser(u)} />
                                          <Trash2
                      size={20}
                      color="red"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDelete(u.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination_controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
              ◀ Назад
            </button>
            <span>Страница {currentPage} из {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
              Вперёд ▶
            </button>
          </div>

          {/* Модальное окно редактирования роли */}
          {editingUser && (
            <RoleModal
              user={editingUser}
              onClose={() => setEditingUser(null)}
              onSave={handleRoleUpdate}
            />
          )}
        </div>
      </main>
      <Outlet />
    </div>
  );
}

export default RoleAndRoot;
